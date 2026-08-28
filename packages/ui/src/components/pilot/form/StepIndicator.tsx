"use client";

import { CheckIcon } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Separator } from "../../ui";

export interface StepDefinition {
  step: number;
  title: string;
}

interface StepIndicatorProps {
  steps: StepDefinition[];
  currentStep: number;
  /** Steps (1-indexed) that currently have at least one validation error. */
  erroredSteps?: number[];
}

export function StepIndicator({
  steps,
  currentStep,
  erroredSteps = [],
}: StepIndicatorProps) {
  return (
    <div className="mb-6">
      {/* Full stepper — hidden below sm */}
      <div className="hidden items-center sm:flex">
        {steps.map((s, index) => {
          const isActive = s.step === currentStep;
          const isComplete = s.step < currentStep;
          const hasError = erroredSteps.includes(s.step);

          return (
            <div key={s.step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isComplete && !isActive && "bg-primary/20 text-primary",
                    !isActive && !isComplete && "bg-muted text-muted-foreground",
                    hasError && "ring-2 ring-destructive"
                  )}
                >
                  {isComplete ? <CheckIcon className="size-4" /> : s.step}
                </div>
                <span
                  className={cn(
                    "text-xs whitespace-nowrap text-muted-foreground",
                    isActive && "font-medium text-foreground"
                  )}
                >
                  {s.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <Separator className="mx-2 mb-5 flex-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Compact label — shown below sm */}
      <div className="flex sm:hidden">
        <span className="text-sm font-medium text-foreground">
          Step {currentStep} of {steps.length} — {steps[currentStep - 1]?.title}
        </span>
      </div>
    </div>
  );
}
