import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, User, Hash, Building, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import CompleteServiceOrderModal from '../components/CompleteServiceOrderModal';

interface OrderDetails {
  id: string;
  title: string;
  equipment_id: string;
  sector: string;
  status: string;
  due_date: string;
  completion_date?: string;
  completed_by?: string;
  sap_os_number?: string;
  completion_image_url?: string;
}

export default function OrdemServicoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrderDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/service-orders/${id}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Ordem de Serviço não encontrada');
      }
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Erro ao buscar detalhes da OS:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleCompleteOrder = async (formData: FormData) => {
    if (!id) return;
    try {
      const response = await fetch(`/api/service-orders/${id}/complete`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao concluir a ordem de serviço');
      }
      await fetchOrderDetails(); // Re-fetch data to show updated status
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao concluir OS:', error);
      alert(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Carregando detalhes...</div>;
  }

  if (!order) {
    return <div className="text-center p-8">Ordem de Serviço não encontrada.</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <Link to={`/equipamentos/${order.equipment_id}`} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-5 w-5" />
        Voltar para o Equipamento
      </Link>

      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {order.completion_image_url && (
          <img src={order.completion_image_url} alt={`Serviço ${order.title}`} className="w-full h-64 object-cover" />
        )}
        <div className="p-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
              <p className="text-sm font-semibold text-indigo-600">ORDEM DE SERVIÇO #{order.id}</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{order.title}</h1>
            </div>
            <div className="bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {order.status.replace('_', ' ')}
            </div>
          </div>

          {order.status !== 'CONCLUÍDA' && (
            <div className="mt-6">
              <button onClick={() => setIsModalOpen(true)} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                <Wrench className="h-5 w-5" />
                Concluir Ordem de Serviço
              </button>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-gray-500">Equipamento</p>
                <p className="font-semibold text-gray-800">{order.equipment_id} ({order.sector})</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-gray-500">Data de Conclusão</p>
                <p className="font-semibold text-gray-800">{order.completion_date ? new Date(order.completion_date).toLocaleDateString('pt-BR') : 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-gray-500">Concluído por</p>
                <p className="font-semibold text-gray-800">{order.completed_by || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Hash className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-gray-500">OS SAP</p>
                <p className="font-semibold text-gray-800">{order.sap_os_number || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CompleteServiceOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCompleteOrder}
        orderTitle={order.title}
      />
    </motion.div>
  );
}
