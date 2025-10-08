
'use client';

import { useState } from 'react';
import { suggestNextSteps, SuggestNextStepsInput, SuggestNextStepsOutput } from '@/ai/flows/suggest-next-steps';
import { useProgress } from '@/context/ProgressContext';
import { allTasks } from '@/lib/rdr2-data';
import { TaskCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles, Bot, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const playstyles = [
  { value: 'completionist', label: 'Completionist' },
  { value: 'exploration', label: 'Exploration' },
  { value: 'combat', label: 'Combat' },
  { value: 'story', label: 'Story-focused' },
  { value: 'relaxed', label: 'Relaxed' },
];

const AiSuggest = () => {
  const { completedTasks, isLoaded } = useProgress();
  const [suggestions, setSuggestions] = useState<SuggestNextStepsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferredPlaystyle, setPreferredPlaystyle] = useState<string>('completionist');

  const getProgressPercentage = (category: TaskCategory) => {
    const categoryTasks = allTasks.filter((task) => task.category === category);
    if (categoryTasks.length === 0) return 0;
    const completedInCategory = categoryTasks.filter((task) => completedTasks.has(task.id)).length;
    return (completedInCategory / categoryTasks.length) * 100;
  };

  const handleSuggest = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    const input: SuggestNextStepsInput = {
      mainStoryProgress: getProgressPercentage(TaskCategory.MainStory),
      sideQuestsProgress: getProgressPercentage(TaskCategory.Stranger),
      challengesProgress: getProgressPercentage(TaskCategory.Challenge),
      collectiblesProgress: getProgressPercentage(TaskCategory.Collectible),
      miscellaneousProgress: getProgressPercentage(TaskCategory.Miscellaneous),
      preferredPlaystyle: preferredPlaystyle,
    };

    try {
      const result = await suggestNextSteps(input);
      setSuggestions(result);
    } catch (e) {
      console.error(e);
      setError('An error occurred while getting suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <CardHeader className="flex-row items-center gap-4 px-0 pt-0">
        <Sparkles className="h-8 w-8 text-accent" />
        <div>
          <CardTitle className="font-headline text-2xl">Need a Hint?</CardTitle>
          <CardDescription>Let AI suggest your next move towards 100% completion.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="mb-6 max-w-sm space-y-2">
            <Label htmlFor="playstyle-select">What are you in the mood for?</Label>
            <Select value={preferredPlaystyle} onValueChange={setPreferredPlaystyle}>
                <SelectTrigger id="playstyle-select">
                    <SelectValue placeholder="Select your playstyle..." />
                </SelectTrigger>
                <SelectContent>
                    {playstyles.map(style => (
                        <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        {isLoading && (
          <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <p>Analyzing your progress...</p>
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {suggestions && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.suggestedNextSteps.slice(0, 3).map((step, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{step.task}</CardTitle>
                  <CardDescription>
                    {step.category} - {step.difficulty}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{step.rationale}</p>
                </CardContent>
                <CardFooter className="text-xs font-semibold">
                  <p>Priority: {step.priority} | Est. Time: {step.estimatedCompletionTime}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {!isLoading && !suggestions && !error && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
                <Bot className="mr-2 h-6 w-6 text-muted-foreground" />
                <p className="text-muted-foreground">Suggestions will appear here.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="px-0 pb-0">
        <Button onClick={handleSuggest} disabled={isLoading || !isLoaded} className="w-full md:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Suggest Next Steps
            </>
          )}
        </Button>
      </CardFooter>
    </div>
  );
};

export default AiSuggest;
