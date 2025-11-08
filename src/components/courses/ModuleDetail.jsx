import React, { useState, useEffect } from "react";
import {
  Play,
  Lock,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  Users,
  Target,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileText,
  XCircle,
} from "lucide-react";
import VideoPlayer from "../ui/VideoPlayer";
import Quiz from "../ui/Quiz";
import Assignment from "./Assignment";
import Button from "../ui/Button";
import moduleProgressionService from "../../services/moduleProgressionService";
import quizService from "../../services/quizService";
import assignmentService from "../../services/assignmentService";
import { useAuth } from "../../hooks/useAuth";

const ModuleDetail = ({
  module,
  courseId,
  isEnrolled = false,
  isAdmin = false,
  onLessonSelect,
  onModuleComplete,
  className = "",
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("lessons");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [moduleStatus, setModuleStatus] = useState(null);

  const handleLessonSelect = (lesson) => {
    if (!isEnrolled && !lesson.isFreePreview) {
      return; // Don't allow access to locked lessons
    }
    setSelectedLesson(lesson);
    onLessonSelect?.(lesson);
  };

  // Load module status on component mount
  useEffect(() => {
    if (isEnrolled && user?.id) {
      const loadStatus = async () => {
        const status = await moduleProgressionService.getModuleCompletionStatus(
          courseId,
          module.moduleId,
          user.id
        );
        setModuleStatus(status);
      };
      loadStatus();
    }
  }, [courseId, module.moduleId, isEnrolled, user?.id]);

  const handleLessonComplete = async (lessonId) => {
    if (isEnrolled && user?.id) {
      const updatedStatus = await moduleProgressionService.updateLessonProgress(
        courseId,
        module.moduleId,
        lessonId,
        user.id
      );
      setModuleStatus(updatedStatus);

      if (updatedStatus?.isCompleted) {
        onModuleComplete?.(module.moduleId);
      }
    }
  };

  const handleQuizComplete = async (results) => {
    if (isEnrolled && user?.id && module.quiz) {
      try {
        // Submit quiz attempt to database
        await quizService.submitQuizAttempt(
          module.quiz.id,
          user.id,
          results.attempt.answers,
          results.percentage,
          results.passed,
          results.attempt.timeSpent
        );

        // Update module status
        const updatedStatus = await moduleProgressionService.updateQuizProgress(
          courseId,
          module.moduleId,
          results,
          user.id
        );
        setModuleStatus(updatedStatus);

        if (updatedStatus?.isCompleted) {
          onModuleComplete?.(module.moduleId);
        }
      } catch (error) {
        console.error("Error submitting quiz:", error);
      }
    }
  };

  const handleAssignmentSubmit = async (submissionData) => {
    if (isEnrolled && user?.id && module.assignment) {
      try {
        // Submit assignment to database
        const { data: submission, error } =
          await assignmentService.submitAssignment(
            module.assignment.id,
            user.id,
            submissionData
          );

        if (error) throw error;

        // Update module status
        const updatedStatus =
          await moduleProgressionService.updateAssignmentProgress(
            courseId,
            module.moduleId,
            submission,
            user.id
          );
        setModuleStatus(updatedStatus);

        return submission;
      } catch (error) {
        console.error("Error submitting assignment:", error);
        throw error;
      }
    }
    throw new Error("Not enrolled");
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Module Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              {module.title}
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              {module.description}
            </p>
          </div>
          <div className="ml-6 flex items-center gap-2">
            <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm font-medium">
              Module {module.order}
            </span>
          </div>
        </div>

        {/* Module Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">
              {module.estimatedTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">
              {module.lessons.length} lessons
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">
              {module.passMarks}% to pass
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">
              {module.quiz && module.assignment
                ? "Quiz & Assignment"
                : module.quiz
                ? "Quiz included"
                : module.assignment
                ? "Assignment included"
                : "No requirements"}
            </span>
          </div>
        </div>

        {/* Module Progress Status */}
        {isEnrolled && moduleStatus && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-neutral-900">Module Progress</h4>
              {moduleStatus.isCompleted ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              ) : moduleStatus.isUnlocked ? (
                <div className="flex items-center gap-1 text-blue-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">In Progress</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-neutral-500">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">Locked</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {/* Lessons Progress */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Lessons:</span>
                <span
                  className={`font-medium ${
                    moduleStatus.progress?.lessons?.isComplete
                      ? "text-green-600"
                      : "text-neutral-900"
                  }`}
                >
                  {moduleStatus.progress?.lessons?.completed || 0}/
                  {moduleStatus.progress?.lessons?.required || 0}
                  {moduleStatus.progress?.lessons?.isComplete && (
                    <CheckCircle className="w-3 h-3 inline ml-1" />
                  )}
                </span>
              </div>

              {/* Quiz Progress */}
              {moduleStatus.progress?.quiz?.required && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Quiz:</span>
                  <span
                    className={`font-medium ${
                      moduleStatus.progress.quiz.passed
                        ? "text-green-600"
                        : "text-neutral-900"
                    }`}
                  >
                    {moduleStatus.progress.quiz.bestScore}%
                    {moduleStatus.progress.quiz.passed && (
                      <CheckCircle className="w-3 h-3 inline ml-1" />
                    )}
                  </span>
                </div>
              )}

              {/* Assignment Progress */}
              {moduleStatus.progress?.assignment?.required && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Assignment:</span>
                  <span
                    className={`font-medium ${
                      moduleStatus.progress.assignment.passed
                        ? "text-green-600"
                        : moduleStatus.progress.assignment.submitted
                        ? "text-blue-600"
                        : "text-neutral-900"
                    }`}
                  >
                    {moduleStatus.progress.assignment.submitted
                      ? `${moduleStatus.progress.assignment.bestScore}%`
                      : "Not submitted"}
                    {moduleStatus.progress.assignment.passed && (
                      <CheckCircle className="w-3 h-3 inline ml-1" />
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Module Locked Message */}
        {isEnrolled && moduleStatus && !moduleStatus.isUnlocked && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800 font-medium">
                This module is locked. Complete the previous modules to unlock
                it.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Module Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab("lessons")}
            className={`px-6 py-4 font-medium ${
              activeTab === "lessons"
                ? "text-brand-600 border-b-2 border-brand-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Lessons
          </button>
          {module.quiz && (
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-6 py-4 font-medium ${
                activeTab === "quiz"
                  ? "text-brand-600 border-b-2 border-brand-600"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Quiz
            </button>
          )}
          {module.assignment && (
            <button
              onClick={() => setActiveTab("assignment")}
              className={`px-6 py-4 font-medium ${
                activeTab === "assignment"
                  ? "text-brand-600 border-b-2 border-brand-600"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Assignment
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-6 py-4 font-medium ${
                activeTab === "admin"
                  ? "text-brand-600 border-b-2 border-brand-600"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Admin
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "lessons" && (
          <div className="space-y-4">
            {selectedLesson ? (
              <div className="space-y-6">
                {/* Back to Lessons */}
                <Button
                  variant="outline"
                  onClick={() => setSelectedLesson(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Lessons
                </Button>

                {/* Video Player */}
                <VideoPlayer
                  videoUrl={selectedLesson.videoUrl}
                  videoType={selectedLesson.videoType || "youtube"}
                  title={selectedLesson.title}
                  description={selectedLesson.description}
                  isPreview={selectedLesson.isFreePreview}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {module.lessons.map((lesson) => (
                  <div
                    key={lesson.lessonId}
                    className={`p-4 rounded-lg border transition-all ${
                      !isEnrolled && !lesson.isFreePreview
                        ? "border-neutral-200 bg-neutral-50 cursor-not-allowed"
                        : "border-neutral-200 hover:border-brand-300 hover:bg-brand-50 cursor-pointer"
                    }`}
                    onClick={() => handleLessonSelect(lesson)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {!isEnrolled && !lesson.isFreePreview ? (
                          <Lock className="w-5 h-5 text-neutral-400" />
                        ) : (
                          <Play className="w-5 h-5 text-brand-500" />
                        )}

                        <div>
                          <h4 className="font-medium text-neutral-900">
                            {lesson.title}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            {lesson.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {lesson.isFreePreview && (
                          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded">
                            Preview
                          </span>
                        )}
                        <span className="text-sm text-neutral-500">
                          {formatDuration(lesson.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "quiz" && module.quiz && (
          <div>
            {showQuiz ? (
              <Quiz
                quiz={module.quiz}
                studentProgress={
                  moduleStatus?.progress
                    ? {
                        quizAttempts: moduleStatus.progress.quiz.attempts || [],
                      }
                    : null
                }
                onComplete={handleQuizComplete}
                onClose={() => setShowQuiz(false)}
                isPreview={!isEnrolled}
              />
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  {module.quiz.title}
                </h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  {module.quiz.description}
                </p>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <Clock className="w-4 h-4" />
                    <span>
                      Time limit: {Math.floor(module.quiz.timeLimit / 60)}{" "}
                      minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <Target className="w-4 h-4" />
                    <span>Passing score: {module.quiz.passMarks}%</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <BookOpen className="w-4 h-4" />
                    <span>{module.quiz.questions.length} questions</span>
                  </div>
                </div>

                {/* Show quiz status if enrolled */}
                {isEnrolled && moduleStatus?.progress?.quiz && (
                  <div className="mb-6">
                    {moduleStatus.progress.quiz.passed ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-800 font-medium">
                            Quiz passed with{" "}
                            {moduleStatus.progress.quiz.bestScore}%
                          </span>
                        </div>
                      </div>
                    ) : moduleStatus.progress.quiz.completed ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-800 font-medium">
                            Best score: {moduleStatus.progress.quiz.bestScore}%
                            (Need {module.quiz.passMarks}% to pass)
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={() => setShowQuiz(true)}
                  disabled={
                    !isEnrolled || (moduleStatus && !moduleStatus.isUnlocked)
                  }
                >
                  {!isEnrolled
                    ? "Enroll to Take Quiz"
                    : moduleStatus && !moduleStatus.isUnlocked
                    ? "Complete Prerequisites"
                    : moduleStatus?.progress?.quiz?.completed
                    ? "Retake Quiz"
                    : "Start Quiz"}
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "assignment" && module.assignment && (
          <div>
            <Assignment
              assignment={module.assignment}
              studentProgress={
                moduleStatus?.progress
                  ? {
                      assignmentSubmissions:
                        moduleStatus.progress.assignment.submissions || [],
                    }
                  : null
              }
              isEnrolled={isEnrolled && moduleStatus?.isUnlocked}
              isAdmin={isAdmin}
              onSubmit={handleAssignmentSubmit}
            />
          </div>
        )}

        {activeTab === "admin" && isAdmin && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Admin Controls
              </h3>
              <p className="text-neutral-600 mb-6">
                Manage quizzes and assignments for this module. Course materials
                are handled at the lesson level.
              </p>
            </div>

            <div className="pt-6 border-t border-neutral-200">
              <h4 className="text-md font-medium text-neutral-900 mb-4">
                Quiz Management
              </h4>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Edit Quiz Questions
                </Button>
                <Button variant="outline" className="w-full">
                  View Quiz Results
                </Button>
                <Button variant="outline" className="w-full">
                  Export Quiz Data
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleDetail;
