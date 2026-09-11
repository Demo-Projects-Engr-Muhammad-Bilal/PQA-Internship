"use client";

import { useFormContext } from "react-hook-form";
import { CreatePilotFormInput } from "@repo/types";
import {
  FormField, FormItem, FormLabel, FormControl, FormMessage,
  Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@repo/ui";
import { DateTimePicker } from "@repo/ui/ui/date-time-picker";
import { toDatetimeLocalValue } from "../date-utils";

export default function Step1General() {
  const { control, watch } = useFormContext<CreatePilotFormInput>();
  const activityType = watch("activityType");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-primary">General & Vessel Information</h2>
        <p className="text-sm font-medium text-muted-foreground mt-1">Enter the primary details of the pilotage activity and vessel.</p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
        

        <FormField
          control={control}
          name="localAgency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Local Agency</FormLabel>
              <FormControl>
                <Input className="h-11 focus-visible:ring-accent" placeholder="Agency Name" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="activityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Activity Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 w-full focus:ring-accent">
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ARRIVAL">Arrival</SelectItem>
                  <SelectItem value="DEPARTURE">Departure</SelectItem>
                  <SelectItem value="SHIFTING">Shifting</SelectItem>
                  <SelectItem value="SWINGING">Swinging</SelectItem>
                  <SelectItem value="CANCELLATION">Cancellation</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="activityDateTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Date/Time</FormLabel>
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

        {activityType === "CANCELLATION" && (
          <FormField
            control={control}
            name="cancellationDateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Date/Time for Cancellation</FormLabel>
                <FormControl>
                  <div className="border border-destructive rounded-md overflow-hidden">
                    <DateTimePicker
                      date={field.value ? new Date(field.value) : undefined}
                      setDate={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="vesselType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Vessel Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 w-full focus:ring-accent">
                    <SelectValue placeholder="Select vessel type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="LNGC">LNGC</SelectItem>
                  <SelectItem value="LPG">LPG</SelectItem>
                  <SelectItem value="TANKER">Tanker</SelectItem>
                  <SelectItem value="CONTAINER">Container</SelectItem>
                  <SelectItem value="BULK_CARRIER">Bulk Carrier</SelectItem>
                  <SelectItem value="OTHERS">Others</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="vesselName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Vessel's Name</FormLabel>
              <FormControl>
                <Input className="h-11 focus-visible:ring-accent" placeholder="e.g., Al-Qasim Star" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="registrationNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Registration No.</FormLabel>
              <FormControl>
                <Input className="h-11 focus-visible:ring-accent" placeholder="Registration ID" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="pcNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">P/C No.</FormLabel>
              <FormControl>
                <Input className="h-11 focus-visible:ring-accent" placeholder="Optional" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
