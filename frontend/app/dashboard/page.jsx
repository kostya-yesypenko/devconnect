"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("mine"); // "mine" | "all"
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    async function fetchUser() {
      try {
        const data = await apiRequest("/auth/me", "GET", null, token);
        setUser(data);
        fetchPosts("mine");
      } catch (err) {
        console.error(err);
        router.push("/login");
      }
    }

    fetchUser();
  }, [router]);

  async function fetchPosts(type) {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const endpoint = type === "all" ? "/posts" : "/posts/mine";
      const data = await apiRequest(endpoint, "GET", null, token);
      setPosts(data);
      setActiveTab(type);
    } catch (err) {
      console.error(err);
      alert("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePost() {
    if (!newPost.trim()) return alert("Post content cannot be empty!");
    const token = localStorage.getItem("token");
    setPosting(true);
    try {
      const created = await apiRequest(
        "/posts",
        "POST",
        { content: newPost },
        token
      );
      setNewPost("");
      setPosts((prev) => [created, ...prev]);
      setActiveTab("mine");
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    } finally {
      setPosting(false);
    }
  }

  async function handleDeletePost(postId) {
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeleting(postId);
    try {
      await apiRequest(`/posts/${postId}`, "DELETE", null, token);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    } finally {
      setDeleting(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 relative">
      {/* 🔸 Logout Button (Top-Right) */}
      <div className="absolute top-6 right-6 flex gap-3">
        {/* 🟢 Show Admin Panel button only for admins */}
        {user?.role === "admin" && (
          <button
            onClick={() => router.push("/admin")}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Admin Panel
          </button>
        )}

        <button
          onClick={() => router.push("/settings")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Settings
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-200 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome</h1>
        <p className="text-gray-600 mb-6">
          {user ? `Hello, ${user.name}!` : "Loading..."}
        </p>

        {/* 🔹 Create Post Section */}
        <div className="mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border rounded-lg p-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={3}
          />
          <button
            onClick={handleCreatePost}
            disabled={posting}
            className={`mt-2 w-full py-2 rounded text-white ${
              posting
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>

        {/* 🔹 Tab Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => fetchPosts("mine")}
            className={`flex-1 py-2 rounded ${
              activeTab === "mine"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            My Posts
          </button>
          <button
            onClick={() => fetchPosts("all")}
            className={`flex-1 py-2 rounded ${
              activeTab === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            All Posts
          </button>
        </div>

        {/* 🔹 Posts List */}
        <div className="mt-6 text-left max-h-64 overflow-y-auto">
          {loading ? (
            <p className="text-gray-500 text-center">Loading...</p>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post._id}
                className="border-b border-gray-200 py-2 text-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p>{post.content}</p>
                    <div className="text-[11px] text-gray-400 mt-1 italic">
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>

                  {/* Show delete only for own posts */}
                  {user && post.author && post.author._id === user._id && (
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      disabled={deleting === post._id}
                      className="ml-2 text-red-500 hover:text-red-700 text-sm"
                    >
                      {deleting === post._id ? "..." : "✕"}
                    </button>
                  )}
                </div>

                {/* Show author info for ALL posts tab */}
                {activeTab === "all" && post.author && (
                  <div className="text-xs text-gray-500 mt-1">
                    — by{" "}
                    <span className="font-semibold">{post.author.name}</span>{" "}
                    <span className="text-gray-400">({post.author.email})</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 mt-4 text-center">No posts found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
