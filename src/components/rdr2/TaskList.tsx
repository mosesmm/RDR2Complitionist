
'use client';

import { useState } from 'react';
import { useProgress } from '@/context/ProgressContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { GameTask, MainMission, StrangerMission, Challenge, Collectible, Miscellaneous, TaskCategory } from '@/lib/types';
import { Star, HelpCircle, Loader2, WandSparkles, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getMissionHelp } from '@/ai/flows/get-mission-help';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const getTaskTitle = (task: GameTask) => {
  switch (task.category) {
      case TaskCategory.Challenge:
          const challenge = task as Challenge;
          return `${challenge.challengeType} - Rank ${challenge.rank}`;
      case TaskCategory.Collectible:
          return (task as Collectible).name;
      default:
          return task.name;
  }
}

const MissionHelpDialog = ({ task }: { task: GameTask }) => {
  const taskTitle = getTaskTitle(task);
  const [isOpen, setIsOpen] = useState(false);
  const [assistance, setAssistance] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetHelp = async () => {
    setIsLoading(true);
    setError('');
    setAssistance('');
    try {
      const result = await getMissionHelp({ taskName: taskTitle });
      setAssistance(result.assistance);
    } catch (e) {
      console.error(e);
      setError('Sorry, I couldn\'t fetch any advice right now. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when dialog is closed
  const onOpenChange = (open: boolean) => {
    if (!open) {
      setAssistance('');
      setError('');
      setIsLoading(false);
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 shrink-0">
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-accent-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Guide for: {taskTitle}</DialogTitle>
          <DialogDescription>
            Click the button below to get AI-powered tips and a walkthrough for this task.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {!assistance && !isLoading && !error && (
            <Button onClick={handleGetHelp} className="w-full">
              <WandSparkles className="mr-2 h-4 w-4" /> Get Help
            </Button>
          )}
          
          {isLoading && (
              <Button disabled className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking...
              </Button>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {assistance && (
            <Card className="max-h-80 overflow-y-auto">
              <CardContent className="pt-6">
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{assistance}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};


const TaskItem = ({ task }: { task: GameTask }) => {
  const { completedTasks, toggleTask, goldMedalMissions, toggleGoldMedal } = useProgress();
  const isCompleted = completedTasks.has(task.id);

  const renderTaskDetails = () => {
    switch (task.category) {
      case TaskCategory.MainStory:
        const mission = task as MainMission;
        const hasGold = goldMedalMissions.has(mission.id);
        return (
          <>
            <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>
            <div className="mt-2">
              <div 
                className="flex items-center gap-2 text-sm font-bold text-accent-foreground/80 mb-1 cursor-pointer"
                onClick={() => toggleGoldMedal(mission.id)}
              >
                {hasGold ? (
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ) : (
                    <StarOff className="h-4 w-4 text-accent" />
                )}
                <h4>Gold Medal Objectives</h4>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {mission.goldMedalObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
              </ul>
            </div>
          </>
        );
      case TaskCategory.Stranger:
        return <p className="text-sm text-muted-foreground">{(task as StrangerMission).description}</p>;
      case TaskCategory.Challenge:
        return <p className="text-sm text-muted-foreground">{(task as Challenge).description}</p>;
      case TaskCategory.Miscellaneous:
        return <p className="text-sm text-muted-foreground">{(task as Miscellaneous).description}</p>;
      default:
        return null;
    }
  };
  
  return (
    <div className="flex items-start gap-4 rounded-md p-3 transition-colors hover:bg-secondary/50">
      <Checkbox
        id={task.id}
        checked={isCompleted}
        onCheckedChange={() => toggleTask(task.id)}
        className="mt-1"
        aria-label={`Mark ${getTaskTitle(task)} as complete`}
      />
      <div className="flex-1">
        <div className="flex items-center">
            <label htmlFor={task.id} className="font-bold cursor-pointer">{getTaskTitle(task)}</label>
            <MissionHelpDialog task={task} />
        </div>
        {renderTaskDetails()}
      </div>
    </div>
  );
};

interface TaskListProps {
  tasks: GameTask[];
}

const TaskList = ({ tasks }: TaskListProps) => {
  const { completedTasks, isLoaded } = useProgress();

  if (!isLoaded) return <div>Loading tasks...</div>;
  if (tasks.length === 0) return <p className="text-center text-muted-foreground py-8">No tasks match your filter.</p>;

  // Group Main Story missions by chapter
  const mainMissionsByChapter = tasks
    .filter((task): task is MainMission => task.category === TaskCategory.MainStory)
    .reduce((acc, mission) => {
      const chapter = `Chapter ${mission.chapter}`;
      if (!acc[chapter]) acc[chapter] = [];
      acc[chapter].push(mission);
      return acc;
    }, {} as Record<string, MainMission[]>);

  // Group other tasks by category
  const otherTasksByCategory = tasks
    .filter(task => task.category !== TaskCategory.MainStory)
    .reduce((acc, task) => {
        if (!acc[task.category]) acc[task.category] = [];
        acc[task.category].push(task);
        return acc;
    }, {} as Record<string, GameTask[]>)

  const accordionGroups = {...mainMissionsByChapter, ...otherTasksByCategory};
  const defaultOpenValue = Object.keys(accordionGroups)[0] || '';

  return (
    <Accordion type="single" collapsible defaultValue={defaultOpenValue} className="w-full">
      {Object.entries(accordionGroups).map(([group, groupTasks]) => {
        const total = groupTasks.length;
        const completed = groupTasks.filter(t => completedTasks.has(t.id)).length;
        return (
          <AccordionItem value={group} key={group}>
            <AccordionTrigger className="font-headline text-xl hover:no-underline">
              <div className="flex items-center gap-4">
                <span>{group}</span>
                <Badge variant={completed === total ? 'default' : 'secondary'} className="bg-accent text-accent-foreground">
                  {completed} / {total}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {groupTasks.map((task) => <TaskItem key={task.id} task={task} />)}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default TaskList;
