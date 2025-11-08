import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Star,
  Users,
  Clock,
  Play,
  Check,
  Lock,
  Download,
  Award,
  HelpCircle,
  Target,
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Lightbulb,
  Users2,
  Calendar,
  Zap,
  Video,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { courseService } from "../services/courseService";
import { useAuth } from "../../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "../../../utils/fmt";
import Button from "../../../components/ui/Button";
import ModuleDetail from "../../../components/courses/ModuleDetail";
import CourseAdmin from "../../../components/admin/CourseAdmin";
import { useCart } from "../../../hooks/useCart";
import moduleProgressionService from "../../../services/moduleProgressionService";
import { gsap } from "gsap";

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedModule, setSelectedModule] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const { addToCart, isInCart } = useCart();
  const assessmentRef = useRef(null);

  // Fetch course data from database
  const {
    data: course,
    isLoading: isLoadingCourse,
    error: courseError,
  } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => courseService.getCourseBySlug(slug),
    enabled: !!slug,
  });

  // Check enrollment status
  const { data: isEnrolled, isLoading: isLoadingEnrollment } = useQuery({
    queryKey: ["enrollment", course?.id, user?.id],
    queryFn: () => courseService.checkEnrollment(course.id, user.id),
    enabled: !!course?.id && !!user?.id,
  });

  // Fetch related courses from the same category
  const { data: relatedCourses = [] } = useQuery({
    queryKey: ["related-courses", course?.categorySlug],
    queryFn: () => courseService.getCourses({ category: course.categorySlug }),
    enabled: !!course?.categorySlug,
  });

  const assessment = course?.assessment;

  const handleEnroll = () => {
    addToCart({
      id: course.id,
      title: course.title,
      price: course.priceCents,
      image: course.thumbnail,
      type: "course",
    });
  };

  // Load course progress when enrolled
  useEffect(() => {
    if (isEnrolled && course?.id && user?.id) {
      const loadProgress = async () => {
        const progress = await moduleProgressionService.getCourseProgress(
          course.id,
          user.id
        );
        setCourseProgress(progress);
      };
      loadProgress();
    }
  }, [isEnrolled, course?.id, user?.id]);

  // Module functions
  // const toggleModuleExpansion = (moduleId) => {
  //   setExpandedModules(prev => ({
  //     ...prev,
  //     [moduleId]: !prev[moduleId]
  //   }));
  // };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
  };

  const handleModuleComplete = async (moduleId) => {
    // Handle module completion logic
    console.log(`Module ${moduleId} completed`);

    // Refresh course progress
    if (isEnrolled && course?.id && user?.id) {
      const progress = await moduleProgressionService.getCourseProgress(
        course.id,
        user.id
      );
      setCourseProgress(progress);
    }
  };

  const handleLessonSelect = (lesson) => {
    // Handle lesson selection logic
    console.log("Lesson selected:", lesson);
  };

  // Assessment functions
  const handleAnswerSelect = (questionId, answerId, isMultiple = false) => {
    if (isMultiple) {
      setAssessmentAnswers((prev) => ({
        ...prev,
        [questionId]: prev[questionId]
          ? prev[questionId].includes(answerId)
            ? prev[questionId].filter((id) => id !== answerId)
            : [...prev[questionId], answerId]
          : [answerId],
      }));
    } else {
      setAssessmentAnswers((prev) => ({
        ...prev,
        [questionId]: answerId,
      }));
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let recommendations = [];

    assessment.questions.forEach((question) => {
      const answer = assessmentAnswers[question.id];
      if (answer) {
        if (Array.isArray(answer)) {
          // Multiple choice
          answer.forEach((answerId) => {
            const option = question.options.find((opt) => opt.id === answerId);
            if (option) {
              totalScore += option.score;
              if (option.recommendation) {
                recommendations.push(option.recommendation);
              }
            }
          });
        } else {
          // Single choice
          const option = question.options.find((opt) => opt.id === answer);
          if (option) {
            totalScore += option.score;
            if (option.recommendation) {
              recommendations.push(option.recommendation);
            }
          }
        }
      }
    });

    return { totalScore, recommendations };
  };

  const getAssessmentResult = (score) => {
    if (score <= assessment.results.low_score.range[1]) {
      return assessment.results.low_score;
    } else if (score <= assessment.results.medium_score.range[1]) {
      return assessment.results.medium_score;
    } else {
      return assessment.results.high_score;
    }
  };

  const handleSubmitAssessment = () => {
    const { totalScore, recommendations } = calculateScore();
    const result = getAssessmentResult(totalScore);
    setAssessmentResult({
      score: totalScore,
      result,
      recommendations,
    });
  };

  const resetAssessment = () => {
    setAssessmentAnswers({});
    setAssessmentResult(null);
    setCurrentQuestion(0);
    setShowAssessment(false);
  };

  // GSAP animations
  useEffect(() => {
    if (assessmentRef.current && showAssessment) {
      gsap.fromTo(
        assessmentRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [showAssessment]);

  // Loading state
  if (isLoadingCourse || isLoadingEnrollment) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-neutral-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8"></div>
              <div className="h-48 bg-neutral-200 rounded mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (courseError || !course) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Course Not Found
            </h1>
            <p className="text-neutral-600 mb-6">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="primary" onClick={() => navigate("/courses")}>
              Browse All Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2 p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  {course.title}
                </h1>
                <p className="text-xl text-neutral-600 mb-4">
                  {course.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-neutral-500">
                    ({course.enrolledCount} students)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-neutral-400" />
                  <span className="text-neutral-600">
                    {course.enrolledCount} enrolled
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-neutral-400" />
                  <span className="text-neutral-600">
                    Last updated:{" "}
                    {new Date(course.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={
                    course.instructorAvatar || "https://via.placeholder.com/48"
                  }
                  alt={course.instructorName || "Instructor"}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-neutral-900">Created by</p>
                  <p className="text-neutral-600">
                    {course.instructorName || "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1 p-8 bg-neutral-50">
              <div className="sticky top-8">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />

                <div className="text-3xl font-bold text-neutral-900 mb-6">
                  {course.isFree
                    ? "Free"
                    : formatCurrency(course.priceCents / 100)}
                </div>

                {isEnrolled ? (
                  <Link to={`/course/${course.slug}/learn`}>
                    <Button variant="primary" fullWidth size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Start Learning
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={handleEnroll}
                    disabled={isInCart(course.id)}
                  >
                    {isInCart(course.id) ? "Added to Cart" : "Enroll Now"}
                  </Button>
                )}

                {/* Assessment Button */}
                {assessment && !showAssessment && !assessmentResult && (
                  <Button
                    variant="outline"
                    fullWidth
                    size="lg"
                    onClick={() => setShowAssessment(true)}
                    className="mt-4"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Take Course Assessment
                  </Button>
                )}

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success-500" />
                    <span className="text-sm text-neutral-600">
                      Full lifetime access
                    </span>
                  </div>
                  {course.includesCertificate && (
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-brand-500" />
                      <span className="text-sm text-neutral-600">
                        Certificate of completion
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Section */}
        {showAssessment && assessment && (
          <div
            ref={assessmentRef}
            className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
          >
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  {assessment.title}
                </h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  {assessment.description}
                </p>
              </div>

              {!assessmentResult ? (
                <div>
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-neutral-600">
                        Question {currentQuestion + 1} of{" "}
                        {assessment.questions.length}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {Math.round(
                          ((currentQuestion + 1) /
                            assessment.questions.length) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            ((currentQuestion + 1) /
                              assessment.questions.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Current Question */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-6">
                      {assessment.questions[currentQuestion].question}
                    </h3>

                    <div className="space-y-3">
                      {assessment.questions[currentQuestion].options.map(
                        (option) => {
                          const isSelected =
                            assessment.questions[currentQuestion].type ===
                            "multiple_choice"
                              ? assessmentAnswers[
                                  assessment.questions[currentQuestion].id
                                ]?.includes(option.id)
                              : assessmentAnswers[
                                  assessment.questions[currentQuestion].id
                                ] === option.id;

                          return (
                            <button
                              key={option.id}
                              onClick={() =>
                                handleAnswerSelect(
                                  assessment.questions[currentQuestion].id,
                                  option.id,
                                  assessment.questions[currentQuestion].type ===
                                    "multiple_choice"
                                )
                              }
                              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                                isSelected
                                  ? "border-brand-500 bg-brand-50 text-brand-900"
                                  : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected
                                      ? "border-brand-500 bg-brand-500"
                                      : "border-neutral-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span className="font-medium text-black">
                                  {option.text}
                                </span>
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentQuestion((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </Button>

                    {currentQuestion < assessment.questions.length - 1 ? (
                      <Button
                        variant="primary"
                        onClick={() => setCurrentQuestion((prev) => prev + 1)}
                        disabled={
                          !assessmentAnswers[
                            assessment.questions[currentQuestion].id
                          ]
                        }
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={handleSubmitAssessment}
                        disabled={
                          !assessmentAnswers[
                            assessment.questions[currentQuestion].id
                          ]
                        }
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get Results
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* Assessment Results */
                <div className="text-center">
                  <div className="mb-8">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        assessmentResult.score <=
                        assessment.results.low_score.range[1]
                          ? "bg-yellow-100"
                          : assessmentResult.score <=
                            assessment.results.medium_score.range[1]
                          ? "bg-green-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {assessmentResult.score <=
                      assessment.results.low_score.range[1] ? (
                        <AlertCircle className="w-10 h-10 text-yellow-600" />
                      ) : assessmentResult.score <=
                        assessment.results.medium_score.range[1] ? (
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      ) : (
                        <TrendingUp className="w-10 h-10 text-blue-600" />
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                      Assessment Complete!
                    </h3>

                    <div className="bg-neutral-50 rounded-lg p-6 mb-6">
                      <p className="text-lg text-neutral-700 mb-4">
                        {assessmentResult.result.message}
                      </p>

                      <div className="text-3xl font-bold text-brand-600 mb-2">
                        Score: {assessmentResult.score}
                      </div>

                      <div className="text-sm text-neutral-500">
                        Based on your answers, we've personalized
                        recommendations for you.
                      </div>
                    </div>

                    {/* Recommendations */}
                    {assessmentResult.recommendations.length > 0 && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-neutral-900 mb-4">
                          <Lightbulb className="w-5 h-5 inline mr-2 text-yellow-500" />
                          Personalized Insights
                        </h4>
                        <div className="space-y-2">
                          {assessmentResult.recommendations.map(
                            (rec, index) => (
                              <div
                                key={index}
                                className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left"
                              >
                                <p className="text-blue-800">{rec}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recommended Courses */}
                    {relatedCourses.length > 0 && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-neutral-900 mb-4">
                          <BookOpen className="w-5 h-5 inline mr-2 text-brand-500" />
                          Recommended Courses Based on Your Assessment
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {relatedCourses
                            .slice(0, 4)
                            .filter((c) => c.id !== course.id)
                            .map((recommendedCourse) => (
                              <Link
                                key={recommendedCourse.id}
                                to={`/course/${recommendedCourse.slug}`}
                                className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <img
                                  src={recommendedCourse.thumbnail}
                                  alt={recommendedCourse.title}
                                  className="w-full h-32 object-cover rounded-lg mb-3"
                                />
                                <h5 className="font-semibold text-neutral-900 mb-1">
                                  {recommendedCourse.title}
                                </h5>
                                <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                                  {recommendedCourse.subtitle}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm font-medium">
                                      {recommendedCourse.rating}
                                    </span>
                                  </div>
                                  <div className="text-sm font-bold text-neutral-900">
                                    {recommendedCourse.isFree
                                      ? "Free"
                                      : formatCurrency(
                                          recommendedCourse.priceCents / 100
                                        )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button variant="primary" onClick={resetAssessment}>
                        <Zap className="w-4 h-4 mr-2" />
                        Retake Assessment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAssessment(false)}
                      >
                        Close Assessment
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Course Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                Overview
              </button>
              <button
                onClick={() => setActiveTab("curriculum")}
                className={`px-6 py-4 font-medium ${
                  activeTab === "curriculum"
                    ? "text-brand-600 border-b-2 border-brand-600"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Curriculum
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`px-6 py-4 font-medium ${
                    activeTab === "admin"
                      ? "text-brand-600 border-b-2 border-brand-600"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Admin
                </button>
              )}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === "overview" && (
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                  Course Overview
                </h3>

                {/* Course Description */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-neutral-900 mb-3">
                    Description
                  </h4>
                  <div className="prose prose-neutral max-w-none text-neutral-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {course.description}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Course Details */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-neutral-900 mb-3">
                    Course Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-brand-500" />
                      <span className="text-neutral-700">
                        {course.modulesCount} modules • {course.lessonsCount}{" "}
                        lessons
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-brand-500" />
                      <span className="text-neutral-700">
                        {Math.floor(course.estimatedDuration / 60)}h{" "}
                        {course.estimatedDuration % 60}m total duration
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-brand-500" />
                      <span className="text-neutral-700">
                        Difficulty:{" "}
                        {course.difficultyLevel?.charAt(0).toUpperCase() +
                          course.difficultyLevel?.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-brand-500" />
                      <span className="text-neutral-700">
                        {course.enrolledCount} students enrolled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instructor */}
                {course.instructorBio && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-neutral-900 mb-3">
                      About the Instructor
                    </h4>
                    <div className="flex items-start gap-4 bg-neutral-50 rounded-lg p-4">
                      <img
                        src={
                          course.instructorAvatar ||
                          "https://via.placeholder.com/64"
                        }
                        alt={course.instructorName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h5 className="font-semibold text-neutral-900 mb-1">
                          {course.instructorName}
                        </h5>
                        <p className="text-neutral-700 leading-relaxed">
                          {course.instructorBio}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "curriculum" && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    Course Content
                  </h3>
                  <p className="text-neutral-600">
                    {course.curriculum.length} modules •{" "}
                    {course.curriculum.reduce(
                      (total, module) => total + module.lessons.length,
                      0
                    )}{" "}
                    lessons
                  </p>
                </div>

                {selectedModule ? (
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedModule(null)}
                      className="mb-4"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Course Content
                    </Button>
                    <ModuleDetail
                      module={selectedModule}
                      courseId={course.id}
                      isEnrolled={isEnrolled}
                      isAdmin={isAdmin}
                      onLessonSelect={handleLessonSelect}
                      onModuleComplete={handleModuleComplete}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {course.curriculum.map((module) => {
                      const moduleStatus =
                        courseProgress?.modules?.[module.moduleId];
                      const isModuleLocked =
                        isEnrolled && moduleStatus && !moduleStatus.isUnlocked;
                      const isModuleCompleted =
                        isEnrolled && moduleStatus && moduleStatus.isCompleted;

                      return (
                        <div
                          key={module.moduleId}
                          className={`border rounded-lg overflow-hidden ${
                            isModuleLocked
                              ? "border-neutral-200 bg-neutral-50"
                              : isModuleCompleted
                              ? "border-green-200 bg-green-50"
                              : "border-neutral-200"
                          }`}
                        >
                          <div
                            className={`p-4 border-b border-neutral-200 cursor-pointer transition-colors ${
                              isModuleLocked
                                ? "bg-neutral-50 cursor-not-allowed"
                                : isModuleCompleted
                                ? "bg-green-50 hover:bg-green-100"
                                : "bg-neutral-50 hover:bg-neutral-100"
                            }`}
                            onClick={() =>
                              !isModuleLocked && handleModuleSelect(module)
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    {isModuleLocked && (
                                      <Lock className="w-4 h-4 text-neutral-400" />
                                    )}
                                    {isModuleCompleted && (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    )}
                                    <h4
                                      className={`font-semibold ${
                                        isModuleLocked
                                          ? "text-neutral-500"
                                          : "text-neutral-900"
                                      }`}
                                    >
                                      {module.title}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        isModuleLocked
                                          ? "bg-neutral-200 text-neutral-600"
                                          : isModuleCompleted
                                          ? "bg-green-100 text-green-700"
                                          : "bg-brand-100 text-brand-700"
                                      }`}
                                    >
                                      Module {module.order}
                                    </span>
                                    {isEnrolled && moduleStatus && (
                                      <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                          isModuleCompleted
                                            ? "bg-green-100 text-green-700"
                                            : moduleStatus.isUnlocked
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-neutral-200 text-neutral-600"
                                        }`}
                                      >
                                        {isModuleCompleted
                                          ? "Completed"
                                          : moduleStatus.isUnlocked
                                          ? "Available"
                                          : "Locked"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-neutral-600 mb-3">
                                  {module.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-neutral-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{module.estimatedTime}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    <span>{module.lessons.length} lessons</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    <span>{module.passMarks}% to pass</span>
                                  </div>
                                  {module.quiz && (
                                    <div className="flex items-center gap-1">
                                      <Award className="w-3 h-3" />
                                      <span>Quiz included</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {!isModuleLocked && (
                                <ArrowRight className="w-5 h-5 text-neutral-400" />
                              )}
                            </div>
                          </div>

                          <div className="p-4">
                            <div className="space-y-2">
                              {module.lessons.slice(0, 3).map((lesson) => (
                                <div
                                  key={lesson.lessonId}
                                  className="flex items-center justify-between py-2"
                                >
                                  <div className="flex items-center gap-3">
                                    {lesson.isFreePreview ? (
                                      <Play className="w-4 h-4 text-brand-500" />
                                    ) : (
                                      <Lock className="w-4 h-4 text-neutral-400" />
                                    )}
                                    <span className="text-neutral-700 text-sm">
                                      {lesson.title}
                                    </span>
                                    {lesson.isFreePreview && (
                                      <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-sm text-neutral-500">
                                    {Math.floor(lesson.duration / 60)}:
                                    {String(lesson.duration % 60).padStart(
                                      2,
                                      "0"
                                    )}
                                  </span>
                                </div>
                              ))}
                              {module.lessons.length > 3 && (
                                <div className="text-center pt-2">
                                  <span className="text-sm text-neutral-500">
                                    +{module.lessons.length - 3} more lessons
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "admin" && isAdmin && (
              <CourseAdmin
                course={course}
                onUpdate={(updatedCourse) => {
                  // Handle course updates
                  console.log("Course updated:", updatedCourse);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
