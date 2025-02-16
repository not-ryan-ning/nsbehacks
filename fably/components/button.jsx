import React from 'react';
import { cn } from '@/lib/utils';

const GameButton = React.forwardRef((props, ref) => {
  const { children, variant = 'default', className, ...otherProps } = props;
  const [isPressed, setIsPressed] = React.useState(false);

  return (
    <button
      ref={ref}
      className={cn(
        "w-full",
        // Base styles
        "relative group overflow-hidden",
        "font-bold text-white text-center",
        "transition-all duration-300 ease-out",
        "rounded-xl",
        // Glass effect and shadows
        "bg-gameButton-primary/90 backdrop-blur-sm",
        "shadow-lg shadow-gameButton-primary/20",
        // Border and glow effects
        "border border-white/20",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-t before:from-white/5 before:to-transparent",
        // Hover effects
        "hover:bg-gameButton-hover/90",
        "hover:shadow-xl hover:shadow-gameButton-primary/30",
        "hover:-translate-y-0.5",
        // Active/Pressed state
        "active:bg-gameButton-pressed/90",
        "active:shadow-md",
        "active:translate-y-0",
        // Size variants
        variant === 'default' ? "px-8 py-3 text-lg" : "px-12 py-4 text-xl",
        // Animation classes
        isPressed && "animate-game-button-press",
        !isPressed && "animate-game-button-glow",
        // Custom classes
        className
      )}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      {...otherProps}
    >
      <span className="relative z-10 block transform transition-transform group-hover:scale-105">
        {children}
      </span>
    </button>
  );
});

GameButton.displayName = 'GameButton';

export default GameButton;
