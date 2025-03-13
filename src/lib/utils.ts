import { type ClassValue, clsx } from "clsx"
import { formatDistanceToNow } from "date-fns";

import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatAmountNumber = (num:number|string|null|undefined) => {
  if(num){
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Add commas for thousands
  }
  return 0;
};

export const formatDate = (timestamp:any) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};