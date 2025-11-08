import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Clock, Award, BookOpen, CheckCircle } from "lucide-react";
import { comprehensiveStudentService } from "../../services/comprehensiveStudentService";
import { useAuth } from "../../hooks/useAuth";

const ProgressTracker = () => {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  // Fetch comprehensive progress data
  const { data: progressSummary, isLoading } = useQuery({
    queryKey: ["student-progress-summary", user?.id],
    queryFn: () => comprehensiveStudentService.getProgressSummary(user.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: enrolledCourses = [] } = useQuery({
    queryKey: ["student-enrolled-courses", user?.id],
    queryFn: () => comprehensiveStudentService.getEnrolledCourses(user.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const calculateOverallProgress = () => {
    if (enrolledCourses.length === 0) return 0;
    return Math.round(
      enrolledCourses.reduce(
        (sum, enrollment) => sum + (enrollment.progress_percentage || 0),
        0
      ) / enrolledCourses.length
    );
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">
            Learning Progress
          </h3>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {progressSummary?.totalEnrollments || 0}
            </p>
            <p className="text-sm text-neutral-600">Enrolled Courses</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {progressSummary?.completedCourses || 0}
            </p>
            <p className="text-sm text-neutral-600">Completed</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {progressSummary?.totalCertificates || 0}
            </p>
            <p className="text-sm text-neutral-600">Certificates</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {overallProgress}%
            </p>
            <p className="text-sm text-neutral-600">Avg Progress</p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="bg-neutral-100 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-700">
              Overall Learning Progress
            </span>
            <span className="text-sm font-bold text-neutral-900">
              {overallProgress}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-brand-400 to-brand-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
