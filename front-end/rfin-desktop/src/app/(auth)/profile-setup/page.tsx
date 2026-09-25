"use client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "@/stores/session";
import { Button, Field, PageTitle, Stepper } from "@/components/ui";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Basic profile only — financial profile comes later (report #12, #14). */
export default function ProfileSetup() {
  const { profile, saveProfile } = useSession();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [city, setCity] = useState(profile.city);
  const save = useMutation({ mutationFn: () => saveProfile({ name: name.trim(), email: email.trim(), city: city.trim() }) });
  const emailError = email && !EMAIL.test(email) ? "That doesn't look like an email address" : undefined;
  const valid = name.trim().length >= 2 && !emailError;

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) save.mutate();
      }}
    >
      <Stepper steps={["About you", "Your goals"]} current={0} />
      <PageTitle title="A little about you" lede="Just the basics. We'll ask for more only when a product needs it." />
      <div className="space-y-5">
        <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="As on your PAN" why="Must match your PAN when you complete KYC." autoFocus />
        <Field label="Email · optional" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" why="Where we send statements and policy documents." error={emailError} />
        <Field label="City · optional" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" placeholder="Mumbai" why="Some products and advisors are city-specific." />
      </div>
      <div className="space-y-3">
        {save.isError ? <p className="text-xs text-rfin-red">{save.error.message}</p> : null}
        <Button type="submit" block disabled={!valid} loading={save.isPending}>
          Continue
        </Button>
        <p className="text-center text-xs text-rfin-mute">Saved as you go — you can finish this later.</p>
      </div>
    </form>
  );
}
