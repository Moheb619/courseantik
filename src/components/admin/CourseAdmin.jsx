import React, { useState } from "react";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  BarChart3,
  FileText,
  Video,
  Award,
  Download,
} from "lucide-react";
import Button from "../ui/Button";
import QuizBuilder from "./QuizBuilder";

const CourseAdmin = ({ course, onUpdate, className = "" }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const handleQuizSave = (quizData) => {
    // Update the course with new quiz data
    console.log("Saving quiz:", quizData);
    setShowQuizBuilder(false);
  };

  const getModuleStats = (module) => {
    return {
      lessons: module.lessons.length,
      totalDuration: module.lessons.reduce(
        (total, lesson) => total + lesson.duration,
        0
      ),
      hasQuiz: !!module.quiz,
    };
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Course Administration
            </h2>
            <p className="text-neutral-600">
              Manage content, quizzes, and settings for "{course.title}"
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="primary">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-4 font-medium ${
              activeTab === "overview"
                ? "text-brand-600 border-b-2 border-brand-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("modules")}
            className={`px-6 py-4 font-medium ${
              activeTab === "modules"
                ? "text-brand-600 border-b-2 border-brand-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Modules
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-6 py-4 font-medium ${
              activeTab === "quizzes"
                ? "text-brand-600 border-b-2 border-brand-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Quizzes
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-8 h-8 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">
                    Students
                  </h3>
                </div>
                <p className="text-3xl font-bold text-blue-900">
                  {course.enrolledCount}
                </p>
                <p className="text-sm text-blue-700">Enrolled students</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-8 h-8 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">
                    Modules
                  </h3>
                </div>
                <p className="text-3xl font-bold text-green-900">
                  {course.curriculum.length}
                </p>
                <p className="text-sm text-green-700">Course modules</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Video className="w-8 h-8 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-900">
                    Lessons
                  </h3>
                </div>
                <p className="text-3xl font-bold text-purple-900">
                  {course.curriculum.reduce(
                    (total, module) => total + module.lessons.length,
                    0
                  )}
                </p>
                <p className="text-sm text-purple-700">Total lessons</p>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Course Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">
                    {course.rating}
                  </p>
                  <p className="text-sm text-neutral-600">Average Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">
                    {course.curriculum.filter((m) => m.quiz).length}
                  </p>
                  <p className="text-sm text-neutral-600">Quizzes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">
                    {formatDuration(
                      course.curriculum.reduce(
                        (total, module) =>
                          total +
                          module.lessons.reduce(
                            (moduleTotal, lesson) =>
                              moduleTotal + lesson.duration,
                            0
                          ),
                        0
                      )
                    )}
                  </p>
                  <p className="text-sm text-neutral-600">Total Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">
                    {course.includesCertificate ? "Yes" : "No"}
                  </p>
                  <p className="text-sm text-neutral-600">Certificate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "modules" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                Course Modules
              </h3>
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </div>

            <div className="space-y-4">
              {course.curriculum.map((module) => {
                const stats = getModuleStats(module);
                return (
                  <div
                    key={module.moduleId}
                    className="border border-neutral-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-neutral-900">
                          {module.title}
                        </h4>
                        <p className="text-sm text-neutral-600">
                          {module.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-neutral-400" />
                        <span>{stats.lessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-neutral-400" />
                        <span>{formatDuration(stats.totalDuration)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-neutral-400" />
                        <span>{stats.hasQuiz ? "Has Quiz" : "No Quiz"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "quizzes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                Course Quizzes
              </h3>
              <Button
                variant="primary"
                onClick={() => setShowQuizBuilder(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
            </div>

            {course.curriculum.filter((m) => m.quiz).length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <Award className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500 mb-4">No quizzes created yet</p>
                <Button
                  variant="primary"
                  onClick={() => setShowQuizBuilder(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Quiz
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {course.curriculum
                  .filter((m) => m.quiz)
                  .map((module) => (
                    <div
                      key={module.moduleId}
                      className="border border-neutral-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-neutral-900">
                            {module.quiz.title}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Module: {module.title}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-neutral-500">Questions:</span>
                          <span className="ml-2 font-medium">
                            {module.quiz.questions.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500">
                            Passing Score:
                          </span>
                          <span className="ml-2 font-medium">
                            {module.quiz.passMarks}%
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Time Limit:</span>
                          <span className="ml-2 font-medium">
                            {Math.floor(module.quiz.timeLimit / 60)} min
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Attempts:</span>
                          <span className="ml-2 font-medium">0</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quiz Builder Modal */}
      {showQuizBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <QuizBuilder
              onSave={handleQuizSave}
              onCancel={() => setShowQuizBuilder(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAdmin;
