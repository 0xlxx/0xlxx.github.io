import {twMerge} from "tailwind-merge";

import { clsx } from "clsx";

export function cn(...args: any[]) {
  return twMerge(clsx(...args));
}