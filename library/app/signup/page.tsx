import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "../auth-forms";

async function SignupContent() {
  if (await getCurrentUser()) redirect("/");
  return <SignupForm />;
}

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm pt-2 sm:pt-6">
      <p className="eyebrow text-center">The Front Desk</p>
      <h2 className="mt-1 text-center font-display text-4xl tracking-tight text-moss-deep">
        Create your account
      </h2>
      <p className="mt-2 mb-6 text-center text-muted italic">Sign up to manage the library.</p>
      <Suspense fallback={<div className="card h-96 animate-pulse bg-vellum/60" />}>
        <SignupContent />
      </Suspense>
    </div>
  );
}
