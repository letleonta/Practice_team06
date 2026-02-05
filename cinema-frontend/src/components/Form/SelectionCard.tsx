import {Check} from "lucide-react";

export const SelectionCard = ({ id, label, isChecked, onToggle, activeClass }: any) => (
    <label
        onClick={onToggle}
        className={`flex items-center gap-4 p-5 rounded-3xl border transition-all cursor-pointer group ${
            isChecked ? `${activeClass} border-transparent shadow-lg` : 'bg-gray-900 border-gray-800 hover:border-gray-600'
        }`}
    >
        <input type="checkbox" checked={isChecked} readOnly className="hidden" />
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isChecked ? 'bg-white border-white' : 'border-gray-700'}`}>
            {isChecked && <Check size={14} className="text-black font-bold" />}
        </div>
        <span className={`text-[11px] font-black uppercase ${isChecked ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
            {label}
        </span>
    </label>
);