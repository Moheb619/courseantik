import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import { comprehensiveAdminService } from "../../services/comprehensiveAdminService";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

const BulkCourseAssignment = ({ isOpen, onClose, selectedCourses = [] }) => {
  const queryClient = useQueryClient();
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("instructor");

  // Fetch instructors
  const { data: instructors, isLoading: instructorsLoading } = useQuery({
    queryKey: ["instructors-for-assignment", searchTerm, filterRole],
    queryFn: () =>
      comprehensiveAdminService.getInstructorsForAssignment({
        search: searchTerm || null,
        role: filterRole,
      }),
    enabled: isOpen,
  });

  // Assign courses to instructor
  const assignCoursesMutation = useMutation({
    mutationFn: ({ instructorId, courseIds }) =>
      comprehensiveAdminService.assignCoursesToInstructor(
        instructorId,
        courseIds
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["instructors"]);
      onClose();
    },
  });

  const handleAssignCourses = () => {
    if (!selectedInstructor || selectedCourses.length === 0) return;

    assignCoursesMutation.mutate({
      instructorId: selectedInstructor.id,
      courseIds: selectedCourses,
    });
  };

  const filteredInstructors =
    instructors?.filter(
      (instructor) =>
        instructor.full_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        instructor.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Courses to Instructor"
      size="lg"
    >
      <div className="space-y-6">
        {/* Selected Courses Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Selected Courses</h3>
          </div>
          <p className="text-blue-700">
            {selectedCourses.length} course
            {selectedCourses.length !== 1 ? "s" : ""} will be assigned
          </p>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="instructor">Instructors</option>
                <option value="all">All Users</option>
              </select>
            </div>
          </div>
        </div>

        {/* Instructors List */}
        <div className="max-h-96 overflow-y-auto">
          {instructorsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
              <p className="mt-2 text-neutral-600">Loading instructors...</p>
            </div>
          ) : filteredInstructors.length > 0 ? (
            <div className="space-y-3">
              {filteredInstructors.map((instructor) => (
                <div
                  key={instructor.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedInstructor?.id === instructor.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                  onClick={() => setSelectedInstructor(instructor)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {instructor.avatar_url ? (
                        <img
                          src={instructor.avatar_url}
                          alt={instructor.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium text-lg">
                          {instructor.full_name?.charAt(0) || "I"}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-neutral-900 truncate">
                          {instructor.full_name || "Unnamed Instructor"}
                        </h4>
                        {selectedInstructor?.id === instructor.id && (
                          <CheckCircle className="w-4 h-4 text-brand-600" />
                        )}
                      </div>

                      <div className="text-sm text-neutral-600 space-y-1">
                        {instructor.expertise && (
                          <p className="truncate">
                            <span className="font-medium">Expertise:</span>{" "}
                            {instructor.expertise}
                          </p>
                        )}
                        {instructor.experience_years > 0 && (
                          <p>
                            <span className="font-medium">Experience:</span>{" "}
                            {instructor.experience_years} years
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Current Courses:</span>{" "}
                          {instructor.courses?.[0]?.count || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-neutral-50 rounded-lg">
              <Users className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600">No instructors found</p>
              {searchTerm && (
                <p className="text-sm text-neutral-500 mt-1">
                  Try adjusting your search terms
                </p>
              )}
            </div>
          )}
        </div>

        {/* Assignment Summary */}
        {selectedInstructor && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-900">Assignment Summary</h3>
            </div>
            <p className="text-green-700">
              Assigning {selectedCourses.length} course
              {selectedCourses.length !== 1 ? "s" : ""} to{" "}
              <span className="font-medium">
                {selectedInstructor.full_name}
              </span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={assignCoursesMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignCourses}
            disabled={
              !selectedInstructor ||
              selectedCourses.length === 0 ||
              assignCoursesMutation.isPending
            }
          >
            {assignCoursesMutation.isPending ? (
              "Assigning..."
            ) : (
              <>
                <BookOpen className="w-4 h-4 mr-2" />
                Assign {selectedCourses.length} Course
                {selectedCourses.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkCourseAssignment;
