'use client';

import { useProgress } from '@/context/ProgressContext';
import { allTasks, taskCategories } from '@/lib/rdr2-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCategory } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';

const ProgressChart = () => {
    const { completedTasks, isLoaded } = useProgress();
    const { theme } = useTheme();

    if (!isLoaded) {
        return <ProgressChartSkeleton />;
    }

    const getCategoryProgress = (category: TaskCategory) => {
        const categoryTasks = allTasks.filter((task) => task.category === category);
        const completedInCategory = categoryTasks.filter((task) => completedTasks.has(task.id)).length;
        const total = categoryTasks.length;
        const percentage = total > 0 ? (completedInCategory / total) * 100 : 0;
        return { name: category, value: percentage, completed: completedInCategory, total };
    };

    const data = taskCategories.map(getCategoryProgress);

    const chartColors = theme === 'dark'
    ? ['#c96666', '#a48f6c', '#809a76', '#6a95a4', '#8f7da0']
    : ['#b54f4f', '#8e795b', '#68825e', '#557d8a', '#776587'];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="p-2 bg-popover text-popover-foreground border rounded-md shadow-lg">
                    <p className="font-bold">{data.name}</p>
                    <p className="text-sm">{`${data.value.toFixed(1)}%`}</p>
                    <p className="text-xs text-muted-foreground">{`(${data.completed}/${data.total} tasks)`}</p>
                </div>
            );
        }
        return null;
    };
    
    return (
        <Card className="shadow-md h-full">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-center">Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

const ProgressChartSkeleton = () => (
    <Card className="shadow-md h-full">
        <CardHeader>
            <Skeleton className="h-8 w-3/4 mx-auto" />
        </CardHeader>
        <CardContent>
            <div className="flex justify-center items-center h-[300px]">
                <Skeleton className="h-48 w-48 rounded-full" />
            </div>
        </CardContent>
    </Card>
);

export default ProgressChart;
