import { useState, useEffect } from "react";
import { query, collection, where, getDocs, QueryConstraint } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Trade {
  transactionId: string;
  buyerPhone: string;
  sellerName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  confirmedAt: Date;
}

export const useTradeHistory = (buyerPhone: string) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!buyerPhone) {
      setLoading(false);
      return;
    }

    const fetchTrades = async () => {
      try {
        const constraints: QueryConstraint[] = [
          where("buyerPhone", "==", buyerPhone),
        ];

        const q = query(collection(db, "trades"), ...constraints);
        const snapshot = await getDocs(q);
        const fetchedTrades = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            transactionId: doc.id,
            buyerPhone: data.buyerPhone,
            sellerName: data.sellerName,
            quantity: data.quantity,
            pricePerUnit: data.pricePerUnit,
            totalAmount: data.totalAmount,
            status: data.status,
            confirmedAt: data.confirmedAt?.toDate?.() || new Date(data.confirmedAt),
          } as Trade;
        });

        setTrades(fetchedTrades.sort((a, b) => b.confirmedAt.getTime() - a.confirmedAt.getTime()));
        setError(null);
      } catch (err) {
        console.error("Failed to fetch trades:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch trades");
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [buyerPhone]);

  return { trades, loading, error };
};
