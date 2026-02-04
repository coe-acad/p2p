import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface TradeSubmission {
  date: string;
  startTime: string;
  end_time: string;
  quantity: number;
  price: number;
}

interface SubmitTradesRequest {
  trades: TradeSubmission[];
  userId?: string;
  deviceId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: SubmitTradesRequest = await req.json();
    const { trades, userId, deviceId } = body;

    // Validate trades array
    if (!Array.isArray(trades) || trades.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid trades array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each trade
    for (const trade of trades) {
      if (!trade.date || !trade.startTime || !trade.end_time || 
          typeof trade.quantity !== 'number' || trade.quantity <= 0 ||
          typeof trade.price !== 'number' || trade.price <= 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid trade format', trade }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Log the submission (in production, this would save to database or forward to external API)
    console.log('=== Trade Submission Received ===');
    console.log('User ID:', userId || 'anonymous');
    console.log('Device ID:', deviceId || 'not provided');
    console.log('Number of trades:', trades.length);
    console.log('Trades:', JSON.stringify(trades, null, 2));
    
    // Calculate totals
    const totalQuantity = trades.reduce((sum, t) => sum + t.quantity, 0);
    const totalValue = trades.reduce((sum, t) => sum + (t.quantity * t.price), 0);
    console.log('Total quantity:', totalQuantity, 'kWh');
    console.log('Total value: ₹', totalValue.toFixed(2));

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Trades submitted successfully',
        summary: {
          tradesCount: trades.length,
          totalQuantity,
          totalValue: Math.round(totalValue),
          submittedAt: new Date().toISOString(),
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing trade submission:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
