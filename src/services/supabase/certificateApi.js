// ============================================================
// Certificate API — Certificate management
// ============================================================
import { supabase } from './supabaseClient';

export const certificateApi = {
  /**
   * Get certificates for the current user
   */
  async getMyCertificates(userId) {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        course:courses (title),
        profile:profiles!certificates_user_id_fkey (name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Verify a certificate by its verification code (public)
   * @param {string} code - e.g. "CA-2026-XK9M4P"
   * @returns {Promise<object|null>}
   */
  async verifyCertificate(code) {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        course:courses (title),
        profile:profiles!certificates_user_id_fkey (name)
      `)
      .eq('verification_code', code)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Issue a certificate (calls Postgres function)
   */
  async issueCertificate(userId, courseId) {
    const { data, error } = await supabase
      .rpc('issue_certificate', {
        p_user_id: userId,
        p_course_id: courseId,
      });

    if (error) throw error;
    return data; // returns certificate UUID
  },

  /**
   * Check eligibility
   */
  async checkEligibility(userId, courseId) {
    const { data, error } = await supabase
      .rpc('check_certificate_eligibility', {
        p_user_id: userId,
        p_course_id: courseId,
      });

    if (error) throw error;
    return data; // boolean
  },

  /**
   * Revoke a certificate (admin)
   */
  async revokeCertificate(certId) {
    const { data, error } = await supabase
      .from('certificates')
      .update({ status: 'revoked' })
      .eq('id', certId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Restore a revoked certificate (admin)
   */
  async restoreCertificate(certId) {
    const { data, error } = await supabase
      .from('certificates')
      .update({ status: 'active' })
      .eq('id', certId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all certificates (admin)
   */
  async getAllCertificates() {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        course:courses (title),
        profile:profiles!certificates_user_id_fkey (name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
