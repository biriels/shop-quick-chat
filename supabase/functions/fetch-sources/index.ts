import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Rate limit: wait between requests (3 seconds)
const RATE_LIMIT_MS = 3000;

// Simple hash function for content deduplication
function hashContent(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// Check robots.txt to see if we can fetch the URL
async function checkRobotsTxt(url: string): Promise<boolean> {
  try {
    const parsedUrl = new URL(url);
    const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`;
    
    const response = await fetch(robotsUrl, {
      headers: {
        "User-Agent": "LovableDemandScanner/1.0 (respectful-bot)",
      },
    });
    
    if (!response.ok) {
      // No robots.txt, assume allowed
      await response.text();
      return true;
    }
    
    const robotsTxt = await response.text();
    const lines = robotsTxt.split("\n");
    let isRelevantAgent = false;
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      
      if (trimmed.startsWith("user-agent:")) {
        const agent = trimmed.replace("user-agent:", "").trim();
        isRelevantAgent = agent === "*" || agent.includes("lovable");
      }
      
      if (isRelevantAgent && trimmed.startsWith("disallow:")) {
        const disallowPath = trimmed.replace("disallow:", "").trim();
        if (disallowPath === "/" || parsedUrl.pathname.startsWith(disallowPath)) {
          console.log(`Robots.txt disallows: ${url}`);
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking robots.txt for ${url}:`, error);
    // On error, be cautious and allow
    return true;
  }
}

// Extract visible text from HTML
function extractVisibleText(html: string): string {
  // Remove script and style tags with their content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)));
  
  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim();
  
  // Limit to reasonable size (100KB)
  if (text.length > 100000) {
    text = text.substring(0, 100000);
  }
  
  return text;
}

// Fetch content from a single URL
async function fetchUrl(url: string): Promise<{ text: string | null; error: string | null }> {
  try {
    // Check robots.txt first
    const canFetch = await checkRobotsTxt(url);
    if (!canFetch) {
      return { text: null, error: "Blocked by robots.txt" };
    }
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "LovableDemandScanner/1.0 (respectful-bot; contact@lovable.dev)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
    });
    
    if (!response.ok) {
      await response.text();
      return { text: null, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      await response.text();
      return { text: null, error: `Unsupported content type: ${contentType}` };
    }
    
    const html = await response.text();
    const text = extractVisibleText(html);
    
    if (!text || text.length < 50) {
      return { text: null, error: "No meaningful content extracted" };
    }
    
    return { text, error: null };
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return { text: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Sleep function for rate limiting
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch active sources
    const { data: sources, error: sourcesError } = await supabase
      .from("sources")
      .select("*")
      .eq("active", true);

    if (sourcesError) {
      console.error("Error fetching sources:", sourcesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch sources" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!sources || sources.length === 0) {
      console.log("No active sources to fetch");
      return new Response(
        JSON.stringify({ message: "No active sources to fetch", fetched: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${sources.length} active sources to fetch`);

    const results: { sourceId: string; url: string; status: string; error?: string }[] = [];

    // Process each source with rate limiting
    for (const source of sources) {
      console.log(`Fetching: ${source.name} (${source.url})`);
      
      const { text, error } = await fetchUrl(source.url);
      
      const contentHash = text ? hashContent(text) : null;
      
      // Check if content has changed (skip if same hash exists)
      if (contentHash) {
        const { data: existing } = await supabase
          .from("fetched_content")
          .select("id")
          .eq("source_id", source.id)
          .eq("content_hash", contentHash)
          .limit(1);
        
        if (existing && existing.length > 0) {
          console.log(`Content unchanged for ${source.url}, skipping`);
          results.push({
            sourceId: source.id,
            url: source.url,
            status: "skipped",
            error: "Content unchanged",
          });
          await sleep(RATE_LIMIT_MS);
          continue;
        }
      }
      
      // Insert new content
      const { error: insertError } = await supabase
        .from("fetched_content")
        .insert({
          source_id: source.id,
          source_url: source.url,
          raw_text: text,
          status: error ? "failed" : "success",
          error_message: error,
          content_hash: contentHash,
        });

      if (insertError) {
        console.error(`Error inserting content for ${source.url}:`, insertError);
      }

      results.push({
        sourceId: source.id,
        url: source.url,
        status: error ? "failed" : "success",
        error: error || undefined,
      });

      // Rate limit between requests
      await sleep(RATE_LIMIT_MS);
    }

    const successful = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.filter((r) => r.status === "skipped").length;

    console.log(`Fetch complete: ${successful} success, ${failed} failed, ${skipped} skipped`);

    return new Response(
      JSON.stringify({
        message: "Fetch complete",
        total: sources.length,
        successful,
        failed,
        skipped,
        results,
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
