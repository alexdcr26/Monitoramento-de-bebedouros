import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username);
      navigate('/equipamentos');
    } catch (err) {
      setError('Falha ao entrar. Tente novamente.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900">Acesso Restrito</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username">Usuário</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="input-form"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button type="submit" className="btn-primary w-full">
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
