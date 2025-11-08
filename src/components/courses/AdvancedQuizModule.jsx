import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

const AdvancedQuizModule = ({ module, courseId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  // Fetch quiz questions
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["quiz-questions", module.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("module_id", module.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!module.id,
  });

  // Check for existing attempt
  const { data: existingAttempt } = useQuery({
    queryKey: ["quiz-attempt", module.id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("module_id", module.id)
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user && !!module.id,
  });

  // Start quiz mutation
  const startQuizMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({
          user_id: user.id,
          module_id: module.id,
          status: "in_progress",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (attempt) => {
      setQuizStarted(true);
      setTimeRemaining(
        module.estimated_time ? module.estimated_time * 60 : null
      );
      queryClient.invalidateQueries(["quiz-attempt", module.id, user?.id]);
    },
  });

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: async (finalAnswers) => {
      // Calculate score
      let score = 0;
      let maxScore = 0;

      questions.forEach((question) => {
        maxScore += question.points;
        const userAnswer = finalAnswers[question.id];
        if (userAnswer) {
          if (question.question_type === "multiple_choice") {
            if (userAnswer === question.correct_answer) {
              score += question.points;
            }
          } else if (question.question_type === "true_false") {
            if (userAnswer === question.correct_answer) {
              score += question.points;
            }
          } else if (question.question_type === "short_answer") {
            // For short answers, we'll need manual grading
            // For now, we'll store the answer for review
          }
        }
      });

      const percentage =
        maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const passed = percentage >= module.pass_marks;

      const { data, error } = await supabase
        .from("quiz_attempts")
        .update({
          answers: finalAnswers,
          score: percentage,
          max_score: 100,
          status: passed ? "submitted" : "submitted",
          submitted_at: new Date().toISOString(),
          time_taken: module.estimated_time
            ? module.estimated_time * 60 - timeRemaining
            : null,
        })
        .eq("id", existingAttempt?.id)
        .select()
        .single();

      if (error) throw error;

      // Create module completion record
      if (passed) {
        await supabase.from("module_completions").insert({
          user_id: user.id,
          module_id: module.id,
          completed_at: new Date().toISOString(),
          score: percentage,
          status: "passed",
        });
      } else {
        await supabase.from("module_completions").insert({
          user_id: user.id,
          module_id: module.id,
          completed_at: new Date().toISOString(),
          score: percentage,
          status: "failed",
        });
      }

      return { ...data, passed, percentage };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(["quiz-attempt", module.id, user?.id]);
      queryClient.invalidateQueries(["module-completions", user?.id]);
    },
  });

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && quizStarted) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      // Auto-submit when time runs out
      handleSubmitQuiz();
    }
  }, [timeRemaining, quizStarted]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    submitQuizMutation.mutate(answers);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (questionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <p>No quiz questions available for this module.</p>
        </div>
      </div>
    );
  }

  // Show results if quiz is completed
  if (existingAttempt && existingAttempt.status === "submitted") {
    const passed = existingAttempt.score >= module.pass_marks;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div
            className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
              passed ? "bg-green-100" : "bg-red-100"
            } mb-4`}
          >
            {passed ? (
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          <h3
            className={`text-lg font-medium ${
              passed ? "text-green-900" : "text-red-900"
            }`}
          >
            {passed ? "Quiz Passed!" : "Quiz Failed"}
          </h3>

          <p className="mt-2 text-gray-600">
            Your score:{" "}
            <span className="font-semibold">{existingAttempt.score}%</span>
          </p>

          <p className="text-sm text-gray-500">
            Pass marks required: {module.pass_marks}%
          </p>

          {!passed && (
            <button
              onClick={() => startQuizMutation.mutate()}
              className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
            >
              Retake Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show quiz interface
  if (quizStarted || existingAttempt?.status === "in_progress") {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        {/* Quiz Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {module.title}
            </h3>
            {timeRemaining && (
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  timeRemaining < 300
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                Time: {formatTime(timeRemaining)}
              </div>
            )}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {currentQuestion.question_text}
          </h4>

          <div className="space-y-3">
            {currentQuestion.question_type === "multiple_choice" &&
              currentQuestion.options &&
              currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}

            {currentQuestion.question_type === "true_false" && (
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="true"
                    checked={answers[currentQuestion.id] === "true"}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-700">True</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="false"
                    checked={answers[currentQuestion.id] === "false"}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-700">False</span>
                </label>
              </div>
            )}

            {currentQuestion.question_type === "short_answer" && (
              <textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion.id, e.target.value)
                }
                placeholder="Enter your answer here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                rows={4}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitQuizMutation.isPending}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show start quiz button
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {module.title}
        </h3>
        <p className="text-gray-600 mb-4">{module.description}</p>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Quiz Information
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>Questions: {questions.length}</p>
                <p>Pass marks: {module.pass_marks}%</p>
                {module.estimated_time && (
                  <p>Time limit: {module.estimated_time} minutes</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => startQuizMutation.mutate()}
          disabled={startQuizMutation.isPending}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50"
        >
          {startQuizMutation.isPending ? "Starting..." : "Start Quiz"}
        </button>
      </div>
    </div>
  );
};

export default AdvancedQuizModule;
