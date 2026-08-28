"use client";

import Link from "next/link";
import PilotFormWizard from "@repo/ui/components/pilot/form/PilotFormWizard";

export default function NewFormPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Pilot Form Submission</h1>
          <p className="text-sm text-gray-500">Fill out the official Port Qasim Authority pilot form</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-white border px-4 py-2 rounded-md shadow-sm"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Render the Wizard Component */}
      <PilotFormWizard />
    </div>
  );
}