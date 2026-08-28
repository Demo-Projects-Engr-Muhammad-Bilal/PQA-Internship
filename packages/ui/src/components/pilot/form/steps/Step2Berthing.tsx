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
  Card,
  CardContent,
  Checkbox,
} from "../../../ui";
import { toDatetimeLocalValue } from "../date-utils";

export default function Step2Berthing() {
  const { control } = useFormContext<CreatePilotFormInput>();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold">Step 2: Pilotage & Berthing</h2>
        <p className="text-sm text-muted-foreground">Enter boarding, disembarkation, and mooring details.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="boardingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pilot Boarding (Date/Time) *</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} value={toDatetimeLocalValue(field.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="disembarkationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pilot Disembarkation (Date/Time) *</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} value={toDatetimeLocalValue(field.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="berthSide"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Berth / Side</FormLabel>
              <FormControl>
                <Input placeholder="e.g., QICT Berth 1" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="dispensation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dispensation (If any)</FormLabel>
              <FormControl>
                <Input placeholder="Enter dispensation details" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="unmooredDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unmoored (Date/Time)</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} value={toDatetimeLocalValue(field.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="unmooredPlace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unmoored (Place)</FormLabel>
              <FormControl>
                <Input placeholder="Unmoored Place" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="mooredDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moored (Date/Time)</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} value={toDatetimeLocalValue(field.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="mooredPlace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moored (Place)</FormLabel>
              <FormControl>
                <Input placeholder="Moored Place" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Extra Pilotage (Checkboxes) */}
      <Card className="bg-muted/40 py-4">
        <CardContent className="space-y-3 px-4">
          <h3 className="text-sm font-medium">Extra Pilotage</h3>
          <div className="flex gap-8">
            <FormField
              control={control}
              name="isExtraPilotageNight"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">Night</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="isExtraPilotageHoliday"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">Holiday</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
