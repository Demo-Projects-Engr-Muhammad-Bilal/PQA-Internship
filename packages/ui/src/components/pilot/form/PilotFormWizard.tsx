"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createPilotFormSchema, CreatePilotFormInput } from "@repo/types";
import { Button, Card, CardContent } from "../../ui";
import { useAuth } from "../../../contexts";
import Step1General from "./steps/Step1General";
import Step2Berthing from "./steps/Step2Berthing";
import Step3Dimensions from "./steps/Step3Dimensions";
import Step4SafetyAndCrafts from "./steps/Step4SafetyAndCrafts";
import { StepIndicator, type StepDefinition } from "./StepIndicator";

const DRAFT_KEY = "pilot_form_draft";

const STEPS: StepDefinition[] = [
  { step: 1, title: "General" },
  { step: 2, title: "Berthing" },
  { step: 3, title: "Dims" },
  { step: 4, title: "Safety" },
];

// Fields validated on "Next" for each step, used both to gate navigation
// and to know which step nodes should flash an error ring.
const STEP_FIELDS: Record<number, (keyof CreatePilotFormInput)[]> = {
  1: ["activityType", "vesselName", "vesselType", "registrationNo", "localAgency"],
  2: ["boardingDate", "disembarkationDate", "berthSide"],
  3: ["loa", "beam", "draftFwd", "draftAft", "totalCargo"],
  4: [],
};

export default function PilotFormWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { apiClient } = useAuth();

  // Initialize React Hook Form with proper typing
  const methods = useForm<CreatePilotFormInput>({
    // Bypass strict Date vs String TS clash using type assertion on resolver
    resolver: zodResolver(createPilotFormSchema) as any, 
    mode: "onChange",
    defaultValues: {
      activityType: "ARRIVAL",
      vesselType: "OTHERS",
      isExtraPilotageNight: false,
      isExtraPilotageHoliday: false,
      abnormalTempRiseDG: false,
      leakageLiquidDG: false,
      stowagePlanDGAttached: false,
      craftsUsed: [],
    },
  });

  const {
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = methods;

  // Load Draft from LocalStorage on Mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        if (parsedDraft.activityDateTime) parsedDraft.activityDateTime = new Date(parsedDraft.activityDateTime);
        if (parsedDraft.boardingDate) parsedDraft.boardingDate = new Date(parsedDraft.boardingDate);
        if (parsedDraft.disembarkationDate) parsedDraft.disembarkationDate = new Date(parsedDraft.disembarkationDate);
        // Defensive check: a null/corrupted craftsUsed in storage would
        // otherwise crash useFieldArray in Step4SafetyAndCrafts.
        if (!Array.isArray(parsedDraft.craftsUsed)) {
          parsedDraft.craftsUsed = [];
        }

        reset(parsedDraft);
      } catch (error) {
        console.error("Failed to parse draft", error);
      }
    }
  }, [reset]);

  // Auto-Save to LocalStorage
  const formValues = watch();
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formValues));
  }, [formValues]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    reset({
      activityType: "ARRIVAL",
      vesselType: "OTHERS",
      isExtraPilotageNight: false,
      isExtraPilotageHoliday: false,
      abnormalTempRiseDG: false,
      leakageLiquidDG: false,
      stowagePlanDGAttached: false,
      craftsUsed: [],
    });
    setCurrentStep(1);
    toast.success("Draft cleared");
  };

  // Step Navigation Logic
  const handleNext = async () => {
    const isStepValid = await trigger(
      currentStep === 4 ? undefined : STEP_FIELDS[currentStep]
    );

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    } else {
      const firstError = Object.keys(methods.formState.errors)[0];
      if (firstError) {
        document
          .querySelector(`[name="${firstError}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Which steps currently hold an error, so the stepper can flash them.
  const erroredSteps = Object.entries(STEP_FIELDS)
    .filter(([, fields]) => fields.some((f) => f in errors))
    .map(([step]) => Number(step));

  // Final Submission to Backend
  const onSubmit: SubmitHandler<CreatePilotFormInput> = async (data) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/api/forms", data);
      toast.success("Form submitted successfully!");
      localStorage.removeItem(DRAFT_KEY);
      router.push("/dashboard");
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Submission failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Card className="mx-auto max-w-4xl shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-2 flex items-start justify-between gap-4">
            <StepIndicator
              steps={STEPS}
              currentStep={currentStep}
              erroredSteps={erroredSteps}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-muted-foreground"
              onClick={clearDraft}
            >
              Clear Draft
            </Button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 1 && <Step1General />}
            {currentStep === 2 && <Step2Berthing />}
            {currentStep === 3 && <Step3Dimensions />}
            {currentStep === 4 && <Step4SafetyAndCrafts />}

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  {isSubmitting ? "Submitting..." : "Submit Form"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
