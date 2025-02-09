"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // マウント後にコンポーネントを表示
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // マウント前は空のボタンを表示
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full border dark:border-gray-50/20"
      >
        <span className="sr-only">テーマを切り替える</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative rounded-full border dark:border-gray-50/20"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: theme === "light" ? 1 : 0,
          scale: theme === "light" ? 1 : 0.5,
          rotate: theme === "light" ? 0 : 180,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="absolute"
      >
        <Sun className="h-5 w-5 text-orange-500" fill="currentColor" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: theme === "dark" ? 1 : 0,
          scale: theme === "dark" ? 1 : 0.5,
          rotate: theme === "dark" ? 0 : -180,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="absolute"
      >
        <Moon className="h-5 w-5 text-yellow-400" fill="currentColor" />
      </motion.div>
      <span className="sr-only">テーマを切り替える</span>
    </Button>
  );
}
