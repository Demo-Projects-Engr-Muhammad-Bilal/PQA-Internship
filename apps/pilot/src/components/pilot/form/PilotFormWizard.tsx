"use client";
import { useAuth } from "@repo/ui";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
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

const NUMERIC_STEP3_FIELDS = [
  "loa", "beam", "gt", "nt", "dwt", "draftFwd", "draftAft",
  "cargoPQ", "deckCargo", "dgCargo", "totalCargo",
] as const;

const STEPS: StepDefinition[] = [
  { step: 1, title: "General" },
  { step: 2, title: "Berthing" },
  { step: 3, title: "Dims" },
  { step: 4, title: "Safety" },
  { step: 5, title: "Signatures" },
];

const STEP_FIELDS: Record<number, (keyof CreatePilotFormInput)[]> = {
  1: ["activityType", "activityDateTime", "vesselName", "vesselType", "registrationNo", "localAgency"],
  2: ["boardingDate", "disembarkationDate", "berthSide"],
  3: ["loa", "beam", "gt", "nt", "dwt", "draftFwd", "draftAft", "cargoPQ", "deckCargo", "dgCargo", "totalCargo"],
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
      vesselName: "",
      registrationNo: "",
      localAgency: "",
      isExtraPilotageNight: false,
      isExtraPilotageHoliday: false,
      abnormalTempRiseDG: false,
      leakageLiquidDG: false,
      stowagePlanDGAttached: false,
      craftsUsed: [],
      loa: undefined,
      beam: undefined,
      gt: undefined,
      nt: undefined,
      dwt: undefined,
      draftFwd: undefined,
      draftAft: undefined,
      cargoPQ: undefined,
      deckCargo: undefined,
      dgCargo: undefined,
      totalCargo: undefined,
    },
  });

  const { handleSubmit, trigger, watch, reset, formState: { errors } } = methods;

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        const dateFields = ["activityDateTime", "boardingDate", "disembarkationDate", "unmooredDate", "mooredDate"];
        dateFields.forEach(field => {
          if (parsedDraft[field]) {
            parsedDraft[field] = new Date(parsedDraft[field]);
          } else {
            parsedDraft[field] = undefined;
          }
        });
        if (!Array.isArray(parsedDraft.craftsUsed)) {
          parsedDraft.craftsUsed = [];
        }
        NUMERIC_STEP3_FIELDS.forEach((field) => {
          const val = parsedDraft[field];
          if (val === "" || val === null || val === undefined) {
            parsedDraft[field] = undefined;
          } else if (typeof val !== "number") {
            const num = Number(val);
            parsedDraft[field] = Number.isNaN(num) ? undefined : num;
          } else if (Number.isNaN(val)) {
            parsedDraft[field] = undefined;
          }
        });
        reset(parsedDraft);
      } catch (error) {
        console.error("Failed to parse draft", error);
      }
    }
  }, [reset]);

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
    const fieldsToValidate = currentStep === 4 ? undefined : STEP_FIELDS[currentStep];
    const isStepValid = await trigger(fieldsToValidate as any);

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    } else {
      const currentErrors = methods.formState.errors;
      const currentValues = methods.getValues();
      console.error("=== STEP", currentStep, "VALIDATION FAILED ===");
      console.error("Fields validated:", fieldsToValidate);
      console.error("Error keys:", Object.keys(currentErrors));
      console.error("Full errors:", currentErrors);
      if (fieldsToValidate) {
        const stepValues: Record<string, unknown> = {};
        for (const f of fieldsToValidate) {
          stepValues[f] = currentValues[f];
        }
        console.error("Step values:", stepValues);
      }
      toast.error("Please fix the validation errors before proceeding.");
      const firstError = Object.keys(currentErrors)[0];
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

  const onError = (formErrors: any) => {
    // DEBUG — open browser DevTools > Console to see exactly which field(s)
    // are failing on final submit
    console.error("=== FINAL SUBMIT VALIDATION FAILED ===");
    console.error("Error keys:", Object.keys(formErrors));
    console.error("Full errors:", formErrors);
    console.error("Current values:", methods.getValues());

    const firstErroredStepString = Object.entries(STEP_FIELDS).find(([, fields]) =>
      fields.some((f) => f in formErrors)
    )?.[0];
    
    const stepWithError = firstErroredStepString ? Number(firstErroredStepString) : null;
    
    if (stepWithError && stepWithError !== currentStep) {
      setCurrentStep(stepWithError);
      toast.error(`Please fix the errors in Step ${STEPS.find(s => s.step === stepWithError)?.title}`);
    } else if (!stepWithError) {
      // Failing field(s) aren't mapped to any step — toast shows the actual field name(s)
      const unmappedKeys = Object.keys(formErrors);
      console.error("Unmapped error field(s) not in STEP_FIELDS:", unmappedKeys);
      toast.error(`Please fix: ${unmappedKeys.join(", ")}`);
    } else {
      toast.error("Please fix the validation errors before proceeding.");
    }
  };

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
    <FormProvider {...methods} >
      <Card className="mx-auto my-5 w-full flex-1 min-h-[75vh] border-0 shadow-xl rounded-xl overflow-y-auto bg-white flex flex-col">
        <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
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
            <form onSubmit={handleSubmit(onSubmit, onError)} className="flex-1 flex flex-col">
              {currentStep === 1 && <Step1General />}
              {currentStep === 2 && <Step2Berthing />}
              {currentStep === 3 && <Step3Dimensions />}
              {currentStep === 4 && <Step4SafetyAndCrafts />}

              <div className="mt-auto flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-8 font-semibold text-primary border-primary/20 hover:bg-primary/5"
                  onClick={handlePrev}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4 inline" /> Previous
                </Button>

                {currentStep < 4 ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    variant="default" 
                    className="h-11 px-8 font-semibold shadow-md transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:bg-primary/50 disabled:text-white"
                  >
                    Next Step <ArrowRight className="ml-2 h-4 w-4 inline" />
                  </Button>
                ) : (
                  <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      variant="default" 
                      className="w-full h-11 font-bold shadow-md transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:bg-primary/50 disabled:text-white"
                  >
                    {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                    {isSubmitting ? "Saving Draft..." : <>Proceed to Signatures <ArrowRight className="ml-2 h-4 w-4 inline" /></>}
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