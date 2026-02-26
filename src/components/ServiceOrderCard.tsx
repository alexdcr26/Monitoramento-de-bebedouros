import { Calendar, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export type OSStatus = 'PENDENTE' | 'EM ANDAMENTO' | 'CONCLUÍDA';

interface ServiceOrderCardProps {
  osCode: string;
  title: string;
  status: OSStatus;
  equipmentCode: string;
  sector: string;
  dueDate: string;
  isLate?: boolean;
  completedBy?: string;
}

const statusStyles: { [key in OSStatus]: { bg: string; text: string; } } = {
  PENDENTE: { bg: 'bg-gray-100', text: 'text-gray-800' },
  'EM ANDAMENTO': { bg: 'bg-blue-100', text: 'text-blue-800' },
  CONCLUÍDA: { bg: 'bg-green-100', text: 'text-green-800' },
};

export default function ServiceOrderCard({ osCode, title, status, equipmentCode, sector, dueDate, isLate = false, completedBy }: ServiceOrderCardProps) {
  const style = statusStyles[status];

  return (
    <Link to={`/ordens/${osCode}`} className={`block bg-white p-5 rounded-xl shadow-sm border ${status === 'CONCLUÍDA' ? 'border-green-500' : isLate ? 'border-red-500' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-gray-500">{osCode}</h3>
          <p className="text-lg font-semibold text-gray-900">{title}</p>
        </div>
        <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
          {status}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{equipmentCode} ({sector})</span>
        </div>
        {status === 'CONCLUÍDA' ? (
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span>Concluído por: <strong>{completedBy}</strong></span>
            </div>
        ) : (
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Prazo: <span className={isLate ? 'font-bold text-red-600' : 'font-medium text-gray-800'}>{dueDate}</span></span>
            </div>
        )}
      </div>
    </Link>
  );
}
