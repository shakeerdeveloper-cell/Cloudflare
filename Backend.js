export default {
  async fetch(request, env) {
    // Enable CORS so your website can communicate with this server
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Only POST requests allowed", { status: 405, headers: corsHeaders });
    }

    try {
      const { userImageBase64, productImageBase64 } = await request.json();

      // Remove the "data:image/jpeg;base64," prefix for the Google API
      const cleanUserImage = userImageBase64.split(",")[1];
      const cleanProductImage = productImageBase64.split(",")[1];

      // Build the payload for the Gemini Image model
      const prompt = "You are a virtual try-on assistant. Edit the first image so the person is wearing the exact shirt from the second image. Maintain the person's exact face, body proportions, and pose. Preserve the exact fabric weave, color gradients, and any custom apparel branding present on the shirt.";
      
      const payload = {
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: cleanUserImage } },
            { inlineData: { mimeType: "image/jpeg", data: cleanProductImage } }
          ]
        }]
      };

      // Ensure your Cloudflare Worker environment variable is named exactly GOOGLE_API_KEY
      const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${env.GOOGLE_API_KEY}`;
      
      const response = await fetch(googleUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // Return the generated image to your website
      return new Response(JSON.stringify(data), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};
