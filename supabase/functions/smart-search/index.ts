import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sample deals data for AI context
const dealsContext = `
Available deals and coupons:

CHEAP COUPONS:
- "50% Off First Order" (WELCOME50) - 50% off, LocalMart, expires in 3 days
- "GH₵20 Off Orders Above GH₵100" (SAVE20) - GH₵20 off, QuickShop, expires in 5 days
- "Free Delivery Weekend" (FREEDELIVERY) - Free delivery, ExpressGo, expires in 2 days

AIRLINE COUPONS:
- "15% Off International Flights" (FLY15INT) - 15% off, Africa World Airlines, expires in 7 days
- "Early Bird Special" (EARLYBIRD) - 20% off for 30-day advance booking, PassionAir, expires in 14 days
- "Weekend Getaway Deal" (WEEKEND25) - 25% off Fri-Sun departures, Emirates, expires in 4 days

RESTAURANT COUPONS:
- "Buy 1 Get 1 Free Pizza" (BOGOPIZZA) - BOGO on large pizzas, Pizza Inn, expires in 5 days
- "30% Off Family Meals" (FAMILY30) - 30% off orders above GH₵150, KFC Ghana, expires in 6 days
- "Free Drink with Combo" (FREEDRINK) - Free drink with combo meal, Burger King, expires in 3 days

UBER & BOLT PROMOS:
- "40% Off Next 5 Rides" (UBER40GH) - 40% off up to GH₵30 per ride, Uber, expires in 7 days
- "50% Off First Bolt Ride" (BOLTFIRST) - 50% off for new users, Bolt, expires in 30 days
- "Free Ride to Airport" (AIRPORTFREE) - Free ride max GH₵80, Uber, expires in 10 days

SHOPPING DEALS:
- "Extra 25% Off Sale Items" (EXTRA25) - 25% off reduced items, Melcom, expires in 4 days
- "GH₵50 Off Electronics" (TECH50) - GH₵50 off min spend GH₵300, Jumia, expires in 8 days
- "Flash Sale Access" (FLASH2024) - Up to 70% off early access, Tonaton, expires in 1 day

EVENTS TICKETS:
- "20% Off Concert Tickets" (CONCERT20) - 20% off all live music events, Ticketmaster Ghana, expires in 5 days
- "Buy 2 Get 1 Free Movie" (MOVIE3FOR2) - BOGO on weekend movie screenings, Silverbird Cinemas, expires in 3 days
- "VIP Festival Pass Discount" (FESTVIPH) - 30% off VIP access to Afrochella, Afrochella, expires in 10 days
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a helpful deals assistant for a marketplace platform in Ghana. Your job is to help users find the best deals, coupons, and promo codes based on their needs.

Here are the current available deals:
${dealsContext}

Instructions:
- Analyze the user's query to understand what they're looking for
- Recommend the most relevant deals based on their needs
- Always include the promo code in your response
- Mention expiration dates so users know urgency
- Be friendly and conversational
- If no deals match, suggest related alternatives
- Keep responses concise but helpful
- Format your response with clear sections if recommending multiple deals
- Use emojis sparingly to make responses engaging`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I couldn't find any matching deals. Try a different search!";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Smart search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
