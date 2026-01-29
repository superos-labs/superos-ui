"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiSettings4Line, RiCloseLine } from "@remixicon/react";

interface KnobsContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const KnobsContext = React.createContext<KnobsContextValue | null>(null);

function useKnobs() {
  const context = React.useContext(KnobsContext);
  if (!context) {
    throw new Error("useKnobs must be used within KnobsProvider");
  }
  return context;
}

function KnobsProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <KnobsContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </KnobsContext.Provider>
  );
}

const PANEL_WIDTH = 320;

function KnobsToggle() {
  const { isOpen, setIsOpen } = useKnobs();

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "fixed bottom-4 z-50 flex size-9 items-center justify-center rounded-full transition-colors",
        "border border-border bg-background text-muted-foreground shadow-sm",
        "hover:text-foreground hover:border-foreground/20 hover:shadow-md",
      )}
      style={{ right: isOpen ? PANEL_WIDTH + 16 : 16 }}
      aria-label="Toggle knobs"
    >
      {isOpen ? (
        <RiCloseLine className="size-4" />
      ) : (
        <RiSettings4Line className="size-4" />
      )}
    </button>
  );
}

function KnobsPanel({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = useKnobs();

  // Adjust body padding when panel opens
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.paddingRight = `${PANEL_WIDTH}px`;
    } else {
      document.body.style.paddingRight = "0px";
    }
    return () => {
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

  return (
    <div
      className={cn(
        "fixed top-0 right-0 z-50 flex h-full flex-col border-l border-border/50 bg-background",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
      style={{ width: PANEL_WIDTH }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Properties
        </h2>
        <button
          onClick={() => setIsOpen(false)}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RiCloseLine className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}

interface KnobSelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
}

function KnobSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: KnobSelectProps<T>) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[13px] font-medium text-foreground/80">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150",
              value === option.value
                ? "bg-foreground text-background shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface KnobInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function KnobInput({ label, value, onChange, placeholder }: KnobInputProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[13px] font-medium text-foreground/80">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:bg-background focus:ring-2 focus:ring-foreground/5"
      />
    </div>
  );
}

interface KnobBooleanProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function KnobBoolean({ label, value, onChange }: KnobBooleanProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-[13px] font-medium text-foreground/80">
        {label}
      </label>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors duration-200",
          value ? "bg-foreground" : "bg-muted",
        )}
      >
        <div
          className={cn(
            "absolute top-1 size-4 rounded-full bg-background shadow transition-all duration-200",
            value ? "left-6" : "left-1",
          )}
        />
      </button>
    </div>
  );
}

interface KnobNumberProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

function KnobNumber({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: KnobNumberProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[13px] font-medium text-foreground/80">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:bg-background focus:ring-2 focus:ring-foreground/5"
      />
    </div>
  );
}

function KnobDivider() {
  return <div className="h-px bg-border/50" />;
}

export {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobSelect,
  KnobInput,
  KnobBoolean,
  KnobNumber,
  KnobDivider,
  useKnobs,
};
