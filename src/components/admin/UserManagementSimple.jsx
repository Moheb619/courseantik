import React, { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

const UserManagementSimple = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  console.log(
    "UserManagementSimple rendered, showCreateModal:",
    showCreateModal
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            User Management (Simple)
          </h2>
          <p className="text-neutral-600">Test the Add User button</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => {
            console.log("Add User button clicked in simple component");
            setShowCreateModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Debug Info */}
      <div className="bg-yellow-100 p-4 rounded-lg">
        <p>Debug: showCreateModal = {showCreateModal ? "true" : "false"}</p>
      </div>

      {/* Simple Test Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          console.log("Modal close clicked");
          setShowCreateModal(false);
        }}
        title="Test Modal"
        size="md"
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Simple Test Modal</h3>
          <p className="mb-4">
            This is a test modal to check if the modal is working.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close Modal
            </button>
            <button
              onClick={() => console.log("Test button clicked")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Button
            </button>
          </div>
        </div>
      </Modal>

      {/* Alternative: Direct HTML Modal for Testing */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Direct HTML Modal</h3>
            <p className="mb-4">This modal is created with direct HTML/CSS.</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close Direct Modal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementSimple;
