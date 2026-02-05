import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onClose: () => void;
    isLoading?: boolean;
    variant?: 'danger' | 'warning';
}

export const ConfirmModal = ({
                                 isOpen,
                                 title,
                                 description,
                                 confirmText = "Видалити",
                                 cancelText = "Скасувати",
                                 onConfirm,
                                 onClose,
                                 isLoading,
                                 variant = 'danger'
                             }: ConfirmModalProps) => {
    if (!isOpen) return null;

    const accentColor = variant === 'danger' ? 'red' : 'yellow';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-fade-in">
            <div className="bg-[#1a1d26] border border-gray-800 p-10 rounded-[40px] w-full max-w-md shadow-2xl text-center scale-in">
                <AlertTriangle size={48} className={`mx-auto mb-6 text-${accentColor}-500`} />

                <h3 className="text-2xl font-black uppercase mb-2 text-white">
                    {title}
                </h3>

                <div className="text-gray-400 text-sm mb-8 leading-relaxed">
                    {description}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-4 rounded-2xl bg-gray-800 font-black uppercase text-[10px] text-white hover:bg-gray-700 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg text-white transition-all 
                            ${variant === 'danger'
                            ? 'bg-red-600 shadow-red-600/20 hover:bg-red-700'
                            : 'bg-yellow-600 shadow-yellow-600/20 hover:bg-yellow-700'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Зачекайте...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};