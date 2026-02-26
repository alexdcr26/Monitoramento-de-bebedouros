import { useState } from 'react';
import { History, User, Calendar, Camera, ChevronDown, ChevronUp } from 'lucide-react';

interface ServiceOrder {
  id: string;
  title: string;
  completion_date: string;
  completed_by: string;
  completion_image_url?: string;
}

interface MaintenanceHistoryCardProps {
  history: ServiceOrder[];
}

export default function MaintenanceHistoryCard({ history }: MaintenanceHistoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (history.length === 0) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-gray-100 p-2 rounded-full">
                    <History className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Histórico de Manutenções</h3>
            </div>
            <p className="text-gray-500 text-center py-4">Nenhum histórico de manutenção concluída para este equipamento.</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
                <History className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Histórico de Manutenções</h3>
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
      </button>
      {isExpanded && (
        <div className="space-y-4">
          {history.map((order) => (
            <div key={order.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="font-semibold text-gray-800">{order.title}</p>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(order.completion_date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <User className="h-4 w-4 mr-2" />
                <span>{order.completed_by}</span>
              </div>
              {order.completion_image_url && (
                <button onClick={() => setSelectedImage(order.completion_image_url!)} className="flex items-center text-sm text-indigo-600 hover:underline mt-2">
                  <Camera className="h-4 w-4 mr-2" />
                  Ver Foto
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {selectedImage && (
        <div 
            onClick={() => setSelectedImage(null)} 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <img 
            src={selectedImage} 
            alt="Comprovação de serviço" 
            className="max-w-full max-h-full rounded-lg" 
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
}
