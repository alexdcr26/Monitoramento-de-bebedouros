import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { db, setupDatabase } from './src/db/setup';

// Garante que o diretório de uploads existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Configura o banco de dados na inicialização
setupDatabase();



async function createServer() {
  const app = express();

  // Middleware para parsear JSON e Cookies
  app.use(express.json());
  app.use(cookieParser());
  app.use('/uploads', express.static(uploadDir));

  // Rota de login simplificada (sem senha)
  app.post('/api/auth/login', (req, res) => {
    const { username } = req.body;
    // Apenas cria um cookie de usuário sem validação
    res.cookie('user', JSON.stringify({ username }), {
        httpOnly: true,
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 1 dia
        sameSite: 'none',
        secure: true
    });
    res.json({ username });
  });

  app.post('/api/auth/logout', (req, res) => {
      res.clearCookie('user', { path: '/' });
      res.json({ message: 'Logout bem-sucedido' });
  });

  app.get('/api/auth/me', (req, res) => {
      if (req.cookies.user) {
          res.json(JSON.parse(req.cookies.user));
      } else {
          // Retorna um usuário padrão se não houver cookie
          res.json({ username: 'Visitante' });
      }
  });

  // --- ROTAS PÚBLICAS ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // --- ROTAS PROTEGIDAS ---
  app.get('/api/equipments', (req, res) => {
    const equipments = db.prepare('SELECT * FROM equipments').all();
    res.json(equipments);
  });

  app.get('/api/equipments/:id', (req, res) => {
    const { id } = req.params;
    const equipment = db.prepare('SELECT * FROM equipments WHERE id = ?').get(id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }
    const maintenanceCycles = db.prepare('SELECT * FROM maintenance_cycles WHERE equipment_id = ?').all(id);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const recentOrders = db.prepare(`
        SELECT * FROM service_orders 
        WHERE equipment_id = ? AND status = 'CONCLUÍDA'
        ORDER BY completion_date DESC
    `).all(id);
    const lastCompletedOrder = db.prepare(`
        SELECT * FROM service_orders 
        WHERE equipment_id = ? AND status = 'CONCLUÍDA' 
        ORDER BY completion_date DESC 
        LIMIT 1
    `).get(id);
    res.json({ ...equipment, maintenanceCycles, recentOrders, lastCompletedOrder });
  });

  app.get('/api/service-orders/:id', (req, res) => {
    const { id } = req.params;
    const order = db.prepare(`
        SELECT so.*, eq.sector
        FROM service_orders so
        JOIN equipments eq ON so.equipment_id = eq.id
        WHERE so.id = ?
    `).get(id);

    if (!order) {
        return res.status(404).json({ error: 'Ordem de Serviço não encontrada' });
    }
    res.json(order);
  });

  app.post('/api/equipments', upload.single('image'), (req, res) => {
    let { id, sector, cycles } = req.body;

    if (typeof cycles === 'string') {
        try {
            cycles = JSON.parse(cycles);
        } catch (e) {
            return res.status(400).json({ error: 'Formato de ciclos inválido.' });
        }
    }

    if (!id || !sector || !cycles || !Array.isArray(cycles)) {
        return res.status(400).json({ error: 'Dados inválidos para criar equipamento.' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const insertEquipment = db.prepare('INSERT INTO equipments (id, sector, status, next_maintenance_in_days, image_url) VALUES (?, ?, ?, ?, ?)');
    const insertCycle = db.prepare('INSERT INTO maintenance_cycles (equipment_id, name, last_maintenance_date, frequency_in_days) VALUES (?, ?, ?, ?)');

    const calculateNextMaintenance = (lastDate: string, frequency: number) => {
        const date = new Date(lastDate);
        date.setDate(date.getDate() + frequency);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const nextMaintenanceDays = Math.min(...cycles.map(c => calculateNextMaintenance(c.lastDate, parseInt(c.frequency, 10))));
    const status = nextMaintenanceDays < 7 ? (nextMaintenanceDays < 0 ? 'RISK' : 'WARNING') : 'SAFE';

    const transaction = db.transaction(() => {
        insertEquipment.run(id, sector, status, nextMaintenanceDays, imageUrl);
        const insertOrder = db.prepare(`
            INSERT INTO service_orders (id, title, equipment_id, status, due_date, is_late)
            VALUES (?, ?, ?, 'PENDENTE', ?, ?)
        `);

        for (const cycle of cycles) {
            const frequency = parseInt(cycle.frequency, 10);
            insertCycle.run(id, cycle.name, cycle.lastDate, frequency);

            const daysUntilNext = calculateNextMaintenance(cycle.lastDate, frequency);
            if (daysUntilNext <= 0) {
                const dueDate = new Date(cycle.lastDate);
                dueDate.setDate(dueDate.getDate() + frequency);
                const newOrderId = `OS-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                insertOrder.run(newOrderId, cycle.name, id, dueDate.toISOString().split('T')[0], 1);
            }
        }
    });

    try {
        transaction();
        res.status(201).json({
            id,
            sector,
            status,
            next_maintenance_in_days: nextMaintenanceDays,
            image_url: imageUrl
        });
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
            return res.status(409).json({ error: 'Código de equipamento já existe' });
        }
        console.error('Erro ao criar equipamento:', error);
        res.status(500).json({ error: 'Erro interno ao criar equipamento' });
    }
  });

  app.post('/api/cycles/:id/complete', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { last_maintenance_date } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!last_maintenance_date) {
        return res.status(400).json({ error: 'Data da última manutenção é obrigatória' });
    }

    const transaction = db.transaction(() => {
        const cycle = db.prepare('SELECT * FROM maintenance_cycles WHERE id = ?').get(id) as { equipment_id: string, name: string };
        if (!cycle) {
            throw new Error('NOT_FOUND');
        }
        const equipmentId = cycle.equipment_id;

        // 1. Atualiza o ciclo de manutenção
        const updateCycle = db.prepare('UPDATE maintenance_cycles SET last_maintenance_date = ? WHERE id = ?');
        updateCycle.run(last_maintenance_date, id);

        // 2. Cria uma nova Ordem de Serviço para registrar o histórico
        const insertOrder = db.prepare(`
            INSERT INTO service_orders (id, title, equipment_id, status, due_date, completion_date, completed_by, completion_image_url)
            VALUES (?, ?, ?, 'CONCLUÍDA', ?, ?, ?, ?)
        `);
        const newOrderId = `OS-${Date.now()}`;
        const completedByUser = req.cookies.user ? JSON.parse(req.cookies.user).username : 'Técnico';
        insertOrder.run(newOrderId, cycle.name, equipmentId, last_maintenance_date, last_maintenance_date, completedByUser, imageUrl);

        // 3. Recalcula o status do equipamento
        const cycles = db.prepare('SELECT * FROM maintenance_cycles WHERE equipment_id = ?').all(equipmentId);
        const calculateNextMaintenance = (lastDate: string, frequency: number) => {
            const date = new Date(lastDate);
            date.setDate(date.getDate() + frequency);
            const today = new Date();
            const diffTime = date.getTime() - today.getTime();
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        };
        const nextMaintenanceDays = Math.min(...cycles.map(c => calculateNextMaintenance(c.last_maintenance_date, c.frequency_in_days)));
        const status = nextMaintenanceDays < 7 ? (nextMaintenanceDays < 0 ? 'RISK' : 'WARNING') : 'SAFE';
        const updateEquipment = db.prepare('UPDATE equipments SET status = ?, next_maintenance_in_days = ? WHERE id = ?');
        updateEquipment.run(status, nextMaintenanceDays, equipmentId);
    });

    try {
        transaction();
        res.json({ message: 'Ciclo de manutenção atualizado com sucesso' });
    } catch (error: any) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Ciclo de manutenção não encontrado' });
        }
        console.error('Erro ao completar ciclo:', error);
        res.status(500).json({ error: 'Erro interno ao completar ciclo de manutenção' });
    }
  });

  app.put('/api/equipments/:id', (req, res) => {
    const { id } = req.params;
    const { sector, cycles } = req.body;

    if (!sector || !cycles || !Array.isArray(cycles)) {
        return res.status(400).json({ error: 'Dados inválidos para atualizar equipamento.' });
    }

    const calculateNextMaintenance = (lastDate: string, frequency: number) => {
        const date = new Date(lastDate);
        date.setDate(date.getDate() + frequency);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const nextMaintenanceDays = Math.min(...cycles.map(c => calculateNextMaintenance(c.lastDate, parseInt(c.frequency, 10))));
    const status = nextMaintenanceDays < 7 ? (nextMaintenanceDays < 0 ? 'RISK' : 'WARNING') : 'SAFE';

    const updateEquipment = db.prepare('UPDATE equipments SET sector = ?, status = ?, next_maintenance_in_days = ? WHERE id = ?');
    const deleteCycles = db.prepare('DELETE FROM maintenance_cycles WHERE equipment_id = ?');
    const insertCycle = db.prepare('INSERT INTO maintenance_cycles (equipment_id, name, last_maintenance_date, frequency_in_days) VALUES (?, ?, ?, ?)');

    const transaction = db.transaction(() => {
        updateEquipment.run(sector, status, nextMaintenanceDays, id);
        deleteCycles.run(id);
        for (const cycle of cycles) {
            insertCycle.run(id, cycle.name, cycle.lastDate, parseInt(cycle.frequency, 10));
        }
    });

    try {
        transaction();
        res.status(200).json({ id, sector, status, next_maintenance_in_days: nextMaintenanceDays });
    } catch (error) {
        console.error('Erro ao atualizar equipamento:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar equipamento' });
    }
  });

  // API para Ordens de Serviço
  app.get('/api/service-orders', (req, res) => {
    const serviceOrders = db.prepare(`
        SELECT so.*, eq.sector
        FROM service_orders so
        JOIN equipments eq ON so.equipment_id = eq.id
    `).all();
    res.json(serviceOrders);
  });

  app.put('/api/service-orders/:id/complete', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { sap_os_number, completion_date, completed_by } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!completion_date || !completed_by) {
        return res.status(400).json({ error: 'Data de conclusão e nome do técnico são obrigatórios' });
    }

    const transaction = db.transaction(() => {
        const order = db.prepare('SELECT * FROM service_orders WHERE id = ?').get(id) as { equipment_id: string, title: string };
        if (!order) {
            throw new Error('NOT_FOUND');
        }

        // 1. Atualiza a Ordem de Serviço
        const updateOrder = db.prepare(`
            UPDATE service_orders
            SET status = 'CONCLUÍDA',
                sap_os_number = ?,
                completion_image_url = ?,
                completion_date = ?,
                completed_by = ?
            WHERE id = ?
        `);
        updateOrder.run(sap_os_number || null, imageUrl, completion_date, completed_by, id);

        // 2. Atualiza o ciclo de manutenção correspondente
        const updateCycle = db.prepare(`
            UPDATE maintenance_cycles 
            SET last_maintenance_date = ? 
            WHERE equipment_id = ? AND name = ?
        `);
        updateCycle.run(completion_date, order.equipment_id, order.title);

        // 3. Recalcula o status do equipamento
        const cycles = db.prepare('SELECT * FROM maintenance_cycles WHERE equipment_id = ?').all(order.equipment_id);
        const calculateNextMaintenance = (lastDate: string, frequency: number) => {
            const date = new Date(lastDate);
            date.setDate(date.getDate() + frequency);
            const today = new Date();
            const diffTime = date.getTime() - today.getTime();
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        };

        const nextMaintenanceDays = Math.min(...cycles.map(c => calculateNextMaintenance(c.last_maintenance_date, c.frequency_in_days)));
        const status = nextMaintenanceDays < 7 ? (nextMaintenanceDays < 0 ? 'RISK' : 'WARNING') : 'SAFE';

        const updateEquipment = db.prepare('UPDATE equipments SET status = ?, next_maintenance_in_days = ? WHERE id = ?');
        updateEquipment.run(status, nextMaintenanceDays, order.equipment_id);
    });

    try {
        transaction();
        res.json({ message: 'Ordem de Serviço concluída e ciclo atualizado com sucesso' });
    } catch (error: any) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Ordem de Serviço não encontrada' });
        }
        console.error('Erro ao concluir OS:', error);
        res.status(500).json({ error: 'Erro interno ao concluir OS' });
    }
  });

  // API para Estatísticas do Dashboard
  app.get('/api/dashboard-stats', (req, res) => {
    const safe = db.prepare("SELECT COUNT(*) as count FROM equipments WHERE status = 'SAFE'").get() as { count: number };
    const warning = db.prepare("SELECT COUNT(*) as count FROM equipments WHERE status = 'WARNING'").get() as { count: number };
    const risk = db.prepare("SELECT COUNT(*) as count FROM equipments WHERE status = 'RISK'").get() as { count: number };
    const pendingOS = db.prepare("SELECT COUNT(*) as count FROM service_orders WHERE status = 'PENDENTE' OR status = 'EM ANDAMENTO'").get() as { count: number };
    const overdueOS = db.prepare(`
        SELECT so.title, so.equipment_id
        FROM service_orders so
        WHERE so.is_late = 1 AND so.status = 'PENDENTE'
    `).all();

    res.json({
        safe: safe?.count || 0,
        warning: warning?.count || 0,
        risk: risk?.count || 0,
        pendingOS: pendingOS?.count || 0,
        overdueOS,
    });
  });


  if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, 'dist')));
      app.get('*', (req, res) => {
          res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      });
  } else {
      const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: 'spa',
      });
      app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

createServer();
