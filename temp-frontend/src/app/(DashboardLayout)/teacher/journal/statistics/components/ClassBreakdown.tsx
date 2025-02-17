'use client';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface ClassData {
    className: string;
    count: number;
}

interface ClassBreakdownProps {
    data: ClassData[];
}

export default function ClassBreakdown({ data }: ClassBreakdownProps) {
    const formattedData = data.map(item => ({
        name: item.className,
        entries: item.count,
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={formattedData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                barSize={20}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                />
                <Tooltip
                    formatter={(value: number) => [`${value} entries`, 'Count']}
                />
                <Bar
                    dataKey="entries"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
