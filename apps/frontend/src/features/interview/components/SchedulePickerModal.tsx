import React, { useMemo, useState } from "react";

interface Props {
  initialDate?: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTH_LABELS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Builds a 6x7 grid of dates for the given month, starting on Monday.
function buildMonthGrid(viewYear: number, viewMonth: number): Date[] {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  // JS getDay(): 0=Sun..6=Sat. Convert to Monday-first offset.
  const jsDay = firstOfMonth.getDay();
  const mondayOffset = (jsDay + 6) % 7;
  const gridStart = new Date(viewYear, viewMonth, 1 - mondayOffset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }
  return days;
}

const SchedulePickerModal: React.FC<Props> = ({ initialDate, onClose, onConfirm }) => {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewDate, setViewDate] = useState(() => initialDate ?? new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const goPrevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
  const goNextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));

  const handleConfirm = () => {
    if (!selectedDate) return;
    onConfirm(selectedDate);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 15, 20, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: 360,
          maxWidth: "100%",
          padding: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          fontFamily: "inherit",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button
            onClick={goPrevMonth}
            aria-label="Tháng trước"
            style={{
              border: "none",
              background: "#f3f4f6",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ‹
          </button>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {MONTH_LABELS[viewMonth]} {viewYear}
          </div>
          <button
            onClick={goNextMonth}
            aria-label="Tháng sau"
            style={{
              border: "none",
              background: "#f3f4f6",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ›
          </button>
        </div>

        {/* Weekday labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
          {WEEKDAY_LABELS.map((w) => (
            <div
              key={w}
              style={{
                textAlign: "center",
                fontSize: 12,
                fontWeight: 600,
                color: "#9ca3af",
                padding: "4px 0",
              }}
            >
              {w}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {grid.map((day) => {
            const inCurrentMonth = day.getMonth() === viewMonth;
            const isPast = day < today;
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const disabled = isPast;

            return (
              <button
                key={day.toISOString()}
                disabled={disabled}
                onClick={() => setSelectedDate(day)}
                style={{
                  aspectRatio: "1 / 1",
                  border: isToday && !isSelected ? "1px solid #6366f1" : "1px solid transparent",
                  borderRadius: 8,
                  background: isSelected ? "#111827" : "transparent",
                  color: disabled
                    ? "#d1d5db"
                    : isSelected
                    ? "#fff"
                    : inCurrentMonth
                    ? "#111827"
                    : "#c7cbd1",
                  fontWeight: isSelected || isToday ? 700 : 500,
                  fontSize: 13,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Huỷ
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDate}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 8,
              border: "none",
              background: selectedDate ? "#111827" : "#d1d5db",
              color: "#fff",
              fontWeight: 600,
              cursor: selectedDate ? "pointer" : "not-allowed",
            }}
          >
            Xác nhận đặt lịch
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulePickerModal;