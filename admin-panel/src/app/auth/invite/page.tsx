"use client";
import type React from "react";
import { Suspense } from "react";
import { Invite } from "@/components/Auth/Invite";
import { AuthShell } from "@/components/Auth/AuthShell";

const InvitePage = () => {
  return (
    <AuthShell eyebrow="Invitation" title="Welcome aboard." lede="Set a password to activate your admin account. Your role decides what you can see and change.">
      <Suspense fallback={null}>
        <Invite />
      </Suspense>
    </AuthShell>
  );
};

export default InvitePage;
