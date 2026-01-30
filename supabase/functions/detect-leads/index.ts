import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Lead {
  fetchedContentId: string;
  sourceId: string;
  sourceUrl: string;
  matchedKeywords: string[];
  snippet: string;
  confidenceScore: number;
}

interface AlertSettings {
  user_id: string;
  email_enabled: boolean;
  email_address: string | null;
  whatsapp_enabled: boolean;
  whatsapp_number: string | null;
  in_app_enabled: boolean;
}

// Extract relevant snippet around matched keyword
function extractSnippet(text: string, keyword: string, contextChars: number = 150): string {
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const index = lowerText.indexOf(lowerKeyword);
  
  if (index === -1) return text.substring(0, contextChars * 2);
  
  const start = Math.max(0, index - contextChars);
  const end = Math.min(text.length, index + keyword.length + contextChars);
  
  let snippet = text.substring(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  
  return snippet;
}

// Send email notification
async function sendEmailAlert(
  resend: Resend,
  email: string,
  leads: Lead[]
): Promise<void> {
  const leadsList = leads
    .map(
      (lead) =>
        `<li>
          <strong>Keywords:</strong> ${lead.matchedKeywords.join(", ")}<br/>
          <strong>Source:</strong> <a href="${lead.sourceUrl}">${lead.sourceUrl}</a><br/>
          <strong>Snippet:</strong> ${lead.snippet}
        </li>`
    )
    .join("");

  await resend.emails.send({
    from: "Lead Alerts <alerts@lovable.dev>",
    to: [email],
    subject: `🔥 ${leads.length} New Lead${leads.length > 1 ? "s" : ""} Detected!`,
    html: `
      <h1>New Buyer Intent Signals Detected</h1>
      <p>The AI Demand Scanner found ${leads.length} potential lead${leads.length > 1 ? "s" : ""}:</p>
      <ul>${leadsList}</ul>
      <p>Log in to your admin dashboard to review these leads.</p>
    `,
  });
}

// Generate WhatsApp message link
function generateWhatsAppMessage(leads: Lead[]): string {
  const message = `🔥 ${leads.length} New Lead${leads.length > 1 ? "s" : ""} Detected!\n\n` +
    leads.slice(0, 3).map((lead, i) => 
      `${i + 1}. Keywords: ${lead.matchedKeywords.slice(0, 3).join(", ")}\nSource: ${lead.sourceUrl}`
    ).join("\n\n") +
    (leads.length > 3 ? `\n\n...and ${leads.length - 3} more leads` : "");
  
  return encodeURIComponent(message);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // Fetch all keywords
    const { data: keywords, error: keywordsError } = await supabase
      .from("keywords")
      .select("keyword, category");

    if (keywordsError) {
      console.error("Error fetching keywords:", keywordsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch keywords" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!keywords || keywords.length === 0) {
      console.log("No keywords configured");
      return new Response(
        JSON.stringify({ message: "No keywords configured", leadsFound: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch unprocessed content (successful fetches that haven't been analyzed)
    const { data: content, error: contentError } = await supabase
      .from("fetched_content")
      .select("id, source_id, source_url, raw_text")
      .eq("status", "success")
      .not("raw_text", "is", null);

    if (contentError) {
      console.error("Error fetching content:", contentError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!content || content.length === 0) {
      console.log("No content to analyze");
      return new Response(
        JSON.stringify({ message: "No content to analyze", leadsFound: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing ${content.length} content items with ${keywords.length} keywords`);

    const newLeads: Lead[] = [];
    const productKeywords = keywords.filter((k) => k.category === "product").map((k) => k.keyword.toLowerCase());
    const intentKeywords = keywords.filter((k) => k.category === "intent").map((k) => k.keyword.toLowerCase());

    // Analyze each content item
    for (const item of content) {
      if (!item.raw_text) continue;
      
      const text = item.raw_text.toLowerCase();
      const matchedProducts: string[] = [];
      const matchedIntents: string[] = [];

      // Check for product keywords
      for (const keyword of productKeywords) {
        if (text.includes(keyword)) {
          matchedProducts.push(keyword);
        }
      }

      // Check for intent keywords
      for (const keyword of intentKeywords) {
        if (text.includes(keyword)) {
          matchedIntents.push(keyword);
        }
      }

      // Only create lead if both product and intent keywords found
      if (matchedProducts.length > 0 && matchedIntents.length > 0) {
        const allMatched = [...matchedProducts, ...matchedIntents];
        const snippet = extractSnippet(item.raw_text, matchedProducts[0]);
        const confidenceScore = Math.min(100, (matchedProducts.length + matchedIntents.length) * 15);

        // Check if lead already exists for this content
        const { data: existingLead } = await supabase
          .from("leads")
          .select("id")
          .eq("fetched_content_id", item.id)
          .limit(1);

        if (!existingLead || existingLead.length === 0) {
          newLeads.push({
            fetchedContentId: item.id,
            sourceId: item.source_id,
            sourceUrl: item.source_url,
            matchedKeywords: allMatched,
            snippet,
            confidenceScore,
          });
        }
      }
    }

    console.log(`Found ${newLeads.length} new leads`);

    if (newLeads.length === 0) {
      return new Response(
        JSON.stringify({ message: "No new leads found", leadsFound: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert new leads
    const { data: insertedLeads, error: insertError } = await supabase
      .from("leads")
      .insert(
        newLeads.map((lead) => ({
          fetched_content_id: lead.fetchedContentId,
          source_id: lead.sourceId,
          source_url: lead.sourceUrl,
          matched_keywords: lead.matchedKeywords,
          snippet: lead.snippet,
          confidence_score: lead.confidenceScore,
        }))
      )
      .select("id");

    if (insertError) {
      console.error("Error inserting leads:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save leads" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all admin users for notifications
    const { data: adminUsers, error: adminsError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminsError) {
      console.error("Error fetching admins:", adminsError);
    }

    const adminIds = adminUsers?.map((u) => u.user_id) || [];

    // Send notifications for each admin
    for (const adminId of adminIds) {
      // Fetch alert settings
      const { data: settings } = await supabase
        .from("alert_settings")
        .select("*")
        .eq("user_id", adminId)
        .maybeSingle();

      const alertSettings: AlertSettings = settings || {
        user_id: adminId,
        email_enabled: false,
        email_address: null,
        whatsapp_enabled: false,
        whatsapp_number: null,
        in_app_enabled: true,
      };

      // In-app notification
      if (alertSettings.in_app_enabled) {
        for (const lead of insertedLeads || []) {
          await supabase.from("notifications").insert({
            user_id: adminId,
            title: "New Lead Detected!",
            message: `Found buyer intent: ${newLeads[0]?.matchedKeywords.slice(0, 3).join(", ")}`,
            type: "lead",
            lead_id: lead.id,
          });
        }
      }

      // Email notification
      if (alertSettings.email_enabled && alertSettings.email_address && resend) {
        try {
          await sendEmailAlert(resend, alertSettings.email_address, newLeads);
          console.log(`Email sent to ${alertSettings.email_address}`);
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }

      // Mark leads as notified
      if (insertedLeads) {
        await supabase
          .from("leads")
          .update({ notified: true })
          .in("id", insertedLeads.map((l) => l.id));
      }
    }

    // For WhatsApp, we return the link in the response (client-side will open)
    const whatsappLinks: { number: string; link: string }[] = [];
    for (const adminId of adminIds) {
      const { data: settings } = await supabase
        .from("alert_settings")
        .select("whatsapp_enabled, whatsapp_number")
        .eq("user_id", adminId)
        .maybeSingle();

      if (settings?.whatsapp_enabled && settings?.whatsapp_number) {
        const message = generateWhatsAppMessage(newLeads);
        whatsappLinks.push({
          number: settings.whatsapp_number,
          link: `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}?text=${message}`,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Lead detection complete",
        leadsFound: newLeads.length,
        leadsInserted: insertedLeads?.length || 0,
        whatsappLinks,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
