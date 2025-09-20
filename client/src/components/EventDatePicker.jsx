import React from "react";
import { format } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

export default function EventDatePicker({ value, onChange }) {
  // value is a Date or null; onChange receives a Date
  const formatted = value ? format(value, "PPP") : "";

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-34 md:w-56 justify-between text-left font-normal"
          >
            <span>{formatted || "Select date"}</span>
            <CalendarIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => onChange(date || null)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
