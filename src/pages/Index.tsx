import Calculator from "@/components/Calculator";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[image:var(--gradient-bg)]">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-foreground">
          Calculator
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Simple & elegant calculations
        </p>
        <Calculator />
      </div>
    </div>
  );
};

export default Index;
