// Поле вводу (Input)
export const FormInput = ({ label, labelColor = "text-gray-500", ...props }: any) => (
    <div className="w-full"> {/* Додано w-full сюди */}
        <label className={`text-[10px] ${labelColor} font-black uppercase mb-3 block tracking-widest leading-none`}>
            {label || "Без назви"} {/* Захист від пустого лейбла */}
        </label>
        <input
            {...props}
            className="w-full bg-gray-900 border border-gray-700 p-5 rounded-2xl outline-none focus:border-red-600 text-white font-bold text-lg shadow-inner transition-all"
        />
    </div>
);

// Секція (Section)
export const FormSection = ({ id, title, icon: Icon, iconColor, children }: any) => (
    <section id={id} className="bg-[#1a1d26] p-10 rounded-[40px] border border-gray-800 shadow-2xl space-y-8 scroll-mt-10 w-full">
        <h3 className="text-white font-black uppercase flex items-center gap-3 border-b border-gray-800 pb-8 tracking-widest">
            {Icon && <Icon className={iconColor} size={20} />} {title}
        </h3>
        <div className="space-y-6"> {/* Обгортка для контенту */}
            {children}
        </div>
    </section>
);

// Селектор
export const FormSelect = ({ label, children, ...props }: any) => (
    <div>
        <label className="text-[10px] text-gray-500 font-black uppercase mb-3 block tracking-widest leading-none">{label}</label>
        <select {...props} className="w-full bg-gray-900 border border-gray-700 p-5 rounded-2xl outline-none text-white font-black uppercase text-xs cursor-pointer shadow-inner">
            {children}
        </select>
    </div>
);

// Текстове поле
export const FormTextarea = ({ label, ...props }: any) => (
    <div>
        <label className="text-[10px] text-gray-500 font-black uppercase mb-3 block tracking-widest leading-none">{label}</label>
        <textarea {...props} className="w-full bg-gray-900 border border-gray-700 p-6 rounded-3xl outline-none focus:border-red-600 text-gray-300 resize-none font-medium leading-relaxed shadow-inner" />
    </div>
);