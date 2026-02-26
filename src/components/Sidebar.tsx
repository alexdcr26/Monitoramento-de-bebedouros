import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wrench, ListChecks, QrCode, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Equipamentos', href: '/equipamentos', icon: Wrench },
  { name: 'Ordens de Serviço', href: '/ordens', icon: ListChecks },
  { name: 'Escanear QR Code', href: '/escanear-qr-code', icon: QrCode },
  { name: 'Guia Interativo', href: '/guia', icon: HelpCircle },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen justify-between">
      <div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">IndusMaint</h1>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                classNames(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon
                className='mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500'
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">Logado como</p>
          <p className="font-semibold text-gray-800">{user?.username}</p>
          <button 
            onClick={handleLogout} 
            className="w-full mt-4 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50">
              <LogOut className="mr-3 h-6 w-6" />
              Sair
          </button>
      </div>
    </div>
  );
}
