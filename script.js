// ============================================
// NOVA AI - COMPLETE JAVASCRIPT
// ============================================

// Global Configuration
const NovaConfig = {
    AI_MODELS: {
        deepseek: {
            name: "DeepSeek",
            icon: "fa-bolt",
            color: "#667eea",
            description: "Fast & Technical",
            responseStyle: "technical"
        },
        chatgpt: {
            name: "ChatGPT",
            icon: "fa-comment",
            color: "#10a37f",
            description: "Creative & Detailed",
            responseStyle: "creative"
        },
        grok: {
            name: "Grok",
            icon: "fa-fire",
            color: "#f97316",
            description: "Direct & Witty",
            responseStyle: "direct"
        },
        claude: {
            name: "Claude",
            icon: "fa-leaf",
            color: "#10b981",
            description: "Thoughtful & Safe",
            responseStyle: "thoughtful"
        }
    },
    
    RESPONSE_STYLES: {
        balanced: { speed: 1.0, creativity: 0.5, detail: 0.5 },
        creative: { speed: 0.8, creativity: 0.9, detail: 0.7 },
        precise: { speed: 1.2, creativity: 0.2, detail: 0.9 }
    },
    
    DEFAULT_SETTINGS: {
        theme: "light",
        autoScroll: true,
        markdown: true,
        ttsEnabled: false,
        voiceEnabled: false,
        responseSpeed: "balanced",
        selectedModel: "deepseek"
    }
};

// ============================================
// CORE AI MODULE
// ============================================

