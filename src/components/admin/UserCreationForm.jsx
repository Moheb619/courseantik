import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { toast } from "react-hot-toast";
import Button from "../ui/Button";
import {
  X,
  User,
  Mail,
  Lock,
  Shield,
  Briefcase,
  DollarSign,
} from "lucide-react";

const UserCreationForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    bio: "",
    expertise: "",
    hourly_rate: 0,
    avatar_url: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries(["admin-users"]);
      queryClient.invalidateQueries(["instructors"]);
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to create user: " + error.message);
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.role === "instructor") {
      if (!formData.expertise.trim()) {
        newErrors.expertise = "Expertise is required for instructors";
      }
      if (formData.hourly_rate < 0) {
        newErrors.hourly_rate = "Hourly rate cannot be negative";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        bio: formData.bio.trim() || null,
        expertise: formData.expertise.trim() || null,
        hourly_rate: parseInt(formData.hourly_rate) || 0,
        avatar_url: formData.avatar_url.trim() || null,
        is_active: formData.is_active,
      };

      await createUserMutation.mutateAsync(userData);
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    {
      value: "student",
      label: "Student",
      description: "Can enroll in courses",
    },
    {
      value: "instructor",
      label: "Instructor",
      description: "Can create and manage courses",
    },
    { value: "admin", label: "Admin", description: "Full platform access" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">
          Create New User
        </h2>
        <button
          onClick={onCancel}
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.full_name ? "border-red-300" : "border-neutral-300"
                }`}
                placeholder="Enter full name"
              />
              {errors.full_name && (
                <p className="text-red-600 text-sm mt-1">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    errors.email ? "border-red-300" : "border-neutral-300"
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Tell us about this user..."
            />
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.password ? "border-red-300" : "border-neutral-300"
                }`}
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.confirmPassword
                    ? "border-red-300"
                    : "border-neutral-300"
                }`}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role & Permissions
          </h3>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              User Role *
            </label>
            <div className="space-y-3">
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-start gap-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={formData.role === option.value}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">
                      {option.label}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Instructor-specific fields */}
        {formData.role === "instructor" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Instructor Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Expertise *
                </label>
                <input
                  type="text"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    errors.expertise ? "border-red-300" : "border-neutral-300"
                  }`}
                  placeholder="e.g., Web Development, Data Science"
                />
                {errors.expertise && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.expertise}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Hourly Rate (BDT)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    errors.hourly_rate ? "border-red-300" : "border-neutral-300"
                  }`}
                  placeholder="0"
                />
              </div>
              {errors.hourly_rate && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.hourly_rate}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Additional Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900">
            Additional Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
              />
              <label className="text-sm font-medium text-neutral-700">
                Active User
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                Create User
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserCreationForm;
