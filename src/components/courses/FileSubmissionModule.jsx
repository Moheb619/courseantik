import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

const FileSubmissionModule = ({ module, courseId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Check if user has already submitted
  const { data: existingSubmission } = useQuery({
    queryKey: ["file-submission", module.id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("file_submissions")
        .select("*")
        .eq("module_id", module.id)
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user && !!module.id,
  });

  // Submit file mutation
  const submitFileMutation = useMutation({
    mutationFn: async (file) => {
      setUploading(true);

      // Upload file to submissions bucket
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${module.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("submissions")
        .getPublicUrl(fileName);

      // Save submission record
      const { data, error } = await supabase
        .from("file_submissions")
        .insert({
          user_id: user.id,
          module_id: module.id,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          status: "submitted",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["file-submission", module.id, user?.id]);
      queryClient.invalidateQueries(["module-completions", user?.id]);
      setSelectedFile(null);
      setUploading(false);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      setUploading(false);
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/gif",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a PDF, Word document, image, or text file");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      submitFileMutation.mutate(selectedFile);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      submitted: "bg-blue-100 text-blue-800",
      reviewed: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
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
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                File Submission Required
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  Please upload your assignment file. Pass marks:{" "}
                  {module.pass_marks}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {existingSubmission ? (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Your Submission</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {existingSubmission.file_name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(existingSubmission.file_size)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(existingSubmission.status)}
                <a
                  href={existingSubmission.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-500 text-sm font-medium"
                >
                  View File
                </a>
              </div>
            </div>

            {existingSubmission.feedback && (
              <div className="mt-3 p-3 bg-white rounded border">
                <h5 className="text-sm font-medium text-gray-900 mb-1">
                  Feedback
                </h5>
                <p className="text-sm text-gray-600">
                  {existingSubmission.feedback}
                </p>
                {existingSubmission.score !== null && (
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    Score: {existingSubmission.score}%
                  </p>
                )}
              </div>
            )}
          </div>

          {existingSubmission.status === "rejected" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Submission Rejected
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Please review the feedback and resubmit your assignment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Assignment File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Accepted formats: PDF, Word documents, images, text files (max
              10MB)
            </p>
          </div>

          {selectedFile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
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
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {uploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </>
            ) : (
              "Submit Assignment"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileSubmissionModule;
