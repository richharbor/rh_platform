"use client";

import { useParams } from "next/navigation";
import Dashboard from "@/pages/Users/Dashboard/Dashboard";
import { useEffect, useRef, useState } from "react";
import { saveSubscription } from "@/services/notification/notification";

export default function DashboardPage() {
  const params = useParams(); // { franchiseOrRole: string, role?: string }
  const didRun = useRef(false);

  console.log(params); // Useful for role-based logic
  const [status, setStatus] = useState("");


  const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY; // Replace


  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    enableNotifications();
  }, [])

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };
  const enableNotifications = async () => {
    try {
      // Ask permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("Permission denied");
        return;
      }

      if (!PUBLIC_VAPID_KEY) {
        console.error("VAPID key is missing");
        setStatus("Missing VAPID key");
        return;
      }

      // Register service worker
      const reg = await navigator.serviceWorker.register("/sw.js");

      // 🔍 CHECK IF ALREADY SUBSCRIBED
      let subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription only if none exists
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        });
      }
      // Save to backend
      const response = saveSubscription(subscription)

      setStatus("Subscribed successfully!");
    } catch (err: any) {
      console.error(err);
      setStatus("Error enabling notifications");
    }
  };

  return (
    <Dashboard />
  );
}
