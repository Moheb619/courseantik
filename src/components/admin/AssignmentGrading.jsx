import React, { useState, useEffect } from "react";
import {
  Star,
  FileText,
  Download,
  Eye,
  Save,
  MessageSquare,
  Clock,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  FileIcon,
  Award,
  RotateCcw,
} from "lucide-react";
import Button from "../ui/Button";
import { formatCurrency } from "../../utils/fmt";

const AssignmentGrading = ({
  assignment,
  submissions = [],
  onGradeSubmission,
  onUpdateFeedback,
  className = "",
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rubricScores, setRubricScores] = useState({});
  const [feedback, setFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("submittedAt");

  useEffect(() => {
    if (selectedSubmission) {
      // Initialize rubric scores and feedback from existing data
      const scores = {};
      if (selectedSubmission.rubricScores) {
        selectedSubmission.rubricScores.forEach((score) => {
          scores[score.criteria] = score.score;
        });
      } else {
        // Initialize with default scores
        assignment.rubric?.forEach((item) => {
          scores[item.criteria] = 0;
        });
      }
      setRubricScores(scores);
      setFeedback(selectedSubmission.feedback || "");
    }
  }, [selectedSubmission, assignment.rubric]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const calculateTotalScore = () => {
    const totalPossible =
      assignment.rubric?.reduce((sum, item) => sum + item.points, 0) || 100;
    const totalScored = Object.values(rubricScores).reduce(
      (sum, score) => sum + (score || 0),
      0
    );
    return Math.round((totalScored / totalPossible) * 100);
  };

  const handleRubricScoreChange = (criteria, score) => {
    const maxScore =
      assignment.rubric?.find((item) => item.criteria === criteria)?.points ||
      100;
    const validScore = Math.max(0, Math.min(maxScore, parseInt(score) || 0));
    setRubricScores((prev) => ({
      ...prev,
      [criteria]: validScore,
    }));
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    setIsGrading(true);
    try {
      const totalScore = calculateTotalScore();
      const passed = totalScore >= assignment.passMarks;

      const gradingData = {
        submissionId: selectedSubmission.id,
        score: totalScore,
        passed,
        feedback: feedback.trim(),
        rubricScores:
          assignment.rubric?.map((item) => ({
            criteria: item.criteria,
            score: rubricScores[item.criteria] || 0,
          })) || [],
        gradedAt: new Date().toISOString(),
        gradedBy: "current_user", // This would come from auth context
      };

      await onGradeSubmission?.(gradingData);

      // Update the selected submission with new grading data
      setSelectedSubmission((prev) => ({
        ...prev,
        ...gradingData,
        status: "graded",
      }));
    } catch (error) {
      console.error("Grading error:", error);
      alert("Failed to save grades. Please try again.");
    } finally {
      setIsGrading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "graded":
        return "text-green-600 bg-green-50 border-green-200";
      case "submitted":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-neutral-600 bg-neutral-50 border-neutral-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "graded":
        return <CheckCircle className="w-4 h-4" />;
      case "submitted":
        return <FileText className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Filter and sort submissions
  const filteredSubmissions = submissions
    .filter((submission) => {
      if (filterStatus !== "all" && submission.status !== filterStatus)
        return false;
      if (
        searchTerm &&
        !submission.studentName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        !submission.studentEmail
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "submittedAt":
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case "studentName":
          return a.studentName.localeCompare(b.studentName);
        case "status":
          return a.status.localeCompare(b.status);
        case "score":
          return (b.score || 0) - (a.score || 0);
        default:
          return 0;
      }
    });

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const gradedCount = submissions.filter((s) => s.status === "graded").length;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Grade Assignments: {assignment.title}
            </h2>
            <p className="text-neutral-600">
              Manage and grade student submissions for this assignment
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-neutral-500">
              {submissions.length} total submissions
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm text-yellow-600">
                {pendingCount} pending
              </span>
              <span className="text-sm text-green-600">
                {gradedCount} graded
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="graded">Graded</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="submittedAt">Submission Date</option>
              <option value="studentName">Student Name</option>
              <option value="status">Status</option>
              <option value="score">Score</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex h-[800px]">
        {/* Submissions List */}
        <div className="w-1/2 border-r border-neutral-200 overflow-y-auto">
          <div className="p-4">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">No submissions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSubmission?.id === submission.id
                        ? "border-brand-500 bg-brand-50"
                        : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-neutral-400" />
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            {submission.studentName}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            {submission.studentEmail}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getStatusColor(
                          submission.status
                        )}`}
                      >
                        {getStatusIcon(submission.status)}
                        <span className="capitalize">{submission.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-neutral-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(
                            submission.submittedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {submission.status === "graded" && (
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          <span
                            className={`font-medium ${
                              submission.passed
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {submission.score}%
                          </span>
                        </div>
                      )}
                    </div>

                    {submission.files && submission.files.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
                        <FileIcon className="w-3 h-3" />
                        <span>{submission.files.length} file(s)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grading Panel */}
        <div className="w-1/2 overflow-y-auto">
          {selectedSubmission ? (
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {selectedSubmission.studentName}
                  </h3>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${getStatusColor(
                      selectedSubmission.status
                    )}`}
                  >
                    {getStatusIcon(selectedSubmission.status)}
                    <span className="text-sm font-medium capitalize">
                      {selectedSubmission.status}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-neutral-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Submitted:{" "}
                      {new Date(
                        selectedSubmission.submittedAt
                      ).toLocaleString()}
                    </span>
                  </div>
                  {selectedSubmission.gradedAt && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        Graded:{" "}
                        {new Date(selectedSubmission.gradedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Content */}
              {selectedSubmission.content && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-neutral-900 mb-2">
                    Text Submission
                  </h4>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                    <div className="whitespace-pre-wrap text-neutral-700">
                      {selectedSubmission.content}
                    </div>
                  </div>
                </div>
              )}

              {/* Files */}
              {selectedSubmission.files &&
                selectedSubmission.files.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-neutral-900 mb-2">
                      Submitted Files
                    </h4>
                    <div className="space-y-2">
                      {selectedSubmission.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileIcon className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm font-medium text-neutral-900">
                              {file.name}
                            </span>
                            <span className="text-xs text-neutral-500">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(file.url, "_blank")}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = file.url;
                                link.download = file.name;
                                link.click();
                              }}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Grading Section */}
              <div className="border-t border-neutral-200 pt-6">
                <h4 className="text-md font-medium text-neutral-900 mb-4">
                  Grading
                </h4>

                {/* Rubric Scoring */}
                {assignment.rubric && assignment.rubric.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-neutral-700 mb-3">
                      Rubric Scoring
                    </h5>
                    <div className="space-y-3">
                      {assignment.rubric.map((item) => (
                        <div
                          key={item.criteria}
                          className="p-3 bg-neutral-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-neutral-900">
                              {item.criteria}
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max={item.points}
                                value={rubricScores[item.criteria] || 0}
                                onChange={(e) =>
                                  handleRubricScoreChange(
                                    item.criteria,
                                    e.target.value
                                  )
                                }
                                className="w-16 px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                disabled={
                                  selectedSubmission.status === "graded"
                                }
                              />
                              <span className="text-sm text-neutral-600">
                                / {item.points}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-600">
                            {item.description}
                          </p>
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                        <span className="font-semibold text-neutral-900">
                          Total Score
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-lg font-bold ${
                              calculateTotalScore() >= assignment.passMarks
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {calculateTotalScore()}%
                          </span>
                          <span
                            className={`text-sm px-2 py-1 rounded ${
                              calculateTotalScore() >= assignment.passMarks
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {calculateTotalScore() >= assignment.passMarks
                              ? "Pass"
                              : "Fail"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Feedback for Student
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    rows={4}
                    placeholder="Provide detailed feedback on the student's work..."
                    disabled={selectedSubmission.status === "graded"}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {selectedSubmission.status !== "graded" ? (
                    <Button
                      variant="primary"
                      onClick={handleGradeSubmission}
                      disabled={isGrading}
                      className="flex-1"
                    >
                      {isGrading ? (
                        "Saving Grade..."
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Grade & Feedback
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Allow re-grading
                          setSelectedSubmission((prev) => ({
                            ...prev,
                            status: "pending",
                          }));
                        }}
                        className="flex-1"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Re-grade
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleGradeSubmission}
                        disabled={isGrading}
                        className="flex-1"
                      >
                        {isGrading ? (
                          "Updating..."
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Update Grade
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {selectedSubmission.status === "graded" && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        This assignment has been graded and feedback has been
                        sent to the student.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">
                Select a submission to start grading
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentGrading;
