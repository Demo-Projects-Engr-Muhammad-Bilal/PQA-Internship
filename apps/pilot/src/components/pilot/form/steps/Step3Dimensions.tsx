"use client";

import { useFormContext } from "react-hook-form";
import { CreatePilotFormInput } from "@repo/types";
import {
  FormField, FormItem, FormLabel, FormControl, FormMessage,
  Input, Separator,
} from "@/components/ui";

type NumericFieldName =
  | "loa" | "beam" | "gt" | "nt" | "dwt" | "draftFwd" | "draftAft"
  | "cargoPQ" | "deckCargo" | "dgCargo" | "totalCargo";

interface NumericFieldProps {
  name: NumericFieldName;
  label: string;
  placeholder?: string;
  unit?: string;
}

function NumericField({ name, label, placeholder = "0.00", unit }: NumericFieldProps) {
  const { control } = useFormContext<CreatePilotFormInput>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                placeholder={placeholder}
                className={`h-11 focus-visible:ring-accent ${unit ? "pr-12" : ""}`}
                {...field}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)
                }
              />
              {unit && (
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  {unit}
                </span>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default function Step3Dimensions() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-primary">Vessel Dimensions & Cargo</h2>
        <p className="text-sm font-medium text-muted-foreground mt-1">Provide official technical measurements and cargo weights.</p>
      </div>

      <div>
        <h3 className="mb-6 text-sm font-bold tracking-widest text-accent uppercase">Vessel Dimensions (Meters / Tonnages)</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3">
          <NumericField name="loa" label="L.O.A. (m)" unit="m" />
          <NumericField name="beam" label="Beam (m)" unit="m" />
          <NumericField name="gt" label="G.T." placeholder="Gross Tonnage" />
          <NumericField name="nt" label="N.T." placeholder="Net Tonnage" />
          <NumericField name="dwt" label="D.W.T." placeholder="Deadweight Tonnage" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
          <NumericField name="draftFwd" label="Draft (Fwd) (m)" unit="m" />
          <NumericField name="draftAft" label="Draft (Aft) (m)" unit="m" />
        </div>
      </div>

      <div>
        <Separator className="my-8 bg-gray-100" />
        <h3 className="mb-6 text-sm font-bold tracking-widest text-accent uppercase">Cargo Breakdown (MTS)</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
          <NumericField name="cargoPQ" label="Cargo for Port Qasim (MTS)" unit="MTS" />
          <NumericField name="deckCargo" label="Deck Cargo (MTS)" unit="MTS" />
          <NumericField name="dgCargo" label="DG Cargo (MTS)" unit="MTS" />
          <NumericField name="totalCargo" label="Total Cargo (MTS)" unit="MTS" />
        </div>
      </div>
    </div>
  );
}
