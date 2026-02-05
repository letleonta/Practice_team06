export const FormSection = ({ id, title, icon: Icon, iconColor, children }: any) => (
    <section id={id} className="bg-[#1a1d26] p-10 rounded-[40px] border border-gray-800 shadow-2xl space-y-8 scroll-mt-10">
        <h3 className="text-white font-black uppercase flex items-center gap-3 border-b border-gray-800 pb-8">
            <Icon className={iconColor} /> {title}
        </h3>
        {children}
    </section>
);