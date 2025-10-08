
'use client';

import { useState, useMemo } from 'react';
import ProgressSummary from './ProgressSummary';
import AiSuggest from './AiSuggest';
import TaskList from './TaskList';
import { allTasks, taskCategories } from '@/lib/rdr2-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameTask, TaskCategory, Challenge } from '@/lib/types';
import { useProgress } from '@/context/ProgressContext';
import { Card, CardContent } from '../ui/card';
import ProgressChart from './ProgressChart';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AreaChart, Bot, ListTodo } from 'lucide-react';

const getTaskSearchableName = (task: GameTask) => {
    if ('name' in task && task.name) {
      return task.name;
    }
    if (task.category === TaskCategory.Challenge) {
      const challenge = task as Challenge;
      return `${challenge.challengeType} - Rank ${challenge.rank}`;
    }
    return '';
  };

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [completionStatus, setCompletionStatus] = useState<string>('All');
  
  const { completedTasks, isLoaded } = useProgress();

  const filteredTasks = useMemo(() => {
    if (!isLoaded) return [];
    
    return allTasks.filter((task) => {
      const searchableName = getTaskSearchableName(task);
      const searchMatch = searchableName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ('description' in task && task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const categoryMatch = activeCategory === 'All' || task.category === activeCategory;

      const completionMatch =
        completionStatus === 'All' ||
        (completionStatus === 'Completed' && completedTasks.has(task.id)) ||
        (completionStatus === 'Incomplete' && !completedTasks.has(task.id));

      return searchMatch && categoryMatch && completionMatch;
    });
  }, [searchTerm, activeCategory, completionStatus, completedTasks, isLoaded]);

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={['progress', 'tasks', 'ai-suggest']} className="w-full space-y-4">
        <AccordionItem value="progress" className="border-none">
           <Card className="shadow-md">
            <AccordionTrigger className="p-6 hover:no-underline">
              <div className="flex items-center gap-4 text-primary">
                <AreaChart className="h-6 w-6" />
                <h2 className="font-headline text-2xl">Progress Overview</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <ProgressSummary />
                  </div>
                  <div>
                    <ProgressChart />
                  </div>
                </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
        
        <AccordionItem value="tasks" className="border-none">
           <Card className="shadow-md">
            <AccordionTrigger className="p-6 hover:no-underline">
               <div className="flex items-center gap-4 text-primary">
                <ListTodo className="h-6 w-6" />
                <h2 className="font-headline text-2xl">Task List</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                    type="search"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="md:col-span-1"
                    />
                    <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by category..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        {taskCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <Select value={completionStatus} onValueChange={setCompletionStatus}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by status..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Statuses</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Incomplete">Incomplete</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                
                <TaskList tasks={filteredTasks} />
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="ai-suggest" className="border-none">
          <Card className="shadow-md">
            <AccordionTrigger className="p-6 hover:no-underline">
               <div className="flex items-center gap-4 text-primary">
                <Bot className="h-6 w-6" />
                <h2 className="font-headline text-2xl">AI Suggestions</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <AiSuggest />
            </AccordionContent>
          </Card>
        </AccordionItem>

      </Accordion>

    </div>
  );
};

export default Dashboard;
