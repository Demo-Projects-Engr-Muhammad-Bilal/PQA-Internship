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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../ui";
import { toDatetimeLocalValue } from "../date-utils";

export default function Step1General() {
  const { control, watch } = useFormContext<CreatePilotFormInput>();

  const activityType = watch("activityType");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold">Step 1: General & Vessel Information</h2>
        <p className="text-sm text-muted-foreground">Enter the primary details of the pilotage activity and vessel.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="serialNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial No.</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 55201" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="localAgency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local Agency</FormLabel>
              <FormControl>
                <Input placeholder="Agency Name" {...field} />
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
              <FormLabel>Activity Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
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
              <FormLabel>Date/Time</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={toDatetimeLocalValue(field.value)}
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
                <FormLabel>Date/Time for Cancellation</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={toDatetimeLocalValue(field.value)}
                  />
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
              <FormLabel>Vessel Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
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
              <FormLabel>Vessel&apos;s Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Al-Qasim Star" {...field} />
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
              <FormLabel>Registration No.</FormLabel>
              <FormControl>
                <Input placeholder="Registration ID" {...field} />
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
              <FormLabel>P/C No.</FormLabel>
              <FormControl>
                <Input placeholder="Optional" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
