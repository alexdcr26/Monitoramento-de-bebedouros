import Database from 'better-sqlite3';

const db = new Database('database.db');

function setupDatabase() {
  // Tabela de Equipamentos
  db.exec(`
    CREATE TABLE IF NOT EXISTS equipments (
      id TEXT PRIMARY KEY,
      sector TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('SAFE', 'WARNING', 'RISK')),
      next_maintenance_in_days INTEGER,
      image_url TEXT
    );
  `);

  // Tabela de Ordens de Serviço
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_orders (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('PENDENTE', 'EM ANDAMENTO', 'CONCLUÍDA')),
      equipment_id TEXT NOT NULL,
      due_date TEXT NOT NULL,
      is_late BOOLEAN DEFAULT FALSE,
      completed_by TEXT,
      sap_os_number TEXT,
      completion_date TEXT,
      completion_image_url TEXT,
      FOREIGN KEY (equipment_id) REFERENCES equipments (id)
    );
  `);



  // Tabela de Ciclos de Manutenção
  db.exec(`
    CREATE TABLE IF NOT EXISTS maintenance_cycles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipment_id TEXT NOT NULL,
        name TEXT NOT NULL,
        last_maintenance_date TEXT NOT NULL,
        frequency_in_days INTEGER NOT NULL,
        FOREIGN KEY (equipment_id) REFERENCES equipments (id)
    );
  `);

  // Inserir dados de exemplo (se as tabelas estiverem vazias)
  const equipmentCount = db.prepare('SELECT COUNT(*) as count FROM equipments').get() as { count: number };
  if (equipmentCount.count === 0) {
    const insertEquipment = db.prepare('INSERT INTO equipments (id, sector, status, next_maintenance_in_days) VALUES (?, ?, ?, ?)');
    const equipmentsData = [
      { id: 'BB-LOG-001', sector: 'Logística', status: 'SAFE', days: 10 },
      { id: 'BB-PROD-002', sector: 'Produção', status: 'WARNING', days: 2 },
      { id: 'BB-ADM-003', sector: 'Administrativo', status: 'RISK', days: -5 }, // Atrasado
      { id: 'BB-LOG-004', sector: 'Logística', status: 'SAFE', days: 50 },
      { id: 'BB-ALM-001', sector: 'Almoxarifado', status: 'RISK', days: -15 }, // Bebedouro Atrasado
    ];
    equipmentsData.forEach(eq => insertEquipment.run(eq.id, eq.sector, eq.status, eq.days));
  }

  const soCount = db.prepare('SELECT COUNT(*) as count FROM service_orders').get() as { count: number };
  if (soCount.count === 0) {
    const insertSO = db.prepare('INSERT INTO service_orders (id, title, status, equipment_id, due_date, is_late, completed_by) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const soData = [
        { id: 'OS-2026-0006', title: 'Limpeza Geral Bebedouro', status: 'PENDENTE', eqId: 'BB-ALM-001', date: '2026-02-10', late: 1, by: null },
        { id: 'OS-2026-0005', title: 'Troca de Filtro', status: 'PENDENTE', eqId: 'BB-LOG-004', date: '2026-04-08', late: 0, by: null },
        { id: 'OS-2026-0004', title: 'Limpeza do Condensador', status: 'CONCLUÍDA', eqId: 'BB-LOG-001', date: '2026-04-08', late: 0, by: 'João Silva' },
        { id: 'OS-2026-0003', title: 'Higienização Interna', status: 'EM ANDAMENTO', eqId: 'BB-PROD-002', date: '2026-03-09', late: 0, by: null },
        { id: 'OS-2026-0002', title: 'Troca de Filtro', status: 'PENDENTE', eqId: 'BB-ADM-003', date: '2026-02-17', late: 1, by: null },
        { id: 'OS-2026-0001', title: 'Troca de Filtro', status: 'PENDENTE', eqId: 'BB-PROD-002', date: '2026-02-25', late: 0, by: null },
    ];
    soData.forEach(so => insertSO.run(so.id, so.title, so.status, so.eqId, so.date, so.late, so.by));
  }

  const cycleCount = db.prepare('SELECT COUNT(*) as count FROM maintenance_cycles').get() as { count: number };
    if (cycleCount.count === 0) {
        const insertCycle = db.prepare('INSERT INTO maintenance_cycles (equipment_id, name, last_maintenance_date, frequency_in_days) VALUES (?, ?, ?, ?)');
        const cyclesData = [
            { eqId: 'BB-PROD-002', name: 'Troca de Filtro', last: '2025-12-26', freq: 60 },
            { eqId: 'BB-PROD-002', name: 'Higienização Interna', last: '2026-01-23', freq: 90 },
            { eqId: 'BB-PROD-002', name: 'Revisão do Motor', last: '2025-11-24', freq: 180 },
            { eqId: 'BB-ALM-001', name: 'Limpeza Geral', last: '2026-01-15', freq: 30 },
        ];
        cyclesData.forEach(c => insertCycle.run(c.eqId, c.name, c.last, c.freq));
    }

  console.log('Banco de dados configurado com sucesso.');
}

export { db, setupDatabase };
