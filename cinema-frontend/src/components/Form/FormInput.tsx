export const FormInput = ({ label, labelColor = "text-gray-500", ...props }: any) => (
    <div className="w-full">
        <label className={`text-[10px] ${labelColor} font-black uppercase mb-3 block tracking-widest`}>
            {label}
        </label>
        <input
            {...props}
            className="w-full bg-gray-900 border border-gray-700 p-5 rounded-2xl outline-none focus:border-red-600 text-white font-bold shadow-inner transition-colors"
        />
    </div>
);