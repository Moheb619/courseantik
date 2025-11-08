import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  User,
  Calendar,
  Clock,
  Star,
  Download,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Filter,
  Search,
} from "lucide-react";
import { comprehensiveTeacherService } from "../../services/comprehensiveTeacherService";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

const AssignmentGradingCenter = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [gradeForm, setGradeForm] = useState({
    score: "",
    feedback: "",
    rubricScores: [],
  });

  // Fetch pending assignments
  const { data: pendingAssignments = [], isLoading } = useQuery({
    queryKey: ["teacher-pending-assignments", user?.id],
    queryFn: () => comprehensiveTeacherService.getPendingAssignments(user.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  // Grade assignment mutation
  const gradeAssignmentMutation = useMutation({
    mutationFn: ({ submissionId, gradeData }) =>
      comprehensiveTeacherService.gradeAssignment(submissionId, {
        ...gradeData,
        gradedBy: user.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["teacher-pending-assignments"]);
      setIsGradingModalOpen(false);
      setSelectedSubmission(null);
      setGradeForm({ score: "", feedback: "", rubricScores: [] });
    },
  });

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setIsGradingModalOpen(true);

    // Initialize rubric scores if rubric exists
    if (submission.assignment.rubric?.length > 0) {
      setGradeForm({
        ...gradeForm,
        rubricScores: submission.assignment.rubric.map((item) => ({
          rubricItemId: item.id,
          score: 0,
        })),
      });
    }
  };

  const handleSubmitGrade = (e) => {
    e.preventDefault();

    const totalScore =
      gradeForm.rubricScores.length > 0
        ? gradeForm.rubricScores.reduce((sum, score) => sum + score.score, 0)
        : parseInt(gradeForm.score);

    const maxScore =
      gradeForm.rubricScores.length > 0
        ? selectedSubmission.assignment.rubric.reduce(
            (sum, item) => sum + item.points,
            0
          )
        : 100;

    const passed =
      (totalScore / maxScore) * 100 >= selectedSubmission.assignment.pass_marks;

    gradeAssignmentMutation.mutate({
      submissionId: selectedSubmission.id,
      gradeData: {
        score: totalScore,
        feedback: gradeForm.feedback,
        rubricScores: gradeForm.rubricScores,
        passed,
      },
    });
  };

  const getSubmissionStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "graded":
        return "bg-green-100 text-green-800";
      case "returned":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Assignment Grading Center
          </h3>
          <p className="text-sm text-neutral-600">
            Review and grade student submissions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="pending">Pending Review</option>
            <option value="graded">Graded</option>
            <option value="returned">Returned</option>
            <option value="all">All Submissions</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      {pendingAssignments.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-xl">
          <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-neutral-900 mb-2">
            No pending submissions
          </h4>
          <p className="text-neutral-600">
            All assignments have been reviewed. Great job!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingAssignments.map((submission) => (
            <div
              key={submission.id}
              className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">
                      {submission.assignment.title}
                    </h4>
                    <p className="text-sm text-neutral-600 mb-2">
                      {submission.assignment.module.title} •{" "}
                      {submission.assignment.module.course.title}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{submission.student.full_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Submitted {formatTimeAgo(submission.submitted_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSubmissionStatusColor(
                      submission.status
                    )}`}
                  >
                    {submission.status}
                  </span>
                  {submission.assignment.due_date && (
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        new Date(submission.submitted_at) >
                        new Date(submission.assignment.due_date)
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {new Date(submission.submitted_at) >
                      new Date(submission.assignment.due_date)
                        ? "Late"
                        : "On Time"}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-neutral-900 mb-2">
                  Assignment Description
                </h5>
                <p className="text-sm text-neutral-700">
                  {submission.assignment.description}
                </p>
              </div>

              {submission.content && (
                <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-neutral-900 mb-2">
                    Student Submission
                  </h5>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                    {submission.content}
                  </p>
                </div>
              )}

              {submission.files && submission.files.length > 0 && (
                <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-neutral-900 mb-2">
                    Submitted Files
                  </h5>
                  <div className="space-y-2">
                    {submission.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <FileText className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-700">{file.name}</span>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  Pass Mark: {submission.assignment.pass_marks}%
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // View submission details
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleGradeSubmission(submission)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Grade
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grading Modal */}
      <Modal
        isOpen={isGradingModalOpen}
        onClose={() => {
          setIsGradingModalOpen(false);
          setSelectedSubmission(null);
        }}
        title="Grade Assignment"
        size="lg"
      >
        {selectedSubmission && (
          <form onSubmit={handleSubmitGrade} className="space-y-6 text-black">
            <div className="bg-neutral-50 rounded-lg p-4">
              <h4 className="font-medium text-neutral-900 mb-2">
                {selectedSubmission.assignment.title}
              </h4>
              <p className="text-sm text-neutral-600 mb-2">
                Student: {selectedSubmission.student.full_name}
              </p>
              <p className="text-sm text-neutral-600">
                Submitted:{" "}
                {new Date(selectedSubmission.submitted_at).toLocaleString()}
              </p>
            </div>

            {/* Rubric-based grading */}
            {selectedSubmission.assignment.rubric?.length > 0 ? (
              <div>
                <h5 className="font-medium text-neutral-900 mb-4">
                  Grading Rubric
                </h5>
                <div className="space-y-4">
                  {selectedSubmission.assignment.rubric.map(
                    (rubricItem, index) => (
                      <div
                        key={rubricItem.id}
                        className="border border-neutral-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h6 className="font-medium text-neutral-900">
                              {rubricItem.criteria}
                            </h6>
                            <p className="text-sm text-neutral-600">
                              {rubricItem.description}
                            </p>
                          </div>
                          <span className="text-sm text-neutral-500">
                            Max: {rubricItem.points} pts
                          </span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={rubricItem.points}
                          value={gradeForm.rubricScores[index]?.score || 0}
                          onChange={(e) => {
                            const newScores = [...gradeForm.rubricScores];
                            newScores[index] = {
                              ...newScores[index],
                              score: parseInt(e.target.value) || 0,
                            };
                            setGradeForm({
                              ...gradeForm,
                              rubricScores: newScores,
                            });
                          }}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          placeholder={`Score out of ${rubricItem.points}`}
                        />
                      </div>
                    )
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">
                      Total Score:
                    </span>
                    <span className="font-bold text-blue-900">
                      {gradeForm.rubricScores.reduce(
                        (sum, score) => sum + (score.score || 0),
                        0
                      )}{" "}
                      /{" "}
                      {selectedSubmission.assignment.rubric.reduce(
                        (sum, item) => sum + item.points,
                        0
                      )}{" "}
                      points
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-blue-700">Percentage:</span>
                    <span className="text-sm font-medium text-blue-700">
                      {Math.round(
                        (gradeForm.rubricScores.reduce(
                          (sum, score) => sum + (score.score || 0),
                          0
                        ) /
                          selectedSubmission.assignment.rubric.reduce(
                            (sum, item) => sum + item.points,
                            0
                          )) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Simple score-based grading */
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Score (out of 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeForm.score}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, score: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Enter score"
                  required
                />
                <p className="text-sm text-neutral-600 mt-1">
                  Pass mark: {selectedSubmission.assignment.pass_marks}%
                </p>
              </div>
            )}

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Feedback
              </label>
              <textarea
                value={gradeForm.feedback}
                onChange={(e) =>
                  setGradeForm({ ...gradeForm, feedback: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Provide feedback to the student..."
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsGradingModalOpen(false);
                  setSelectedSubmission(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={gradeAssignmentMutation.isPending}
              >
                {gradeAssignmentMutation.isPending
                  ? "Submitting..."
                  : "Submit Grade"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AssignmentGradingCenter;
