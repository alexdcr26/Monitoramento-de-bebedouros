import { Printer, QrCode } from 'lucide-react';

interface QrCodeCardProps {
  equipmentId: string;
}

export default function QrCodeCard({ equipmentId }: QrCodeCardProps) {
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 self-start">
        <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-100 p-2 rounded-full">
                <QrCode className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Identificação do Ativo</h3>
        </div>
        <div className="flex flex-col items-center">
            <img src={qrUrl} alt={`QR Code para ${equipmentId}`} className="max-w-[200px] w-full rounded-lg border p-1" referrerPolicy="no-referrer" />
            <p className="mt-2 text-sm font-mono bg-gray-100 px-2 py-1 rounded">{equipmentId}</p>
            <button onClick={handlePrint} className="btn-secondary w-full mt-4 flex items-center justify-center gap-2">
                <Printer className="h-4 w-4" />
                Imprimir Etiqueta
            </button>
        </div>
    </div>
  );
}
