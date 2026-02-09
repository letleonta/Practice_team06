import type {ReactNode} from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    iconColorClass: string;
    bgColorClass: string;
}

export const StatCard = ({ label, value, icon, iconColorClass, bgColorClass }: StatCardProps) => {
    return (
        <div className="bg-[#1a1d26] border border-gray-800 rounded-3xl flex items-center justify-center gap-4 p-6 flex-1 shadow-sm transition-transform hover:scale-[1.02]">
            <div className={`${bgColorClass} p-4 rounded-2xl`}>
                <div className={iconColorClass}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">
                    {label}
                </p>
                <p className="text-3xl font-black text-white whitespace-nowrap">
                    {value}
                </p>
            </div>
        </div>
    );
};