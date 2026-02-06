import {type LucideIcon, Plus } from 'lucide-react';

interface IconButtonProps {
    icon?: LucideIcon;
    onClick: () => void;
    color?: 'amber' | 'purple' | 'red' | 'blue' | 'gray';
    className?: string;
    size?: number;
}

export const IconButton = ({
                               icon: Icon = Plus,
                               onClick,
                               color = 'amber',
                               className = '',
                               size = 18
                           }: IconButtonProps) => {

    const colorClasses = {
        amber: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
        purple: 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/10',
        red: 'bg-red-600 hover:bg-red-700 shadow-red-600/10',
        blue: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/10',
        gray: 'bg-gray-800 hover:bg-gray-700 shadow-black/20',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-4 text-white rounded-2xl shadow-lg transition-all active:scale-95 ${colorClasses[color]} ${className}`}
        >
            <Icon size={size} />
        </button>
    );
};