import React, { useState } from 'react';
import { X, Plus, Trash2, UploadCloud } from 'lucide-react';

interface Cycle {
    name: string;
    frequency: string; // in days
    lastDate: string;
}

interface NewEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
}

const defaultCycles: Cycle[] = [];

export default function NewEquipmentModal({ isOpen, onClose, onSave }: NewEquipmentModalProps) {
  const [id, setId] = useState('');
  const [sector, setSector] = useState('');
  const [cycles, setCycles] = useState<Cycle[]>([{ name: '', frequency: '', lastDate: '' }]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCycleChange = (index: number, field: keyof Cycle, value: string) => {
    const newCycles = [...cycles];
    newCycles[index][field] = value;
    setCycles(newCycles);
  };

  const addCycle = () => {
    setCycles([...cycles, { name: '', frequency: '', lastDate: '' }]);
  };

  const removeCycle = (index: number) => {
    const newCycles = cycles.filter((_, i) => i !== index);
    setCycles(newCycles);
  };

  const handleSubmit = () => {
    if (!id || !sector || cycles.some(c => !c.name || !c.frequency || !c.lastDate)) {
      alert('Por favor, preencha todos os campos, incluindo os ciclos de manutenção.');
      return;
    }

    const formData = new FormData();
    formData.append('id', id);
    formData.append('sector', sector);
    formData.append('cycles', JSON.stringify(cycles));
    if (image) {
      formData.append('image', image);
    }

    onSave(formData);
    // Reset state
    setId('');
    setSector('');
    setCycles(defaultCycles);
    setImage(null);
    setImagePreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Novo Equipamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="equipment-id" className="block text-sm font-medium text-gray-700">Código do Equipamento</label>
            <input
              type="text"
              id="equipment-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Ex: BB-LOG-005"
              className="mt-1 w-full input"
            />
          </div>
          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-gray-700">Setor</label>
            <input
              type="text"
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Ex: Logística"
              className="mt-1 w-full input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Foto do Bebedouro</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto" />
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Carregar um arquivo</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                  </label>
                  <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ciclos de Manutenção</h3>
            <div className="space-y-4">
                {cycles.map((cycle, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Nome do Ciclo</label>
                            <input type="text" value={cycle.name} onChange={e => handleCycleChange(index, 'name', e.target.value)} className="mt-1 w-full input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Frequência (dias)</label>
                            <input type="number" value={cycle.frequency} onChange={e => handleCycleChange(index, 'frequency', e.target.value)} className="mt-1 w-full input" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Última</label>
                                <input type="date" value={cycle.lastDate} onChange={e => handleCycleChange(index, 'lastDate', e.target.value)} className="mt-1 w-full input" />
                            </div>
                            <button onClick={() => removeCycle(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={addCycle} className="mt-4 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                <Plus className="h-5 w-5" />
                Adicionar outro ciclo
            </button>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="btn-primary">
            Salvar Equipamento
          </button>
        </div>
      </div>
    </div>
  );
}
