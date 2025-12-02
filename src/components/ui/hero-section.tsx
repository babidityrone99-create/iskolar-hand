import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HeroSectionProps {
  children: ReactNode;
  variant?: "default" | "navy" | "gradient";
  className?: string;
}

export const HeroSection = ({
  children,
  variant = "default",
  className,
}: HeroSectionProps) => {
  const variantStyles = {
    default: "bg-primary text-primary-foreground",
    navy: "bg-secondary text-secondary-foreground",
    gradient: "bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground",
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden px-6 py-12 md:py-16",
        variantStyles[variant],
        className
      )}
    >
      {/* Decorative gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
      
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--gold)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Bottom gold accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-light via-gold to-gold-dark" />
    </section>
  );
};
