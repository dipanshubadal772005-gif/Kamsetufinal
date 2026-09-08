/* =====================================================
   KAMSETU AI ASSISTANT
   Chat + Hindi/English Voice Support
===================================================== */

(function () {
    "use strict";

    const API_BASE_URL = window.KAMSETU_API_URL;

    const state = {
        language: localStorage.getItem("KAMSETU_AI_LANGUAGE") || "en",
        history: [],
        listening: false,
        recognition: null,
        speaking: false
    };

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function addStylesheet() {
        if (document.querySelector('link[data-kamsetu-ai-css="true"]')) {
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = getAssetPath("ai-assistant.css");
        link.dataset.kamsetuAiCss = "true";
        document.head.appendChild(link);
    }

    function getAssetPath(file) {
        const path = window.location.pathname;

        if (path.includes("/provider/history/")) {
            return `../../${file}`;
        }

        if (path.includes("/customer/") || path.includes("/provider/")) {
            return `../${file}`;
        }

        return file;
    }

    function createAssistant() {
        if (document.getElementById("kamsetuAiButton")) {
            return;
        }

        addStylesheet();

        const button = document.createElement("button");
        button.id = "kamsetuAiButton";
        button.type = "button";
        button.setAttribute("aria-label", "Open KAMSETU AI Assistant");
        button.innerHTML = `
            <span class="kamsetu-ai-button-icon">🤖</span>
            <span class="kamsetu-ai-button-text">AI Assistant</span>
        `;

        const panel = document.createElement("section");
        panel.id = "kamsetuAiPanel";
        panel.setAttribute("aria-label", "KAMSETU AI Assistant");
        panel.innerHTML = `
            <div class="kamsetu-ai-header">
                <div class="kamsetu-ai-title">
                    <div class="kamsetu-ai-avatar">🤖</div>
                    <div>
                        <strong>KAMSETU AI</strong>
                        <span>Chat & Voice Support</span>
                    </div>
                </div>

                <div class="kamsetu-ai-header-actions">
                    <select id="kamsetuAiLanguage" class="kamsetu-ai-language" aria-label="Assistant language">
                        <option value="en">English</option>
                        <option value="hi">हिन्दी</option>
                    </select>
                    <button id="kamsetuAiStop" type="button" title="Stop speaking">■</button>
                    <button id="kamsetuAiClose" type="button" title="Close">×</button>
                </div>
            </div>

            <div id="kamsetuAiMessages" class="kamsetu-ai-messages"></div>

            <div class="kamsetu-ai-composer">
                <div class="kamsetu-ai-input-wrap">
                    <input
                        id="kamsetuAiInput"
                        type="text"
                        autocomplete="off"
                        placeholder="Ask KAMSETU anything..."
                    >
                    <button id="kamsetuAiMic" class="kamsetu-ai-icon-button" type="button" title="Speak">🎙️</button>
                    <button id="kamsetuAiSend" class="kamsetu-ai-icon-button" type="button" title="Send">➤</button>
                </div>
                <div class="kamsetu-ai-note">Voice supports Hindi and English.</div>
            </div>
        `;

        document.body.appendChild(button);
        document.body.appendChild(panel);

        const languageSelect = document.getElementById("kamsetuAiLanguage");
        languageSelect.value = state.language;

        button.addEventListener("click", function () {
            panel.classList.toggle("open");

            if (panel.classList.contains("open")) {
                document.getElementById("kamsetuAiInput")?.focus();
            }
        });

        document.getElementById("kamsetuAiClose").addEventListener("click", function () {
            panel.classList.remove("open");
            stopListening();
        });

        document.getElementById("kamsetuAiStop").addEventListener("click", stopSpeaking);
        document.getElementById("kamsetuAiSend").addEventListener("click", sendCurrentMessage);
        document.getElementById("kamsetuAiMic").addEventListener("click", toggleVoiceInput);

        document.getElementById("kamsetuAiInput").addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                sendCurrentMessage();
            }
        });

        languageSelect.addEventListener("change", function () {
            state.language = this.value === "hi" ? "hi" : "en";
            localStorage.setItem("KAMSETU_AI_LANGUAGE", state.language);
            updateInputPlaceholder();
        });

        addWelcomeMessage();
        setupSpeechRecognition();
        updateInputPlaceholder();
    }

    function addWelcomeMessage() {
        const text = state.language === "hi"
            ? "नमस्ते! मैं KAMSETU AI Assistant हूँ। आप KAMSETU की services, booking, negotiation, time slots, tracking या किसी भी सामान्य मदद के बारे में पूछ सकते हैं।"
            : "Hi! I’m the KAMSETU AI Assistant. Ask me about services, booking, negotiation, time slots, tracking, or anything you need help with.";

        addMessage("assistant", text, false);
    }

    function updateInputPlaceholder() {
        const input = document.getElementById("kamsetuAiInput");

        if (!input) {
            return;
        }

        input.placeholder = state.language === "hi"
            ? "KAMSETU के बारे में पूछें..."
            : "Ask KAMSETU anything...";
    }

    function addMessage(role, text, saveToHistory = true) {
        const messages = document.getElementById("kamsetuAiMessages");

        if (!messages) {
            return;
        }

        const message = document.createElement("div");
        message.className = `kamsetu-ai-message ${role}`;
        message.textContent = text;
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;

        if (saveToHistory && (role === "user" || role === "assistant")) {
            state.history.push({
                role,
                content: String(text).slice(0, 4000)
            });

            if (state.history.length > 10) {
                state.history = state.history.slice(-10);
            }
        }

        return message;
    }

    function addTypingMessage() {
        const messages = document.getElementById("kamsetuAiMessages");

        if (!messages) {
            return null;
        }

        const message = document.createElement("div");
        message.className = "kamsetu-ai-message assistant";
        message.id = "kamsetuAiTyping";
        message.innerHTML = `
            <span class="kamsetu-ai-typing">
                <i></i><i></i><i></i>
            </span>
        `;

        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;

        return message;
    }

    async function sendCurrentMessage() {
        const input = document.getElementById("kamsetuAiInput");
        const sendButton = document.getElementById("kamsetuAiSend");

        if (!input || !sendButton) {
            return;
        }

        const message = input.value.trim();

        if (!message) {
            return;
        }

        stopListening();
        stopSpeaking();

        input.value = "";
        input.disabled = true;
        sendButton.disabled = true;

        addMessage("user", message);
        const typing = addTypingMessage();

        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message,
                    language: state.language,
                    history: state.history.slice(-10)
                })
            });

            const data = await response.json().catch(function () {
                return {};
            });

            if (typing) {
                typing.remove();
            }

            if (!response.ok || !data.success) {
                throw new Error(data.message || "AI assistant is unavailable.");
            }

            addMessage("assistant", data.reply);
            speakText(data.reply);
        } catch (error) {
            if (typing) {
                typing.remove();
            }

            const fallback = state.language === "hi"
                ? "AI Assistant से अभी connection नहीं हो पाया। कृपया backend और OPENAI_API_KEY check करके फिर कोशिश करें।"
                : "I could not connect to the AI Assistant right now. Please check the backend and OPENAI_API_KEY, then try again.";

            const errorMessage = error.message || fallback;
            addMessage("assistant", errorMessage, false);
        } finally {
            input.disabled = false;
            sendButton.disabled = false;
            input.focus();
        }
    }

    function setupSpeechRecognition() {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = function () {
            state.listening = true;
            const mic = document.getElementById("kamsetuAiMic");
            if (mic) {
                mic.classList.add("listening");
                mic.textContent = "⏹";
                mic.title = "Stop listening";
            }
        };

        recognition.onresult = function (event) {
            const input = document.getElementById("kamsetuAiInput");

            if (!input) {
                return;
            }

            const transcript = event.results?.[0]?.[0]?.transcript || "";
            input.value = transcript;

            if (transcript.trim()) {
                sendCurrentMessage();
            }
        };

        recognition.onerror = function (event) {
            console.warn("Speech recognition error:", event.error);
        };

        recognition.onend = function () {
            state.listening = false;
            const mic = document.getElementById("kamsetuAiMic");

            if (mic) {
                mic.classList.remove("listening");
                mic.textContent = "🎙️";
                mic.title = "Speak";
            }
        };

        state.recognition = recognition;
    }

    function toggleVoiceInput() {
        if (!state.recognition) {
            const message = state.language === "hi"
                ? "आपके browser में voice recognition उपलब्ध नहीं है। Chrome में microphone permission के साथ कोशिश करें।"
                : "Voice recognition is not available in this browser. Try Chrome with microphone permission enabled.";

            addMessage("assistant", message, false);
            return;
        }

        if (state.listening) {
            stopListening();
            return;
        }

        stopSpeaking();

        state.recognition.lang = state.language === "hi"
            ? "hi-IN"
            : "en-IN";

        try {
            state.recognition.start();
        } catch (error) {
            console.warn("Could not start speech recognition:", error);
        }
    }

    function stopListening() {
        if (!state.recognition || !state.listening) {
            return;
        }

        try {
            state.recognition.stop();
        } catch (error) {
            console.warn("Could not stop speech recognition:", error);
        }
    }

    function speakText(text) {
        if (!window.speechSynthesis || !text) {
            return;
        }

        stopSpeaking();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = state.language === "hi" ? "hi-IN" : "en-IN";
        utterance.rate = 0.95;
        utterance.pitch = 1;

        const voices = window.speechSynthesis.getVoices();
        const prefix = state.language === "hi" ? "hi" : "en";
        const preferred = voices.find(function (voice) {
            return voice.lang && voice.lang.toLowerCase().startsWith(prefix);
        });

        if (preferred) {
            utterance.voice = preferred;
        }

        utterance.onstart = function () {
            state.speaking = true;
        };

        utterance.onend = function () {
            state.speaking = false;
        };

        utterance.onerror = function () {
            state.speaking = false;
        };

        window.speechSynthesis.speak(utterance);
    }

    function stopSpeaking() {
        if (!window.speechSynthesis) {
            return;
        }

        window.speechSynthesis.cancel();
        state.speaking = false;
    }

    document.addEventListener("DOMContentLoaded", createAssistant);
})();
