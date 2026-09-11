"use client";

import Link from "next/link";
import { Button } from "@repo/ui/ui/button";
import PilotFormWizard from "@/components/pilot/form/PilotFormWizard";

export default function NewFormPage() {
  return (
    <div className="w-full h-full min-h-[calc(100vh-120px)] flex flex-col pb-6">
      <div className="mb-2 flex w-full items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">New Pilot Form Submission</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Fill out the official Port Qasim Authority pilot form.</p>
        </div>
        <Button 
          variant="outline" 
          className="border-gray-300 font-semibold text-primary hover:bg-gray-100 shadow-sm" 
          asChild
        >
          <Link href="/dashboard">&larr; Back to Dashboard</Link>
        </Button>
      </div>

      {/* The Wizard Component automatically inherits the theme we applied to it in Phase 2 */}
      <div className="my-5"><PilotFormWizard /></div>
    </div>
  );
}

