import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { Search, User, Briefcase, Star, Check } from "lucide-react";

const InstructorSelector = ({
  selectedInstructor,
  onInstructorSelect,
  disabled = false,
  placeholder = "Select an instructor...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Fetch instructors
  const {
    data: instructors = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["instructors"],
    queryFn: userService.getInstructors,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Ensure instructors is always an array
  const instructorsList = Array.isArray(instructors) ? instructors : [];

  // Filter instructors based on search term
  const filteredInstructors = instructorsList.filter(
    (instructor) =>
      instructor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (instructor) => {
    onInstructorSelect(instructor);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedInstructorData = instructorsList.find(
    (i) => i.id === selectedInstructor
  );

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        Instructor *
      </label>

      {/* Selected Instructor Display */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
          disabled
            ? "bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed"
            : "bg-white border-neutral-300 hover:border-neutral-400"
        }`}
      >
        {selectedInstructorData ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
              {selectedInstructorData.avatar_url ? (
                <img
                  src={selectedInstructorData.avatar_url}
                  alt={selectedInstructorData.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-brand-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-neutral-900">
                {selectedInstructorData.full_name}
              </div>
              <div className="text-sm text-neutral-600">
                {selectedInstructorData.expertise}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-neutral-500">{placeholder}</span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-neutral-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search instructors..."
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                autoFocus
              />
            </div>
          </div>

          {/* Instructor List */}
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-neutral-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mx-auto mb-2"></div>
                Loading instructors...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                Error loading instructors. Please try again.
              </div>
            ) : filteredInstructors.length === 0 ? (
              <div className="p-4 text-center text-neutral-500">
                {searchTerm
                  ? "No instructors found matching your search."
                  : "No instructors available."}
              </div>
            ) : (
              filteredInstructors.map((instructor) => (
                <button
                  key={instructor.id}
                  type="button"
                  onClick={() => handleSelect(instructor)}
                  className={`w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors ${
                    selectedInstructor === instructor.id ? "bg-brand-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                      {instructor.avatar_url ? (
                        <img
                          src={instructor.avatar_url}
                          alt={instructor.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-900">
                          {instructor.full_name}
                        </span>
                        {selectedInstructor === instructor.id && (
                          <Check className="w-4 h-4 text-brand-600" />
                        )}
                      </div>

                      <div className="text-sm text-neutral-600 mt-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {instructor.expertise}
                          </span>
                        </div>
                      </div>

                      {instructor.bio && (
                        <div className="text-xs text-neutral-500 mt-1 line-clamp-2">
                          {instructor.bio}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default InstructorSelector;
