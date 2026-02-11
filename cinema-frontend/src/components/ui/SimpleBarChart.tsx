import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts";

export const SimpleBarChart = ({ data, dataKey, dataLabel, nameKey, color, chartName }: any) => {
    const maxValue = data && data.length > 0
        ? Math.max(...data.map((d: any) => d[dataKey]))
        : 0;

    return (
        <div className="bg-[#1a1d26] border border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col min-w-0 h-full">
            <h3 className="text-xs text-gray-500 uppercase font-black tracking-[0.2em] mb-6 shrink-0">
                {chartName}
            </h3>
            <div className="flex-1 w-full min-h-75">
                <ResponsiveContainer width="100%" height="100%" debounce={1}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ left: 0, right: 45, top: 30, bottom: 0 }}
                        barCategoryGap="35%"
                    >
                        <XAxis
                            type="number"
                            hide
                            domain={[0, maxValue]}
                        />
                        <YAxis dataKey={nameKey} type="category" hide />

                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: '#111827',
                                border: '1px solid #374151',
                                borderRadius: '12px'
                            }}
                        />

                        <Bar
                            name={dataLabel}
                            dataKey={dataKey}
                            fill={color}
                            radius={[0, 4, 4, 0]}
                        >
                            <LabelList
                                dataKey={nameKey}
                                content={(props: any) => {
                                    const { y, value } = props;
                                    return (
                                        <text
                                            x={0}
                                            y={y - 10}
                                            fill="#9ca3af"
                                            fontSize={11}
                                            fontWeight={700}
                                            textAnchor="start"
                                            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                        >
                                            {value}
                                        </text>
                                    );
                                }}
                            />
                            <LabelList
                                dataKey={dataKey}
                                position="right"
                                offset={12}
                                fill="#ffffff"
                                fontSize={12}
                                fontWeight={800}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};