"use client";

import Link from "next/link";
import { Button } from "@repo/ui/ui/button";
import PilotFormWizard from "@/components/pilot/form/PilotFormWizard";

export default function NewFormPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 flex w-full items-center justify-between">
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
      <PilotFormWizard />
    </div>
  );
}

