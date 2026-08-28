"use client";

import { useFormContext } from "react-hook-form";
import { CreatePilotFormInput } from "@repo/types";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Separator,
} from "../../../ui";

type NumericFieldName =
  | "loa"
  | "beam"
  | "gt"
  | "nt"
  | "dwt"
  | "draftFwd"
  | "draftAft"
  | "cargoPQ"
  | "deckCargo"
  | "dgCargo"
  | "totalCargo";

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
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                placeholder={placeholder}
                className={unit ? "pr-12" : undefined}
                {...field}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)
                }
              />
              {unit && (
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold">Step 3: Vessel Dimensions & Cargo</h2>
        <p className="text-sm text-muted-foreground">Provide official technical measurements and cargo weights.</p>
      </div>

      {/* Dimensions Section */}
      <div>
        <h3 className="mb-4 text-sm font-semibold tracking-wider text-primary uppercase">Vessel Dimensions (Meters / Tonnages)</h3>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
          <NumericField name="loa" label="L.O.A. (m)" unit="m" />
          <NumericField name="beam" label="Beam (m)" unit="m" />
          <NumericField name="gt" label="G.T." placeholder="Gross Tonnage" />
          <NumericField name="nt" label="N.T." placeholder="Net Tonnage" />
          <NumericField name="dwt" label="D.W.T." placeholder="Deadweight Tonnage" />
        </div>

        {/* Drafts */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <NumericField name="draftFwd" label="Draft (Fwd) (m)" unit="m" />
          <NumericField name="draftAft" label="Draft (Aft) (m)" unit="m" />
        </div>
      </div>

      {/* Cargo Details Section */}
      <div>
        <Separator className="mb-6" />
        <h3 className="mb-4 text-sm font-semibold tracking-wider text-primary uppercase">Cargo Breakdown (MTS)</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <NumericField name="cargoPQ" label="Cargo for Port Qasim (MTS)" unit="MTS" />
          <NumericField name="deckCargo" label="Deck Cargo (MTS)" unit="MTS" />
          <NumericField name="dgCargo" label="DG Cargo (MTS)" unit="MTS" />
          <NumericField name="totalCargo" label="Total Cargo (MTS)" unit="MTS" />
        </div>
      </div>
    </div>
  );
}