const NovaAI = {
    currentModel: "deepseek",
    responseStyle: "balanced",
    isThinking: false,
    
    init() {
        this.currentModel = NovaStorage.getSetting("selectedModel") || "deepseek";
        this.responseStyle = NovaStorage.getSetting("responseSpeed") || "balanced";
        this.updateUI();
    },
    
    selectModel(modelId) {
        if (this.isThinking) return;
        
        this.currentModel = modelId;
        NovaStorage.saveSetting("selectedModel", modelId);
        
        // Update UI
        document.querySelectorAll(".ai-model").forEach(el => {
            el.classList.toggle("active", el.dataset.model === modelId);
        });
        
        document.querySelectorAll(".model-badge").forEach(el => {
            el.classList.toggle("active", el.dataset.model === modelId);
        });
        
        const model = NovaConfig.AI_MODELS[modelId];
        document.getElementById("currentModelName").textContent = model.name;
        document.getElementById("currentModel").textContent = model.name;
        document.getElementById("typingText").textContent = `${model.name} is thinking...`;
        
        NovaUI.showNotification(`Switched to ${model.name}`);
        this.updateStats();
    },
    
    setResponseStyle(style) {
        this.responseStyle = style;
        NovaStorage.saveSetting("responseSpeed", style);
        
        // Update UI
        document.querySelectorAll(".response-option").forEach(el => {
            el.classList.toggle("active", el.textContent.toLowerCase().includes(style));
        });
        
        document.getElementById("responseSpeed").textContent = 
            style === "balanced" ? "Balanced Mode" : 
            style === "creative" ? "Creative Mode" : "Precise Mode";
        
        NovaUI.showNotification(`Response style: ${style}`);
    },
    
    setSpeed(speed) {
        this.responseStyle = speed;
        this.setResponseStyle(speed);
    },
    
    async generateResponse(userMessage) {
        this.isThinking = true;
        const startTime = Date.now();
        
        const model = NovaConfig.AI_MODELS[this.currentModel];
        const style = NovaConfig.RESPONSE_STYLES[this.responseStyle];
        
        // Simulate AI thinking based on speed
        const thinkTime = Math.random() * 1000 + (style.speed * 500);
        await new Promise(resolve => setTimeout(resolve, thinkTime));
        
        // Generate response based on model and style
        let response = this.generateSmartResponse(userMessage, model, style);
        
        this.isThinking = false;
        const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);
        
        // Update stats
        this.updateResponseTime(responseTime);
        this.updateTokenCount(response.length);
        
        return response;
    },
    
    generateSmartResponse(message, model, style) {
        const responses = {
            deepseek: {
                technical: `As DeepSeek AI, I'll analyze "${message}" from a technical perspective. The core concepts involve...`,
                creative: `DeepSeek here! "${message}" - that's an interesting topic. Let me explore some creative angles...`,
                direct: `DeepSeek analysis: "${message}". Key points:`
            },
            chatgpt: {
                creative: `ChatGPT here! Regarding "${message}", I'd like to provide a comprehensive and creative perspective...`,
                technical: `From ChatGPT's perspective on "${message}", the technical aspects include...`,
                thoughtful: `Thinking about "${message}" carefully, there are several important considerations...`
            },
            grok: {
                direct: `Grok here! "${message}" - straight talk:`,
                witty: `Grok says: "${message}"? Let me give you the unfiltered version with some wit...`,
                creative: `Alright, "${message}" - here's a Grok-style creative take...`
            },
            claude: {
                thoughtful: `As Claude AI, I approach "${message}" with careful consideration. Important aspects include...`,
                technical: `Claude analysis of "${message}" from a technical and ethical standpoint:`,
                creative: `Regarding "${message}", Claude would suggest these creative approaches...`
            }
        };
        
        // Fallback responses
        const fallbacks = [
            `Thanks for asking about "${message}". Based on my analysis as ${model.name}, here's what I think...`,
            `Interesting question about "${message}". As ${model.name}, I'd approach it like this...`,
            `Regarding "${message}", ${model.name} perspective suggests the following...`,
            `Let me help you with "${message}". From ${model.name}'s viewpoint...`,
            `"${message}" is a great topic. ${model.name} analysis indicates...`
        ];
        
        const modelResponses = responses[this.currentModel];
        const styleKey = model.responseStyle || "balanced";
        const baseResponse = modelResponses ? modelResponses[styleKey] || modelResponses[Object.keys(modelResponses)[0]] : null;
        
        if (baseResponse) {
            return baseResponse + " " + this.enhanceResponse(message, style);
        }
        
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    },
    
    enhanceResponse(message, style) {
        const enhancements = {
            creative: [
                "Would you like me to elaborate on any specific aspect?",
                "I could also explore alternative approaches if you're interested.",
                "This topic reminds me of related concepts that might interest you.",
                "Let me know if you'd like a more detailed breakdown."
            ],
            technical: [
                "The technical implementation would involve these key components.",
                "From an engineering perspective, the challenges include...",
                "The algorithm behind this typically follows these steps.",
                "Optimization strategies for this would include..."
            ],
            thoughtful: [
                "It's important to consider the ethical implications as well.",
                "Different perspectives might view this differently.",
                "This raises interesting questions about...",
                "We should also think about the long-term implications."
            ],
            direct: [
                "That's the core of it.",
                "No sugar-coating: that's the reality.",
                "Bottom line: that's what matters.",
                "Simply put: that's the situation."
            ]
        };
        
        const styleKey = this.responseStyle;
        const styleEnhancements = enhancements[styleKey] || enhancements.balanced || enhancements.creative;
        return styleEnhancements[Math.floor(Math.random() * styleEnhancements.length)];
    },
    
    updateResponseTime(time) {
        document.getElementById("responseTime").textContent = `${time}s`;
        NovaStats.recordResponseTime(time);
    },
    
    updateTokenCount(length) {
        const tokens = Math.ceil(length / 4);
        document.getElementById("tokenCount").textContent = `${tokens} tokens`;
        NovaStats.addTokens(tokens);
    },
    
    updateUI() {
        const model = NovaConfig.AI_MODELS[this.currentModel];
        if (!model) return;
        
        document.getElementById("currentModelName").textContent = model.name;
        document.getElementById("currentModel").textContent = model.name;
        document.getElementById("typingText").textContent = `${model.name} is thinking...`;
    },
    
    updateStats() {
        NovaStats.updateDisplay();
    }
};

// ============================================
// CHAT MODULE
// ============================================

