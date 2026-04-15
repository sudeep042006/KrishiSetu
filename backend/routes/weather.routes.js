import express from 'express';
// We use ES Modules due to frontend/backend configurations (node version and package.jsons typically use fetch natively in newer nodes)

const router = express.Router();

router.post('/insights', async (req, res) => {
    try {
        const { weatherData, aqiData } = req.body;
        
        if (!process.env.DEEPSEEK_API_KEY) {
            return res.status(500).json({ success: false, message: "DEEPSEEK_API_KEY is not configured in backend .env" });
        }

        const prompt = `
        You are an expert agricultural assistant.
        The current weather conditions are: ${JSON.stringify(weatherData)}.
        The area's Air Quality Index is: ${JSON.stringify(aqiData)}.
        
        Based on this weather data, provide brief, actionable farming and crop suggestions in 2-3 short sentences. Focus on immediate things the farmer should consider (like if to water, plant, protect from frost or heat, and what crops might thrive right now). Keep it simple, friendly, and direct.`;

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are a professional agricultural advisor." },
                    { role: "user", content: prompt }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Deepseek error", err);
            return res.status(response.status).json({ success: false, message: "Error fetching suggestions from DeepSeek." });
        }

        const data = await response.json();
        const suggestion = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

        res.status(200).json({ success: true, suggestion });
    } catch (error) {
        console.error("Error in /insights:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

export default router;
