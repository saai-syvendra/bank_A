"use client";

import * as React from "react";
import { format, setMonth, setYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
    field: {
        value: Date;
        onChange: (date: Date | undefined) => void;
    };
}

export function DatePicker({ field }: DatePickerProps) {
    const [currentDate, setCurrentDate] = React.useState<Date>(
        field.value || new Date()
    );

    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from(
            { length: currentYear - 1900 + 1 },
            (_, i) => currentYear - i
        );
    }, []);

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const handleYearChange = (year: string) => {
        const newDate = setYear(currentDate, parseInt(year));
        setCurrentDate(newDate);
        field.onChange(newDate);
    };

    const handleMonthChange = (month: string) => {
        const newDate = setMonth(currentDate, months.indexOf(month));
        setCurrentDate(newDate);
        field.onChange(newDate);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                        format(field.value, "PPP")
                    ) : (
                        <span>Pick a date</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex justify-between p-2">
                    <Select
                        value={currentDate.getFullYear().toString()}
                        onValueChange={handleYearChange}
                    >
                        <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={months[currentDate.getMonth()]}
                        onValueChange={handleMonthChange}
                    >
                        <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month) => (
                                <SelectItem key={month} value={month}>
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                        field.onChange(date);
                        if (date) setCurrentDate(date);
                    }}
                    month={currentDate}
                    onMonthChange={setCurrentDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
