"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    async function fetchUsers() {
      try {
        const data = await apiRequest("/admin/users", "GET", null, token);
        setUsers(data);
      } catch (err) {
        console.error(err);
        alert("Access denied or error fetching users");
        router.push("/dashboard");
      }
    }

    fetchUsers();
  }, [router]);

  async function toggleBlock(userId, isBlocked) {
    const token = localStorage.getItem("token");
    const endpoint = isBlocked
      ? `/admin/users/${userId}/unblock`
      : `/admin/users/${userId}/block`;

    try {
      await apiRequest(endpoint, "PUT", null, token);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isBlocked: !isBlocked } : u
        )
      );
    } catch (err) {
      alert("Failed to update user status");
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Go Back to Dashboard
        </button>

        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.role}</td>
                <td className="p-2 border">
                  {u.isBlocked ? (
                    <span className="text-red-500 font-semibold">Blocked</span>
                  ) : (
                    <span className="text-green-600 font-semibold">Active</span>
                  )}
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => toggleBlock(u._id, u.isBlocked)}
                    className={`px-3 py-1 rounded text-white ${
                      u.isBlocked
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {u.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
