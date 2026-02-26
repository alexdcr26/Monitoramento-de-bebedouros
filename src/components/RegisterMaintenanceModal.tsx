import React, { useState, useEffect } from 'react';

interface RegisterMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  cycleName: string;
}

export default function RegisterMaintenanceModal({ isOpen, onClose, onSave, cycleName }: RegisterMaintenanceModalProps) {
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setMaintenanceDate(today);
      setImage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('last_maintenance_date', maintenanceDate);
    if (image) {
      formData.append('image', image);
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registrar Manutenção</h2>
        <p className="text-gray-600 mb-6">Confirme a data de conclusão para o ciclo: <span className="font-semibold">{cycleName}</span>.</p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="maintenanceDate" className="block text-sm font-medium text-gray-700 mb-1">Data da Manutenção</label>
              <input
                id="maintenanceDate"
                type="date"
                value={maintenanceDate}
                onChange={(e) => setMaintenanceDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Foto do Serviço (Opcional)</label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
