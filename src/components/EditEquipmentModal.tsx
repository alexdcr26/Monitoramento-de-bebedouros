import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface Cycle {
    name: string;
    frequency_in_days: number;
    last_maintenance_date: string;
}

interface EditEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipment: { sector: string; cycles: Cycle[] }) => void;
  equipmentData: {
    id: string;
    sector: string;
    maintenanceCycles: Cycle[];
  } | null;
}

export default function EditEquipmentModal({ isOpen, onClose, onSave, equipmentData }: EditEquipmentModalProps) {
  const [sector, setSector] = useState('');
  const [cycles, setCycles] = useState<Cycle[]>([]);

  useEffect(() => {
    if (equipmentData) {
      setSector(equipmentData.sector);
      setCycles(equipmentData.maintenanceCycles.map(c => ({ ...c, last_maintenance_date: c.last_maintenance_date.split('T')[0] })));
    }
  }, [equipmentData]);

  const handleCycleChange = (index: number, field: keyof Cycle, value: string | number) => {
    const newCycles = [...cycles];
    (newCycles[index] as any)[field] = value;
    setCycles(newCycles);
  };

  const addCycle = () => {
    setCycles([...cycles, { name: '', frequency_in_days: 0, last_maintenance_date: '' }]);
  };

  const removeCycle = (index: number) => {
    const newCycles = cycles.filter((_, i) => i !== index);
    setCycles(newCycles);
  };

  const handleSubmit = () => {
    if (!sector || cycles.some(c => !c.name || !c.frequency_in_days || !c.last_maintenance_date)) {
      alert('Por favor, preencha todos os campos, incluindo os ciclos de manutenção.');
      return;
    }
    
    // Transform data to match server expectation (which matches NewEquipmentModal format)
    const formattedCycles = cycles.map(c => ({
        name: c.name,
        frequency: c.frequency_in_days,
        lastDate: c.last_maintenance_date
    }));

    onSave({ sector, cycles: formattedCycles as any });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Editar Equipamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Código do Equipamento</label>
            <p className="mt-1 text-lg font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-md">{equipmentData?.id}</p>
          </div>
          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-gray-700">Setor</label>
            <input
              type="text"
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="mt-1 w-full input"
            />
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
                            <input type="number" value={cycle.frequency_in_days} onChange={e => handleCycleChange(index, 'frequency_in_days', parseInt(e.target.value, 10))} className="mt-1 w-full input" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Última</label>
                                <input type="date" value={cycle.last_maintenance_date} onChange={e => handleCycleChange(index, 'last_maintenance_date', e.target.value)} className="mt-1 w-full input" />
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
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
