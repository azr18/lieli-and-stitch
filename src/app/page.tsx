'use client';

import {useState, useEffect} from 'react';
import {generateNextStep} from '@/ai/flows/generate-next-step';
import {summarizeStory} from '@/ai/flows/summarize-story';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Toaster} from '@/components/ui/toaster';

const initialGameState = `You are Lilo, and you are on an adventure with Stitch in Hawaii.
Stitch is your alien friend, experiment 626. You two are unseperable.
You start at your home. The day is sunny.`;

export default function Home() {
  const [story, setStory] = useState<string>(initialGameState);
  const [choice, setChoice] = useState<string>('');
  const [nextSnippet, setNextSnippet] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function generateInitialSummary() {
      const initialSummary = await summarizeStory({storySoFar: initialGameState});
      setSummary(initialSummary?.summary || 'No summary available.');
    }
    generateInitialSummary();
  }, []);

  const handleChoiceSubmit = async () => {
    setIsLoading(true);
    try {
      const nextStep = await generateNextStep({
        gameState: story,
        playerChoice: choice,
      });

      if (nextStep) {
        setNextSnippet(nextStep.nextStorySnippet);
        setStory(story + '\n' + 'Your Choice: ' + choice + '\n' + nextStep.nextStorySnippet);
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
      <h1 className="text-4xl font-extrabold text-primary mb-8">Aloha Adventure</h1>

      <Card className="w-full max-w-2xl p-4 rounded-lg shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Your Adventure</CardTitle>
          <CardDescription>
            {summary ? summary : 'Embark on an exciting journey with Lilo and Stitch!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-primary-foreground text-sm">{story}</p>
          {nextSnippet && <p className="text-accent-foreground mt-2">{nextSnippet}</p>}
        </CardContent>
      </Card>

      <div className="w-full max-w-2xl mt-6">
        <Textarea
          placeholder="What will Lilo and Stitch do next?"
          className="w-full rounded-md border-accent shadow-sm focus:ring-accent focus:border-accent"
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
        />
        <Button
          className="w-full mt-2 bg-accent text-background hover:bg-accent-foreground focus:ring-accent focus:ring-offset-2"
          onClick={handleChoiceSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Thinking...' : 'Continue the Adventure'}
        </Button>
      </div>
    </div>
  );
}
