"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@repo/utils";
import { Button } from "./";
import { Calendar } from "./";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./";
import { Label } from "./";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date || new Date());
  
  const [hours, setHours] = React.useState<string>(date ? format(date, "hh") : "12");
  const [minutes, setMinutes] = React.useState<string>(date ? format(date, "mm") : "00");
  const [ampm, setAmpm] = React.useState<string>(date ? format(date, "a") : "AM");

  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
      setHours(format(date, "hh"));
      setMinutes(format(date, "mm"));
      setAmpm(format(date, "a"));
    }
  }, [date]);

  const updateTime = (newDate: Date, h: string, m: string, ap: string) => {
    let hoursInt = parseInt(h, 10);
    if (ap === "PM" && hoursInt < 12) hoursInt += 12;
    if (ap === "AM" && hoursInt === 12) hoursInt = 0;
    
    newDate.setHours(hoursInt);
    newDate.setMinutes(parseInt(m, 10));
    return newDate;
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const updatedDate = updateTime(new Date(newDate), hours, minutes, ampm);
      setSelectedDate(updatedDate);
      setDate(updatedDate);
    } else {
      setSelectedDate(undefined);
      setDate(undefined);
    }
  };

  const handleTimeChange = (type: "hours" | "minutes" | "ampm", value: string) => {
    let newH = hours;
    let newM = minutes;
    let newAp = ampm;

    if (type === "hours") newH = value;
    if (type === "minutes") newM = value;
    if (type === "ampm") newAp = value;

    setHours(newH);
    setMinutes(newM);
    setAmpm(newAp);

    if (selectedDate) {
      const updatedDate = updateTime(new Date(selectedDate), newH, newM, newAp);
      setSelectedDate(updatedDate);
      setDate(updatedDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP p") : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          captionLayout="dropdown"
          startMonth={new Date(1900, 0)}
          endMonth={new Date(2100, 11)}
        />
        <div className="p-3 border-t border-border flex items-center justify-between gap-2 bg-gray-50/50">
          <Label className="text-sm font-semibold text-primary">Time</Label>
          <div className="flex items-center gap-1">
            <Select value={hours} onValueChange={(v) => handleTimeChange("hours", v)}>
              <SelectTrigger className="w-[65px] h-8 text-sm focus:ring-accent bg-white">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                  const val = h.toString().padStart(2, "0");
                  return <SelectItem key={val} value={val}>{val}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            <span className="text-gray-500 font-bold">:</span>
            <Select value={minutes} onValueChange={(v) => handleTimeChange("minutes", v)}>
              <SelectTrigger className="w-[65px] h-8 text-sm focus:ring-accent bg-white">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => i).map((m) => {
                  const val = m.toString().padStart(2, "0");
                  return <SelectItem key={val} value={val}>{val}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            <Select value={ampm} onValueChange={(v) => handleTimeChange("ampm", v)}>
              <SelectTrigger className="w-[65px] h-8 text-sm focus:ring-accent bg-white">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
