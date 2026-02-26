import { Printer, QrCode, X } from 'lucide-react';

interface NewEquipmentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId: string;
}

export default function NewEquipmentQrModal({ isOpen, onClose, equipmentId }: NewEquipmentQrModalProps) {
  if (!isOpen) return null;

    const baseUrl = window.location.origin;
  const equipmentUrl = `${baseUrl}/equipamentos/${equipmentId}?view=public`;
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(equipmentUrl)}&size=300&ecc=H`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Etiqueta Equipamento ${equipmentId}</title>
            <style>
              body { font-family: sans-serif; text-align: center; margin-top: 50px; }
              img { max-width: 300px; }
              h1 { font-size: 24px; }
            </style>
          </head>
          <body>
            <img src="${qrUrl}" alt="QR Code do Equipamento ${equipmentId}" />
            <h1>${equipmentId}</h1>
            <script>
              window.onload = () => {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
        </button>
        <div className="flex flex-col items-center">
            <QrCode className="h-12 w-12 text-indigo-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Equipamento Criado!</h2>
            <p className="text-gray-600 mb-6">Imprima a etiqueta de QR Code para identificação.</p>
            <img src={qrUrl} alt={`QR Code para ${equipmentId}`} className="max-w-[200px] w-full rounded-lg border p-1" referrerPolicy="no-referrer" />
            <p className="mt-2 text-sm font-mono bg-gray-100 px-2 py-1 rounded">{equipmentId}</p>
            <button onClick={handlePrint} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
                <Printer className="h-4 w-4" />
                Imprimir Etiqueta
            </button>
        </div>
      </div>
    </div>
  );
}
