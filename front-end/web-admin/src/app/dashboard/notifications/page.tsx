"use client";

import { useState } from "react";
import { PrivateAxios } from "@/helpers/PrivateAxios";
import { toast } from "sonner";
import { Send, Bell } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1';

export default function NotificationsPage() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !body) return toast.error("Please fill in all fields");

        if (!confirm("Are you sure you want to send this notification to ALL users?")) return;

        setLoading(true);
        try {
            await PrivateAxios.post(`${API_URL}/notifications/broadcast`, {
                title,
                body,
                data: { type: "broadcast" }
            });
            toast.success("Broadcast sent successfully! 🚀");
            setTitle("");
            setBody("");
        } catch (error: any) {
            console.error("Broadcast error:", error);
            toast.error(error.response?.data?.error || "Failed to send broadcast");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Bell className="w-8 h-8 text-blue-600" />
                Broadcast Notifications
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-semibold text-gray-800">Send Push Notification</h2>
                    <p className="text-sm text-gray-500 mt-1">This message will be sent to all users with the app installed.</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleBroadcast} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                id="title"
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="e.g. New Contest Alert! 🏆"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="body" className="block text-sm font-medium text-gray-700">Message</label>
                            <textarea
                                id="body"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[120px]"
                                placeholder="e.g. Check out our latest rewards..."
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all ${loading
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {loading ? (
                                "Sending..."
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send to All Users
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
