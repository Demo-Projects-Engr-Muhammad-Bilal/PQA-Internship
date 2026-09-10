"use client";
import { useAuth } from "@repo/ui";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createPilotFormSchema, CreatePilotFormInput } from "@repo/types";
import { Button, Card, CardContent } from "@repo/ui";
import {  useDashboardData } from "@/contexts";
import Step1General from "./steps/Step1General";
import Step2Berthing from "./steps/Step2Berthing";
import Step3Dimensions from "./steps/Step3Dimensions";
import Step4SafetyAndCrafts from "./steps/Step4SafetyAndCrafts";
import Step5Signatures from "./steps/Step5Signatures";
import { StepIndicator, type StepDefinition } from "./StepIndicator";

const DRAFT_KEY = "pilot_form_draft";

const STEPS: StepDefinition[] = [
  { step: 1, title: "General" },
  { step: 2, title: "Berthing" },
  { step: 3, title: "Dims" },
  { step: 4, title: "Safety" },
  { step: 5, title: "Signatures" },
];

const STEP_FIELDS: Record<number, (keyof CreatePilotFormInput)[]> = {
  1: ["activityType", "vesselName", "vesselType", "registrationNo", "localAgency"],
  2: ["boardingDate", "disembarkationDate", "berthSide"],
  3: ["loa", "beam", "draftFwd", "draftAft", "totalCargo"],
  4: [],
};

export default function PilotFormWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedFormId, setSavedFormId] = useState<string | null>(null);
  const router = useRouter();
  const { apiClient } = useAuth();
  const { invalidateMyForms } = useDashboardData();

  const methods = useForm<CreatePilotFormInput>({
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

  const { handleSubmit, trigger, watch, reset, formState: { errors } } = methods;

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        if (parsedDraft.activityDateTime) parsedDraft.activityDateTime = new Date(parsedDraft.activityDateTime);
        if (parsedDraft.boardingDate) parsedDraft.boardingDate = new Date(parsedDraft.boardingDate);
        if (parsedDraft.disembarkationDate) parsedDraft.disembarkationDate = new Date(parsedDraft.disembarkationDate);
        if (!Array.isArray(parsedDraft.craftsUsed)) {
          parsedDraft.craftsUsed = [];
        }
        reset(parsedDraft);
      } catch (error) {
        console.error("Failed to parse draft", error);
      }
    }
  }, [reset]);

  // eslint-disable-next-line react-hooks/incompatible-library
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

  const handleNext = async () => {
    const isStepValid = await trigger(
      currentStep === 4 ? undefined : STEP_FIELDS[currentStep]
    );

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
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

  const erroredSteps = Object.entries(STEP_FIELDS)
    .filter(([, fields]) => fields.some((f) => f in errors))
    .map(([step]) => Number(step));

  const onSubmit: SubmitHandler<CreatePilotFormInput> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post<{ data: { id: string } }>("/forms", data);
      invalidateMyForms();
      setSavedFormId(response.data.data.id);
      setCurrentStep(5);
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to save draft. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Card className="mx-auto w-full  border-0 shadow-xl rounded-xl overflow-hidden bg-white">
        <CardContent className="p-6 sm:p-10">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex-1">
              <StepIndicator
                steps={STEPS}
                currentStep={currentStep}
                erroredSteps={erroredSteps}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 text-primary border-primary/20 hover:bg-primary/5"
              onClick={clearDraft}
            >
              Clear Draft
            </Button>
          </div>

          {currentStep < 5 ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              {currentStep === 1 && <Step1General />}
              {currentStep === 2 && <Step2Berthing />}
              {currentStep === 3 && <Step3Dimensions />}
              {currentStep === 4 && <Step4SafetyAndCrafts />}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-8 font-semibold text-primary border-gray-300 hover:bg-gray-50"
                  onClick={handlePrev}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  &larr; Previous
                </Button>

                {currentStep < 4 ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="h-11 px-8 font-semibold bg-primary hover:bg-primary/90 text-white shadow-md transition-colors"
                  >
                    Next Step &rarr;
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="h-11 px-10 font-bold bg-accent hover:bg-accent/90 text-white shadow-md transition-colors"
                  >
                    {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                    {isSubmitting ? "Saving Draft..." : "Proceed to Signatures &rarr;"}
                  </Button>
                )}
              </div>
            </form>
          ) : (
            savedFormId && (
              <Step5Signatures 
                formId={savedFormId} 
                onBack={() => setCurrentStep(4)} 
              />
            )
          )}
        </CardContent>
      </Card>
    </FormProvider>
  );
}

