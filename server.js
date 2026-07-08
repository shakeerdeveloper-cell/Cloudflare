const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Allow requests from your website and increase the payload limit for images
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/generate', async (req, res) => {
  try {
    const { userImageBase64, productImageBase64 } = req.body;
    
    // Strip the data URL prefix
    const cleanUserImage = userImageBase64.split(",")[1];
    const cleanProductImage = productImageBase64.split(",")[1];

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

    // process.env.GOOGLE_API_KEY safely pulls your key from Render's secure vault
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${process.env.GOOGLE_API_KEY}`;
    
    const response = await fetch(googleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
