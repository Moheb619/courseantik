import React, { useState, useEffect } from "react";
import { useFieldArray } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  Video,
  HelpCircle,
  FileText,
  ArrowUp,
  ArrowDown,
  Copy,
  Eye,
  EyeOff,
  Clock,
  Target,
} from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import LessonBuilder from "./LessonBuilder";
import QuizBuilder from "./QuizBuilder";
import AssignmentBuilder from "./AssignmentBuilder";

const ModuleBuilder = ({
  isOpen,
  onClose,
  module,
  onSave,
  control,
  moduleIndex,
  register,
  setValue,
  watch,
  courseId = null,
}) => {
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const {
    fields: lessonFields,
    append: appendLesson,
    remove: removeLesson,
    move: moveLesson,
  } = useFieldArray({
    control,
    name: `modules.${moduleIndex}.lessons`,
  });

  const moduleData = watch(`modules.${moduleIndex}`) || {};

  useEffect(() => {
    if (module) {
      // Initialize module data when editing
      setValue(`modules.${moduleIndex}.title`, module.title || "");
      setValue(`modules.${moduleIndex}.description`, module.description || "");
      setValue(
        `modules.${moduleIndex}.estimated_time`,
        module.estimated_time || ""
      );
      setValue(`modules.${moduleIndex}.pass_marks`, module.pass_marks || 70);
      setValue(
        `modules.${moduleIndex}.is_required`,
        module.is_required !== false
      );
    }
  }, [module, moduleIndex, setValue]);

  const addLesson = () => {
    const lessonNumber = lessonFields.length + 1;
    const newLesson = {
      title: `Lesson ${lessonNumber}: Getting Started`,
      slug: `lesson-${lessonNumber}-getting-started`,
      description: `In this lesson, you'll learn the core concepts and get hands-on practice with real examples. Perfect for beginners and those looking to strengthen their fundamentals.`,
      lesson_order: lessonNumber,
      duration: 15,
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      video_type: "youtube",
      is_free_preview: lessonNumber === 1, // First lesson is free preview
      content: {
        materials: [
          "Course slides",
          "Code examples",
          "Reference documentation",
        ],
        notes: "Make sure to practice along with the video for best results.",
      },
    };
    appendLesson(newLesson);
    setEditingLesson({ ...newLesson, lessonIndex: lessonFields.length });
    setShowLessonModal(true);
  };

  const addQuiz = () => {
    const newQuiz = {
      title: "Module Knowledge Check",
      description:
        "Test your understanding of the concepts covered in this module. You must score at least 70% to proceed to the next module.",
      pass_marks: 70,
      time_limit: 1800, // 30 minutes
      is_required: true,
      max_attempts: 3,
      questions: [],
    };
    setValue(`modules.${moduleIndex}.quiz`, newQuiz);
    setEditingQuiz({ ...newQuiz, moduleIndex });
    setShowQuizModal(true);
  };

  const addAssignment = () => {
    const newAssignment = {
      title: "Module Project Assignment",
      description:
        "Apply what you've learned by completing this hands-on project. Upload your completed project files for review by the instructor. Make sure your code is well-commented and follows best practices.",
      requirements: {
        points: [
          "Complete all tasks outlined in the assignment brief",
          "Follow coding best practices and conventions",
          "Include proper documentation and comments",
          "Test your code thoroughly before submission",
        ],
      },
      submission_type: "file",
      allowed_file_types: ["pdf", "doc", "docx", "zip"],
      max_file_size: 10, // MB
      pass_marks: 70,
      is_required: true,
      due_date: null,
      rubric: [],
    };
    setValue(`modules.${moduleIndex}.assignment`, newAssignment);
    setEditingAssignment({ ...newAssignment, moduleIndex });
    setShowAssignmentModal(true);
  };

  const handleSaveModule = () => {
    const moduleTitle = moduleData.title;
    if (!moduleTitle || moduleTitle.trim() === "") {
      toast.error("Please enter a module title");
      return;
    }

    onSave();
    onClose();
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const totalLessonDuration = lessonFields.reduce((total, lesson, index) => {
    const duration =
      watch(`modules.${moduleIndex}.lessons.${index}.duration`) || 0;
    return total + duration;
  }, 0);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={module ? "Edit Module" : "Create Module"}
        size="xl"
      >
        <div className="space-y-6">
          {/* Module Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module Title *
              </label>
              <input
                {...register(`modules.${moduleIndex}.title`)}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter module title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module Description
              </label>
              <textarea
                {...register(`modules.${moduleIndex}.description`)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter module description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Estimated Time
                </label>
                <input
                  {...register(`modules.${moduleIndex}.estimated_time`)}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  Pass Marks (%)
                </label>
                <input
                  {...register(`modules.${moduleIndex}.pass_marks`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="70"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                {...register(`modules.${moduleIndex}.is_required`)}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                This module is required to complete the course
              </label>
            </div>
          </div>

          {/* Lessons Section */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Lessons ({lessonFields.length})
              </h4>
              <Button
                type="button"
                onClick={addLesson}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Lesson
              </Button>
            </div>

            {lessonFields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No lessons added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessonFields.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2 py-1 rounded">
                        {lessonIndex + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {watch(
                            `modules.${moduleIndex}.lessons.${lessonIndex}.title`
                          ) || "Untitled Lesson"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDuration(
                            watch(
                              `modules.${moduleIndex}.lessons.${lessonIndex}.duration`
                            )
                          )}
                          {watch(
                            `modules.${moduleIndex}.lessons.${lessonIndex}.is_free_preview`
                          ) && (
                            <span className="ml-2 text-green-600 font-medium">
                              Free Preview
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Get the actual lesson data from watch
                          const lessonData = watch(
                            `modules.${moduleIndex}.lessons.${lessonIndex}`
                          );
                          setEditingLesson({
                            ...lessonData,
                            lessonIndex,
                            moduleIndex,
                          });
                          setShowLessonModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLesson(lessonIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {lessonFields.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Total Duration:</strong>{" "}
                  {formatDuration(totalLessonDuration)}
                </p>
              </div>
            )}
          </div>

          {/* Quiz & Assignment Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Assessments
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quiz */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Quiz
                  </h5>
                  {moduleData.quiz ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Get the actual quiz data from watch
                          const quizData = watch(`modules.${moduleIndex}.quiz`);
                          setEditingQuiz({ ...quizData, moduleIndex });
                          setShowQuizModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setValue(`modules.${moduleIndex}.quiz`, null)
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={addQuiz}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Quiz
                    </Button>
                  )}
                </div>

                {moduleData.quiz ? (
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">
                      {moduleData.quiz.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {moduleData.quiz.questions?.length || 0} questions
                    </p>
                    <p className="text-sm text-gray-600">
                      Pass marks:{" "}
                      {moduleData.quiz.passMarks || moduleData.quiz.pass_marks}%
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No quiz added</p>
                )}
              </div>

              {/* Assignment */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Assignment
                  </h5>
                  {moduleData.assignment ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Get the actual assignment data from watch
                          const assignmentData = watch(
                            `modules.${moduleIndex}.assignment`
                          );
                          setEditingAssignment({
                            ...assignmentData,
                            moduleIndex,
                          });
                          setShowAssignmentModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setValue(`modules.${moduleIndex}.assignment`, null)
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={addAssignment}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Assignment
                    </Button>
                  )}
                </div>

                {moduleData.assignment ? (
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">
                      {moduleData.assignment.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {moduleData.assignment.submission_type} submission
                    </p>
                    <p className="text-sm text-gray-600">
                      Pass marks:{" "}
                      {moduleData.assignment.passMarks ||
                        moduleData.assignment.pass_marks}
                      %
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No assignment added</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveModule}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Module
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lesson Builder Modal */}
      <LessonBuilder
        isOpen={showLessonModal}
        onClose={() => {
          setShowLessonModal(false);
          setEditingLesson(null);
        }}
        lesson={editingLesson}
        courseId={watch(`modules.${moduleIndex}.course_id`)}
        moduleId={watch(`modules.${moduleIndex}.id`)}
        lessonId={editingLesson?.id}
        onSave={(lessonData) => {
          if (editingLesson.lessonIndex !== undefined) {
            Object.keys(lessonData).forEach((key) => {
              setValue(
                `modules.${moduleIndex}.lessons.${editingLesson.lessonIndex}.${key}`,
                lessonData[key]
              );
            });
            toast.success("Lesson saved successfully");
          }
          setShowLessonModal(false);
          setEditingLesson(null);
        }}
      />

      {/* Quiz Builder Modal */}
      {showQuizModal && (
        <Modal
          isOpen={showQuizModal}
          onClose={() => {
            setShowQuizModal(false);
            setEditingQuiz(null);
          }}
          title={editingQuiz ? "Edit Quiz" : "Create Quiz"}
          size="xl"
        >
          <QuizBuilder
            quiz={editingQuiz}
            moduleId={null} // No database ID yet during course creation
            onSave={(quizData) => {
              setValue(`modules.${moduleIndex}.quiz`, quizData);
              setShowQuizModal(false);
              setEditingQuiz(null);
            }}
            onCancel={() => {
              setShowQuizModal(false);
              setEditingQuiz(null);
            }}
          />
        </Modal>
      )}

      {/* Assignment Builder Modal */}
      {showAssignmentModal && (
        <Modal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setEditingAssignment(null);
          }}
          title={editingAssignment ? "Edit Assignment" : "Create Assignment"}
          size="xl"
        >
          <AssignmentBuilder
            assignment={editingAssignment}
            moduleId={null} // No database ID yet during course creation
            onSave={(assignmentData) => {
              setValue(`modules.${moduleIndex}.assignment`, assignmentData);
              setShowAssignmentModal(false);
              setEditingAssignment(null);
            }}
            onCancel={() => {
              setShowAssignmentModal(false);
              setEditingAssignment(null);
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default ModuleBuilder;
