import React, { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

const UserManagementTest = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  console.log("UserManagementTest rendered, showCreateModal:", showCreateModal);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            User Management Test
          </h2>
          <p className="text-neutral-600">Test the Add User button</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => {
            console.log("Add User button clicked");
            setShowCreateModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>

        {/* Simple HTML Button for Testing */}
        <button
          onClick={() => {
            console.log("Simple button clicked");
            setShowCreateModal(true);
          }}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded"
        >
          Simple Button
        </button>
      </div>

      {/* Debug Info */}
      <div className="bg-yellow-100 p-4 rounded-lg">
        <p>Debug: showCreateModal = {showCreateModal ? "true" : "false"}</p>
      </div>

      {/* Test Modal */}
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
          <h3 className="text-lg font-semibold mb-4">Test Modal</h3>
          <p>This is a test modal to check if the modal is working.</p>
          <button
            onClick={() => setShowCreateModal(false)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Close Modal
          </button>
        </div>
      </Modal>

      {/* Alternative Simple Modal for Testing */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Simple Test Modal</h3>
            <p>This is a simple modal without the Modal component.</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Close Modal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTest;
