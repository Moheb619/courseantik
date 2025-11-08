import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import Button from "./Button";

const Quiz = ({
  quiz,
  onComplete,
  onClose,
  isPreview = false,
  studentProgress = null,
  attemptLimit = null,
  className = "",
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit || 0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const handleAnswerSelect = (questionId, answerId, isMultiple = false) => {
    if (isSubmitted) return;

    if (isMultiple) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: prev[questionId]?.includes(answerId)
          ? prev[questionId].filter((id) => id !== answerId)
          : [...(prev[questionId] || []), answerId],
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: answerId,
      }));
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    let totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (question.type === "multiple") {
        const correctOptions = question.options.filter((opt) => opt.correct);
        const userSelectedCorrect = correctOptions.every((opt) =>
          userAnswer?.includes(opt.id)
        );
        const userSelectedIncorrect = question.options.some(
          (opt) => opt.correct === false && userAnswer?.includes(opt.id)
        );

        if (
          userSelectedCorrect &&
          !userSelectedIncorrect &&
          userAnswer?.length === correctOptions.length
        ) {
          correctAnswers++;
        }
      } else {
        const correctOption = question.options.find((opt) => opt.correct);
        if (userAnswer === correctOption?.id) {
          correctAnswers++;
        }
      }
    });

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = percentage >= quiz.passMarks;

    return {
      correctAnswers,
      totalQuestions,
      percentage,
      passed,
    };
  };

  const handleSubmit = () => {
    if (isSubmitted) return;

    const score = calculateScore();
    const attempt = {
      id: `attempt_${Date.now()}`,
      score: score.percentage,
      passed: score.passed,
      completedAt: new Date().toISOString(),
      answers: { ...answers },
      timeSpent: (quiz.timeLimit || 0) - timeLeft,
    };

    setResults({ ...score, attempt });
    setIsSubmitted(true);
    onComplete?.({ ...score, attempt });
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(quiz.timeLimit || 0);
    setIsSubmitted(false);
    setResults(null);
    setShowExplanation(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const currentQ = quiz.questions[currentQuestion];
  const userAnswer = answers[currentQ?.id];

  // Calculate attempt information
  const previousAttempts = studentProgress?.quizAttempts || [];
  const attemptNumber = previousAttempts.length + 1;
  const hasPassedBefore = previousAttempts.some((attempt) => attempt.passed);
  const canRetake =
    !hasPassedBefore &&
    (!attemptLimit || previousAttempts.length < attemptLimit);
  const bestScore =
    previousAttempts.length > 0
      ? Math.max(...previousAttempts.map((a) => a.score))
      : 0;

  if (isSubmitted && results) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center mb-6">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              results.passed ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {results.passed ? (
              <Award className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>

          <h3 className="text-2xl font-bold text-neutral-900 mb-2">
            {results.passed ? "Congratulations!" : "Keep Learning!"}
          </h3>

          <p className="text-neutral-600 mb-4">
            {results.passed
              ? "You passed the quiz! Great job on mastering this module."
              : `You scored ${results.percentage}%. You need ${quiz.passMarks}% to pass.`}
          </p>

          <div className="bg-neutral-50 rounded-lg p-4 mb-6">
            <div className="text-3xl font-bold text-brand-600 mb-1">
              {results.percentage}%
            </div>
            <div className="text-sm text-neutral-500 mb-2">
              {results.correctAnswers} out of {results.totalQuestions} questions
              correct
            </div>
            {results.attempt && (
              <div className="text-xs text-neutral-400">
                Time spent: {formatTime(results.attempt.timeSpent)} • Attempt #
                {attemptNumber}
              </div>
            )}
          </div>

          {/* Previous attempts summary */}
          {!isPreview && previousAttempts.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-neutral-900 mb-2">
                Previous Attempts:
              </h4>
              <div className="space-y-1">
                {previousAttempts.slice(-3).map((attempt, index) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between text-xs bg-white rounded p-2 border"
                  >
                    <span>Attempt {previousAttempts.length - index}</span>
                    <span
                      className={`font-medium ${
                        attempt.passed ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {attempt.score}% {attempt.passed ? "✓" : "✗"}
                    </span>
                  </div>
                ))}
                {previousAttempts.length > 3 && (
                  <div className="text-xs text-neutral-500 text-center py-1">
                    +{previousAttempts.length - 3} more attempts
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!results.passed && canRetake && (
          <div className="mb-6">
            <Button variant="primary" onClick={resetQuiz} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
          </div>
        )}

        {!results.passed && !canRetake && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">
                {attemptLimit
                  ? `You have used all ${attemptLimit} attempts for this quiz.`
                  : "You have already passed this quiz."}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close Quiz
          </Button>
          {results.passed && (
            <Button variant="primary" onClick={onClose} className="flex-1">
              Continue Learning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-neutral-900">{quiz.title}</h3>
            <p className="text-neutral-600 text-sm">{quiz.description}</p>
          </div>
          {quiz.timeLimit > 0 && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Attempt Information */}
        {!isPreview && previousAttempts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-blue-800">
                  <strong>Attempt:</strong> {attemptNumber}
                  {attemptLimit && ` of ${attemptLimit}`}
                </span>
                <span className="text-blue-800">
                  <strong>Best Score:</strong> {bestScore}%
                </span>
              </div>
              {hasPassedBefore && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                  Previously Passed
                </span>
              )}
            </div>
          </div>
        )}

        {/* Cannot retake message */}
        {!canRetake && !hasPassedBefore && attemptLimit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">
                You have reached the maximum number of attempts ({attemptLimit})
                for this quiz.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-600">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm text-neutral-500">
            {Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                ((currentQuestion + 1) / quiz.questions.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-neutral-900 mb-4">
          {currentQ.question}
        </h4>

        <div className="space-y-3">
          {currentQ.options.map((option) => {
            const isSelected =
              currentQ.type === "multiple"
                ? userAnswer?.includes(option.id)
                : userAnswer === option.id;

            return (
              <button
                key={option.id}
                onClick={() =>
                  handleAnswerSelect(
                    currentQ.id,
                    option.id,
                    currentQ.type === "multiple"
                  )
                }
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-brand-500 bg-brand-50 text-brand-900"
                    : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-brand-500 bg-brand-500"
                        : "border-neutral-300"
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="font-medium">{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestion < quiz.questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              disabled={
                !userAnswer ||
                (currentQ.type === "multiple" && userAnswer.length === 0)
              }
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={
                !userAnswer ||
                (currentQ.type === "multiple" && userAnswer.length === 0)
              }
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </div>

      {/* Quiz Info */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <div className="flex items-center gap-4">
            <span>Passing Score: {quiz.passMarks}%</span>
            {quiz.timeLimit > 0 && (
              <span>Time Limit: {formatTime(quiz.timeLimit)}</span>
            )}
          </div>
          {isPreview && (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
              Preview Mode
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
