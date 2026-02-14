import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";

const QuizPlayer = ({ quiz, onComplete }) => {
  // Shuffling logic usually happens backend or here on init
  const [questions] = useState(quiz.questions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: optionId }
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleNext = () => {
    // Save answer
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: selectedOption }));

    if (isLastQuestion) {
      calculateScore();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      // Current answer state might not be updated for the last question yet if we relied solely on state here
      // so we use the local 'selectedOption' for the current/last question
      const answer =
        q.id === currentQuestion.id ? selectedOption : answers[q.id];
      if (answer === q.correct_option_id) {
        correctCount++;
      }
    });

    const percentage = (correctCount / questions.length) * 100;
    setScore(percentage);
    setShowResult(true);

    if (onComplete) {
      onComplete({
        score: percentage,
        passed: percentage >= (quiz.pass_percentage || 50),
        answers: { ...answers, [currentQuestion.id]: selectedOption },
      });
    }
  };

  if (showResult) {
    return (
      <div className="text-center p-8 bg-white rounded-xl border">
        <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
        <div className="text-6xl font-black text-primary mb-4">
          {Math.round(score)}%
        </div>
        <p className="text-muted-foreground mb-6">
          {score >= (quiz.pass_percentage || 50)
            ? "Congratulations! You passed."
            : "Keep studying and try again."}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry Quiz
        </Button>
      </div>
    );
  }

  if (!currentQuestion) return <div>No questions available.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
        <span>
          {Math.round((currentQuestionIndex / questions.length) * 100)}%
          progress
        </span>
      </div>

      <h3 className="text-xl font-bold mb-6">
        {currentQuestion.question_text}
      </h3>

      <RadioGroup
        value={selectedOption}
        onValueChange={setSelectedOption}
        className="space-y-4 mb-8"
      >
        {currentQuestion.options?.map((option) => (
          <div
            key={option.id}
            className={cn(
              "flex items-center space-x-2 border p-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-50",
              selectedOption === option.id &&
                "border-primary bg-primary/5 ring-1 ring-primary",
            )}
          >
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <Button
        onClick={handleNext}
        disabled={!selectedOption}
        className="w-full"
      >
        {isLastQuestion ? "Submit Quiz" : "Next Question"}
      </Button>
    </div>
  );
};

QuizPlayer.propTypes = {
  quiz: PropTypes.object.isRequired,
  onComplete: PropTypes.func,
};

export default QuizPlayer;
