import { Slider } from "@/components/ui/slider";

interface ParameterSliderProps {
  label: string;
  symbol: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

const ParameterSlider = ({ label, symbol, value, min, max, step, onChange, format }: ParameterSliderProps) => {
  const display = format ? format(value) : value.toFixed(2);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {label} <span className="font-mono text-muted-foreground">({symbol})</span>
        </label>
        <span className="font-mono text-sm font-semibold text-primary">{display}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
};

export default ParameterSlider;
