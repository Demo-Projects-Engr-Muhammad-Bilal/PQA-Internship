"use client";

import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui";

export interface StepDefinition {
  step: number;
  title: string;
}

interface StepIndicatorProps {
  steps: StepDefinition[];
  currentStep: number;
  erroredSteps?: number[];
}

export function StepIndicator({
  steps,
  currentStep,
  erroredSteps = [],
}: StepIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Full stepper */}
      <div className="hidden items-center sm:flex">
        {steps.map((s, index) => {
          const isActive = s.step === currentStep;
          const isComplete = s.step < currentStep;
          const hasError = erroredSteps.includes(s.step);

          return (
            <div key={s.step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 border-2",
                    (isActive || isComplete) ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted text-muted-foreground border-muted",
                    hasError && "ring-4 ring-destructive/30 bg-destructive text-destructive-foreground border-destructive"
                  )}
                >
                  {isComplete ? <CheckIcon className="size-5" /> : s.step}
                </div>
                <span
                  className={cn(
                    "text-xs whitespace-nowrap uppercase tracking-wider",
                    isActive ? "text-primary font-bold" : "text-muted-foreground font-semibold",
                    hasError && "text-destructive"
                  )}
                >
                  {s.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <Separator 
                  className={cn(
                    "mx-4 flex-1 h-[2px]", 
                    isComplete ? "bg-primary" : "bg-gray-100"
                  )} 
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Compact label */}
      <div className="flex sm:hidden items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm border-2 border-primary">
          {currentStep}
        </div>
        <span className="text-sm font-bold text-primary uppercase tracking-wider">
          {steps[currentStep - 1]?.title}
        </span>
      </div>
    </div>
  );
}
