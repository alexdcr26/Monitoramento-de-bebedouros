import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'green' | 'yellow' | 'red' | 'blue';
}

const colorClasses = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
};

const borderClasses = {
    green: 'border-green-200',
    yellow: 'border-yellow-200',
    red: 'border-red-200',
    blue: 'border-blue-200',
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`bg-white p-5 rounded-xl shadow-sm border ${borderClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
