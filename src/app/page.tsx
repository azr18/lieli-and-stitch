'use client';

import {useState, useEffect, useCallback} from 'react';
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

const questionsData = [
  {
    id: 1,
    scene: 'Lilo meets Stitch for the first time at the animal shelter.',
    question: 'What was Stitch originally created to do?',
    choices: ['Destroy cities', 'Be a companion', 'Win a science fair', 'Clean spaceships'],
    correctAnswer: 'Destroy cities',
  },
  {
    id: 2,
    scene: 'Lilo is teaching Stitch about Earth customs.',
    question: 'What does Lilo use as a reference to teach Stitch how to be good?',
    choices: ['A cookbook', 'A book about dogs', 'Elvis records', 'A hula manual'],
    correctAnswer: 'Elvis records',
  },
  {
    id: 3,
    scene: 'Lilo and Stitch are at the beach.',
    question: 'What is the name of the beach where Lilo and Stitch often surf?',
    choices: ['Kauai Beach', 'Cocoa Beach', 'Hanalei Bay', 'Myrtle Beach'],
    correctAnswer: 'Hanalei Bay',
  },
  {
    id: 4,
    scene: 'The Grand Councilwoman arrives on Earth.',
    question: 'What is the Grand Councilwoman’s primary concern regarding Stitch?',
    choices: ['His cuteness', 'His destructive programming', 'His ability to swim', 'His love for Lilo'],
    correctAnswer: 'His destructive programming',
  },
  {
    id: 5,
    scene: 'Lilo tries to enter Stitch in a pet show.',
    question: 'What does Lilo try to pass Stitch off as in the pet show?',
    choices: ['A cat', 'A dog', 'A unique breed of dog', 'An alien'],
    correctAnswer: 'A unique breed of dog',
  },
  {
    id: 6,
    scene: 'Cobra Bubbles investigates Lilo’s home life.',
    question: 'What is Cobra Bubbles’ former profession?',
    choices: ['Social worker', 'CIA agent', 'Surfing instructor', 'Chef'],
    correctAnswer: 'CIA agent',
  },
  {
    id: 7,
    scene: 'Jumba and Pleakley try to capture Stitch.',
    question: 'What are Jumba and Pleakley disguised as when they first interact with Lilo?',
    choices: ['Tourists', 'Electric company workers', 'Plumbers', 'Salesmen'],
    correctAnswer: 'Tourists',
  },
  {
    id: 8,
    scene: 'Lilo and Stitch are taking hula lessons.',
    question: 'What is the name of Lilo’s hula teacher?',
    choices: ['Kumu', 'Moses', 'David', 'Nani'],
    correctAnswer: 'Kumu',
  },
  {
    id: 9,
    scene: 'Nani is having trouble keeping a job.',
    question: 'What is Nani’s primary struggle throughout the movie?',
    choices: ['Finding friends', 'Keeping a job', 'Learning to surf', 'Avoiding Jumba and Pleakley'],
    correctAnswer: 'Keeping a job',
  },
  {
    id: 10,
    scene: 'Stitch reads "The Ugly Duckling."',
    question: 'Which story makes Stitch realize he is different and alone?',
    choices: ['Cinderella', 'The Ugly Duckling', 'Sleeping Beauty', 'Snow White'],
    correctAnswer: 'The Ugly Duckling',
  },
  {
    id: 11,
    scene: 'Lilo and Stitch are trying to save Ohana.',
    question: 'What does "Ohana" mean?',
    choices: ['Family', 'Home', 'Friend', 'Love'],
    correctAnswer: 'Family',
  },
  {
    id: 12,
    scene: 'The characters are discussing Stitch\'s fate.',
    question: 'Who ultimately decides that Stitch belongs with Lilo?',
    choices: ['Grand Councilwoman', 'Cobra Bubbles', 'Captain Gantu', 'Jumba'],
    correctAnswer: 'Grand Councilwoman',
  },
  {
    id: 13,
    scene: 'Lilo is teaching Stitch about the importance of family.',
    question: 'What is Lilo trying to instill in Stitch by teaching him about family?',
    choices: ['Destruction', 'Love and belonging', 'Fear', 'Anger'],
    correctAnswer: 'Love and belonging',
  },
  {
    id: 14,
    scene: 'Stitch is causing chaos around the house.',
    question: 'What is one of the first destructive things Stitch does in Lilo’s house?',
    choices: ['Paints the walls', 'Eats all the food', 'Destroys a model city', 'Hides all the clothes'],
    correctAnswer: 'Destroys a model city',
  },
  {
    id: 15,
    scene: 'Lilo and Stitch are trying to evade Captain Gantu.',
    question: 'What is Captain Gantu’s primary mission?',
    choices: ['To make friends', 'To capture Stitch', 'To surf', 'To learn about Earth'],
    correctAnswer: 'To capture Stitch',
  },
  {
    id: 16,
    scene: 'Lilo and Stitch are at a luau.',
    question: 'What traditional Hawaiian dish is mentioned during the luau scene?',
    choices: ['Sushi', 'Poi', 'Tacos', 'Pizza'],
    correctAnswer: 'Poi',
  },
  {
    id: 17,
    scene: 'Lilo is explaining to Stitch what he needs to do to become a model citizen.',
    question: 'According to Lilo, what should Stitch avoid doing to be good?',
    choices: ['Brushing his teeth', 'Making friends', 'Being destructive', 'Eating junk food'],
    correctAnswer: 'Being destructive',
  },
  {
    id: 18,
    scene: 'The house is being inspected by social services.',
    question: 'Why is social services evaluating Lilo’s home life?',
    choices: ['Because they suspect alien activity', 'Because Nani can’t keep a job', 'Because the house is too colorful', 'Because Lilo is too quiet'],
    correctAnswer: 'Because Nani can’t keep a job',
  },
  {
    id: 19,
    scene: 'Lilo, Nani, and Stitch are in danger.',
    question: 'Who saves Lilo, Nani, and Stitch from Captain Gantu?',
    choices: ['Jumba and Pleakley', 'Cobra Bubbles', 'The Grand Councilwoman', 'The Mayor'],
    correctAnswer: 'Jumba and Pleakley',
  },
  {
    id: 20,
    scene: 'The ending scene, where Lilo, Stitch, and Nani are a family.',
    question: 'In the end, what does the Grand Councilwoman allow Lilo to do with Stitch?',
    choices: ['Send him back to space', 'Keep him as her pet', 'Use him to destroy other planets', 'Experiment on him'],
    correctAnswer: 'Keep him as her pet',
  },
];

