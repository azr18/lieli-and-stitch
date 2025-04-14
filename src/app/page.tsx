'use client';

import {useState, useEffect} from 'react';
import {generateNextStep} from '@/ai/flows/generate-next-step';
import {summarizeStory} from '@/ai/flows/summarize-story';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Toaster} from '@/components/ui/toaster';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';

const initialGameState = `You are Lilo, and you are on an adventure with Stitch in Hawaii.
Stitch is your alien friend, experiment 626. You two are unseperable.
You start at your home. The day is sunny.`;

export default function Home() {
  const [story, setStory] = useState<string>(initialGameState);
  const [choice, setChoice] = useState<string>('');
  const [nextSnippet, setNextSnippet] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableChoices, setAvailableChoices] = useState<string[]>([]);

  useEffect(() => {
    async function generateInitialSummary() {
      const initialSummary = await summarizeStory({storySoFar: initialGameState});
      setSummary(initialSummary?.summary || 'No summary available.');
    }
    generateInitialSummary();
  }, []);

  useEffect(() => {
    const getAvailableChoices = async () => {
      setIsLoading(true);
      try {
        const nextStep = await generateNextStep({
          gameState: story,
          playerChoice: 'start', // Initial call to get the first set of choices
        });

        if (nextStep) {
          setNextSnippet(nextStep.nextStorySnippet);
          setAvailableChoices(nextStep.availableChoices || []); // Set available choices from the response
        } else {
          console.error('Failed to generate next step.');
        }
      } catch (error) {
        console.error('Error generating next step:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getAvailableChoices();
  }, []);

  const handleChoiceSubmit = async () => {
    if (!choice) {
      alert('Please select a choice.');
      return;
    }

    setIsLoading(true);
    try {
      const nextStep = await generateNextStep({
        gameState: story,
        playerChoice: choice,
      });

      if (nextStep) {
        setNextSnippet(nextStep.nextStorySnippet);
        setStory(story + '\n' + 'Your Choice: ' + choice + '\n' + nextStep.nextStorySnippet);
        setAvailableChoices(nextStep.availableChoices || []);
        setChoice(''); // Clear the choice input after submitting

        // Generate a new summary after each step
        const newSummary = await summarizeStory({storySoFar: story});
        setSummary(newSummary?.summary || 'No summary available.');
      } else {
        console.error('Failed to generate next step.');
      }
    } catch (error) {
      console.error('Error generating next step:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-br from-secondary to-primary">
      <Toaster />
      <h1 className="text-4xl font-extrabold text-background mb-8">Aloha Adventure</h1>

      <Card className="w-full max-w-2xl p-4 rounded-lg shadow-md bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Your Adventure</CardTitle>
          <CardDescription>
            {summary ? summary : 'Embark on an exciting journey with Lilo and Stitch!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-card-foreground text-sm">{story}</p>
          {nextSnippet && <p className="text-muted-foreground mt-2">{nextSnippet}</p>}
        </CardContent>
      </Card>

      <div className="w-full max-w-2xl mt-6">
        <RadioGroup
          defaultValue={choice}
          className="grid gap-2"
          onValueChange={setChoice}
        >
          {availableChoices.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={option} className="bg-secondary"/>
              <label
                htmlFor={option}
                className="text-sm font-medium leading-none peer-data-[state=checked]:text-accent-foreground"
              >
                {option}
              </label>
            </div>
          ))}
        </RadioGroup>
        <Button
          className="w-full mt-2 bg-accent text-accent-foreground hover:bg-accent-foreground focus:ring-accent focus:ring-offset-2"
          onClick={handleChoiceSubmit}
          disabled={isLoading || availableChoices.length === 0}
        >
          {isLoading ? 'Thinking...' : 'Continue the Adventure'}
        </Button>
      </div>
    </div>
  );
}
