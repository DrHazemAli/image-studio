"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SunIcon, MoonIcon, DesktopIcon } from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@radix-ui/themes";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const themes = [
    { value: "light", label: "Light", icon: SunIcon },
    { value: "dark", label: "Dark", icon: MoonIcon },
    { value: "system", label: "System", icon: DesktopIcon },
  ] as const;

  const currentTheme = themes.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon || SunIcon;

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="2"
            className={`h-9 w-9 !p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                <CurrentIcon className="h-4 w-4 text-gray-900 dark:text-white" />
              </motion.div>
            </AnimatePresence>
          </Button>
        </motion.div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[140px] bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-zinc-800 shadow-lg p-1 z-50"
          sideOffset={4}
          align="end"
        >
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon;
                  return (
                    <DropdownMenu.Item
                      key={themeOption.value}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors outline-none focus:bg-gray-100 dark:focus:bg-gray-800"
                      onSelect={() => setTheme(themeOption.value)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{themeOption.label}</span>
                      {theme === themeOption.value && (
                        <motion.div
                          layoutId="activeTheme"
                          className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full"
                        />
                      )}
                    </DropdownMenu.Item>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
