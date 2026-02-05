import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { convertTradesToSchema, type TradeSubmission } from "@/utils/tradeSchemaConverter";
export interface PlannedTrade {
  id: string;
  time: string;
  kWh: number;
  rate: number;
  isBatteryPowered?: boolean;
}

export interface ConfirmedTrade {
  time: string;
  kWh: number;
  rate: number;
  earnings: number;
  buyer?: string;
}

export interface PublishedTradesData {
  plannedTrades: PlannedTrade[];
  confirmedTrades: ConfirmedTrade[];
  publishedAt?: string; // ISO date string
  isPublished: boolean;
  showConfirmedTrades: boolean; // Explicit flag for showing confirmed trades
}

const STORAGE_KEY = "samai_published_trades";

const DEFAULT_DATA: PublishedTradesData = {
  plannedTrades: [],
  confirmedTrades: [],
  isPublished: false,
  showConfirmedTrades: false,
};

export const usePublishedTrades = () => {
  const [tradesData, setTradesDataState] = useState<PublishedTradesData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_DATA, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_DATA;
      }
    }
    return DEFAULT_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tradesData));
  }, [tradesData]);

  const setTradesData = (updates: Partial<PublishedTradesData>) => {
    setTradesDataState(prev => {
      const newData = { ...prev, ...updates };
      // Sync to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    });
  };

  // Update planned trades dynamically (for modifications on Prepared page)
  // Memoized to prevent unnecessary re-renders in consuming components
  const updatePlannedTrades = useCallback((trades: PlannedTrade[]) => {
    setTradesDataState(prev => {
      const newData = {
        ...prev,
        plannedTrades: trades,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    });
  }, []);

  const publishTrades = async (trades: PlannedTrade[]) => {
    // Only submit to backend if there are trades to submit
    if (trades && trades.length > 0) {
      // Convert trades to backend schema
      const tradeSubmissions = convertTradesToSchema(trades);
      
      // Submit to backend
      try {
        const { data, error } = await supabase.functions.invoke('submit-trades', {
          body: { trades: tradeSubmissions }
        });
        
        if (error) {
          console.error('Failed to submit trades to backend:', error);
        } else {
          console.log('Trades submitted successfully:', data);
        }
      } catch (err) {
        console.error('Error calling submit-trades:', err);
      }
    } else {
      console.log('No trades to submit, skipping backend call');
    }
    
    // Update local state regardless of backend response
    const newData = {
      ...tradesData,
      plannedTrades: trades,
      isPublished: true,
      publishedAt: new Date().toISOString(),
    };
    // Synchronously write to localStorage before state update to prevent race condition
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setTradesDataState(newData);
  };

  const confirmTrades = (trades: ConfirmedTrade[]) => {
    setTradesDataState(prev => ({
      ...prev,
      confirmedTrades: trades,
      showConfirmedTrades: true,
    }));
  };

  const setShowConfirmedTrades = (show: boolean) => {
    setTradesDataState(prev => ({
      ...prev,
      showConfirmedTrades: show,
    }));
  };

  const clearTrades = () => {
    setTradesDataState(DEFAULT_DATA);
  };

  // Calculate totals
  const plannedUnits = tradesData.plannedTrades.reduce((sum, t) => sum + t.kWh, 0);
  const plannedEarnings = tradesData.plannedTrades.reduce((sum, t) => sum + Math.round(t.kWh * t.rate), 0);
  
  const confirmedUnits = tradesData.confirmedTrades.reduce((sum, t) => sum + t.kWh, 0);
  const confirmedEarnings = tradesData.confirmedTrades.reduce((sum, t) => sum + t.earnings, 0);

  const totalUnits = plannedUnits + confirmedUnits;
  const totalEarnings = plannedEarnings + confirmedEarnings;
  
  const avgRate = totalUnits > 0 ? Math.round((totalEarnings / totalUnits) * 10) / 10 : 0;

  return {
    tradesData,
    setTradesData,
    publishTrades,
    updatePlannedTrades,
    confirmTrades,
    setShowConfirmedTrades,
    clearTrades,
    // Computed values
    plannedUnits,
    plannedEarnings,
    confirmedUnits,
    confirmedEarnings,
    totalUnits,
    totalEarnings,
    avgRate,
  };
};
