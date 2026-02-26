import { Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export type Status = 'SAFE' | 'WARNING' | 'RISK';

interface EquipmentCardProps {
  code: string;
  sector: string;
  status: Status;
  nextMaintenance: string;
}

const statusColors: { [key in Status]: { bg: string; text: string; ring: string } } = {
  SAFE: { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-600/20' },
  WARNING: { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-600/20' },
  RISK: { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-600/20' },
};

const maintenanceStatusColors = {
    'Em 10 dias': 'text-green-600',
    'Em 2 dias': 'text-yellow-600',
    'Atrasado': 'text-red-600',
    'Em 50 dias': 'text-gray-600',
}

export default function EquipmentCard({ code, sector, status, nextMaintenance }: EquipmentCardProps) {
  const colors = statusColors[status];
  
  let maintenanceColor = 'text-gray-600';
  if (nextMaintenance.includes('Atrasado')) {
    maintenanceColor = 'text-red-600';
  } else if (nextMaintenance.includes('Hoje') || nextMaintenance.includes('Amanhã') || nextMaintenance.includes('Em 2 dias')) {
    maintenanceColor = 'text-yellow-600';
  } else if (nextMaintenance.includes('Em 10 dias')) { // Mantendo a lógica original aproximada
     maintenanceColor = 'text-green-600';
  }

  return (
    <Link to={`/equipamentos/${code}`} className="block bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{code}</h3>
          <p className="text-sm text-gray-500">{sector}</p>
        </div>
        <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text} ring-1 ring-inset ${colors.ring}`}>
          {status}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Próx. Manutenção</span>
            </div>
            <p className={`font-semibold ${maintenanceColor}`}>{nextMaintenance}</p>
        </div>
        <div className="flex items-center text-sm font-medium text-indigo-600">
            <span>Ver detalhes</span>
            <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}
