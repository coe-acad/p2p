import { addDays, format, parse, setHours, setMinutes, setSeconds } from "date-fns";

export interface PlannedTrade {
  id: string;
  time: string;
  kWh: number;
  rate: number;
  isBatteryPowered?: boolean;
}

export interface TradeSubmission {
  date: string;
  startTime: string;
  end_time: string;
  quantity: number;
  price: number;
}

/**
 * Parses a time string like "10:00 AM" and returns hours (24h format) and minutes
 */
const parseTimeString = (timeStr: string): { hours: number; minutes: number } => {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  
  // Convert to 24-hour format
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }
  
  return { hours, minutes };
};

/**
 * Converts IST time to UTC ISO string
 * IST is UTC+5:30
 */
const istToUtc = (date: Date, hours: number, minutes: number): string => {
  // Create a date in IST
  const istDate = new Date(date);
  istDate.setHours(hours, minutes, 0, 0);
  
  // IST is UTC+5:30, so subtract 5 hours 30 minutes to get UTC
  const utcDate = new Date(istDate.getTime() - (5 * 60 + 30) * 60 * 1000);
  
  return utcDate.toISOString();
};

/**
 * Extracts start time from trade time string like "10:00 AM – 11:00 AM"
 */
const extractStartTime = (timeRange: string): string => {
  const parts = timeRange.split("–").map(s => s.trim());
  return parts[0];
};

/**
 * Converts an array of PlannedTrade objects to the backend submission schema
 * 
 * @param trades - Array of planned trades from the UI
 * @param targetDate - Optional date for the trades (defaults to tomorrow)
 * @returns Array of TradeSubmission objects ready for backend
 */
export const convertTradesToSchema = (
  trades: PlannedTrade[],
  targetDate?: Date
): TradeSubmission[] => {
  const date = targetDate || addDays(new Date(), 1);
  const dateString = format(date, "yyyy-MM-dd");
  
  return trades.map((trade) => {
    // Extract start time from range like "10:00 AM – 11:00 AM"
    const startTimeStr = extractStartTime(trade.time);
    const { hours, minutes } = parseTimeString(startTimeStr);
    
    // Calculate end time (1 hour later)
    const endHours = hours + 1;
    const endMinutes = minutes;
    
    return {
      date: dateString,
      startTime: istToUtc(date, hours, minutes),
      end_time: istToUtc(date, endHours, endMinutes),
      quantity: trade.kWh,
      price: trade.rate,
    };
  });
};

/**
 * Validates the trade submission array
 */
export const validateTradeSubmissions = (trades: TradeSubmission[]): boolean => {
  if (!Array.isArray(trades) || trades.length === 0) {
    return false;
  }
  
  return trades.every((trade) => {
    return (
      typeof trade.date === "string" &&
      typeof trade.startTime === "string" &&
      typeof trade.end_time === "string" &&
      typeof trade.quantity === "number" &&
      trade.quantity > 0 &&
      typeof trade.price === "number" &&
      trade.price > 0
    );
  });
};
