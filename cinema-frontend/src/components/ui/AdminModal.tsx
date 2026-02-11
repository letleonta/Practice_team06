import type {ReactNode} from 'react';
import { X } from 'lucide-react';

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: ReactNode;
    headerExtra?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    maxWidth?: string;
}

export const AdminModal = ({
                               isOpen,
                               onClose,
                               title,
                               headerExtra,
                               children,
                               footer,
                               maxWidth = 'max-w-lg'
                           }: AdminModalProps) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className={`bg-[#1a1d26] border border-gray-800 rounded-[2.5rem] w-full ${maxWidth} max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-gray-800 flex items-center justify-between bg-linear-to-r from-red-600/10 to-transparent shrink-0">
                    <div className="flex-1">{title}</div>
                    <div className="flex items-center gap-3">
                        {headerExtra}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {children && (
                    <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar font-sans">
                        {children}
                    </div>
                )}

                {/* Footer */}
                {footer && (
                    <div className="p-6 bg-gray-900/50 border-t border-gray-800 flex gap-4 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};