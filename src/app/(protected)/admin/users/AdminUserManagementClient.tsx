"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUser, updateUser, deactivateUser } from "@/actions/users";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "END_USER";
  officeId: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface Props {
  users: UserData[];
  officeName: string;
  officeId: string;
}

export default function AdminUserManagementClient({ users, officeName, officeId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCreate(data: { email: string; password: string; name: string }) {
    setError(null);
    startTransition(async () => {
      try {
        await createUser({
          email: data.email,
          password: data.password,
          name: data.name || null,
          role: "END_USER",
          officeId,
        });
        setShowCreateModal(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create user");
      }
    });
  }

  function handleUpdate(userId: string, data: { name: string; email: string }) {
    setError(null);
    startTransition(async () => {
      try {
        await updateUser(userId, {
          name: data.name || null,
          email: data.email,
        });
        setEditingUser(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update user");
      }
    });
  }

  function handleDeactivate(userId: string) {
    if (!confirm("Are you sure you want to deactivate this user? They will no longer be able to log in.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await deactivateUser(userId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to deactivate user");
      }
    });
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Create End User
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                  No End Users in {officeName} yet. Click &quot;Create End User&quot; to add one.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {user.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="mr-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    {user.isActive && (
                      <button
                        onClick={() => handleDeactivate(user.id)}
                        disabled={isPending}
                        className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateEndUserModal
          officeName={officeName}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          isPending={isPending}
        />
      )}

      {editingUser && (
        <EditEndUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={(data) => handleUpdate(editingUser.id, data)}
          isPending={isPending}
        />
      )}
    </div>
  );
}

// ─── Create End User Modal ───────────────────────────────────────────────────

interface CreateEndUserModalProps {
  officeName: string;
  onClose: () => void;
  onSubmit: (data: { email: string; password: string; name: string }) => void;
  isPending: boolean;
}

function CreateEndUserModal({ officeName, onClose, onSubmit, isPending }: CreateEndUserModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (!email.trim()) {
      setValidationError("Email is required");
      return;
    }
    if (!password || password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }

    onSubmit({ email: email.trim(), password, name: name.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Create End User</h2>
        <p className="mb-4 text-sm text-gray-500">
          This user will be automatically assigned to <span className="font-medium">{officeName}</span>.
        </p>

        {validationError && (
          <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="create-eu-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="create-eu-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="user@example.com"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label htmlFor="create-eu-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="create-eu-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="create-eu-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="create-eu-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Full name (optional)"
            />
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
              {isPending ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit End User Modal ─────────────────────────────────────────────────────

interface EditEndUserModalProps {
  user: UserData;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string }) => void;
  isPending: boolean;
}

function EditEndUserModal({ user, onClose, onSubmit, isPending }: EditEndUserModalProps) {
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name || "");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (!email.trim()) {
      setValidationError("Email is required");
      return;
    }

    onSubmit({ name: name.trim(), email: email.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Edit End User</h2>

        {validationError && (
          <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="edit-eu-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-eu-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="edit-eu-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="edit-eu-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
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
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
