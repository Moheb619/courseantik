import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Check,
  Clock,
  Target,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import Button from "../ui/Button";
import quizService from "../../services/quizService";

const QuizBuilder = ({
  quiz = null,
  moduleId,
  onSave,
  onCancel,
  className = "",
}) => {
  const [quizData, setQuizData] = useState(() => {
    if (quiz) {
      return {
        id: quiz.id || "",
        title: quiz.title || "",
        description: quiz.description || "",
        questions: quiz.questions || [],
        passMarks: quiz.passMarks || quiz.pass_marks || 70,
        timeLimit: quiz.timeLimit || quiz.time_limit || 600,
        isRequired: quiz.isRequired || quiz.is_required !== false,
        maxAttempts: quiz.maxAttempts || quiz.max_attempts || null,
      };
    }
    return {
      id: "",
      title: "",
      description: "",
      questions: [],
      passMarks: 70,
      timeLimit: 600, // 10 minutes
      isRequired: true,
      maxAttempts: null,
    };
  });

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "single",
    options: [
      { id: "a", text: "", correct: false },
      { id: "b", text: "", correct: false },
    ],
    explanation: "",
  });

  const addQuestion = () => {
    const question = {
      id: `q${Date.now()}`,
      ...newQuestion,
      options: newQuestion.options.filter((opt) => opt.text.trim() !== ""),
    };

    setQuizData((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));

    setNewQuestion({
      question: "",
      type: "single",
      options: [
        { id: "a", text: "", correct: false },
        { id: "b", text: "", correct: false },
      ],
      explanation: "",
    });
  };

  const updateQuestion = (questionId, updatedQuestion) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, ...updatedQuestion } : q
      ),
    }));
    setEditingQuestion(null);
  };

  const deleteQuestion = (questionId) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
  };

  const addOption = () => {
    const newId = String.fromCharCode(97 + newQuestion.options.length);
    setNewQuestion((prev) => ({
      ...prev,
      options: [...prev.options, { id: newId, text: "", correct: false }],
    }));
  };

  const updateOption = (optionId, field, value) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === optionId ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const removeOption = (optionId) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== optionId),
    }));
  };

  const handleCorrectAnswerChange = (optionId, isCorrect) => {
    if (newQuestion.type === "single") {
      // For single choice, uncheck all others
      setNewQuestion((prev) => ({
        ...prev,
        options: prev.options.map((opt) => ({
          ...opt,
          correct: opt.id === optionId ? isCorrect : false,
        })),
      }));
    } else {
      // For multiple choice, toggle the option
      updateOption(optionId, "correct", isCorrect);
    }
  };

  const handleSave = async () => {
    if (!quizData.title.trim()) {
      alert("Please enter a quiz title");
      return;
    }

    if (quizData.questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    try {
      // If no moduleId, we're in course creation mode - just return the data
      if (!moduleId) {
        onSave(quizData);
        return;
      }

      let result;
      if (quiz && quiz.id && quiz.id !== "") {
        // Update existing quiz
        result = await quizService.updateQuiz(quiz.id, quizData);
      } else {
        // Create new quiz
        result = await quizService.createQuiz(moduleId, quizData);
      }

      if (result.error) {
        throw result.error;
      }

      onSave(result.data);
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Failed to save quiz. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">
          {quiz ? "Edit Quiz" : "Create New Quiz"}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Quiz
          </Button>
        </div>
      </div>

      {/* Quiz Basic Info */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Quiz Title
          </label>
          <input
            type="text"
            value={quizData.title}
            onChange={(e) =>
              setQuizData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Enter quiz title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Description
          </label>
          <textarea
            value={quizData.description}
            onChange={(e) =>
              setQuizData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            rows={3}
            placeholder="Enter quiz description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Passing Score (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={quizData.passMarks || 70}
              onChange={(e) =>
                setQuizData((prev) => ({
                  ...prev,
                  passMarks: parseInt(e.target.value) || 70,
                }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={Math.floor((quizData.timeLimit || 600) / 60)}
              onChange={(e) =>
                setQuizData((prev) => ({
                  ...prev,
                  timeLimit: (parseInt(e.target.value) || 10) * 60,
                }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Questions ({quizData.questions.length})
        </h3>

        {quizData.questions.length === 0 ? (
          <div className="text-center py-8 bg-neutral-50 rounded-lg">
            <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No questions added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizData.questions.map((question, index) => (
              <div
                key={question.id}
                className="border border-neutral-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-neutral-900">
                    Question {index + 1}
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingQuestion(question.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-neutral-700 mb-3">{question.question}</p>

                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center gap-2 p-2 rounded ${
                        option.correct
                          ? "bg-green-50 border border-green-200"
                          : "bg-neutral-50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          option.correct
                            ? "border-green-500 bg-green-500"
                            : "border-neutral-300"
                        }`}
                      >
                        {option.correct && (
                          <Check className="w-2 h-2 text-white" />
                        )}
                      </div>
                      <span className="text-sm">{option.text}</span>
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Question */}
      <div className="border-t border-neutral-200 pt-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Add New Question
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Question Text
            </label>
            <textarea
              value={newQuestion.question}
              onChange={(e) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  question: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              rows={3}
              placeholder="Enter your question"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Question Type
            </label>
            <select
              value={newQuestion.type}
              onChange={(e) =>
                setNewQuestion((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="single">Single Choice</option>
              <option value="multiple">Multiple Choice</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Answer Options
            </label>
            <div className="space-y-2">
              {newQuestion.options.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <input
                    type={newQuestion.type === "single" ? "radio" : "checkbox"}
                    name="correct-answer"
                    checked={option.correct}
                    onChange={(e) =>
                      handleCorrectAnswerChange(option.id, e.target.checked)
                    }
                    className="w-4 h-4 text-brand-600"
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) =>
                      updateOption(option.id, "text", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder={`Option ${option.id.toUpperCase()}`}
                  />
                  {newQuestion.options.length > 2 && (
                    <button
                      onClick={() => removeOption(option.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {newQuestion.options.length < 6 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              value={newQuestion.explanation}
              onChange={(e) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  explanation: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              rows={2}
              placeholder="Explain why this is the correct answer"
            />
          </div>

          <Button
            variant="primary"
            onClick={addQuestion}
            disabled={
              !newQuestion.question.trim() ||
              newQuestion.options.filter((opt) => opt.text.trim()).length < 2
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilder;
