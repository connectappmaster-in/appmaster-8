import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetDisplay, setResetDisplay] = useState(false);

  const handleNumber = (num: string) => {
    if (resetDisplay) {
      setDisplay(num);
      setResetDisplay(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (resetDisplay) {
      setDisplay("0.");
      setResetDisplay(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOperation = (op: string) => {
    if (previousValue !== null && operation !== null && !resetDisplay) {
      calculate();
    }
    setPreviousValue(display);
    setOperation(op);
    setResetDisplay(true);
  };

  const calculate = () => {
    if (previousValue === null || operation === null) return;

    const prev = parseFloat(previousValue);
    const current = parseFloat(display);
    let result: number;

    switch (operation) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "×":
        result = prev * current;
        break;
      case "÷":
        result = prev / current;
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setResetDisplay(true);
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setResetDisplay(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  return (
    <Card className="w-full max-w-sm p-6 bg-card shadow-[var(--shadow-calculator)] border-border/50">
      <div className="mb-6 p-6 bg-calculator-display rounded-2xl min-h-[100px] flex items-end justify-end">
        <div className="text-right">
          {previousValue && operation && (
            <div className="text-sm text-muted-foreground mb-1 font-mono">
              {previousValue} {operation}
            </div>
          )}
          <div className="text-5xl font-mono font-bold text-foreground break-all">
            {display}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Button
          variant="secondary"
          className="h-16 text-xl font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95 transition-transform"
          onClick={clear}
        >
          AC
        </Button>
        <Button
          variant="secondary"
          className="h-16 text-xl font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95 transition-transform"
          onClick={handleBackspace}
        >
          ⌫
        </Button>
        <Button
          variant="secondary"
          className="h-16 text-xl font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95 transition-transform col-span-2"
          onClick={() => handleOperation("÷")}
        >
          ÷
        </Button>

        {["7", "8", "9"].map((num) => (
          <Button
            key={num}
            variant="ghost"
            className="h-16 text-xl font-semibold bg-calculator-number text-calculator-number-foreground hover:bg-calculator-number/80 active:scale-95 transition-transform"
            onClick={() => handleNumber(num)}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="default"
          className="h-16 text-xl font-semibold bg-calculator-operator text-calculator-operator-foreground hover:bg-calculator-operator/90 active:scale-95 transition-transform"
          onClick={() => handleOperation("×")}
        >
          ×
        </Button>

        {["4", "5", "6"].map((num) => (
          <Button
            key={num}
            variant="ghost"
            className="h-16 text-xl font-semibold bg-calculator-number text-calculator-number-foreground hover:bg-calculator-number/80 active:scale-95 transition-transform"
            onClick={() => handleNumber(num)}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="default"
          className="h-16 text-xl font-semibold bg-calculator-operator text-calculator-operator-foreground hover:bg-calculator-operator/90 active:scale-95 transition-transform"
          onClick={() => handleOperation("-")}
        >
          -
        </Button>

        {["1", "2", "3"].map((num) => (
          <Button
            key={num}
            variant="ghost"
            className="h-16 text-xl font-semibold bg-calculator-number text-calculator-number-foreground hover:bg-calculator-number/80 active:scale-95 transition-transform"
            onClick={() => handleNumber(num)}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="default"
          className="h-16 text-xl font-semibold bg-calculator-operator text-calculator-operator-foreground hover:bg-calculator-operator/90 active:scale-95 transition-transform"
          onClick={() => handleOperation("+")}
        >
          +
        </Button>

        <Button
          variant="ghost"
          className="h-16 text-xl font-semibold bg-calculator-number text-calculator-number-foreground hover:bg-calculator-number/80 active:scale-95 transition-transform col-span-2"
          onClick={() => handleNumber("0")}
        >
          0
        </Button>
        <Button
          variant="ghost"
          className="h-16 text-xl font-semibold bg-calculator-number text-calculator-number-foreground hover:bg-calculator-number/80 active:scale-95 transition-transform"
          onClick={handleDecimal}
        >
          .
        </Button>
        <Button
          variant="default"
          className="h-16 text-xl font-semibold bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95 transition-transform"
          onClick={calculate}
        >
          =
        </Button>
      </div>
    </Card>
  );
};

export default Calculator;
