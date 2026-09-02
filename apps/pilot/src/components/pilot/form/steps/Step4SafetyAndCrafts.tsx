"use client";

import { CreatePilotFormInput } from "@repo/types";
import { PlusCircle, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  Button, Card, CardContent, CardHeader, CardTitle, Checkbox,
  FormControl, FormField, FormItem, FormLabel, FormMessage, Input,
  Label, RadioGroup, RadioGroupItem, Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow, Textarea
} from "@/components/ui";

interface DgQuestionProps {
  name: "abnormalTempRiseDG" | "leakageLiquidDG" | "stowagePlanDGAttached";
  question: string;
}

function DgQuestion({ name, question }: DgQuestionProps) {
  const { control } = useFormContext<CreatePilotFormInput>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between space-y-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <FormLabel className="flex-1 pr-4 font-semibold text-primary">{question}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(v) => field.onChange(v === "true")}
              value={String(field.value)}
              className="flex shrink-0 gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem className="text-accent border-primary" value="true" id={`${name}-yes`} />
                <Label htmlFor={`${name}-yes`} className="font-semibold cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem className="text-accent border-primary" value="false" id={`${name}-no`} />
                <Label htmlFor={`${name}-no`} className="font-semibold cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export default function Step4SafetyAndCrafts() {
  const { register, control } = useFormContext<CreatePilotFormInput>();
  const { fields, append, remove } = useFieldArray({ control, name: "craftsUsed" });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-primary">Safety & Crafts Used</h2>
        <p className="text-sm font-medium text-muted-foreground mt-1">Complete safety declarations and specify crafts/tugs deployed.</p>
      </div>

      <Card className="border-primary/10 shadow-md">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
          <CardTitle className="text-sm font-bold tracking-widest text-accent uppercase">
            Safety & Dangerous Goods (DG)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <DgQuestion name="abnormalTempRiseDG" question="Any abnormal rise in temperature of DG spaces?" />
          <DgQuestion name="leakageLiquidDG" question="Any leakage of liquid dangerous cargo in hold?" />
          <DgQuestion name="stowagePlanDGAttached" question="Stowage plan of DG attached?" />
        </CardContent>
      </Card>

      <div className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-widest text-accent uppercase">Crafts Used (Tugs / Pilot Boats)</h3>
          <Button
            type="button"
            size="sm"
            className="bg-white text-accent border border-accent hover:bg-accent hover:text-white transition-colors"
            onClick={() => append({ craftType: "TUG", craftName: "", fromLocation: "", toLocation: "" })}
          >
            <PlusCircle className="size-4 mr-2" /> Add Craft
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary border-b-0">
                <TableHead className="text-xs font-semibold tracking-wider text-white uppercase h-10">Craft Type</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider text-white uppercase h-10">Craft Name</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider text-white uppercase h-10">From Location</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider text-white uppercase h-10">To Location</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider text-white uppercase h-10 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {fields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-8 text-center text-sm font-medium text-muted-foreground">
                    No crafts added yet. Click &quot;+ Add Craft&quot; to include tugs or boats.
                  </TableCell>
                </TableRow>
              ) : (
                fields.map((field, index) => (
                  <TableRow key={field.id} className="hover:bg-gray-50/50">
                    <TableCell className="p-3">
                      <FormField
                        control={control}
                        name={`craftsUsed.${index}.craftType`}
                        render={({ field: selectField }) => (
                          <Select onValueChange={selectField.onChange} value={selectField.value}>
                            <SelectTrigger className="h-9 w-full text-sm focus:ring-accent">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PILOT_BOAT">Pilot Boat</SelectItem>
                              <SelectItem value="TUG">Tug</SelectItem>
                              <SelectItem value="MOORING_BOAT">Mooring Boat</SelectItem>
                              <SelectItem value="ESCORTING_TUG">Escorting Tug</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>
                    <TableCell className="p-3">
                      <Input className="h-9 text-sm focus-visible:ring-accent" placeholder="e.g., Tug 2" {...register(`craftsUsed.${index}.craftName`)} />
                    </TableCell>
                    <TableCell className="p-3">
                      <Input className="h-9 text-sm focus-visible:ring-accent" placeholder="From" {...register(`craftsUsed.${index}.fromLocation`)} />
                    </TableCell>
                    <TableCell className="p-3">
                      <Input className="h-9 text-sm focus-visible:ring-accent" placeholder="To" {...register(`craftsUsed.${index}.toLocation`)} />
                    </TableCell>
                    <TableCell className="p-3 text-right">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-white hover:bg-destructive h-9 w-9"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <FormField
        control={control}
        name="additionalRemarks"
        render={({ field }) => (
          <FormItem className="pt-6">
            <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Additional Remarks</FormLabel>
            <FormControl>
              <Textarea
                className="resize-none focus-visible:ring-accent"
                rows={3}
                placeholder="Any extra observations or notes..."
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    </div>
  );
}
