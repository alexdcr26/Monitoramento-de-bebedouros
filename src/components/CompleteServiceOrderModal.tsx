import React, { useState, useEffect } from 'react';

interface CompleteServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  orderTitle: string;
}

export default function CompleteServiceOrderModal({ isOpen, onClose, onSave, orderTitle }: CompleteServiceOrderModalProps) {
  const [completionDate, setCompletionDate] = useState('');
  const [sapOsNumber, setSapOsNumber] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [technicianName, setTechnicianName] = useState('');

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setCompletionDate(today);
      setSapOsNumber('');
      setImage(null);
      setTechnicianName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('completion_date', completionDate);
    formData.append('sap_os_number', sapOsNumber);
    formData.append('completed_by', technicianName);
    if (image) {
      formData.append('image', image);
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Concluir Ordem de Serviço</h2>
        <p className="text-gray-600 mb-6">Preencha os detalhes para fechar a OS: <span className="font-semibold">{orderTitle}</span>.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 mb-1">Data de Conclusão</label>
            <input
              id="completionDate"
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="sapOsNumber" className="block text-sm font-medium text-gray-700 mb-1">Número da OS (SAP)</label>
            <input
              id="sapOsNumber"
              type="text"
              value={sapOsNumber}
              onChange={(e) => setSapOsNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="technicianName" className="block text-sm font-medium text-gray-700 mb-1">Nome do Técnico</label>
            <input
              id="technicianName"
              type="text"
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
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
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Concluir Ordem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
