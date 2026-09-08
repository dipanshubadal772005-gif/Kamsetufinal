const SYSTEM_PROMPT = `You are KAMSETU AI Assistant, a friendly support assistant for a household-services marketplace.

Your job is to help users understand and use KAMSETU. You can answer questions about services, finding professionals, booking, time slots, negotiation, payments, cancellations, rescheduling, profiles, messages, tracking, and general use of the website.

Language rules:
- Reply only in the language requested by the user: English or Hindi.
- If the user writes in Hindi, reply in Hindi.
- If the user writes in English, reply in English.
- If the user mixes Hindi and English (Hinglish), prefer simple Hindi with commonly understood English service/product terms unless the user clearly asks for English.
- Keep answers concise, friendly, and practical.

Important:
- Do not claim that you completed a booking, cancellation, payment, refund, negotiation, or other account action unless an actual application action has been performed.
- You are currently a support assistant, not an autonomous booking agent.
- If you do not know a KAMSETU-specific detail, say so instead of inventing it.
- Never ask for passwords, OTPs, card numbers, API keys, or other sensitive credentials.
- For emergencies or dangerous situations, advise the user to contact the appropriate local emergency service first.
`;

async function chatWithAI(req, res) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(503).json({
                success: false,
                message: "AI assistant is not configured. Add GEMINI_API_KEY to backend/.env."
            });
        }

        const message = String(req.body?.message || "").trim();

        const language =
            req.body?.language === "hi"
                ? "Hindi"
                : "English";

        const history = Array.isArray(req.body?.history)
            ? req.body.history
            : [];

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Please enter a message."
            });
        }

        const safeHistory = history
            .slice(-10)
            .filter(
                item =>
                    item &&
                    ["user", "assistant"].includes(item.role)
            )
            .map(item => ({
                role: item.role === "assistant"
                    ? "model"
                    : "user",
                parts: [
                    {
                        text: String(
                            item.content || ""
                        ).slice(0, 4000)
                    }
                ]
            }));

        const contents = [
            ...safeHistory,
            {
                role: "user",
                parts: [
                    {
                        text: message
                    }
                ]
            }
        ];

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-3.6-flash"}:generateContent?key=${apiKey}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    systemInstruction: {
                        parts: [
                            {
                                text:
                                    `${SYSTEM_PROMPT}\n\n` +
                                    `The user has selected ${language}. ` +
                                    `Answer only in ${language}.`
                            }
                        ]
                    },

                    contents,

                    generationConfig: {
                        maxOutputTokens: 500,
                        temperature: 0.7
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API error:", data);

            return res.status(502).json({
                success: false,
                message:
                    "AI service is temporarily unavailable. Please try again."
            });
        }

        const reply =
            data?.candidates?.[0]?.content?.parts
                ?.map(part => part.text || "")
                .join("")
                .trim();

        if (!reply) {
            console.error(
                "Gemini returned no text:",
                JSON.stringify(data, null, 2)
            );

            return res.status(502).json({
                success: false,
                message:
                    "The AI did not return a response. Please try again."
            });
        }

        return res.json({
            success: true,
            reply
        });

    } catch (error) {
        console.error("Gemini controller error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Unable to connect to the AI assistant."
        });
    }
}

module.exports = {
    chatWithAI
};