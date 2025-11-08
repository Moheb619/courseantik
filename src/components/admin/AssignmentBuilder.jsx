import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  X,
  FileText,
  Upload,
  Calendar,
  Target,
  AlertCircle,
  Star,
  Clock,
  Info,
} from "lucide-react";
import Button from "../ui/Button";
import { assignmentService } from "../../services/assignmentService";

const AssignmentBuilder = ({
  assignment = null,
  moduleId,
  onSave,
  onCancel,
  className = "",
}) => {
  const [assignmentData, setAssignmentData] = useState(() => {
    if (assignment) {
      return {
        id: assignment.id || "",
        title: assignment.title || "",
        description: assignment.description || "",
        requirements: Array.isArray(assignment.requirements)
          ? assignment.requirements
          : [""],
        submissionType:
          assignment.submissionType || assignment.submission_type || "file",
        allowedFileTypes: Array.isArray(assignment.allowedFileTypes)
          ? assignment.allowedFileTypes
          : Array.isArray(assignment.allowed_file_types)
          ? assignment.allowed_file_types
          : [".pdf", ".doc", ".docx"],
        maxFileSize:
          assignment.maxFileSize || assignment.max_file_size || 5242880,
        passMarks: assignment.passMarks || assignment.pass_marks || 70,
        isRequired: assignment.isRequired || assignment.is_required !== false,
        dueDate: assignment.dueDate || assignment.due_date || "",
        rubric: Array.isArray(assignment.rubric)
          ? assignment.rubric
          : [
              {
                criteria: "Content Quality",
                points: 25,
                description: "Quality and accuracy of content",
              },
              {
                criteria: "Organization",
                points: 25,
                description: "Clear structure and logical flow",
              },
              {
                criteria: "Completeness",
                points: 25,
                description: "All requirements addressed",
              },
              {
                criteria: "Presentation",
                points: 25,
                description: "Professional presentation and formatting",
              },
            ],
      };
    }
    return {
      id: "",
      title: "",
      description: "",
      requirements: [""],
      submissionType: "file", // 'text', 'file', or 'both'
      allowedFileTypes: [".pdf", ".doc", ".docx"],
      maxFileSize: 5242880, // 5MB in bytes
      passMarks: 70,
      isRequired: true,
      dueDate: "",
      rubric: [
        {
          criteria: "Content Quality",
          points: 25,
          description: "Quality and accuracy of content",
        },
        {
          criteria: "Organization",
          points: 25,
          description: "Clear structure and logical flow",
        },
        {
          criteria: "Completeness",
          points: 25,
          description: "All requirements addressed",
        },
        {
          criteria: "Presentation",
          points: 25,
          description: "Professional presentation and formatting",
        },
      ],
    };
  });

  const [errors, setErrors] = useState({});

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!assignmentData.title.trim()) {
      newErrors.title = "Assignment title is required";
    }

    if (!assignmentData.description.trim()) {
      newErrors.description = "Assignment description is required";
    }

    const requirements = Array.isArray(assignmentData.requirements)
      ? assignmentData.requirements
      : [];
    if (requirements.filter((req) => req.trim()).length === 0) {
      newErrors.requirements = "At least one requirement is needed";
    }

    if (!assignmentData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else if (new Date(assignmentData.dueDate) < new Date()) {
      newErrors.dueDate = "Due date must be in the future";
    }

    if (assignmentData.passMarks < 0 || assignmentData.passMarks > 100) {
      newErrors.passMarks = "Pass marks must be between 0 and 100";
    }

    if (
      (assignmentData.submissionType === "file" ||
        assignmentData.submissionType === "both") &&
      assignmentData.allowedFileTypes.length === 0
    ) {
      newErrors.allowedFileTypes = "At least one file type must be allowed";
    }

    if (assignmentData.rubric.length === 0) {
      newErrors.rubric = "At least one rubric criterion is required";
    }

    const totalRubricPoints = assignmentData.rubric.reduce(
      (sum, item) => sum + (item.points || 0),
      0
    );
    if (totalRubricPoints !== 100) {
      newErrors.rubric = "Rubric points must total 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const processedData = {
        ...assignmentData,
        requirements: (Array.isArray(assignmentData.requirements)
          ? assignmentData.requirements
          : []
        ).filter((req) => req.trim()),
        rubric: (Array.isArray(assignmentData.rubric)
          ? assignmentData.rubric
          : []
        ).filter((item) => item.criteria.trim() && item.points > 0),
      };

      // If no moduleId, we're in course creation mode - just return the data
      if (!moduleId) {
        onSave(processedData);
        return;
      }

      let result;
      if (assignment && assignment.id && assignment.id !== "") {
        // Update existing assignment
        result = await assignmentService.updateAssignment(
          assignment.id,
          processedData
        );
      } else {
        // Create new assignment
        result = await assignmentService.createAssignment(
          moduleId,
          processedData
        );
      }

      if (result.error) {
        throw result.error;
      }

      onSave(result.data);
    } catch (error) {
      console.error("Error saving assignment:", error);
      alert("Failed to save assignment. Please try again.");
    }
  };

  const addRequirement = () => {
    setAssignmentData((prev) => ({
      ...prev,
      requirements: Array.isArray(prev.requirements)
        ? [...prev.requirements, ""]
        : [""],
    }));
  };

  const updateRequirement = (index, value) => {
    setAssignmentData((prev) => ({
      ...prev,
      requirements: Array.isArray(prev.requirements)
        ? prev.requirements.map((req, i) => (i === index ? value : req))
        : [value],
    }));
  };

  const removeRequirement = (index) => {
    setAssignmentData((prev) => ({
      ...prev,
      requirements: Array.isArray(prev.requirements)
        ? prev.requirements.filter((_, i) => i !== index)
        : [],
    }));
  };

  const addRubricItem = () => {
    setAssignmentData((prev) => ({
      ...prev,
      rubric: [...prev.rubric, { criteria: "", points: 0, description: "" }],
    }));
  };

  const updateRubricItem = (index, field, value) => {
    setAssignmentData((prev) => ({
      ...prev,
      rubric: prev.rubric.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "points" ? parseInt(value) || 0 : value,
            }
          : item
      ),
    }));
  };

  const removeRubricItem = (index) => {
    setAssignmentData((prev) => ({
      ...prev,
      rubric: prev.rubric.filter((_, i) => i !== index),
    }));
  };

  const addFileType = () => {
    const newType = prompt("Enter file extension (e.g., .pdf, .docx):");
    if (newType && !assignmentData.allowedFileTypes.includes(newType)) {
      setAssignmentData((prev) => ({
        ...prev,
        allowedFileTypes: [...prev.allowedFileTypes, newType],
      }));
    }
  };

  const removeFileType = (type) => {
    setAssignmentData((prev) => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.filter((t) => t !== type),
    }));
  };

  const fileSizeOptions = [
    { value: 1048576, label: "1 MB" },
    { value: 5242880, label: "5 MB" },
    { value: 10485760, label: "10 MB" },
    { value: 20971520, label: "20 MB" },
    { value: 52428800, label: "50 MB" },
  ];

  const totalRubricPoints = assignmentData.rubric.reduce(
    (sum, item) => sum + (item.points || 0),
    0
  );

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">
          {assignment ? "Edit Assignment" : "Create New Assignment"}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Assignment
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Assignment Title *
            </label>
            <input
              type="text"
              value={assignmentData.title}
              onChange={(e) =>
                setAssignmentData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.title ? "border-red-300" : "border-neutral-300"
              }`}
              placeholder="Enter assignment title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description *
            </label>
            <textarea
              value={assignmentData.description}
              onChange={(e) =>
                setAssignmentData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.description ? "border-red-300" : "border-neutral-300"
              }`}
              rows={4}
              placeholder="Describe what students need to do for this assignment"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Due Date *
            </label>
            <input
              type="datetime-local"
              value={assignmentData.dueDate}
              onChange={(e) =>
                setAssignmentData((prev) => ({
                  ...prev,
                  dueDate: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.dueDate ? "border-red-300" : "border-neutral-300"
              }`}
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.dueDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Pass Marks (%) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={assignmentData.passMarks}
              onChange={(e) =>
                setAssignmentData((prev) => ({
                  ...prev,
                  passMarks: parseInt(e.target.value) || 0,
                }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.passMarks ? "border-red-300" : "border-neutral-300"
              }`}
            />
            {errors.passMarks && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.passMarks}
              </p>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isRequired"
                checked={assignmentData.isRequired}
                onChange={(e) =>
                  setAssignmentData((prev) => ({
                    ...prev,
                    isRequired: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500"
              />
              <label
                htmlFor="isRequired"
                className="text-sm font-medium text-neutral-700"
              >
                This assignment is required to complete the module
              </label>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-neutral-700">
              Requirements *
            </label>
            <Button variant="outline" size="sm" onClick={addRequirement}>
              <Plus className="w-4 h-4 mr-1" />
              Add Requirement
            </Button>
          </div>

          <div className="space-y-2">
            {(Array.isArray(assignmentData.requirements)
              ? assignmentData.requirements
              : [""]
            ).map((requirement, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Enter a requirement"
                />
                {assignmentData.requirements.length > 1 && (
                  <button
                    onClick={() => removeRequirement(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.requirements && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.requirements}
            </p>
          )}
        </div>

        {/* Submission Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Submission Type
          </label>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="submissionType"
                value="text"
                checked={assignmentData.submissionType === "text"}
                onChange={(e) =>
                  setAssignmentData((prev) => ({
                    ...prev,
                    submissionType: e.target.value,
                  }))
                }
                className="mr-3"
              />
              <div>
                <div className="font-medium text-neutral-900">Text Only</div>
                <div className="text-sm text-neutral-600">
                  Students submit text content
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="submissionType"
                value="file"
                checked={assignmentData.submissionType === "file"}
                onChange={(e) =>
                  setAssignmentData((prev) => ({
                    ...prev,
                    submissionType: e.target.value,
                  }))
                }
                className="mr-3"
              />
              <div>
                <div className="font-medium text-neutral-900">File Only</div>
                <div className="text-sm text-neutral-600">
                  Students upload files
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="submissionType"
                value="both"
                checked={assignmentData.submissionType === "both"}
                onChange={(e) =>
                  setAssignmentData((prev) => ({
                    ...prev,
                    submissionType: e.target.value,
                  }))
                }
                className="mr-3"
              />
              <div>
                <div className="font-medium text-neutral-900">Text & File</div>
                <div className="text-sm text-neutral-600">
                  Students can choose
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* File Settings */}
        {(assignmentData.submissionType === "file" ||
          assignmentData.submissionType === "both") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-neutral-700">
                  Allowed File Types
                </label>
                <Button variant="outline" size="sm" onClick={addFileType}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Type
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {assignmentData.allowedFileTypes.map((type, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-brand-100 text-brand-700 rounded text-sm"
                  >
                    {type}
                    <button
                      onClick={() => removeFileType(type)}
                      className="text-brand-500 hover:text-brand-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {errors.allowedFileTypes && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.allowedFileTypes}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Maximum File Size
              </label>
              <select
                value={assignmentData.maxFileSize}
                onChange={(e) =>
                  setAssignmentData((prev) => ({
                    ...prev,
                    maxFileSize: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {fileSizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Grading Rubric */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Grading Rubric
              </label>
              <p className="text-xs text-neutral-500 mt-1">
                Total points: {totalRubricPoints}/100
                {totalRubricPoints !== 100 && (
                  <span className="text-red-600 ml-2">
                    (Must total 100 points)
                  </span>
                )}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={addRubricItem}>
              <Plus className="w-4 h-4 mr-1" />
              Add Criterion
            </Button>
          </div>

          <div className="space-y-3">
            {assignmentData.rubric.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-neutral-200 rounded-lg"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                  <div className="lg:col-span-4">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Criteria Name
                    </label>
                    <input
                      type="text"
                      value={item.criteria}
                      onChange={(e) =>
                        updateRubricItem(index, "criteria", e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="e.g., Content Quality"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Points
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.points}
                      onChange={(e) =>
                        updateRubricItem(index, "points", e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>

                  <div className="lg:col-span-5">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateRubricItem(index, "description", e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="Describe what this criterion measures"
                    />
                  </div>

                  <div className="lg:col-span-1 flex justify-end">
                    {assignmentData.rubric.length > 1 && (
                      <button
                        onClick={() => removeRubricItem(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.rubric && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.rubric}
            </p>
          )}
        </div>

        {/* Preview Section */}
        <div className="border-t border-neutral-200 pt-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Assignment Preview
          </h3>
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
            <div className="mb-3">
              <h4 className="font-semibold text-neutral-900">
                {assignmentData.title || "Assignment Title"}
              </h4>
              <p className="text-sm text-neutral-600 mt-1">
                {assignmentData.description ||
                  "Assignment description will appear here"}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-neutral-500 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  Due:{" "}
                  {assignmentData.dueDate
                    ? new Date(assignmentData.dueDate).toLocaleDateString()
                    : "Not set"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>Pass: {assignmentData.passMarks}%</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>
                  {assignmentData.submissionType === "both"
                    ? "Text & File"
                    : assignmentData.submissionType === "file"
                    ? "File Only"
                    : "Text Only"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Max: {formatFileSize(assignmentData.maxFileSize)}</span>
              </div>
            </div>

            {assignmentData.requirements.filter((req) => req.trim()).length >
              0 && (
              <div>
                <p className="text-xs font-medium text-neutral-700 mb-1">
                  Requirements:
                </p>
                <ul className="text-xs text-neutral-600 space-y-1">
                  {assignmentData.requirements
                    .filter((req) => req.trim())
                    .map((req, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentBuilder;
