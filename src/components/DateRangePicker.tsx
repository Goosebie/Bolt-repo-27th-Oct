import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, isAfter, isBefore, isValid, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  onChange: (range: { startDate: string; endDate: string }) => void;
  className?: string;
}

export function DateRangePicker({ onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const maxDate = addDays(today, 365);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateClick = (date: Date) => {
    if (!dateRange.startDate || (dateRange.startDate && dateRange.endDate)) {
      setDateRange({ startDate: date, endDate: null });
    } else {
      if (isAfter(date, dateRange.startDate)) {
        const newRange = { startDate: dateRange.startDate, endDate: date };
        setDateRange(newRange);
        onChange({
          startDate: format(newRange.startDate, 'yyyy-MM-dd'),
          endDate: format(date, 'yyyy-MM-dd')
        });
        setIsOpen(false);
      } else {
        setDateRange({ startDate: date, endDate: null });
      }
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  const isInRange = (date: Date) => {
    if (!dateRange.startDate) return false;
    if (!dateRange.endDate && hoverDate) {
      return (
        (isAfter(date, dateRange.startDate) && isBefore(date, hoverDate)) ||
        (isAfter(date, hoverDate) && isBefore(date, dateRange.startDate))
      );
    }
    return dateRange.endDate && 
      isAfter(date, dateRange.startDate) && 
      isBefore(date, dateRange.endDate);
  };

  const formatDisplayDate = () => {
    if (!dateRange.startDate) return 'Select dates';
    if (!dateRange.endDate) return format(dateRange.startDate, 'MMM d, yyyy');
    return `${format(dateRange.startDate, 'MMM d')} - ${format(dateRange.endDate, 'MMM d, yyyy')}`;
  };

  return (
    <div className={cn("relative", className)} ref={calendarRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 
          rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent
          hover:bg-white/20 transition-colors"
      >
        <CalendarIcon className="w-4 h-4" />
        <span>{formatDisplayDate()}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-gray-900 rounded-lg shadow-xl border border-gray-700 max-h-[400px] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => changeMonth(-1)}
              disabled={isBefore(startOfMonth(currentMonth), startOfMonth(today))}
              className="p-1 hover:bg-gray-700 rounded-md disabled:opacity-50"
            >
              ←
            </button>
            <span className="text-white font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => changeMonth(1)}
              disabled={isAfter(startOfMonth(currentMonth), startOfMonth(maxDate))}
              className="p-1 hover:bg-gray-700 rounded-md disabled:opacity-50"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400">
                {day}
              </div>
            ))}

            {getDaysInMonth().map((date, i) => (
              <button
                key={i}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoverDate(date)}
                onMouseLeave={() => setHoverDate(null)}
                disabled={!isValid(date) || isBefore(date, today)}
                className={cn(
                  "p-2 text-sm rounded-md transition-colors",
                  "hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed",
                  "text-gray-300",
                  dateRange.startDate && date.getTime() === dateRange.startDate.getTime() && 
                    "bg-blue-600 text-white hover:bg-blue-700",
                  dateRange.endDate && date.getTime() === dateRange.endDate.getTime() && 
                    "bg-blue-600 text-white hover:bg-blue-700",
                  isInRange(date) && "bg-blue-600/20 text-blue-200"
                )}
              >
                {format(date, 'd')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}