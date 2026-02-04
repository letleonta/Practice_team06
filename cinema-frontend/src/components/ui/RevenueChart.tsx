import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {formatDateShort } from "../../utils/formatTime.ts";
import type { RevenuePointDto} from "../../types/booking.ts";

const RevenueChart = ({ data }: { data: RevenuePointDto[] }) => {
    return (
        <div className="bg-[#1a1d26] border border-gray-800 rounded-3xl p-6 shadow-sm h-80 flex flex-col overflow-hidden">
            <h3 className="text-xs text-gray-500 uppercase font-black tracking-[0.2em] mb-6 shrink-0">
                Динаміка виручки
            </h3>

            <div className="flex-1 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={10}
                            tickFormatter={formatDateShort}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#6b7280"
                            fontSize={10}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => `${val}₴`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#161820', border: '1px solid #374151', borderRadius: '8px' }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                            itemStyle={{ color: '#dc2626', fontWeight: 'bold' }}
                            labelFormatter={(label) => formatDateShort(label)}
                            formatter={(value: any) => `${Number(value).toLocaleString()} ₴`}
                        />
                        <Area
                            name="Виручка"
                            type="monotone"
                            dataKey="amount"
                            stroke="#dc2626"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAmt)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;