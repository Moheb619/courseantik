// ============================================================
// useEnrollment Hook — Enrollment check + enroll action
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { courseApi } from '../services/supabase/courseApi';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to check if the current user is enrolled in a course
 * and to enroll them if not.
 *
 * @param {string} courseId - The course UUID
 */
export function useEnrollment(courseId) {
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);

  const checkEnrollment = useCallback(async () => {
    if (!user || !courseId) {
      setIsEnrolled(false);
      setLoading(false);
      return;
    }

    try {
      const enrolled = await courseApi.checkEnrollment(courseId, user.id);
      setIsEnrolled(enrolled);
    } catch (err) {
      console.error('Enrollment check error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, courseId]);

  useEffect(() => {
    checkEnrollment();
  }, [checkEnrollment]);

  const enroll = async () => {
    if (!user || !courseId) return;

    setEnrolling(true);
    setError(null);
    try {
      await courseApi.enrollCourse(courseId, user.id);
      setIsEnrolled(true);
    } catch (err) {
      setError(err.message || 'Enrollment failed');
      console.error('Enroll error:', err);
    } finally {
      setEnrolling(false);
    }
  };

  return {
    isEnrolled,
    loading,
    enrolling,
    error,
    enroll,
    recheckEnrollment: checkEnrollment,
  };
}
