import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lightbulb, XCircle } from 'lucide-react';

const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
    const qrboxSize = Math.floor(minEdge * 0.8);
    return {
        width: qrboxSize,
        height: qrboxSize,
    };
};

export default function EscanearQrCode() {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const html5Qrcode = new Html5Qrcode('reader');
    scannerRef.current = html5Qrcode;

    const startScanner = async () => {
        const config = {
            fps: 10,
            qrbox: qrboxFunction,
            aspectRatio: 1.0,
        };

        const onScanSuccess = (decodedText: string) => {
            if (decodedText) {
                try {
                    const url = new URL(decodedText);
                    if (url.protocol === 'http:' || url.protocol === 'https:') {
                        window.location.href = decodedText;
                    } else {
                        setError('QR Code não contém um link válido.');
                    }
                } catch (_) {
                    setError('QR Code inválido. O conteúdo não é uma URL.');
                }
            }
        };

        const onScanFailure = () => {
            // Silently ignore scan failures.
        };

        try {
            const cameras = await Html5Qrcode.getCameras();
            if (!cameras || cameras.length === 0) {
                setError('Nenhuma câmera encontrada.');
                return;
            }

            const rearCamera = cameras.find(camera => camera.label.toLowerCase().includes('back'));
            const cameraId = rearCamera ? rearCamera.id : cameras[0].id;

            await html5Qrcode.start(cameraId, config, onScanSuccess, onScanFailure);

        } catch (err: any) {
            console.error('Erro detalhado ao iniciar scanner:', err);
            if (err.name === 'NotAllowedError') {
                setError('A permissão para acessar a câmera é necessária.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                 setError('Nenhuma câmera foi encontrada neste dispositivo.');
            } else {
                setError('Não foi possível iniciar a câmera. Tente recarregar a página.');
            }
        }
    };

    startScanner();

    return () => {
      const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
          try {
            await scannerRef.current.stop();
          } catch (err) {
            console.error('Failed to stop scanner gracefully:', err);
          }
        }
      };
      stopScanner();
    };
  }, []);

  return (
    <div>
      <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft className="h-5 w-5" />
        Voltar ao Dashboard
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Escanear QR Code</h1>
      <p className="text-gray-600 mb-6">Aponte a câmera para o QR Code do equipamento.</p>

      <div id="reader" className="max-w-md mx-auto rounded-xl overflow-hidden shadow-2xl border-4 border-gray-200"></div>

      {error && (
        <div className="mt-6 max-w-md mx-auto bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex">
                <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            </div>
        </div>
      )}

      {!error && (
          <div className="mt-6 max-w-md mx-auto bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex">
                <div className="flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                    <p className="text-sm text-blue-700">Posicione o QR Code dentro da área da câmera para uma leitura rápida.</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
