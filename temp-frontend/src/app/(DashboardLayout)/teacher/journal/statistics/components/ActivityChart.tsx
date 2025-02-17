'use client';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ActivityData {
    date: string;
    count: number;
}

interface ActivityChartProps {
    data: ActivityData[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
    const formattedData = data.map(item => ({
        ...item,
        formattedDate: format(parseISO(item.date), 'MMM d'),
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={formattedData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 12 }}
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                />
                <Tooltip
                    labelFormatter={(value) => `Date: ${value}`}
                    formatter={(value: number) => [`${value} entries`, 'Count']}
                />
                <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
