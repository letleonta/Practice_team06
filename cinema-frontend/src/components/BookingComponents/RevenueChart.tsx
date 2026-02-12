import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDateShortWithoutYear, formatDateShortWithYear } from "../../utils/formatTime.ts";
import type { RevenuePointDto, GroupByPeriod } from "../../types/booking.ts";

export type TimePreset = 'День' | 'Тиждень' | 'Місяць' | 'Рік';

interface RevenueChartProps {
    data: RevenuePointDto[];
    grouping: GroupByPeriod; // 'Hour' | 'Day' | 'Month'
    activePreset: TimePreset;
    onPresetClick: (preset: TimePreset, step: GroupByPeriod) => void;
}

const RevenueChart = ({ data, grouping, activePreset, onPresetClick }: RevenueChartProps) => {
    const PRESETS: { label: TimePreset; step: GroupByPeriod }[] = [
        { label: 'День', step: 'Hour' },
        { label: 'Тиждень', step: 'Day' },
        { label: 'Місяць', step: 'Day' },
        { label: 'Рік', step: 'Month' },
    ];

    const formatXAxis = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        switch (grouping) {
            case 'Hour':
                return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
            case 'Month':
                return date.toLocaleDateString('uk-UA', { month: 'short' });
            default:
                return formatDateShortWithoutYear(dateStr);
        }
    };

    const formatTooltipLabel = (label: string) => {
        if (!label) return '';

        const date = new Date(label);

        if (grouping === 'Hour') {
            return date.toLocaleString('uk-UA', {
                day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
            });
        }
        if (grouping === 'Month') {
            return date.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
        }
        return formatDateShortWithYear(label);
    };

    return (
        <div className="bg-[#1a1d26] border border-gray-800 rounded-3xl p-6 shadow-sm h-80 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className="text-xs text-gray-500 uppercase font-black tracking-[0.2em]">
                    Динаміка виручки
                </h3>

                <div className="flex bg-[#161820] p-1 rounded-xl border border-gray-800">
                    {PRESETS.map((p) => (
                        <button
                            key={p.label}
                            onClick={() => onPresetClick(p.label, p.step)}
                            className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                                activePreset === p.label
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />

                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={10}
                            tickFormatter={formatXAxis}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={grouping === 'Hour' ? 50 : 25}
                        />

                        <YAxis
                            stroke="#6b7280"
                            fontSize={10}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => `${val}₴`}
                        />

                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#161820',
                                border: '1px solid #374151',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                            }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '11px' }}
                            itemStyle={{ color: '#dc2626', fontWeight: 'bold', fontSize: '12px' }}
                            labelFormatter={(label) => formatTooltipLabel(label)}
                            formatter={(value: unknown) => [`${Number(value).toLocaleString()} ₴`, "Виручка"]}
                        />

                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#dc2626"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;