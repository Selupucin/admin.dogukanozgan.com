// @do/ui — yardımcılar. shadcn/ui'nin standart `cn` birleştiricisi.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