const COLORS = ["#26cc71", "#ffeb3b", "#ff5722", "#03a9f4", "#673ab7"];

const random = (max: number, min = 0) => Math.random() * (max - min) + min;

const defaultCount = 200;
const confettiConfig = {
    angle: 90,
    spread: 45,
    startVelocity: 45,
    elementCount: defaultCount,
    dragFriction: 0.1,
    duration: 3000,
    stagger: 0,
    width: "10px",
    height: "10px",
    perspective: "500px",
    colors: COLORS
};

export default function Home() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answeredCorrectlyCount, setAnsweredCorrectlyCount] = useState<number>(0);
  const [choice, setChoice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showSadFace, setShowSadFace] = useState<boolean>(false);
  const [selectedChoiceCorrect, setSelectedChoiceCorrect] = useState<boolean | null>(null);
  const [story, setStory] = useState<string>(''); // To accumulate story progression
  const [availableNextQuestions, setAvailableNextQuestions] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [isFirstTry, setIsFirstTry] = useState<boolean>(true);

  const questions = questionsData[currentQuestionIndex];

  useEffect(() => {
    if (answeredCorrectlyCount === 20) {
      setIsGameOver(true);
    }
  }, [answeredCorrectlyCount]);

  useEffect(() => {
    const initialQuestion = questionsData[0];
    setStory(initialQuestion.scene);
    setSelectedChoiceCorrect(null);
  }, []);

  const handleChoiceSubmit = async () => {
    if (!choice) {
      alert('Please select a choice.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (choice === questions?.correctAnswer) {
        // Correct Answer
        setSelectedChoiceCorrect(true);
        setAnsweredCorrectlyCount((prevCount) => prevCount + 1);
        setShowConfetti(true);
        setShowSadFace(false);

        if (isFirstTry) {
          setPoints((prevPoints) => prevPoints + 1);
        }

        setTimeout(() => {
          setShowConfetti(false);
          setStory(story + '\n' + `You answered correctly: ${questions.question}`);
          // Move to next question choice
          if (answeredCorrectlyCount < 19) {
            const nextPossibleQuestions = getTwoRandomQuestions(questions.id);
            setAvailableNextQuestions(nextPossibleQuestions);
          } else {
            setIsGameOver(true);
          }
        }, 2000);
      } else {
        // Wrong Answer
        setSelectedChoiceCorrect(false);
        setShowSadFace(true);
        setTimeout(() => {
          setShowSadFace(false);
        }, 2000);
      }
    }, 1000);
  };

  const handleNextQuestionSelect = (nextQuestionId: number) => {
    const nextIndex = questionsData.findIndex(q => q.id === nextQuestionId);
    if (nextIndex !== -1) {
      setCurrentQuestionIndex(nextIndex);
      setAvailableNextQuestions([]);
      setSelectedChoiceCorrect(null);
      setChoice('');
      setIsFirstTry(true);
    }
  };

  const getTwoRandomQuestions = (currentQuestionId: number): number[] => {
    let available = questionsData.filter(q => q.id !== currentQuestionId).map(q => q.id);
    let selected = [];
    for (let i = 0; i < 2 && available.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      selected.push(available[randomIndex]);
      available.splice(randomIndex, 1);
    }
    return selected;
  };

  const fireConfetti = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1000;`;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return;
    }

    let particles: { x: number; y: number; angle: number; velocity: number; color: string }[] = [];

    const createParticle = () => {
        const color = confettiConfig.colors[Math.floor(Math.random() * confettiConfig.colors.length)];
        return {
            x: random(canvas.width),
            y: canvas.height,
            angle: random(confettiConfig.angle - confettiConfig.spread / 2, confettiConfig.angle + confettiConfig.spread / 2),
            velocity: random(confettiConfig.startVelocity),
            color: color
        };
    };

    for (let i = 0; i < confettiConfig.elementCount; i++) {
        particles.push(createParticle());
    }

    const animationFrame = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle, index) => {
            particle.x += Math.cos(particle.angle * Math.PI / 180) * particle.velocity;
            particle.y -= Math.sin(particle.angle * Math.PI / 180) * particle.velocity;
            particle.velocity *= (1 - confettiConfig.dragFriction);

            ctx.beginPath();
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x, particle.y, parseFloat(confettiConfig.width), parseFloat(confettiConfig.height));
            ctx.closePath();
        });

        requestAnimationFrame(animationFrame);
    };

    animationFrame();

    setTimeout(() => {
        document.body.removeChild(canvas);
    }, confettiConfig.duration);
}, []);

  useEffect(() => {
    if (showConfetti) {
      fireConfetti();
    }
  }, [showConfetti, fireConfetti]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-br from-secondary to-primary">
      <Toaster />
      <h1 className="text-4xl font-extrabold text-background mb-8">Aloha Adventure</h1>

      <Card className="w-full max-w-2xl p-4 rounded-lg shadow-md bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Your Trivia Adventure</CardTitle>
          <CardDescription>
            Embark on an exciting trivia journey with Lilo and Stitch!
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
           <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-lg">Points: {points}</div>
          </div>
          <div className="border p-4 rounded">
            <p className="text-card-foreground text-sm">{story}</p>
          </div>
          {questions && selectedChoiceCorrect === null && (
            <>
              <div className="border p-4 rounded mt-4">
                <p className="text-muted-foreground">{questions?.question}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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

      {!isGameOver ? (
        availableNextQuestions.length === 0 ? (
          <div className="w-full max-w-2xl mt-6">
            <RadioGroup
              defaultValue={choice}
              className="grid gap-2"
              onValueChange={(value) => {
                setChoice(value);
                setIsFirstTry(choice === '' || value !== questions?.correctAnswer);
              }}
            >
              {questions?.choices.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} className="bg-secondary"/>
                  <label
                    htmlFor={option}
                    className="text-sm font-medium leading-none peer-data-[state=checked]:text-accent-foreground"
                  >
                    {option}
                  </label>
                  {selectedChoiceCorrect === false && choice === option && <Icons.close className="h-4 w-4 text-red-500" />}
                  {selectedChoiceCorrect === true && choice === option && <Icons.check className="h-4 w-4 text-green-500" />}
                </div>
              ))}
            </RadioGroup>
            <Button
              className="w-full mt-2 bg-accent text-accent-foreground hover:bg-accent-foreground focus:ring-accent focus:ring-offset-2"
              onClick={handleChoiceSubmit}
              disabled={isLoading || selectedChoiceCorrect === true}
            >
              {isLoading ? 'Thinking...' : (selectedChoiceCorrect === true ? 'Correct!' : 'Submit Choice')}
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-2xl mt-6">
            <p className="text-lg font-semibold text-background mb-4">Choose your next question!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableNextQuestions.map((questionId) => {
                const question = questionsData.find(q => q.id === questionId);
                return (
                  <Card key={questionId} className="cursor-pointer hover:shadow-md transition-shadow duration-300" onClick={() => handleNextQuestionSelect(questionId)}>
                    <CardContent>
                      {question ? question.question : 'Loading...'}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )
      ) : (
        <div className="text-center text-2xl font-bold text-background mt-8">
          Congratulations! You answered all 20 questions correctly!
        </div>
      )}
    </div>
  );
}

