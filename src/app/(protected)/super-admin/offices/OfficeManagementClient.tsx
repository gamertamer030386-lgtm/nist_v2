"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createOffice,
  updateOffice,
  deleteOffice,
  assignAdminToOffice,
} from "@/actions/offices";

interface OfficeData {
  id: string;
  name: string;
  description: string | null;
  adminCount: number;
  endUserCount: number;
}

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  officeId: string | null;
}

interface Props {
  offices: OfficeData[];
  adminUsers: AdminUser[];
}

export default function OfficeManagementClient({ offices, adminUsers }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState<OfficeData | null>(null);
  const [assigningOffice, setAssigningOffice] = useState<OfficeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {/* Error display */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Create Office
        </button>
      </div>

      {/* Office table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Office Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Description
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Admins
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                End Users
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {offices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No offices created yet. Click &quot;Create Office&quot; to get started.
                </td>
              </tr>
            ) : (
              offices.map((office) => (
                <tr key={office.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {office.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {office.description || "—"}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">
                    {office.adminCount}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">
                    {office.endUserCount}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => setAssigningOffice(office)}
                      className="mr-2 text-green-600 hover:text-green-800 font-medium"
                    >
                      Assign Admin
                    </button>
                    <button
                      onClick={() => setEditingOffice(office)}
                      className="mr-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(office.id)}
                      disabled={isPending}
                      className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <OfficeFormModal
          title="Create Office"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          isPending={isPending}
        />
      )}

      {/* Edit Modal */}
      {editingOffice && (
        <OfficeFormModal
          title="Edit Office"
          initialName={editingOffice.name}
          initialDescription={editingOffice.description ?? ""}
          onClose={() => setEditingOffice(null)}
          onSubmit={(name, description) => handleUpdate(editingOffice.id, name, description)}
          isPending={isPending}
        />
      )}

      {/* Assign Admin Modal */}
      {assigningOffice && (
        <AssignAdminModal
          office={assigningOffice}
          adminUsers={adminUsers}
          onClose={() => setAssigningOffice(null)}
          onAssign={handleAssignAdmin}
          isPending={isPending}
        />
      )}
    </div>
  );

  function handleCreate(name: string, description: string) {
    setError(null);
    startTransition(async () => {
      try {
        await createOffice({ name, description: description || null });
        setShowCreateModal(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create office");
      }
    });
  }

  function handleUpdate(officeId: string, name: string, description: string) {
    setError(null);
    startTransition(async () => {
      try {
        await updateOffice(officeId, { name, description: description || null });
        setEditingOffice(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update office");
      }
    });
  }

  function handleDelete(officeId: string) {
    if (!confirm("Are you sure you want to delete this office? All users will be unassigned.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await deleteOffice(officeId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete office");
      }
    });
  }

  function handleAssignAdmin(userId: string, officeId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await assignAdminToOffice(userId, officeId);
        setAssigningOffice(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to assign admin");
      }
    });
  }
}


// ─── Modal Components ────────────────────────────────────────────────────────

interface OfficeFormModalProps {
  title: string;
  initialName?: string;
  initialDescription?: string;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
  isPending: boolean;
}

function OfficeFormModal({
  title,
  initialName = "",
  initialDescription = "",
  onClose,
  onSubmit,
  isPending,
}: OfficeFormModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError("Office name is required");
      return;
    }
    if (name.length > 100) {
      setValidationError("Office name must be 100 characters or less");
      return;
    }
    if (description.length > 500) {
      setValidationError("Description must be 500 characters or less");
      return;
    }

    onSubmit(name.trim(), description.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>

        {validationError && (
          <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="office-name" className="block text-sm font-medium text-gray-700 mb-1">
              Office Name <span className="text-red-500">*</span>
            </label>
            <input
              id="office-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter office name"
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-400">{name.length}/100</p>
          </div>

          <div className="mb-6">
            <label htmlFor="office-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="office-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Optional description"
            />
            <p className="mt-1 text-xs text-gray-400">{description.length}/500</p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AssignAdminModalProps {
  office: OfficeData;
  adminUsers: AdminUser[];
  onClose: () => void;
  onAssign: (userId: string, officeId: string) => void;
  isPending: boolean;
}

function AssignAdminModal({
  office,
  adminUsers,
  onClose,
  onAssign,
  isPending,
}: AssignAdminModalProps) {
  const [selectedUserId, setSelectedUserId] = useState("");

  // Filter to show admins not already assigned to this office
  const availableAdmins = adminUsers.filter(
    (admin) => admin.officeId !== office.id
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;
    onAssign(selectedUserId, office.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          Assign Admin to {office.name}
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Select an Admin user to assign to this office.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="admin-select" className="block text-sm font-medium text-gray-700 mb-1">
              Admin User
            </label>
            {availableAdmins.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No available Admin users to assign. All admins are already assigned to this office or no Admin users exist.
              </p>
            ) : (
              <select
                id="admin-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select an admin...</option>
                {availableAdmins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name || admin.email} ({admin.email})
                    {admin.officeId ? " — currently assigned elsewhere" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !selectedUserId || availableAdmins.length === 0}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isPending ? "Assigning..." : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
