'use client';

import { useProgress } from '@/context/ProgressContext';
import { allTasks, taskCategories } from '@/lib/rdr2-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TaskCategory } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const ProgressSummary = () => {
  const { completedTasks, isLoaded } = useProgress();

  if (!isLoaded) {
    return <ProgressSummarySkeleton />;
  }

  const totalTasks = allTasks.length;
  const totalCompleted = completedTasks.size;
  const overallPercentage = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

  const getCategoryProgress = (category: TaskCategory) => {
    const categoryTasks = allTasks.filter((task) => task.category === category);
    const completedInCategory = categoryTasks.filter((task) => completedTasks.has(task.id)).length;
    const percentage = categoryTasks.length > 0 ? (completedInCategory / categoryTasks.length) * 100 : 0;
    return { percentage, completed: completedInCategory, total: categoryTasks.length };
  };

  return (
    <Card className="mb-8 shadow-md h-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">Total Completion: {overallPercentage.toFixed(1)}%</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Progress value={overallPercentage} className="h-4" />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary-foreground mix-blend-difference">
            {totalCompleted} / {totalTasks}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {taskCategories.map((category) => {
            const { percentage, completed, total } = getCategoryProgress(category);
            return (
              <div key={category}>
                <div className="mb-1 flex justify-between text-sm font-semibold">
                  <span>{category}</span>
                  <span className="text-muted-foreground">{completed} / {total}</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};


const ProgressSummarySkeleton = () => {
  return (
    <Card className="mb-8 shadow-md h-full">
      <CardHeader>
         <Skeleton className="h-8 w-1/2 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array(5).fill(0).map((_, i) => (
             <div key={i}>
                <div className="mb-1 flex justify-between">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-1/4" />
                </div>
                <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


export default ProgressSummary;
