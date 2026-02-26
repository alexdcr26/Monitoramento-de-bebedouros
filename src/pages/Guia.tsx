import { motion } from 'framer-motion';
import { BarChart3, ListChecks, QrCode, Wrench, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  },
};

const FeatureCard = ({ icon, title, description, color }) => (
  <motion.div variants={itemVariants} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 flex flex-col items-start">
    <div className={`mb-4 p-3 rounded-full bg-${color}-100`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-base">{description}</p>
  </motion.div>
);

export default function Guia() {
  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants} 
      className="p-4 sm:p-6 lg:p-8"
    >
      <motion.div variants={itemVariants} className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">Guia Rápido do SG-Manutenção</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Aprenda a usar os recursos essenciais e otimize sua gestão de manutenção.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        <FeatureCard 
          icon={<BarChart3 className="h-8 w-8 text-blue-600" />} 
          title="Dashboard Inteligente" 
          description="Tenha uma visão geral e instantânea do status de todos os seus equipamentos. Identifique riscos e tome ações preventivas com base em dados em tempo real."
          color="blue"
        />
        <FeatureCard 
          icon={<Wrench className="h-8 w-8 text-green-600" />} 
          title="Gestão de Equipamentos" 
          description="Cadastre novos equipamentos, defina seus ciclos de manutenção e acompanhe o histórico completo de intervenções, tudo em um só lugar."
          color="green"
        />
        <FeatureCard 
          icon={<ListChecks className="h-8 w-8 text-yellow-600" />} 
          title="Ordens de Serviço" 
          description="Acompanhe o ciclo de vida de cada OS, desde a abertura automática por atraso até a conclusão pelo técnico, com registro fotográfico."
          color="yellow"
        />
        <FeatureCard 
          icon={<QrCode className="h-8 w-8 text-indigo-600" />} 
          title="Acesso Rápido com QR Code" 
          description="Cada equipamento possui um QR Code único. Use a câmera do seu celular para escanear e acessar a página de detalhes instantaneamente."
          color="indigo"
        />
      </div>

      <motion.div variants={itemVariants} className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Pronto para começar?</h2>
        <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-transform hover:scale-105">
          Ir para o Dashboard
          <ArrowRight className="h-5 w-5" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
