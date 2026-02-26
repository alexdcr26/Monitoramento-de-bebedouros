import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import ServiceOrderCard, { OSStatus } from '../components/ServiceOrderCard';

interface ServiceOrder {
  id: string;
  title: string;
  status: OSStatus;
  equipment_id: string;
  sector: string;
  due_date: string;
  is_late: boolean;
  completed_by: string | null;
}

type Tab = 'pending' | 'completed';

export default function Ordens() {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  const completedPercentage = () => {
    if (serviceOrders.length === 0) return 0;
    const completedCount = serviceOrders.filter(o => o.status === 'CONCLUÍDA').length;
    return Math.round((completedCount / serviceOrders.length) * 100);
  };

  const filteredOrders = serviceOrders.filter(order => {
    if (activeTab === 'pending') {
      return order.status === 'PENDENTE' || order.status === 'EM ANDAMENTO';
    }
    return order.status === 'CONCLUÍDA';
  });

  useEffect(() => {
    async function fetchServiceOrders() {
      try {
        const response = await fetch('/api/service-orders');
        const data = await response.json();
        setServiceOrders(data);
      } catch (error) {
        console.error('Erro ao buscar ordens de serviço:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchServiceOrders();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="mt-1 text-sm text-gray-500">Acompanhe as execuções de manutenção.</p>
        </div>
      </div>

      <div className="mt-8">
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-600">Progresso Geral</h3>
                <span className="text-sm font-bold text-indigo-600">{completedPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${completedPercentage()}%` }}></div>
            </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por código OS ou equipamento..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Carregando ordens de serviço...</div>
      ) : (
        <>
          <div className="border-b border-gray-200 mt-8">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('pending')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                Pendentes
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                Concluídas
              </button>
            </nav>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredOrders.map((order) => (
              <div key={order.id}>
                <ServiceOrderCard 
                    osCode={order.id} 
                    title={order.title} 
                    status={order.status} 
                    equipmentCode={order.equipment_id} 
                    sector={order.sector} 
                    dueDate={order.due_date} 
                    isLate={!!order.is_late}
                    completedBy={order.completed_by || undefined}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

