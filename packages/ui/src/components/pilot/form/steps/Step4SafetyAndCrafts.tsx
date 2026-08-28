"use client";

import { CreatePilotFormInput } from "@repo/types";
import { PlusCircle, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea
} from "../../../ui";

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
        <FormItem className="flex items-center justify-between space-y-0 rounded-md border bg-background p-3">
          <FormLabel className="flex-1 pr-4 font-normal">{question}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(v) => field.onChange(v === "true")}
              value={String(field.value)}
              className="flex shrink-0 gap-4"
            >
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="true" id={`${name}-yes`} />
                <Label htmlFor={`${name}-yes`} className="font-normal">Yes</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="false" id={`${name}-no`} />
                <Label htmlFor={`${name}-no`} className="font-normal">No</Label>
              </div>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export default function Step4SafetyAndCrafts() {
  const {
    register,
    control,
  } = useFormContext<CreatePilotFormInput>();

  // React Hook Form field array for dynamic crafts rows
  const { fields, append, remove } = useFieldArray({
    control,
    name: "craftsUsed",
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold">Step 4: Safety & Crafts Used</h2>
        <p className="text-sm text-muted-foreground">Complete safety declarations and specify crafts/tugs deployed.</p>
      </div>

      {/* Safety Declarations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm tracking-wider uppercase">
            Safety & Dangerous Goods (DG) Declarations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DgQuestion
            name="abnormalTempRiseDG"
            question="Any abnormal rise in temperature of DG spaces?"
          />
          <DgQuestion
            name="leakageLiquidDG"
            question="Any leakage of liquid dangerous cargo in hold?"
          />
          <DgQuestion
            name="stowagePlanDGAttached"
            question="Stowage plan of DG attached?"
          />
        </CardContent>
      </Card>

      {/* Dynamic Crafts Used Table Section */}
      <div className="pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wider text-primary uppercase">Crafts Used (Tugs / Pilot Boats)</h3>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append({ craftType: "TUG", craftName: "", fromLocation: "", toLocation: "" })}
          >
            <PlusCircle className="size-4" /> Add Craft
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs">
                <TableHead>Craft Type</TableHead>
                <TableHead>Craft Name</TableHead>
                <TableHead>From Location</TableHead>
                <TableHead>To Location</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {fields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-6 text-center text-xs whitespace-normal text-muted-foreground">
                    No crafts added yet. Click &quot;+ Add Craft&quot; to include tugs or boats.
                  </TableCell>
                </TableRow>
              ) : (
                fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`craftsUsed.${index}.craftType`}
                        render={({ field: selectField }) => (
                          <Select onValueChange={selectField.onChange} value={selectField.value}>
                            <SelectTrigger className="h-7 w-full text-xs">
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
                    <TableCell>
                      <Input
                        className="h-7 text-xs"
                        placeholder="e.g., Tug 2"
                        {...register(`craftsUsed.${index}.craftName`)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-7 text-xs"
                        placeholder="From"
                        {...register(`craftsUsed.${index}.fromLocation`)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-7 text-xs"
                        placeholder="To"
                        {...register(`craftsUsed.${index}.toLocation`)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Additional Remarks */}
      <FormField
        control={control}
        name="additionalRemarks"
        render={({ field }) => (
          <FormItem className="pt-4">
            <FormLabel>Additional Remarks</FormLabel>
            <FormControl>
              <Textarea
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

      <FormField
        control={control}
        name="isDeclared"
        render={({ field }) => (
          <FormItem className="mt-6 flex flex-row items-start space-x-3 space-y-0 rounded-md border bg-muted/20 p-4 shadow-sm">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="font-semibold text-foreground">
                Declaration
              </FormLabel>
              <p className="text-sm text-muted-foreground">
                I declare that the above contents are true and correct to the best of my knowledge.
              </p>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
