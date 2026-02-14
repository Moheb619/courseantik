// ============================================================
// useCourses Hook — Course fetching with loading/error states
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { courseApi } from '../services/supabase/courseApi';

/**
 * Hook for fetching and managing courses
 * @param {object} options
 * @param {boolean} options.adminMode - If true, fetches all courses (including unpublished)
 * @param {boolean} options.autoFetch - If true, fetches on mount (default: true)
 */
export function useCourses({ adminMode = false, autoFetch = true } = {}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = adminMode
        ? await courseApi.getAllCourses()
        : await courseApi.getCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
      console.error('useCourses error:', err);
    } finally {
      setLoading(false);
    }
  }, [adminMode]);

  useEffect(() => {
    if (autoFetch) {
      fetchCourses();
    }
  }, [autoFetch, fetchCourses]);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
  };
}

/**
 * Hook for fetching a single course by ID
 */
export function useCourseDetails(courseId) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await courseApi.getCourseById(courseId);
      setCourse(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch course');
      console.error('useCourseDetails error:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return {
    course,
    loading,
    error,
    refetch: fetchCourse,
  };
}
