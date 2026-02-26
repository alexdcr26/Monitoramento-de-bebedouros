import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Equipamentos from './pages/Equipamentos';
import Ordens from './pages/Ordens';
import EscanearQrCode from './pages/EscanearQrCode';
import EquipamentoDetalhe from './pages/EquipamentoDetalhe';
import OrdemServicoDetalhe from './pages/OrdemServicoDetalhe';
import Guia from './pages/Guia';

import Login from './pages/Login';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>; 
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/escanear-qr-code" element={<EscanearQrCode />} />
      
      {/* Rotas principais dentro do Layout */}
      <Route path="/" element={<Layout><Outlet /></Layout>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="equipamentos" element={<Equipamentos />} />
        <Route path="equipamentos/:id" element={<EquipamentoDetalhe />} />
        <Route path="ordens" element={<Ordens />} />
        <Route path="ordens/:id" element={<OrdemServicoDetalhe />} />
        <Route path="guia" element={<Guia />} />
      </Route>
      
      {/* Redireciona qualquer rota não encontrada para o dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
