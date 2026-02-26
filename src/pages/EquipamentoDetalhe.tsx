import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, AlertTriangle, Calendar, CheckCircle, XCircle, Edit, Check } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Status } from '../components/EquipmentCard';
import { OSStatus } from '../components/ServiceOrderCard';
import EditEquipmentModal from '../components/EditEquipmentModal';
import RegisterMaintenanceModal from '../components/RegisterMaintenanceModal';
import QrCodeCard from '../components/QrCodeCard';
import ImageModal from '../components/ImageModal';
import MaintenanceHistoryCard from '../components/MaintenanceHistoryCard';

interface ServiceOrder {
    id: string;
    title: string;
    status: OSStatus;
    completion_date?: string;
    completion_image_url?: string;
}

interface EquipmentDetails {
    id: string;
    sector: string;
    status: Status;
    next_maintenance_in_days: number;
    maintenanceCycles: { id: number; name: string; last_maintenance_date: string; frequency_in_days: number }[];
    recentOrders: ServiceOrder[];
    lastCompletedOrder?: ServiceOrder;
}

import React from 'react';
const statusInfo: { [key in Status]: { text: string; bg: string; textColor: string; icon: React.ReactNode } } = {
    SAFE: { text: 'SEGURO', bg: 'bg-green-100', textColor: 'text-green-800', icon: <CheckCircle className="-ml-1 mr-1.5 h-4 w-4" /> },
    WARNING: { text: 'ATENÇÃO', bg: 'bg-yellow-100', textColor: 'text-yellow-800', icon: <AlertTriangle className="-ml-1 mr-1.5 h-4 w-4" /> },
    RISK: { text: 'RISCO', bg: 'bg-red-100', textColor: 'text-red-800', icon: <XCircle className="-ml-1 mr-1.5 h-4 w-4" /> },
};

export default function EquipamentoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [data, setData] = useState<EquipmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<{id: number; name: string} | null>(null);

  async function fetchDetails() {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/equipments/${id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Equipamento não encontrado');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Erro ao buscar detalhes do equipamento:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUpdateEquipment = async (updatedData: { sector: string; cycles: any[] }) => {
    if (!id) return;
    try {
        const response = await fetch(`/api/equipments/${id}`, {
            credentials: 'include',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao atualizar equipamento');
        }
        await fetchDetails();
        setIsEditModalOpen(false);
    } catch (error) {
        console.error('Erro ao atualizar equipamento:', error);
        alert(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleRegisterMaintenance = async (formData: FormData) => {
    if (!selectedCycle) return;
    try {
        const response = await fetch(`/api/cycles/${selectedCycle.id}/complete`, {
            credentials: 'include',
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao registrar manutenção');
        }
        await fetchDetails();
        setIsRegisterModalOpen(false);
        setSelectedCycle(null);
    } catch (error) {
        console.error('Erro ao registrar manutenção:', error);
        alert(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Carregando...</div>;
  }

  if (!data) {
    return <div className="text-center p-8">Equipamento não encontrado.</div>;
  }

  const currentStatus = statusInfo[data.status];
  const nextMaintenanceDate = new Date();
  nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + data.next_maintenance_in_days);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {user && (
        <motion.div variants={itemVariants}>
            <Link to="/equipamentos" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="h-5 w-5" />
                Voltar para a Lista
            </Link>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <p className="text-sm text-gray-500">EQUIPAMENTO</p>
          <h1 className="text-3xl font-bold text-gray-900">{id}</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${currentStatus.bg} ${currentStatus.textColor}`}>
                {currentStatus.icon}
                {currentStatus.text}
            </div>
            {user && (
                <button onClick={() => setIsEditModalOpen(true)} className="btn-secondary flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Editar
                </button>
            )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <motion.div variants={containerVariants} className="lg:col-span-2 space-y-8">
            <motion.div variants={itemVariants} className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Próxima Manutenção Preventiva</h3>
                <p className="text-3xl font-bold text-blue-900">{nextMaintenanceDate.toLocaleDateString('pt-BR')}</p>
                <p className="text-blue-700">Daqui a {data.next_maintenance_in_days} dias</p>
            </motion.div>

            {data.lastCompletedOrder ? (
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Último Serviço Realizado</h3>
                    <p className="font-semibold text-gray-800">{data.lastCompletedOrder.title}</p>
                    <p className="text-sm text-gray-500 mb-4">Concluído em: {new Date(data.lastCompletedOrder.completion_date!).toLocaleDateString('pt-BR')}</p>
                    {data.lastCompletedOrder.completion_image_url && (
                        <motion.img 
                            layoutId={`service-image-${data.id}`}
                            src={data.lastCompletedOrder.completion_image_url}
                            alt={`Serviço realizado em ${data.id}`}
                            className="rounded-lg w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ maxHeight: '300px' }}
                            onClick={() => setIsImageModalOpen(true)}
                        />
                    )}
                </motion.div>
            ) : (
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                    <p className="text-gray-500">Nenhum serviço concluído registrado.</p>
                </motion.div>
            )}

            {user && (
                <>
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ciclos de Manutenção</h3>
                        <ul className="space-y-4">
                            {data.maintenanceCycles.map(cycle => (
                                <li key={cycle.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-700">{cycle.name}</p>
                                        <p className="text-sm text-gray-500">Última: {new Date(cycle.last_maintenance_date).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <button onClick={() => { setSelectedCycle({id: cycle.id, name: cycle.name}); setIsRegisterModalOpen(true); }} className="btn-secondary text-sm">Registrar</button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <MaintenanceHistoryCard history={data.recentOrders} />
                    </motion.div>
                </>
            )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-8">
            <QrCodeCard equipmentId={id!} />
        </motion.div>
      </div>
      
      <ImageModal 
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={data.lastCompletedOrder?.completion_image_url || ''}
        altText={`Serviço concluído para ${data.id}`}
      />

      {user && (
          <>
            <EditEquipmentModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                onSave={handleUpdateEquipment} 
                equipmentData={data}
            />
            <RegisterMaintenanceModal 
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSave={handleRegisterMaintenance}
                cycleName={selectedCycle?.name || ''}
            />
          </>
      )}
    </motion.div>
  );
}
