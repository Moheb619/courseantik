import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Need to create this or use standard textarea
import { UploadCloud, FileText, CheckCircle } from "lucide-react";

const AssignmentSubmitter = ({ assignment, onSubmit }) => {
  const [fileUrl, setFileUrl] = useState(""); // Simplified: In real app, this would be file upload logic
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      if (onSubmit) {
        onSubmit({ fileUrl, notes });
      }
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="text-center p-8 bg-green-50 rounded-xl border border-green-200">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          Assignment Submitted!
        </h2>
        <p className="text-green-700">
          Your work has been received. The instructor will review it shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{assignment.title}</h2>
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100 text-blue-800">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" /> Instructions
        </h3>
        <p>
          {assignment.description ||
            "Complete the task described in the video and upload your work below."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-xl border shadow-sm"
      >
        <div className="space-y-2">
          <Label htmlFor="url">Submission Link (Google Drive / Dropbox)</Label>
          <Input
            id="url"
            placeholder="https://..."
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Please ensure the link is publicly accessible.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes for Instructor (Optional)</Label>
          <textarea
            id="notes"
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Any additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Uploading..." : "Submit Assignment"}
        </Button>
      </form>
    </div>
  );
};

AssignmentSubmitter.propTypes = {
  assignment: PropTypes.object.isRequired,
  onSubmit: PropTypes.func,
};

export default AssignmentSubmitter;
