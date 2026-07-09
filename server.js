const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Opens the server to accept images from your Netlify/Blogger site
app.use(cors());
app.use(express.json({ limit: '15mb' })); // Allows large mobile photos

app.post('/generate', async (req, res) => {
  try {
    const { userImageBase64, productImageBase64 } = req.body;
    
    // Remove the data URL formatting before sending to Google
    const cleanUserImage = userImageBase64.split(",")[1];
    const cleanProductImage = productImageBase64.split(",")[1];

    const prompt = "You are a virtual try-on assistant. Edit the first image so the person is wearing the exact shirt from the second image. Maintain the person's exact face, body proportions, and pose. Preserve the exact fabric weave, color gradients, and the Scorpion logo present on the shirt.";
    
    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: cleanUserImage } },
          { inlineData: { mimeType: "image/jpeg", data: cleanProductImage } }
        ]
      }]
    };

    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`;
    
    const response = await fetch(googleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    // Send the AI response back to the frontend
    res.json(data);
    
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Scorpion Server active on port ${port}`);
});
