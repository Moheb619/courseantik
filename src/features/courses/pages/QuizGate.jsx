import React, { useState } from "react";
import Button from "../../../components/ui/Button";

const QuizGate = () => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const testQuestions = [
    {
      id: 1,
      question: "What is the capital of France?",
      options: [
        { id: "a", text: "London", score: 0 },
        { id: "b", text: "Paris", score: 10 },
        { id: "c", text: "Berlin", score: 0 },
        { id: "d", text: "Madrid", score: 0 },
      ],
    },
    {
      id: 2,
      question: "Which planet is closest to the Sun?",
      options: [
        { id: "a", text: "Venus", score: 0 },
        { id: "b", text: "Earth", score: 0 },
        { id: "c", text: "Mercury", score: 10 },
        { id: "d", text: "Mars", score: 0 },
      ],
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                Test Assessment
              </h1>
              <p className="text-neutral-600">
                This is a test page to debug button visibility issues
              </p>
            </div>

            {/* Test Buttons */}
            <div className="mb-8 p-6 bg-neutral-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Test Buttons</h2>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Danger Button</Button>
                <Button variant="success">Success Button</Button>
              </div>
            </div>

            {/* Test Question */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Question {currentQuestion + 1} of {testQuestions.length}
              </h2>
              <p className="text-lg text-neutral-700 mb-6">
                {testQuestions[currentQuestion].question}
              </p>

              <div className="space-y-3">
                {testQuestions[currentQuestion].options.map((option) => {
                  const isSelected = selectedAnswer === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedAnswer(option.id)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-brand-500 bg-brand-50 text-brand-900"
                          : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-900"
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
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="font-medium text-current">
                          {option.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestion((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                variant="primary"
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
                disabled={currentQuestion >= testQuestions.length - 1}
              >
                Next
              </Button>
            </div>

            {/* Debug Info */}
            <div className="mt-8 p-4 bg-neutral-100 rounded-lg">
              <h3 className="font-semibold mb-2">Debug Information:</h3>
              <p>Selected Answer: {selectedAnswer || "None"}</p>
              <p>Current Question: {currentQuestion + 1}</p>
              <p>
                Button Variants Tested: Primary, Secondary, Outline, Ghost,
                Danger, Success
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGate;
