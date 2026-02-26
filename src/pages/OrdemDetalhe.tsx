import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, AlertTriangle, Camera, Edit2, Upload, XCircle, Calendar } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { OSStatus } from '../components/ServiceOrderCard';

interface OrderDetails {
    id: string;
    title: string;
    status: OSStatus;
    equipment_id: string;
    sector: string;
    due_date: string;
    is_late: boolean;
    sap_os_number?: string;
    completion_image_url?: string;
    // Adicionar mais campos se necessário, como a descrição do risco
}

export default function OrdemDetalhe() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);

    const [sapOsNumber, setSapOsNumber] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [completionDate, setCompletionDate] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCompleteOrder = async () => {
        if (!image || !completionDate) {
            alert('Por favor, adicione uma foto comprobatória e a data de conclusão para finalizar a ordem.');
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        if (sapOsNumber) formData.append('sap_os_number', sapOsNumber);
        formData.append('image', image);
        formData.append('completion_date', completionDate);

        try {
            const response = await fetch(`/api/service-orders/${id}/complete`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) throw new Error('Falha ao concluir a ordem de serviço');

            alert('Ordem de Serviço concluída com sucesso!');
            // Refresh data
            const updatedDataResponse = await fetch(`/api/service-orders/${id}`);
            const updatedData = await updatedDataResponse.json();
            setData(updatedData);
        } catch (error) {
            console.error('Erro ao concluir OS:', error);
            alert('Erro ao concluir a ordem de serviço. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        // Set initial completion date to today
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        setCompletionDate(`${year}-${month}-${day}`);
    }, []);

    useEffect(() => {
        if (!id) return;
        async function fetchOrderDetails() {
            try {
                const response = await fetch(`/api/service-orders/${id}`);
                if (!response.ok) throw new Error('Ordem de Serviço não encontrada');
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Erro ao buscar detalhes da OS:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrderDetails();
    }, [id]);

    if (loading) {
        return <div>Carregando detalhes da Ordem de Serviço...</div>;
    }

    if (!data) {
        return <div>Ordem de Serviço não encontrada.</div>;
    }

    return (
        <div>
            <Link to="/ordens" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4">
                <ArrowLeft className="h-5 w-5" />
                Voltar
            </Link>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{id}</h1>
                    <p className="text-sm text-gray-500">{data.equipment_id} • {data.sector}</p>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">{data.title}</h2>
                        <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800">
                            <Clock className="-ml-1 mr-1.5 h-4 w-4" />
                            {data.status}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Prazo: {data.due_date}</p>
                    
                    {data.is_late && (
                        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-semibold text-yellow-800">Risco Sanitário</h3>
                                    <p className="mt-1 text-sm text-yellow-700"><strong>CRÍTICO:</strong> Filtro vencido há mais de 5 dias. Risco elevado de contaminação bacteriana, formação de biofilme e presença de microorganismos patogênicos. Intervenção urgente necessária.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Execution Section */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Execução da Ordem</h2>
                    <div className="space-y-4">
                        {/* Photo Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-gray-100 p-2 rounded-full">
                                    <Camera className="h-5 w-5 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">1. Foto Comprobatória</h3>
                            </div>
                            
                            {data.status === 'CONCLUÍDA' ? (
                                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-green-800 font-medium">Serviço Concluído</p>
                                    {data.completion_image_url && (
                                        <img src={data.completion_image_url} alt="Comprovação" className="mt-2 mx-auto h-48 object-contain rounded-md" />
                                    )}
                                    {data.sap_os_number && (
                                        <p className="mt-2 text-sm text-gray-600">OS SAP: <strong>{data.sap_os_number}</strong></p>
                                    )}
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        {imagePreview ? (
                                            <div className="mb-4 relative">
                                                <img src={imagePreview} alt="Preview" className="h-48 object-contain rounded-md" />
                                                <button 
                                                    onClick={() => { setImage(null); setImagePreview(null); }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                        )}
                                        
                                        <p className="text-sm text-gray-500 mb-4">Foto do serviço concluído</p>
                                        
                                        <div className="flex gap-4 w-full">
                                            <label className="btn-secondary flex-1 justify-center cursor-pointer">
                                                <span>Selecionar Foto</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SAP OS Number (Optional) */}
                        {data.status !== 'CONCLUÍDA' && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Número da OS SAP (Opcional)</h3>
                                <input 
                                    type="text" 
                                    value={sapOsNumber}
                                    onChange={(e) => setSapOsNumber(e.target.value)}
                                    placeholder="Digite o número da OS gerada no SAP"
                                    className="w-full input"
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        {data.status !== 'CONCLUÍDA' && (
                            <button 
                                onClick={handleCompleteOrder}
                                disabled={submitting || !image}
                                className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-sm transition-colors ${
                                    submitting || !image ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {submitting ? 'Enviando...' : 'Finalizar Serviço'}
                            </button>
                        )}

                        {/* Completion Date Card */}
                        {data.status !== 'CONCLUÍDA' && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <Calendar className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">2. Data do Serviço</h3>
                                </div>
                                <input 
                                    type="date" 
                                    value={completionDate}
                                    onChange={(e) => setCompletionDate(e.target.value)}
                                    className="w-full input"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
