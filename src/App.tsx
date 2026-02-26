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

function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Carregando...</div>; // Ou um spinner
    }

    return user ? <Layout><Outlet /></Layout> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/equipamentos/:id" element={<EquipamentoDetalhe />} /> 
      <Route path="/escanear-qr-code" element={<EscanearQrCode />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/equipamentos" element={<Equipamentos />} />
        <Route path="/ordens" element={<Ordens />} />
        <Route path="/ordens/:id" element={<OrdemServicoDetalhe />} />
        <Route path="/guia" element={<Guia />} />
      </Route>
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
