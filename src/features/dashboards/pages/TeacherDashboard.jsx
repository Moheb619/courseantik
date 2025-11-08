import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  Star,
  Calendar,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { dummyCourses } from "../../../data/dummyData";
import { formatCurrency } from "../../../utils/fmt";
import Button from "../../../components/ui/Button";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [courses] = useState(dummyCourses.slice(0, 3)); // Mock teacher's courses

  // Calculate teacher stats
  const totalCourses = courses.length;
  const totalStudents = 450; // Mock data
  const totalEarnings = 2500; // Mock data
  const pendingSubmissions = 12; // Mock data

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "students", label: "Students", icon: Users },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "submissions", label: "Submissions", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Teacher Dashboard
              </h1>
              <p className="text-neutral-600 mt-1">
                Manage your courses and track your teaching progress
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  My Courses
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {totalCourses}
                </p>
                <p className="text-sm text-green-600">+1 this month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {totalStudents}
                </p>
                <p className="text-sm text-green-600">+25 this month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Total Earnings
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {formatCurrency(totalEarnings)}
                </p>
                <p className="text-sm text-green-600">+15% this month</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Pending Reviews
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {pendingSubmissions}
                </p>
                <p className="text-sm text-orange-600">Needs attention</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-brand-500 text-brand-600"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900">
                          New student enrolled
                        </h4>
                        <p className="text-sm text-neutral-600">
                          Sarah Johnson enrolled in your React course
                        </p>
                      </div>
                      <div className="text-sm text-neutral-500">1 hour ago</div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900">
                          New submission
                        </h4>
                        <p className="text-sm text-neutral-600">
                          Project submission from Mike Chen
                        </p>
                      </div>
                      <div className="text-sm text-neutral-500">
                        3 hours ago
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900">
                          New review
                        </h4>
                        <p className="text-sm text-neutral-600">
                          5-star review from Alex Rodriguez
                        </p>
                      </div>
                      <div className="text-sm text-neutral-500">1 day ago</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-center gap-2"
                    >
                      <Plus className="w-8 h-8 text-brand-600" />
                      <span className="font-medium">Create New Course</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-center gap-2"
                    >
                      <MessageSquare className="w-8 h-8 text-brand-600" />
                      <span className="font-medium">Review Submissions</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-center gap-2"
                    >
                      <BarChart3 className="w-8 h-8 text-brand-600" />
                      <span className="font-medium">View Analytics</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* My Courses Tab */}
            {activeTab === "courses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    My Courses
                  </h3>
                  <Button variant="primary" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-video bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white" />
                      </div>
                      <div className="p-6">
                        <h4 className="font-semibold text-neutral-900 mb-2">
                          {course.title}
                        </h4>
                        <div className="text-sm text-neutral-600 mb-3 prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {course.description}
                          </ReactMarkdown>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600">Students</span>
                            <span className="font-medium">
                              {course.enrolledCount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600">Rating</span>
                            <span className="font-medium flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              {course.rating}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600">Price</span>
                            <span className="font-medium">
                              {formatCurrency(course.priceCents / 100)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    My Students
                  </h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                    <select className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                      <option>All Students</option>
                      <option>Active</option>
                      <option>Completed</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Mock student cards */}
                  {[1, 2, 3, 4, 5, 6].map((student) => (
                    <div
                      key={student}
                      className="bg-white border border-neutral-200 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-brand-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            Student {student}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            student{student}@example.com
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Progress</span>
                          <span className="text-neutral-900">
                            {Math.floor(Math.random() * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Last Active</span>
                          <span className="text-neutral-900">2 days ago</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Courses</span>
                          <span className="text-neutral-900">
                            {Math.floor(Math.random() * 3) + 1}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Earnings Tab */}
            {activeTab === "earnings" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Earnings Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h4 className="font-medium text-neutral-900 mb-4">
                      This Month
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Gross Earnings</span>
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(3500)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">
                          Platform Fee (10%)
                        </span>
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(350)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-neutral-600">Net Earnings</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(3150)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h4 className="font-medium text-neutral-900 mb-4">
                      All Time
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Total Sales</span>
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(25000)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Total Earnings</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(22500)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Courses Sold</span>
                        <span className="font-semibold text-neutral-900">
                          125
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submissions Tab */}
            {activeTab === "submissions" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Student Submissions
                  </h3>
                  <select className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                    <option>All Submissions</option>
                    <option>Pending Review</option>
                    <option>Reviewed</option>
                  </select>
                </div>
                <div className="space-y-4">
                  {/* Mock submission cards */}
                  {[1, 2, 3, 4, 5].map((submission) => (
                    <div
                      key={submission}
                      className="bg-white border border-neutral-200 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-brand-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-neutral-900">
                              Project Submission #{submission}
                            </h4>
                            <p className="text-sm text-neutral-600">
                              Student: John Doe • Course: React Masterclass
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                          <p className="text-sm text-neutral-500 mt-1">
                            2 days ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-neutral-600">
                          File: project_submission_{submission}.zip
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                          <Button variant="primary" size="sm">
                            Grade
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
