import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dummyCourseDetail } from "../../../data/dummyData";
import Button from "../../../components/ui/Button";

const StudentLearningPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Simple state for now
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For now, we'll use the dummy data - later this will come from Supabase
  const course = dummyCourseDetail;
  const isEnrolled = true; // This will come from user enrollment check

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Add error handling for missing course data
  if (!course || !course.curriculum) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            Course Not Found
          </h1>
          <p className="text-neutral-600 mb-6">
            The course you're looking for doesn't exist or is not available.
          </p>
          <Button variant="primary" onClick={() => navigate("/courses")}>
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            Course Not Enrolled
          </h1>
          <p className="text-neutral-600 mb-6">
            You need to enroll in this course to access the learning content.
          </p>
          <Button variant="primary" onClick={() => navigate(`/course/${slug}`)}>
            View Course Details
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              {course.title}
            </h1>
            <p className="text-neutral-600 mb-6">
              Welcome to your learning journey! This is the student learning
              page.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">Course Slug: {slug}</p>
              <p className="text-sm text-neutral-500">Course ID: {course.id}</p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="primary"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/course/${slug}`)}
                >
                  View Course Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLearningPage;
