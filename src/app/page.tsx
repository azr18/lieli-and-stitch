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
    scene: 'Lilo and Stitch are at the beach in Hawaii.',
    question: 'What is the capital city of Hawaii?',
    choices: ['Honolulu', 'Hilo', 'Kailua', 'Pearl City'],
    correctAnswer: 'Honolulu',
  },
  {
    id: 2,
    scene: 'Lilo and Stitch are exploring the jungle.',
    question: 'What is the name of the famous Hawaiian volcano?',
    choices: ['Mauna Loa', 'Mount Haleakala', 'Mount Everest', 'Mount Kilimanjaro'],
    correctAnswer: 'Mauna Loa',
  },
  {
    id: 3,
    scene: 'Lilo and Stitch are learning to surf.',
    question: 'What is the Hawaiian word for family?',
    choices: ['Ohana', 'Aloha', 'Mahalo', 'Kamaaina'],
    correctAnswer: 'Ohana',
  },
  {
    id: 4,
    scene: 'Lilo and Stitch are stargazing on a clear night.',
    question: 'Which constellation is prominently visible in Hawaii?',
    choices: ['Southern Cross', 'Big Dipper', 'Orion', 'Pleiades'],
    correctAnswer: 'Southern Cross',
  },
  {
    id: 5,
    scene: 'Lilo and Stitch are enjoying a luau.',
    question: 'What is the main ingredient in poi?',
    choices: ['Taro', 'Potato', 'Rice', 'Wheat'],
    correctAnswer: 'Taro',
  },
  {
    id: 6,
    scene: 'Lilo and Stitch visit a local market.',
    question: 'What fruit is Hawaii famous for?',
    choices: ['Pineapple', 'Mango', 'Banana', 'Coconut'],
    correctAnswer: 'Pineapple',
  },
  {
    id: 7,
    scene: 'Lilo and Stitch are watching a hula dance.',
    question: 'What musical instrument is commonly used in hula?',
    choices: ['Ukulele', 'Guitar', 'Drums', 'Piano'],
    correctAnswer: 'Ukulele',
  },
  {
    id: 8,
    scene: 'Lilo and Stitch are building a sandcastle.',
    question: 'What is the name of the Hawaiian state fish?',
    choices: ['Humuhumunukunukuapuaa', 'Salmon', 'Tuna', 'Cod'],
    correctAnswer: 'Humuhumunukunukuapuaa',
  },
  {
    id: 9,
    scene: 'Lilo and Stitch are hiking in the mountains.',
    question: 'What is a traditional Hawaiian greeting?',
    choices: ['Aloha', 'Bonjour', 'Konnichiwa', 'Guten Tag'],
    correctAnswer: 'Aloha',
  },
  {
    id: 10,
    scene: 'Lilo and Stitch are attending a surf competition.',
    question: 'What does "Kamaaina" mean in Hawaiian?',
    choices: ['Local resident', 'Tourist', 'Surfer', 'Judge'],
    correctAnswer: 'Local resident',
  },
  {
    id: 11,
    scene: 'Lilo and Stitch are planting flowers.',
    question: 'Which flower is commonly used in leis?',
    choices: ['Plumeria', 'Rose', 'Daisy', 'Tulip'],
    correctAnswer: 'Plumeria',
  },
  {
    id: 12,
    scene: 'Lilo and Stitch are visiting the Polynesian Cultural Center.',
    question: 'Which of these is a Polynesian island?',
    choices: ['Samoa', 'Jamaica', 'Cuba', 'Haiti'],
    correctAnswer: 'Samoa',
  },
  {
    id: 13,
    scene: 'Lilo and Stitch are enjoying shave ice.',
    question: 'What is a popular flavor for shave ice?',
    choices: ['Guava', 'Chocolate', 'Vanilla', 'Strawberry'],
    correctAnswer: 'Guava',
  },
  {
    id: 14,
    scene: 'Lilo and Stitch are exploring a sea cave.',
    question: 'What sea creature is common in Hawaiian waters?',
    choices: ['Sea Turtle', 'Penguin', 'Polar Bear', 'Walrus'],
    correctAnswer: 'Sea Turtle',
  },
  {
    id: 15,
    scene: 'Lilo and Stitch are fishing off a pier.',
    question: 'What is a common type of fish in Hawaii?',
    choices: ['Ahi', 'Cod', 'Salmon', 'Trout'],
    correctAnswer: 'Ahi',
  },
  {
    id: 16,
    scene: 'Lilo and Stitch are watching the sunrise.',
    question: 'Which direction does the sun rise in Hawaii?',
    choices: ['East', 'West', 'North', 'South'],
    correctAnswer: 'East',
  },
  {
    id: 17,
    scene: 'Lilo and Stitch are learning about volcanoes.',
    question: 'What is lava made of?',
    choices: ['Molten rock', 'Water', 'Sand', 'Air'],
    correctAnswer: 'Molten rock',
  },
  {
    id: 18,
    scene: 'Lilo and Stitch are visiting a coffee farm.',
    question: 'What type of coffee is grown in Hawaii?',
    choices: ['Kona', 'Arabica', 'Robusta', 'Liberica'],
    correctAnswer: 'Kona',
  },
  {
    id: 19,
    scene: 'Lilo and Stitch are at a botanical garden.',
    question: 'Which plant is native to Hawaii?',
    choices: ['Hibiscus', 'Rose', 'Tulip', 'Daisy'],
    correctAnswer: 'Hibiscus',
  },
  {
    id: 20,
    scene: 'Lilo and Stitch are saying goodbye.',
    question: 'What does "Aloha" mean when saying goodbye?',
    choices: ['Farewell', 'Hello', 'Thank you', 'Please'],
    correctAnswer: 'Farewell',
  },
];

export default function Home() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answeredCorrectlyCount, setAnsweredCorrectlyCount] = useState<number>(0);
  const [choice, setChoice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFireworks, setShowFireworks] = useState<boolean>(false);
  const [showSadFace, setShowSadFace] = useState<boolean>(false);
  const [selectedChoiceCorrect, setSelectedChoiceCorrect] = useState<boolean | null>(null);
  const [story, setStory] = useState<string>(''); // To accumulate story progression
  const [availableNextQuestions, setAvailableNextQuestions] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

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
        setShowFireworks(true);
        setShowSadFace(false);

        setTimeout(() => {
          setShowFireworks(false);
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

      {!isGameOver ? (
        availableNextQuestions.length === 0 ? (
          <div className="w-full max-w-2xl mt-6">
            <RadioGroup
              defaultValue={choice}
              className="grid gap-2"
              onValueChange={setChoice}
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
