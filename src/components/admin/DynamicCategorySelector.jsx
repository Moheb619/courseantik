import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { categoryManagementService } from "../../services/courseManagementService";

const DynamicCategorySelector = ({
  selectedCategoryId,
  onCategorySelect,
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch existing categories
  const {
    data: categories = [],
    isLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryManagementService.getCategories,
  });

  // Create new category mutation
  const createCategoryMutation = useMutation({
    mutationFn: categoryManagementService.createCategory,
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries(["categories"]);
      onCategorySelect(newCategory.id);
      setNewCategoryName("");
      setShowCreateForm(false);
      setIsCreating(false);
      toast.success("Category created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create category: " + error.message);
      setIsCreating(false);
    },
  });

  // Get selected category details
  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setShowCreateForm(false);
        setNewCategoryName("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
      setShowCreateForm(false);
      setNewCategoryName("");
    }
  };

  const handleCategorySelect = (categoryId) => {
    onCategorySelect(categoryId);
    setIsOpen(false);
    setSearchTerm("");
    setShowCreateForm(false);
  };

  const handleCreateNew = () => {
    setShowCreateForm(true);
    setNewCategoryName(searchTerm);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    // Check if category already exists
    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === newCategoryName.toLowerCase()
    );

    if (existingCategory) {
      toast.error("Category already exists");
      return;
    }

    setIsCreating(true);
    await createCategoryMutation.mutateAsync({
      name: newCategoryName.trim(),
      description: `Category for ${newCategoryName.trim()}`,
    });
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewCategoryName("");
    setSearchTerm("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
      setShowCreateForm(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Category *
      </label>

      {/* Selected Category Display */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
        } ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={selectedCategory ? "text-gray-900" : "text-gray-500"}
          >
            {selectedCategory ? selectedCategory.name : "Select a category"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <X className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or create category..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Categories List */}
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Loading categories...
              </div>
            ) : categoriesError ? (
              <div className="p-3 text-center text-red-500">
                Error loading categories
              </div>
            ) : (
              <>
                {/* Existing Categories */}
                {filteredCategories.length > 0 && (
                  <>
                    {filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategorySelect(category.id)}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between ${
                          selectedCategoryId === category.id
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-900"
                        }`}
                      >
                        <span className="text-sm">{category.name}</span>
                        {selectedCategoryId === category.id && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </>
                )}

                {/* Create New Category Option */}
                {searchTerm &&
                  !filteredCategories.some(
                    (cat) => cat.name.toLowerCase() === searchTerm.toLowerCase()
                  ) && (
                    <div className="border-t border-gray-200">
                      {!showCreateForm ? (
                        <button
                          type="button"
                          onClick={handleCreateNew}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 text-blue-600 flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          <span className="text-sm">Create "{searchTerm}"</span>
                        </button>
                      ) : (
                        <div className="p-3 bg-gray-50">
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">
                              Create new category
                            </label>
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={(e) =>
                                setNewCategoryName(e.target.value)
                              }
                              placeholder="Enter category name"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={handleCreateCategory}
                                disabled={isCreating || !newCategoryName.trim()}
                                className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              >
                                {isCreating ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    Creating...
                                  </>
                                ) : (
                                  "Create"
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelCreate}
                                disabled={isCreating}
                                className="flex-1 px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* No Results */}
                {!isLoading &&
                  filteredCategories.length === 0 &&
                  !searchTerm && (
                    <div className="p-3 text-center text-gray-500">
                      No categories found
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicCategorySelector;