const NovaChat = {
    messages: [],
    isTyping: false,
    
    init() {
        this.loadMessages();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Enter key handling
        document.getElementById("messageInput").addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        document.getElementById("messageInput").addEventListener("input", function() {
            this.style.height = "auto";
            this.style.height = Math.min(this.scrollHeight, 120) + "px";
        });
    },
    
    handleKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    },
    
    async sendMessage() {
        const input = document.getElementById("messageInput");
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Clear input
        input.value = "";
        input.style.height = "auto";
        input.focus();
        
        // Add user message
        this.addMessage(message, "user", "You");
        
        // Show typing indicator
        this.showTyping();
        
        // Generate AI response
        try {
            const response = await NovaAI.generateResponse(message);
            
            // Hide typing indicator
            this.hideTyping();
            
            // Add AI response
            this.addMessage(response, "ai", NovaConfig.AI_MODELS[NovaAI.currentModel].name);
            
            // Speak if TTS is enabled
            if (NovaTTS.isEnabled()) {
                NovaTTS.speak(response);
            }
            
        } catch (error) {
            this.hideTyping();
            this.addMessage("Sorry, I encountered an error. Please try again.", "ai", "Nova AI");
            console.error("Chat error:", error);
        }
    },
    
    addMessage(text, type, sender) {
        const messagesContainer = document.getElementById("messagesContainer");
        const messageId = "msg_" + Date.now();
        
        // Hide welcome screen if it's the first message
        if (this.messages.length === 0) {
            document.getElementById("welcomeScreen").style.display = "none";
        }
        
        // Create message element
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${type}`;
        messageDiv.id = messageId;
        
        const time = new Date().toLocaleTimeString([], { 
            hour: "2-digit", 
            minute: "2-digit" 
        });
        
        // Format message with markdown if enabled
        const formattedText = NovaStorage.getSetting("markdown") ? 
            this.formatMarkdown(text) : text;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${type === "user" ? "user" : "robot"}"></i>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${sender}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-text">${formattedText}</div>
                <div class="message-actions">
                    <button class="message-action-btn" onclick="NovaChat.copyMessage('${messageId}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="message-action-btn" onclick="NovaChat.speakMessage('${messageId}')">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    ${type === "ai" ? `
                    <button class="message-action-btn" onclick="NovaChat.regenerateMessage('${messageId}')">
                        <i class="fas fa-redo"></i>
                    </button>
                    ` : ""}
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        
        // Save message
        this.messages.push({
            id: messageId,
            text: text,
            formatted: formattedText,
            type: type,
            sender: sender,
            time: time,
            timestamp: Date.now(),
            model: type === "ai" ? NovaAI.currentModel : null
        });
        
        // Auto-scroll if enabled
        if (NovaStorage.getSetting("autoScroll")) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Save to storage
        this.saveMessages();
        
        // Update stats
        document.getElementById("statMessages").textContent = this.messages.length;
        NovaStats.addMessage();
    },
    
    formatMarkdown(text) {
        // Convert markdown to HTML
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/# (.*?)(?=\n|$)/g, '<h3>$1</h3>')
            .replace(/## (.*?)(?=\n|$)/g, '<h4>$1</h4>')
            .replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>')
            .replace(/\n/g, '<br>');
        
        // Wrap lists
        html = html.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
        
        return html;
    },
    
    showTyping() {
        this.isTyping = true;
        document.getElementById("typingIndicator").classList.add("visible");
        document.getElementById("sendButton").disabled = true;
    },
    
    hideTyping() {
        this.isTyping = false;
        document.getElementById("typingIndicator").classList.remove("visible");
        document.getElementById("sendButton").disabled = false;
    },
    
    copyMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            navigator.clipboard.writeText(message.text).then(() => {
                NovaUI.showNotification("Message copied to clipboard!");
            });
        }
    },
    
    speakMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            NovaTTS.speak(message.text);
        }
    },
    
    regenerateMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message && message.type === "user") {
            document.getElementById("messageInput").value = message.text;
            NovaUI.showNotification("Message loaded for regeneration");
        }
    },
    
    usePrompt(prompt) {
        document.getElementById("messageInput").value = prompt;
        document.getElementById("messageInput").focus();
        NovaUI.showNotification("Prompt loaded - press Enter to send");
    },
    
    clear() {
        if (this.messages.length === 0) return;
        
        if (confirm("Are you sure you want to clear all messages?")) {
            this.messages = [];
            document.getElementById("messagesContainer").innerHTML = "";
            document.getElementById("welcomeScreen").style.display = "block";
            NovaStorage.saveMessages([]);
            NovaUI.showNotification("Chat cleared");
            
            // Reset stats
            document.getElementById("statMessages").textContent = "0";
        }
    },
    
    export() {
        if (this.messages.length === 0) {
            NovaUI.showNotification("No messages to export");
            return;
        }
        
        let exportText = `Nova AI Chat Export\n`;
        exportText += `Generated: ${new Date().toLocaleString()}\n`;
        exportText += `Model: ${NovaConfig.AI_MODELS[NovaAI.currentModel].name}\n`;
        exportText += `=================================\n\n`;
        
        this.messages.forEach(msg => {
            exportText += `[${msg.time}] ${msg.sender}:\n`;
            exportText += `${msg.text}\n\n`;
        });
        
        const blob = new Blob([exportText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nova-ai-chat-${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        NovaUI.showNotification("Chat exported successfully!");
    },
    
    showHistory() {
        // In a real app, this would show a history modal
        NovaUI.showNotification("Chat history feature coming soon!");
    },
    
    isEmpty() {
        return this.messages.length === 0;
    },
    
    saveMessages() {
        NovaStorage.saveMessages(this.messages);
    },
    
    loadMessages() {
        const saved = NovaStorage.loadMessages();
        if (saved && saved.length > 0) {
            this.messages = saved;
            
            // Re-render messages
            const messagesContainer = document.getElementById("messagesContainer");
            messagesContainer.innerHTML = "";
            
            saved.forEach(msg => {
                const messageDiv = document.createElement("div");
                messageDiv.className = `message ${msg.type}`;
                messageDiv.id = msg.id;
                
                messageDiv.innerHTML = `
                    <div class="message-avatar">
                        <i class="fas fa-${msg.type === "user" ? "user" : "robot"}"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">${msg.sender}</span>
                            <span class="message-time">${msg.time}</span>
                        </div>
                        <div class="message-text">${msg.formatted}</div>
                        <div class="message-actions">
                            <button class="message-action-btn" onclick="NovaChat.copyMessage('${msg.id}')">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="message-action-btn" onclick="NovaChat.speakMessage('${msg.id}')">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            ${msg.type === "ai" ? `
                            <button class="message-action-btn" onclick="NovaChat.regenerateMessage('${msg.id}')">
                                <i class="fas fa-redo"></i>
                            </button>
                            ` : ""}
                        </div>
                    </div>
                `;
                
                messagesContainer.appendChild(messageDiv);
            });
            
            // Hide welcome screen
            document.getElementById("welcomeScreen").style.display = "none";
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
};

// ============================================
// VOICE MODULE
// ============================================

const NovaVoice = {
    recognition: null,
    isListening: false,
    interimTranscript: "",
    
    init() {
        this.setupSpeechRecognition();
        this.updateUI();
    },
    
    setupSpeechRecognition() {
        if (!("webkitSpeechRecognition" in window)) {
            console.warn("Speech recognition not supported");
            return;
        }
        
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US";
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI();
            NovaUI.showNotification("🎤 Listening... Speak now");
        };
        
        this.recognition.onresult = (event) => {
            this.interimTranscript = "";
            let finalTranscript = "";
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    this.interimTranscript += transcript;
                }
            }
            
            if (finalTranscript) {
                this.handleVoiceInput(finalTranscript);
            }
            
            // Update UI with interim results
            document.getElementById("voiceText").textContent = 
                this.interimTranscript || "Listening... Speak now";
        };
        
        this.recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === "no-speech") {
                NovaUI.showNotification("No speech detected");
            } else if (event.error === "audio-capture") {
                NovaUI.showNotification("No microphone found");
            } else if (event.error === "not-allowed") {
                NovaUI.showNotification("Microphone access denied");
            }
            this.stopRecognition();
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI();
        };
    },
    
    toggleRecognition() {
        if (this.isListening) {
            this.stopRecognition();
        } else {
            this.startRecognition();
        }
    },
    
    startRecognition() {
        if (!this.recognition) {
            NovaUI.showNotification("Voice recognition not supported");
            return;
        }
        
        try {
            this.recognition.start();
            document.getElementById("voiceIndicator").classList.add("visible");
        } catch (error) {
            console.error("Failed to start recognition:", error);
            NovaUI.showNotification("Failed to start voice recognition");
        }
    },
    
    stopRecognition() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            document.getElementById("voiceIndicator").classList.remove("visible");
            NovaUI.showNotification("Voice input stopped");
        }
    },
    
    handleVoiceInput(text) {
        if (!text.trim()) return;
        
        // Update input field
        const input = document.getElementById("messageInput");
        input.value = text;
        input.style.height = "auto";
        input.style.height = Math.min(input.scrollHeight, 120) + "px";
        
        // Auto-send after 1 second of silence
        setTimeout(() => {
            if (this.interimTranscript === "") {
                NovaChat.sendMessage();
                this.stopRecognition();
            }
        }, 1000);
    },
    
    sendVoiceMessage() {
        const input = document.getElementById("messageInput");
        const text = input.value.trim();
        
        if (text) {
            NovaChat.sendMessage();
            this.stopRecognition();
        }
    },
    
    updateUI() {
        const voiceBtn = document.getElementById("voiceToggle");
        const voiceStatus = document.getElementById("voiceStatus");
        
        if (this.isListening) {
            voiceBtn.classList.add("active");
            voiceStatus.textContent = "●";
            voiceStatus.style.color = "#ef4444";
        } else {
            voiceBtn.classList.remove("active");
            voiceStatus.textContent = "";
        }
    }
};

// ============================================
// TEXT-TO-SPEECH MODULE
// ============================================

const NovaTTS = {
    synth: null,
    voices: [],
    isEnabled: false,
    
    init() {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        this.isEnabled = NovaStorage.getSetting("ttsEnabled") || false;
        this.updateUI();
        
        // Listen for voices loaded
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
    },
    
    loadVoices() {
        this.voices = this.synth.getVoices();
    },
    
    toggle() {
        this.isEnabled = !this.isEnabled;
        NovaStorage.saveSetting("ttsEnabled", this.isEnabled);
        this.updateUI();
        
        NovaUI.showNotification(
            this.isEnabled ? "🔊 Text-to-speech enabled" : "Text-to-speech disabled"
        );
    },
    
    isEnabled() {
        return this.isEnabled;
    },
    
    speak(text) {
        if (!this.isEnabled || !this.synth || !text) return;
        
        // Cancel any ongoing speech
        if (this.synth.speaking) {
            this.synth.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure voice
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Try to find a good voice
        const preferredVoices = [
            "Google US English",
            "Microsoft David",
            "Microsoft Zira",
            "Samantha"
        ];
        
        const voice = this.voices.find(v => 
            preferredVoices.some(p => v.name.includes(p))
        ) || this.voices[0];
        
        if (voice) {
            utterance.voice = voice;
        }
        
        this.synth.speak(utterance);
    },
    
    updateUI() {
        const ttsBtn = document.getElementById("ttsToggle");
        if (this.isEnabled) {
            ttsBtn.classList.add("active");
        } else {
            ttsBtn.classList.remove("active");
        }
    }
};

// ============================================
// UI MODULE
// ============================================

const NovaUI = {
    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.loadEmojis();
    },
    
    setupTheme() {
        const savedTheme = NovaStorage.getSetting("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
    },
    
    setupEventListeners() {
        // Close modals when clicking outside
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".emoji-picker-modal") && 
                !e.target.closest(".emoji-btn")) {
                this.closeEmojiPicker();
            }
            
            if (!e.target.closest(".attach-menu-modal") && 
                !e.target.closest(".attach-btn")) {
                this.closeAttachMenu();
            }
        });
        
        // Escape key closes modals
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.closeAllModals();
            }
        });
    },
    
    toggleSidebar() {
        document.getElementById("novaSidebar").classList.toggle("active");
    },
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        NovaStorage.saveSetting("theme", newTheme);
        
        NovaUI.showNotification(
            newTheme === "dark" ? "🌙 Dark mode enabled" : "☀️ Light mode enabled"
        );
    },
    
    toggleAutoScroll(enabled) {
        NovaStorage.saveSetting("autoScroll", enabled);
        NovaUI.showNotification(
            enabled ? "Auto-scroll enabled" : "Auto-scroll disabled"
        );
    },
    
    toggleMarkdown(enabled) {
        NovaStorage.saveSetting("markdown", enabled);
        NovaUI.showNotification(
            enabled ? "Markdown enabled" : "Markdown disabled"
        );
    },
    
    toggleSettings() {
        // Toggle settings panel (simplified)
        this.toggleSidebar();
    },
    
    resizeTextarea(textarea) {
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    },
    
    showAttachMenu() {
        document.getElementById("attachMenu").classList.toggle("visible");
    },
    
    closeAttachMenu() {
        document.getElementById("attachMenu").classList.remove("visible");
    },
    
    attachImage() {
        this.closeAttachMenu();
        NovaUI.showNotification("Image attachment coming soon!");
    },
    
    attachFile() {
        this.closeAttachMenu();
        NovaUI.showNotification("File attachment coming soon!");
    },
    
    attachCamera() {
        this.closeAttachMenu();
        NovaUI.showNotification("Camera feature coming soon!");
    },
    
    attachGallery() {
        this.closeAttachMenu();
        NovaUI.showNotification("Gallery feature coming soon!");
    },
    
    toggleEmojiPicker() {
        document.getElementById("emojiPicker").classList.toggle("visible");
    },
    
    closeEmojiPicker() {
        document.getElementById("emojiPicker").classList.remove("visible");
    },
    
    closeAllModals() {
        this.closeEmojiPicker();
        this.closeAttachMenu();
        document.getElementById("helpModal").classList.remove("visible");
    },
    
    loadEmojis() {
        const emojis = {
            smileys: ["😀", "😂", "🥰", "😎", "🤔", "😮", "😢", "😠", "🥺", "😴"],
            objects: ["📱", "💻", "⌚", "📷", "🎮", "📚", "✏️", "🎨", "🎵", "🎬"],
            symbols: ["❤️", "✨", "🌟", "🔥", "💯", "🎯", "✅", "❌", "⚠️", "❓"],
            flags: ["🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇮🇳", "🇯🇵", "🇰🇷", "🇨🇳", "🇫🇷", "🇩🇪"]
        };
        
        const grid = document.getElementById("emojiGrid");
        grid.innerHTML = "";
        
        // Load smileys by default
        this.loadEmojiCategory("smileys");
        
        // Setup category buttons
        document.querySelectorAll(".emoji-category").forEach(btn => {
            btn.addEventListener("click", () => {
                const category = btn.dataset.category;
                this.loadEmojiCategory(category);
                
                // Update active button
                document.querySelectorAll(".emoji-category").forEach(b => {
                    b.classList.remove("active");
                });
                btn.classList.add("active");
            });
        });
    },
    
    loadEmojiCategory(category) {
        const emojis = {
            smileys: ["😀", "😂", "🥰", "😎", "🤔", "😮", "😢", "😠", "🥺", "😴", "😍", "🤩", "🥳", "😜", "🤪", "😇", "🥶", "😈", "👻", "🤖"],
            objects: ["📱", "💻", "⌚", "📷", "🎮", "📚", "✏️", "🎨", "🎵", "🎬", "⚽", "🏀", "🎾", "🎯", "🎲", "🎸", "🎹", "🎤", "🎧", "📺"],
            symbols: ["❤️", "✨", "🌟", "🔥", "💯", "🎯", "✅", "❌", "⚠️", "❓", "⭐", "💡", "⚡", "💎", "🎉", "🎊", "🏆", "💰", "💳", "📈"],
            flags: ["🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇮🇳", "🇯🇵", "🇰🇷", "🇨🇳", "🇫🇷", "🇩🇪", "🇧🇷", "🇷🇺", "🇮🇹", "🇪🇸", "🇲🇽", "🇿🇦", "🇳🇬", "🇪🇬", "🇹🇷", "🇸🇦"]
        };
        
        const grid = document.getElementById("emojiGrid");
        grid.innerHTML = "";
        
        emojis[category].forEach(emoji => {
            const span = document.createElement("span");
            span.textContent = emoji;
            span.title = emoji;
            span.addEventListener("click", () => {
                const input = document.getElementById("messageInput");
                const start = input.selectionStart;
                const end = input.selectionEnd;
                const text = input.value;
                
                input.value = text.substring(0, start) + emoji + text.substring(end);
                input.focus();
                input.selectionStart = input.selectionEnd = start + emoji.length;
                this.resizeTextarea(input);
                
                this.closeEmojiPicker();
            });
            grid.appendChild(span);
        });
    },
    
    showHelp() {
        document.getElementById("helpModal").classList.add("visible");
    },
    
    closeHelp() {
        document.getElementById("helpModal").classList.remove("visible");
    },
    
    showNotification(message) {
        const notification = document.getElementById("notification");
        const text = document.getElementById("notificationText");
        
        text.textContent = message;
        notification.classList.add("show");
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove("show");
        }, 3000);
    }
};

// ============================================
// STORAGE MODULE
// ============================================

const NovaStorage = {
    STORAGE_KEY: "nova_ai_data",
    
    save(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save data:", error);
        }
    },
    
    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error("Failed to load data:", error);
            return null;
        }
    },
    
    saveSetting(key, value) {
        const data = this.load() || { settings: {} };
        data.settings = data.settings || {};
        data.settings[key] = value;
        this.save(data);
    },
    
    getSetting(key) {
        const data = this.load();
        if (data && data.settings) {
            return data.settings[key];
        }
        return NovaConfig.DEFAULT_SETTINGS[key];
    },
    
    saveMessages(messages) {
        const data = this.load() || {};
        data.messages = messages.slice(-100); // Keep last 100 messages
        this.save(data);
    },
    
    loadMessages() {
        const data = this.load();
        return data?.messages || [];
    },
    
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};

// ============================================
// STATISTICS MODULE
// ============================================

const NovaStats = {
    totalMessages: 0,
    totalTokens: 0,
    responseTimes: [],
    
    init() {
        this.loadStats();
        this.updateDisplay();
    },
    
    loadStats() {
        const data = NovaStorage.load();
        if (data && data.stats) {
            this.totalMessages = data.stats.totalMessages || 0;
            this.totalTokens = data.stats.totalTokens || 0;
            this.responseTimes = data.stats.responseTimes || [];
        }
    },
    
    saveStats() {
        const data = NovaStorage.load() || {};
        data.stats = {
            totalMessages: this.totalMessages,
            totalTokens: this.totalTokens,
            responseTimes: this.responseTimes.slice(-100) // Keep last 100
        };
        NovaStorage.save(data);
    },
    
    addMessage() {
        this.totalMessages++;
        this.updateDisplay();
        this.saveStats();
    },
    
    addTokens(count) {
        this.totalTokens += count;
        this.updateDisplay();
        this.saveStats();
    },
    
    recordResponseTime(time) {
        this.responseTimes.push(parseFloat(time));
        if (this.responseTimes.length > 100) {
            this.responseTimes.shift();
        }
        this.saveStats();
    },
    
    getAverageResponseTime() {
        if (this.responseTimes.length === 0) return 0;
        const sum = this.responseTimes.reduce((a, b) => a + b, 0);
        return (sum / this.responseTimes.length).toFixed(1);
    },
    
    updateDisplay() {
        document.getElementById("statMessages").textContent = this.totalMessages;
        document.getElementById("statTokens").textContent = this.totalTokens;
        document.getElementById("statTime").textContent = 
            this.getAverageResponseTime() + "s";
    }
};

// ============================================
// INITIALIZATION
// ============================================

// Initialize all modules when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Initialize modules
    NovaStats.init();
    NovaAI.init();
    NovaUI.init();
    NovaChat.init();
    NovaVoice.init();
    NovaTTS.init();
    
    // Apply saved settings
    const theme = NovaStorage.getSetting("theme");
    if (theme) {
        document.documentElement.setAttribute("data-theme", theme);
    }
    
    // Set initial model
    const savedModel = NovaStorage.getSetting("selectedModel");
    if (savedModel) {
        NovaAI.selectModel(savedModel);
    }
    
    // Set initial response style
    const savedStyle = NovaStorage.getSetting("responseSpeed");
    if (savedStyle) {
        NovaAI.setResponseStyle(savedStyle);
    }
    
    console.log("Nova AI initialized successfully!");
});

// Global error handler
window.addEventListener("error", (event) => {
    console.error("Global error:", event.error);
    NovaUI.showNotification("An error occurred. Please refresh the page.");
});

// Service Worker Registration for PWA
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js").catch(err => {
            console.log("ServiceWorker registration failed: ", err);
        });
    });
    }
