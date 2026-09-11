"use client";

import { useFormContext } from "react-hook-form";
import { CreatePilotFormInput } from "@repo/types";
import {
  FormField, FormItem, FormLabel, FormControl, FormMessage,
  Input, Card, CardContent, Checkbox,
} from "@repo/ui";
import { DateTimePicker } from "@repo/ui/ui/date-time-picker";

export default function Step2Berthing() {
  const { control } = useFormContext<CreatePilotFormInput>();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-primary">Pilotage & Berthing</h2>
        <p className="text-sm font-medium text-muted-foreground mt-1">Enter boarding, disembarkation, and mooring details.</p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
        <FormField
          control={control}
          name="boardingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Pilot Boarding (Date/Time) *</FormLabel>
              <FormControl>
                <DateTimePicker
                  date={field.value ? new Date(field.value) : undefined}
                  setDate={field.onChange}
                />
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
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Pilot Disembarkation (Date/Time) *</FormLabel>
              <FormControl>
                <DateTimePicker
                  date={field.value ? new Date(field.value) : undefined}
                  setDate={field.onChange}
                />
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
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Berth / Side</FormLabel>
              <FormControl>
                <Input className="h-11 focus-visible:ring-accent" placeholder="e.g., QICT Berth 1" {...field} value={field.value ?? ""} />
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
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Dispensation (If any)</FormLabel>
              <FormControl>
                <Input className="h-11 focus-visible:ring-accent" placeholder="Enter dispensation details" {...field} value={field.value ?? ""} />
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
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Unmoored (Date/Time)</FormLabel>
              <FormControl>
                <DateTimePicker
                  date={field.value ? new Date(field.value) : undefined}
                  setDate={field.onChange}
                />
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
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Unmoored (Place)</FormLabel>
              <FormControl>
                <Input className="h-11 focus-visible:ring-accent" placeholder="Unmoored Place" {...field} value={field.value ?? ""} />
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
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Moored (Date/Time)</FormLabel>
              <FormControl>
                <DateTimePicker
                  date={field.value ? new Date(field.value) : undefined}
                  setDate={field.onChange}
                />
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
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Moored (Place)</FormLabel>
              <FormControl>
                <Input className="h-11 focus-visible:ring-accent" placeholder="Moored Place" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Card className="bg-accent/5 border-accent/20 shadow-sm py-4 mt-6">
        <CardContent className="space-y-4 px-6">
          <h3 className="text-xs font-bold tracking-wider text-primary uppercase">Extra Pilotage</h3>
          <div className="flex gap-10">
            <FormField
              control={control}
              name="isExtraPilotageNight"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-semibold text-primary">Night Operation</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="isExtraPilotageHoliday"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-semibold text-primary">Public Holiday</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
