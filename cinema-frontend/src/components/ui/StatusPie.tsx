import { PieChart, Pie, Sector, ResponsiveContainer, LabelList } from 'recharts';
import type {BookingsStatsDto} from "../../types/booking";

interface StatusPieProps {
    stats: BookingsStatsDto;
}

const COLORS = ['#3C7E1B', '#940B48', '#FF0A12']; // Оплачено, В процесі, Скасовано

const MyCustomSector = (props: any) => {
    return (
        <Sector
            {...props}
            fill={COLORS[props.index % COLORS.length]}
            className="outline-none cursor-pointer"
        />
    );
};

const StatusPie = ({ stats }: StatusPieProps) => {
    const total = (stats.paidCount || 0) + (stats.inProgressCount || 0) + (stats.cancelledCount || 0);

    const data = [
        { name: 'Оплачено', value: stats.paidCount },
        { name: 'В процесі', value: stats.inProgressCount },
        { name: 'Скасовано', value: stats.cancelledCount },
    ];

    const getPercent = (value: number) => (total > 0 ? ((value / total) * 100).toFixed(1) : "0.0");

    return (
        <div className="bg-[#1a1d26] border border-gray-800 rounded-2xl p-6 shadow-xl h-full flex flex-col justify-center">
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-6 tracking-wider">Статуси замовлень</h3>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                {/* Графік */}
                <div className="h-50 w-50 shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={55}
                                outerRadius={75}
                                dataKey="value"
                                stroke="none"
                                shape={MyCustomSector}
                                animationDuration={1000}
                            >
                                <LabelList
                                    dataKey="value"
                                    position="outside"
                                    offset={15}
                                    fill="#6b7280"
                                    fontSize={12}
                                    fontWeight="bold"
                                    formatter={(val) => {
                                        const num = Number(val);
                                        return num > 0 ? num.toString() : '';
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Текст у центрі кола */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-white">{total}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest text-center leading-tight">Всього<br/>бронювань</span>
                    </div>
                </div>

                {/* Легенда */}
                <div className="flex-1 w-full space-y-4">
                    {data.map((item, index) => (
                        <div key={item.name} className="flex items-center group">
                            {/* Кольоровий індикатор (Tailwind класи для надійності) */}
                            <div
                                className="w-3 h-3 rounded-full mr-4 transition-transform group-hover:scale-125 shrink-0"
                                style={{ backgroundColor: COLORS[index] }}
                            />

                            <span className="text-sm text-gray-400 font-medium flex-1">
                                {item.name}
                            </span>

                            {/* Кількість та відсоток */}
                            <div className="flex items-center gap-4 ml-4">
                                <span className="text-sm font-bold text-white min-w-5 text-right">
                                    {item.value}
                                </span>
                                <span className="text-sm font-semibold text-gray-400 w-12 text-right">
                                    {getPercent(item.value)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatusPie;