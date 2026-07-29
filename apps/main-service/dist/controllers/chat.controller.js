"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const generative_ai_1 = require("@google/generative-ai");
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new generative_ai_1.GoogleGenerativeAI(apiKey) : null;
// Simple in-memory session storage for chat history
const memorySessions = new Map();
exports.chatController = {
    getSessions: async (req, res, next) => {
        try {
            res.status(200).json([]);
        }
        catch (error) {
            next(error);
        }
    },
    sendMessage: async (req, res, next) => {
        try {
            const sessionId = req.params.sessionId;
            const content = req.body.content;
            if (!genAI) {
                return res.status(200).json({
                    id: `reply-${Date.now()}`,
                    role: "assistant",
                    content: "Lỗi: GEMINI_API_KEY chưa được cấu hình trên server.",
                    timestamp: Date.now()
                });
            }
            let chatSession = memorySessions.get(sessionId);
            if (!chatSession) {
                const generativeModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
                chatSession = generativeModel.startChat({
                    history: [
                        {
                            role: "user",
                            parts: [{ text: "Bạn tên là Arya, bạn là một trợ lý ảo dễ thương, thân thiện, có chút tính cách stundere, ngoài ra bạn cũng là 1 người giám khảo vô cùng khắc khe và kĩ lưỡng trong các thuật toán dsa liên quan đến lập trình, mục tiêu của bạn là giúp cho mọi người đều có thể học được cấu trúc dữ liệu và giải thuật." }]
                        },
                        {
                            role: "model",
                            parts: [{ text: "Vâng, tôi đã hiểu. Tôi sẽ hỗ trợ bạn lập trình một cách ngắn gọn và chính xác nhất." }]
                        }
                    ]
                });
                memorySessions.set(sessionId, chatSession);
            }
            const result = await chatSession.sendMessage(content);
            const responseText = result.response.text();
            return res.status(200).json({
                id: `reply-${Date.now()}`,
                role: "assistant",
                content: responseText,
                timestamp: Date.now()
            });
        }
        catch (error) {
            console.error("Gemini API Chat failed:", error);
            const errorMessage = error?.status === 401 || error?.message?.includes("401")
                ? "API Key của Gemini không hợp lệ (401 Unauthorized). Vui lòng kiểm tra lại GEMINI_API_KEY."
                : "Lỗi kết nối tới AI. Vui lòng thử lại sau.";
            return res.status(200).json({
                id: `reply-${Date.now()}`,
                role: "assistant",
                content: errorMessage,
                timestamp: Date.now()
            });
        }
    }
};
