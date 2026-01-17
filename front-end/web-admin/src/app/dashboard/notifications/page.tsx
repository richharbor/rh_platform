"use client";

import { useState } from "react";
import { PrivateAxios } from "@/helpers/PrivateAxios";
import { toast } from "sonner";
import { Send, Bell, Image as ImageIcon, Loader2 } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1';

export default function NotificationsPage() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Logic borrowed from contestService
            const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1').replace('/v1', '');
            const token = Cookies.get("admin_token");

            const response = await axios.post(`${BASE_URL}/api/upload/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });

            if (response.data.fileUrl) {
                setImageUrl(response.data.fileUrl);
                toast.success("Image uploaded!");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleBroadcastClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !body) return toast.error("Please fill in all fields");
        setIsConfirmOpen(true);
    };

    const handleConfirmBroadcast = async () => {
        setLoading(true);
        try {
            await PrivateAxios.post(`${API_URL}/notifications/broadcast`, {
                title: title.trim(),
                body: body.trim(),
                imageUrl: imageUrl.trim(), // Trim whitespace from URL
                data: { type: "broadcast" }
            });
            toast.success("Broadcast sent successfully! 🚀");
            setTitle("");
            setBody("");
            setImageUrl("");
        } catch (error: any) {
            console.error("Broadcast error:", error);
            toast.error(error.response?.data?.error || "Failed to send broadcast");
        } finally {
            setLoading(false);
            setIsConfirmOpen(false);
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
                    <form onSubmit={handleBroadcastClick} className="space-y-6">
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
                            <label className="block text-sm font-medium text-gray-700">Notification Image (Optional)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://... or upload image"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border border-gray-300 flex items-center gap-2"
                                    >
                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                        Upload
                                    </button>
                                </div>
                            </div>
                            {imageUrl && (
                                <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}


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
                        </div>
                    </form>
                </div>
            </div>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Broadcast</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to send this notification to <span className="font-bold">ALL users</span>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmBroadcast}>
                            Send Broadcast
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >

    );
}
