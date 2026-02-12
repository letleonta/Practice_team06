import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../api/axiosInstance';

interface Props {
    isOpen: boolean;
    type: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const QuickCreateModal = ({ isOpen, type, onClose, onSuccess }: Props) => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', name: '' });

    if (!isOpen) return null;

    const isPerson = ['actors', 'directors'].includes(type);

    const getTitle = () => {
        if (type === 'actors') return 'Додати актора';
        if (type === 'directors') return 'Додати режисера';
        if (type === 'genres') return 'Додати жанр';
        return 'Додати запис';
    };

    const handleSave = async () => {
        try {
            const payload = isPerson
                ? { firstName: formData.firstName, lastName: formData.lastName }
                : { name: formData.name };

            await api.post(`/${type}`, payload);
            onSuccess();
            onClose();
            setFormData({ firstName: '', lastName: '', name: '' });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-[#1a1d26] border border-gray-800 p-8 rounded-[40px] w-full max-w-lg shadow-2xl scale-in">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black uppercase text-white">{getTitle()}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24}/>
                    </button>
                </div>
                <div className="space-y-4">
                    {isPerson ? (
                        <>
                            <input
                                className="w-full bg-gray-900 border border-gray-700 p-4 rounded-2xl outline-none text-white font-bold shadow-inner focus:border-red-600 transition-colors"
                                placeholder="Ім'я"
                                value={formData.firstName}
                                onChange={e => setFormData({...formData, firstName: e.target.value})}
                            />
                            <input
                                className="w-full bg-gray-900 border border-gray-700 p-4 rounded-2xl outline-none text-white font-bold shadow-inner focus:border-red-600 transition-colors"
                                placeholder="Прізвище"
                                value={formData.lastName}
                                onChange={e => setFormData({...formData, lastName: e.target.value})}
                            />
                        </>
                    ) : (
                        <input
                            className="w-full bg-gray-900 border border-gray-700 p-4 rounded-2xl outline-none text-white font-bold shadow-inner focus:border-red-600 transition-colors"
                            placeholder="Назва"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    )}
                </div>
                <div className="flex gap-4 mt-10">
                    <button onClick={onClose} className="flex-1 py-4 rounded-2xl bg-gray-800 font-black text-xs text-white hover:bg-gray-700 transition-colors">
                        Скасувати
                    </button>
                    <button onClick={handleSave} className="flex-1 py-4 rounded-2xl bg-red-600 font-black text-xs text-white hover:bg-red-700 transition-colors">
                        Зберегти
                    </button>
                </div>
            </div>
        </div>
    );
};