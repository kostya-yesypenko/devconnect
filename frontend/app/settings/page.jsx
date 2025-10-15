"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    theme: "light",
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    async function fetchUser() {
      try {
        const data = await apiRequest("/auth/me", "GET", null, token);
        setUser(data);
        setForm({
          name: data.name,
          email: data.email,
          password: "",
          theme: data.theme,
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, [router]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setProfilePhoto(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    if (form.password) formData.append("password", form.password);
    formData.append("theme", form.theme);
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/settings`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      alert("Settings updated!");
      setUser(data.user);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Settings</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Go Back to Dashboard
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            name="password"
            type="password"
            placeholder="New Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <select
            name="theme"
            value={form.theme}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <input type="file" onChange={handleFileChange} className="w-full" />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
