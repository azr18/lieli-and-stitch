'use client';

import {useState, useEffect, useCallback} from 'react';
import {generateNextStep} from '@/ai/flows/generate-next-step';
import {summarizeStory} from '@/ai/flows/summarize-story';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Toaster} from '@/components/ui/toaster';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Icons} from '@/components/icons';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '@/components/ui/alert-dialog';

const initialGameState = `You are Lilo, and you are on an adventure with Stitch in Hawaii.
Stitch is your alien friend, experiment 626. You two are unseperable.
You start at your home. The day is sunny.`;

const questions = [
  {
    storySnippet: 'You are Lilo, and you are on an adventure with Stitch in Hawaii. Stitch is your alien friend, experiment 626. You two are unseperable. You start at your home. The day is sunny.',
    question: 'What do you do first?',
    choices: ['Go to the beach', 'Play with Stitch at home', 'Look for pineapples', 'Take a nap'],
    correctAnswer: 'Go to the beach',
    nextStorySnippet: 'You and Stitch head to the beach. The waves are calling!',
  },
  {
    storySnippet: 'You and Stitch head to the beach. The waves are calling!',
    question: 'What do you want to do at the beach?',
    choices: ['Surf', 'Build a sandcastle', 'Look for seashells', 'Bury Stitch in the sand'],
    correctAnswer: 'Surf',
    nextStorySnippet: 'You grab your surfboards. Time to catch some waves!',
  },
  {
    storySnippet: 'You grab your surfboards. Time to catch some waves!',
    question: 'Uh oh, the surf board is broken, what should you do?',
    choices: ['Find another board', 'Cry', 'Go home', 'Try to use the broken board'],
    correctAnswer: 'Find another board',
    nextStorySnippet: 'There is a backup surf board. Now its time to surf!',
  },
  {
    storySnippet: 'There is a backup surf board. Now its time to surf!',
    question: 'Oh no, a shark appears',
    choices: ['Run away', 'Punch it', 'Feed it', 'Wave'],
    correctAnswer: 'Run away',
    nextStorySnippet: 'You and Stitch ran away from the shark!',
  },
];

export default function Home() {
  const [story, setStory] = useState<string>(initialGameState);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [choice, setChoice] = useState<string>('');
  const [nextSnippet, setNextSnippet] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableChoices, setAvailableChoices] = useState<string[]>([]);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [showFireworks, setShowFireworks] = useState<boolean>(false);
  const [showSadFace, setShowSadFace] = useState<boolean>(false);

  const [isSpeakingStory, setIsSpeakingStory] = useState(false);
  const [isSpeakingSnippet, setIsSpeakingSnippet] = useState(false);

  const speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const SpeechSynthesisUtterance = typeof window !== 'undefined' ? window.speechSynthesisUtterance : null;

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    async function generateInitialSummary() {
      const initialSummary = await summarizeStory({storySoFar: initialGameState});
      setSummary(initialSummary?.summary || 'No summary available.');
    }
    generateInitialSummary();
    setAvailableChoices(currentQuestion?.choices || []);
    setNextSnippet(currentQuestion?.storySnippet || null);
  }, []);

  const handleChoiceSubmit = async () => {
    if (!choice) {
      alert('Please select a choice.');
      return;
    }

    if (choice === currentQuestion?.correctAnswer) {
      // Correct Answer
      setCorrectAnswersCount((prevCount) => prevCount + 1);
      setShowFireworks(true);
      setShowSadFace(false);

      setTimeout(() => {
        setShowFireworks(false);
        setStory(story + '\n' + 'Your Choice: ' + choice + '\n' + currentQuestion.nextStorySnippet);

        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
          setAvailableChoices(questions[currentQuestionIndex + 1].choices);
          setNextSnippet(questions[currentQuestionIndex + 1].storySnippet);
        } else {
          setNextSnippet('You finished the game!');
        }
      }, 2000);
    } else {
      // Wrong Answer
      setShowSadFace(true);
      setTimeout(() => {
        setShowSadFace(false);
      }, 2000);
    }
    setChoice('');
  };

  const speakText = (text: string, isStory: boolean) => {
    if (!speechSynthesis || !SpeechSynthesisUtterance) {
      console.warn('Text-to-speech is not supported in this browser.');
      return;
    }

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel(); // Stop current speech if any

      //if user presses button twice it should cancel if it is already speaking.
      if (isStory && isSpeakingStory) {
        setIsSpeakingStory(false);
        return;
      }

      if (!isStory && isSpeakingSnippet) {
        setIsSpeakingSnippet(false);
        return;
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => {
      if (isStory) {
        setIsSpeakingStory(true);
      } else {
        setIsSpeakingSnippet(true);
      }
    };

    utterance.onend = () => {
      if (isStory) {
        setIsSpeakingStory(false);
      } else {
        setIsSpeakingSnippet(false);
      }
    };

    utterance.onerror = () => {
      if (isStory) {
        setIsSpeakingStory(false);
      } else {
        setIsSpeakingSnippet(false);
      }
    };

    speechSynthesis.speak(utterance);
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
        <CardContent className="relative">
          <div className="border p-4 rounded">
            <p className="text-card-foreground text-sm">{story}</p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0"
              onClick={() => speakText(story, true)}
              disabled={isSpeakingStory}
            >
              {isSpeakingStory ? <Icons.loader className="h-4 w-4 animate-spin" /> : <Icons.volume />}
              <span className="sr-only">Speak</span>
            </Button>
          </div>
          {nextSnippet && (
            <>
              <div className="border p-4 rounded mt-4">
                <p className="text-muted-foreground">{currentQuestion?.question}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 mt-2"
                  onClick={() => speakText(nextSnippet, false)}
                  disabled={isSpeakingSnippet}
                >
                  {isSpeakingSnippet ? <Icons.loader className="h-4 w-4 animate-spin" /> : <Icons.volume />}
                  <span className="sr-only">Speak</span>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showFireworks && (
        <div className="fireworks">
          <span className="firework"></span>
          <span className="firework"></span>
          <span className="firework"></span>
        </div>
      )}

      {showSadFace && (
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Incorrect Answer</AlertDialogTitle>
              <AlertDialogDescription>
                <Icons.close className="h-6 w-6 inline-block mr-2 text-red-500" />
                Try again!
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )}

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
