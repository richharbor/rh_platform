"use client"
import { Login } from "@/components/Auth/Login";
import { AuthShell } from "@/components/Auth/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell eyebrow="Admin" title="Run the harbor." lede="Publish blogs, work leads and send campaigns — with the access your role allows.">
      <Login />
    </AuthShell>
  )
}
