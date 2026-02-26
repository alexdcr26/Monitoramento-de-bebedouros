import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { CheckCircle, AlertTriangle, XCircle, BarChart2, Camera, Wrench, XCircle as XCircleIcon } from 'lucide-react';

interface Stats {
  safe: number;
  warning: number;
  risk: number;
  pendingOS: number;
  overdueOS: { title: string; equipment_id: string }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    safe: 0,
    warning: 0,
    risk: 0,
    pendingOS: 0,
    overdueOS: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard-stats');
        const data = await response.json();
        setStats(prevStats => ({ ...prevStats, ...data }));
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }



  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
      <p className="mt-1 text-sm text-gray-500">Status atual das manutenções industriais.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <StatCard title="Equip. Seguros" value={stats.safe} icon={<CheckCircle className="h-6 w-6" />} color="green" />
        <StatCard title="Atenção (7 dias)" value={stats.warning} icon={<AlertTriangle className="h-6 w-6" />} color="yellow" />
        <StatCard title="Em Risco" value={stats.risk} icon={<XCircle className="h-6 w-6" />} color="red" />
        <StatCard title="OS Pendentes" value={stats.pendingOS} icon={<BarChart2 className="h-6 w-6" />} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">OS Atrasadas</h2>
            <a href="/ordens" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Ver todas &rarr;</a>
          </div>
          {stats.overdueOS.length > 0 ? (
            <ul>
              {stats.overdueOS.map((os, index) => (
                <li key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-800">{os.title} • {os.equipment_id}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="-ml-0.5 mr-1.5 h-4 w-4" />
                    ATRASADA
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">Nenhuma ordem de serviço atrasada.</p>
          )}
        </div>

        <div className="bg-indigo-600 p-8 rounded-xl shadow-sm text-white flex flex-col items-start justify-center">
            <div className="bg-white/20 p-3 rounded-full mb-4">
                <Wrench className="h-8 w-8 text-white" />
            </div>
          <h2 className="text-xl font-bold">Pronto para o campo?</h2>
          <p className="mt-2 text-indigo-200">Escaneie o QR Code de um equipamento para visualizar seu histórico e iniciar uma nova Ordem de Serviço.</p>
          <button className="mt-6 bg-white text-indigo-600 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-indigo-50 transition-colors">
            <Camera className="h-5 w-5" />
            Abrir Câmera
          </button>
        </div>
      </div>
    </div>
  );
}
