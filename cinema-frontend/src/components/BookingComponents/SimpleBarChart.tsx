import type {ReactElement} from "react";
import {Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList, type LabelProps} from "recharts";

interface SimpleBarChartProps<T> {
    data: T[];
    dataKey: keyof T;
    dataLabel: string;
    nameKey: string;
    color: string;
    chartName: string;
}

export const SimpleBarChart = <T extends object>({
                                                      data,
                                                      dataKey,
                                                      dataLabel,
                                                      nameKey,
                                                      color,
                                                      chartName,
                                                  }: SimpleBarChartProps<T>): ReactElement => {

    const maxValue = data && data.length > 0
        ? Math.max(...data.map((d) => Number(d[dataKey]) || 0))
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
                        <YAxis
                            dataKey={nameKey as string}
                            type="category"
                            hide
                        />

                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{
                                backgroundColor: "#111827",
                                border: "1px solid #374151",
                                borderRadius: "12px",
                            }}
                            itemStyle={{ color: color, fontSize: "12px", fontWeight: "bold" }}
                            formatter={(value: unknown) => [Number(value).toLocaleString(), dataLabel]}
                        />

                        <Bar
                            name={dataLabel}
                            dataKey={dataKey as string}
                            fill={color}
                            radius={[0, 4, 4, 0]}
                        >
                            <LabelList
                                dataKey={nameKey as string}
                                content={(props: LabelProps) => {
                                    const { y, value } = props;
                                    const yVal = typeof y === "number" ? y : 0;

                                    return (
                                        <text
                                            x={0}
                                            y={yVal - 10}
                                            fill="#9ca3af"
                                            fontSize={11}
                                            fontWeight={700}
                                            textAnchor="start"
                                            style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                                        >
                                            {String(value ?? "")}
                                        </text>
                                    );
                                }}
                            />
                            <LabelList
                                dataKey={dataKey as string}
                                position="right"
                                offset={12}
                                fill="#ffffff"
                                fontSize={12}
                                fontWeight={800}
                                formatter={(val: unknown) => Number(val).toLocaleString()}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};