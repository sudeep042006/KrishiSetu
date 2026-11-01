import express from 'express';

const router = express.Router();

/**
 * Intelligent Rule-Based Agricultural Expert Fallback
 * Generates tailored advisory based on real-time weather and air quality metrics
 * when LLM APIs are offline or unconfigured.
 */
function generateAgriculturalFallback(weatherData, aqiData) {
    const temp = weatherData?.current?.temp_c ?? weatherData?.temp ?? 28;
    const humidity = weatherData?.current?.humidity ?? weatherData?.humidity ?? 60;
    const condition = (weatherData?.current?.condition?.text || weatherData?.condition || '').toLowerCase();
    const windKph = weatherData?.current?.wind_kph ?? weatherData?.wind ?? 10;
    const aqi = typeof aqiData === 'number' ? aqiData : (aqiData?.aqi || aqiData?.current?.us_epa_index || 50);

    const tips = [];

    // 1. Irrigation & Temperature Advice
    if (temp > 35) {
        tips.push(`High temperature (${temp}°C) detected; irrigate crops early morning or evening to prevent rapid moisture evaporation and heat stress.`);
    } else if (temp < 14) {
        tips.push(`Cool temperatures (${temp}°C) prevailing; reduce excessive watering and ensure soil is lightly moist to buffer against overnight cold stress.`);
    } else {
        tips.push(`Favorable temperature (${temp}°C) for vegetative growth; maintain regular crop irrigation schedules.`);
    }

    // 2. Rainfall & Chemical Spray Advice
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower') || condition.includes('thunder')) {
        tips.push('Rainfall expected; postpone foliar spraying and fertilizer broadcasting, and ensure proper field drainage to avoid root suffocation.');
    } else if (humidity > 78) {
        tips.push('High relative humidity increases fungal blight risk; inspect lower leaf surfaces and maintain row aeration.');
    } else if (windKph > 25) {
        tips.push(`Strong winds (${windKph} km/h); avoid pesticide dusting today to prevent chemical drift.`);
    } else {
        tips.push('Clear field conditions make this an optimal window for weeding, pest scouting, and harvesting mature produce.');
    }

    // 3. AQI / Protection Note
    if (aqi > 150) {
        tips.push('High particulate haze may slow down photosynthesis; consider light water spraying on leafy greens if dust builds up.');
    }

    return tips.join(' ');
}

router.post('/insights', async (req, res) => {
    try {
        const { weatherData, aqiData } = req.body;

        // If DeepSeek API key is configured, query DeepSeek with deepseek-chat
        if (process.env.DEEPSEEK_API_KEY) {
            try {
                const prompt = `You are a professional agricultural extension expert advising an Indian farmer.
The current local weather is: ${JSON.stringify(weatherData)}.
Air quality metrics: ${JSON.stringify(aqiData)}.
Provide 2-3 clear, practical, direct sentences on immediate farming actions (irrigation timing, spray precautions, disease prevention, or crop protection). Keep it helpful and concise.`;

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
                        max_tokens: 160,
                        temperature: 0.7
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const suggestion = data.choices?.[0]?.message?.content?.trim();
                    if (suggestion) {
                        return res.status(200).json({ success: true, suggestion, source: 'deepseek-ai' });
                    }
                } else {
                    const err = await response.text();
                    console.warn("DeepSeek API returned error status, falling back to smart agronomy engine:", response.status, err);
                }
            } catch (deepseekErr) {
                console.warn("DeepSeek request failed, falling back to agronomy engine:", deepseekErr.message);
            }
        }

        // Seamless, high-reliability fallback using rule-based agronomy engine
        const fallbackSuggestion = generateAgriculturalFallback(weatherData, aqiData);
        return res.status(200).json({
            success: true,
            suggestion: fallbackSuggestion,
            source: 'agri-engine-fallback'
        });

    } catch (error) {
        console.error("Error in /weather/insights:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

export default router;
