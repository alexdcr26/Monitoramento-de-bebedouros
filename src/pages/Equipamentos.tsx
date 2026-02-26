import { useEffect, useState } from 'react';
import { Plus, Search, ListFilter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EquipmentCard, { Status } from '../components/EquipmentCard';
import NewEquipmentModal from '../components/NewEquipmentModal';
import NewEquipmentQrModal from '../components/NewEquipmentQrModal';

interface Equipment {
  id: string;
  sector: string;
  status: Status;
  next_maintenance_in_days: number;
}

function formatMaintenanceDays(days: number): string {
    if (days < 0) return 'Atrasado';
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Amanhã';
    return `Em ${days} dias`;
}

export default function Equipamentos() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [newEquipmentId, setNewEquipmentId] = useState('');
  const { user, loading: authLoading } = useAuth();

  async function fetchEquipments() {
    setLoading(true);
    try {
      const response = await fetch('/api/equipments', { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error(`Falha na requisição: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setEquipments(data);
      } else {
        console.error('Erro de formato: A API não retornou um array.', data);
        setEquipments([]);
      }
    } catch (error) {
      console.error('Ocorreu um erro ao buscar os equipamentos:', error);
      setEquipments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchEquipments();
    }
  }, [user, authLoading]);

  const handleSaveEquipment = async (formData: FormData) => {
    try {
        const response = await fetch('/api/equipments', {
            credentials: 'include',
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao criar equipamento');
        }

        const newEquipment = await response.json();

        // Refresh equipment list and show QR modal
        await fetchEquipments();
        setIsModalOpen(false);
        setNewEquipmentId(newEquipment.id);
        setIsQrModalOpen(true);
    } catch (error) {
        console.error('Erro ao salvar equipamento:', error);
        alert(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipamentos</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie e monitore o status de manutenção.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Novo Equipamento
        </button>
      </div>

      <div className="mt-8 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por código ou setor..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700 hover:bg-gray-50">
          <ListFilter className="h-5 w-5" />
          Todos
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Carregando equipamentos...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {Array.isArray(equipments) && equipments.map((equip) => (
            <div key={equip.id}>
              <EquipmentCard 
                  code={equip.id} 
                  sector={equip.sector} 
                  status={equip.status} 
                  nextMaintenance={formatMaintenanceDays(equip.next_maintenance_in_days)} 
              />
            </div>
          ))}
        </div>
      )}
      
      <NewEquipmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveEquipment} 
      />
      <NewEquipmentQrModal 
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        equipmentId={newEquipmentId}
      />
    </div>
  );
}

