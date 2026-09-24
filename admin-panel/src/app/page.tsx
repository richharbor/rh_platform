import { redirect } from "next/navigation";

// middleware.ts bounces this on to /<roleSlug>/blogs when authenticated
// (or keeps it here at /auth/login otherwise) — the role segment isn't
// knowable in a plain server component without duplicating cookie logic.
export default function Home() {
  redirect("/auth/login");
}
