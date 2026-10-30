import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DateDropdownProps {
  value: string;
  onChange: (val: string) => void;
}

const MONTHS = [
  { name: 'January', days: 31 },
  { name: 'February', days: 29 }, // include leap day
  { name: 'March', days: 31 },
  { name: 'April', days: 30 },
  { name: 'May', days: 31 },
  { name: 'June', days: 30 },
  { name: 'July', days: 31 },
  { name: 'August', days: 31 },
  { name: 'September', days: 30 },
  { name: 'October', days: 31 },
  { name: 'November', days: 30 },
  { name: 'December', days: 31 },
];

// Generate all 366 dates in sequential order
const ALL_CALENDAR_DATES: string[] = [];
MONTHS.forEach((m) => {
  for (let d = 1; d <= m.days; d++) {
    ALL_CALENDAR_DATES.push(`${m.name} ${d}`);
  }
});

export const DateDropdown: React.FC<DateDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // When opening, scroll selected item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen]);

  const handleSelect = (date: string) => {
    onChange(date);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="neo-input flex items-center justify-between text-left font-heading text-base md:text-lg cursor-pointer bg-white text-black border-3 border-black"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{value || 'Select a date...'}</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Single Scrollable List of All Calendar Dates */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border-3 border-black rounded-xl shadow-[6px_6px_0px_#000] p-1.5 focus:outline-none"
        >
          {ALL_CALENDAR_DATES.map((dateStr) => {
            const isSelected = dateStr === value;
            // The subtle clue requested by the brief: a small underline directly under December 31
            const isDec31 = dateStr === 'December 31';

            return (
              <div
                key={dateStr}
                role="option"
                aria-selected={isSelected}
                data-selected={isSelected}
                onClick={() => handleSelect(dateStr)}
                className={`px-3 py-2 text-sm font-heading rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-[var(--yellow)] text-black'
                    : 'text-black hover:bg-neutral-100'
                }`}
              >
                <span className={isDec31 ? 'underline decoration-2 underline-offset-4 decoration-neutral-500' : ''}>
                  {dateStr}
                </span>
                {isSelected && <span className="font-bold">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
