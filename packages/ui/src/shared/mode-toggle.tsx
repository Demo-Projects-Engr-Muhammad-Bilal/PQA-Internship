"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "../ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect`n    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="outline" size="icon" className="h-9 w-9 opacity-0" />;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-md border-border bg-card"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-primary transition-all" />
      ) : (
        <Moon className="h-4 w-4 text-foreground transition-all" />
      )}
    </Button>
  );
}
