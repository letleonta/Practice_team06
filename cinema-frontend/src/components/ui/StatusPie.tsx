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
        <div className="bg-[#1a1d26] border border-gray-800 rounded-3xl p-6 shadow-sm min-h-75">
            <h3 className="text-xs text-gray-500 uppercase font-black tracking-[0.2em] mb-6 shrink-0">
                Статус бронювань
            </h3>
            <div className="flex flex-col items-center w-full min-w-0">
                <div className="h-48 w-48 shrink-0 relative mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={50}
                                outerRadius={65}
                                dataKey="value"
                                stroke="none"
                                shape={MyCustomSector}
                            >
                                <LabelList
                                    dataKey="value"
                                    position="outside"
                                    offset={10}
                                    fill="#9ca3af"
                                    fontSize={10}
                                    fontWeight="bold"
                                    formatter={(val: any) => (val > 0 ? val : '')}
                                />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-black text-white leading-none">{total}</span>
                        <span className="text-[8px] text-gray-500 uppercase tracking-tighter text-center mt-1">
                            Всього
                        </span>
                    </div>
                </div>

                <div className="w-full space-y-2 px-2">
                    {data.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between group py-1 border-b border-gray-800/50 last:border-0">
                            <div className="flex items-center min-w-0">
                                <div
                                    className="w-2.5 h-2.5 rounded-full mr-3 shrink-0"
                                    style={{ backgroundColor: COLORS[index] }}
                                />
                                <span className="text-sm text-gray-400 font-medium truncate">
                                    {item.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 ml-2 shrink-0">
                                <span className="text-sm font-bold text-white">
                                    {item.value}
                                </span>
                                <span className="text-sm font-semibold text-gray-500 w-10 text-right">
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