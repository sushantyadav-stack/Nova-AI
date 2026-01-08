// Nova AI - Main JavaScript
class NovaAI {
    constructor() {
        this.messages = [];
        this.currentAI = 'deepseek';
        this.isDarkMode = false;
        this.isVoiceMode = false;
        this.isTTSEnabled = false;
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.initialize();
    }

    initialize() {
        this.loadSettings();
        this.setupEventListeners();
        this.loadChatHistory();
        this.populateEmojis();
        this.updateAIStatus();
        
        // Check for speech synthesis support
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
        this.loadVoices();
    }

    setupEventListeners() {
        // AI Selection
        document.querySelectorAll('.ai-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectAI(e));
        });

        // Voice button
        document.querySelector('.voice-btn').addEventListener('click', () => this.toggleVoiceMode());

        // TTS button
        document.querySelector('.tts-btn').addEventListener('click', () => this.toggleTTS());

        // Auto-resize textarea
        const textarea = document.getElementById('messageInput');
        textarea.addEventListener('input', () => this.autoResizeTextarea(textarea));

        // Load saved theme
        if (this.isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    selectAI(event) {
        // Remove active class from all options
        document.querySelectorAll('.ai-option').forEach(opt => {
            opt.classList.remove('active');
        });
        
        // Add active class to clicked option
        event.currentTarget.classList.add('active');
        
        // Update current AI
        this.currentAI = event.currentTarget.dataset.ai;
        
        // Update status display
        document.getElementById('activeAI').textContent = this.getAIName(this.currentAI);
        
        // Show notification
        this.showNotification(`Switched to ${this.getAIName(this.currentAI)}`);
        
        // Save settings
        this.saveSettings();
    }

    getAIName(aiId) {
        const aiNames = {
            'deepseek': 'DeepSeek',
            'chatgpt': 'ChatGPT',
            'grok': 'Grok',
            'claude': 'Claude'
        };
        return aiNames[aiId] || 'Unknown AI';
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Clear input and reset height
        input.value = '';
        input.style.height = 'auto';

        // Add user message to chat
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get response from selected AI
            const response = await this.getAIResponse(message);
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Add AI response to chat
            this.addMessage(response, 'ai');
            
            // Speak response if TTS is enabled
            if (this.isTTSEnabled) {
                this.speakText(response);
            }
            
            // Update response time
            this.updateResponseTime();
            
            // Save to history
            this.saveToHistory(message, response);
            
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
            console.error('AI Error:', error);
        }
    }

    async getAIResponse(message) {
        // Simulate different AI responses based on selection
        const responses = {
            deepseek: `I'm DeepSeek AI, an advanced language model. You asked: "${message}". I can help you with coding, analysis, and creative tasks with precision and technical accuracy.`,
            chatgpt: `This is ChatGPT responding. Regarding "${message}", I can provide detailed explanations, creative ideas, and practical solutions with a conversational tone.`,
            grok: `Grok here! "${message}" - I'll give you a direct, no-nonsense answer with a bit of wit. Let's cut through the noise and get to the point.`,
            claude: `As Claude AI, I approach "${message}" with thoughtful analysis, ethical considerations, and detailed explanations while maintaining helpfulness and safety.`
        };

        // Simulate API delay
        await this.delay(500 + Math.random() * 1000);
        
        return responses[this.currentAI] || `As ${this.getAIName(this.currentAI)}, I received your message: "${message}". How can I assist you further?`;
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageId = 'msg_' + Date.now();
        
        const messageHTML = `
            <div class="message ${sender}-message" id="${messageId}">
                <div class="message-avatar">
                    <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="sender">${sender === 'user' ? 'You' : this.getAIName(this.currentAI)}</span>
                        <span class="time">${this.getCurrentTime()}</span>
                    </div>
                    <div class="message-text">${this.formatMessage(text)}</div>
                    <div class="message-actions">
                        <button onclick="novaAI.speakText('${text.replace(/'/g, "\\'")}')">
                            <i class="fas fa-volume-up"></i>
                        </button>
                        <button onclick="novaAI.copyText('${text.replace(/'/g, "\\'")}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.innerHTML += messageHTML;
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add to messages array
        this.messages.push({
            id: messageId,
            text: text,
            sender: sender,
            time: Date.now(),
            ai: this.currentAI
        });
        
        // Save messages
        this.saveMessages();
    }

    formatMessage(text) {
        // Simple markdown formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingHTML = `
            <div class="message ai-message" id="typingIndicator">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.innerHTML += typingHTML;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Voice Functions
    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        const voiceBtn = document.querySelector('.voice-btn');
        const voiceIndicator = document.getElementById('voiceIndicator');
        
        if (this.isVoiceMode) {
            voiceBtn.classList.add('active');
            voiceIndicator.style.display = 'block';
            this.startVoiceRecognition();
            this.showNotification('Voice mode activated. Start speaking...');
        } else {
            voiceBtn.classList.remove('active');
            voiceIndicator.style.display = 'none';
            this.stopVoiceRecognition();
            this.showNotification('Voice mode deactivated');
        }
        
        document.getElementById('activeMode').textContent = this.isVoiceMode ? 'Voice' : 'Text';
        this.saveSettings();
    }

    startVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showNotification('Speech recognition not supported in this browser');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            document.getElementById('messageInput').value = transcript;
            this.autoResizeTextarea(document.getElementById('messageInput'));
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showNotification('Speech recognition error: ' + event.error);
        };

        this.recognition.start();
    }

    stopVoiceRecognition() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    // Text-to-Speech Functions
    loadVoices() {
        this.voices = this.synth.getVoices();
    }

    speakText(text) {
        if (!this.synth || !text) return;
        
        if (this.synth.speaking) {
            this.synth.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Try to find a good voice
        const preferredVoices = ['Google US English', 'Microsoft David', 'Samantha'];
        const voice = this.voices.find(v => preferredVoices.some(p => v.name.includes(p))) || this.voices[0];
        
        if (voice) {
            utterance.voice = voice;
        }
        
        this.synth.speak(utterance);
    }

    toggleTTS() {
        this.isTTSEnabled = !this.isTTSEnabled;
        const ttsBtn = document.querySelector('.tts-btn');
        
        if (this.isTTSEnabled) {
            ttsBtn.classList.add('active');
            this.showNotification('Text-to-speech enabled');
        } else {
            ttsBtn.classList.remove('active');
            this.showNotification('Text-to-speech disabled');
        }
        
        this.saveSettings();
    }

    // Utility Functions
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    updateResponseTime() {
        const time = (0.5 + Math.random() * 1.5).toFixed(1);
        document.getElementById('responseTime').textContent = time + 's';
    }

    copyText(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Text copied to clipboard!');
        });
    }

    // Settings Management
    saveSettings() {
        const settings = {
            currentAI: this.currentAI,
            isDarkMode: this.isDarkMode,
            isTTSEnabled: this.isTTSEnabled,
            messages: this.messages
        };
        localStorage.setItem('novaAI_settings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('novaAI_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.currentAI = settings.currentAI || 'deepseek';
            this.isDarkMode = settings.isDarkMode || false;
            this.isTTSEnabled = settings.isTTSEnabled || false;
            this.messages = settings.messages || [];
        }
    }

    saveMessages() {
        localStorage.setItem('novaAI_messages', JSON.stringify(this.messages));
    }

    loadChatHistory() {
        const savedMessages = localStorage.getItem('novaAI_messages');
        if (savedMessages) {
            this.messages = JSON.parse(savedMessages);
            this.displayHistory();
        }
    }

    displayHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        // Show last 5 conversations
        const recentMessages = this.messages.slice(-10);
        
        recentMessages.forEach((msg, index) => {
            if (msg.sender === 'user') {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.textContent = msg.text.substring(0, 50) + '...';
                historyItem.onclick = () => this.loadConversation(index);
                historyList.appendChild(historyItem);
            }
        });
    }

    saveToHistory(userMessage, aiResponse) {
        // History is automatically saved in messages array
        this.displayHistory();
    }

    // Emoji Functions
    populateEmojis() {
        const emojis = ['😀', '😂', '🥰', '😎', '🤔', '😮', '👍', '👋', '🎉', '🔥', '💡', '🚀', '📚', '💻', '🎨', '🎵', '🌍', '⭐'];
        const emojiGrid = document.getElementById('emojiGrid');
        
        emojis.forEach(emoji => {
            const span = document.createElement('span');
            span.textContent = emoji;
            span.onclick = () => this.insertEmoji(emoji);
            emojiGrid.appendChild(span);
        });
    }

    insertEmoji(emoji) {
        const textarea = document.getElementById('messageInput');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        
        textarea.value = text.substring(0, start) + emoji + text.substring(end);
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        this.autoResizeTextarea(textarea);
        
        this.closeEmojiPicker();
    }

    toggleEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        picker.classList.toggle('show');
    }

    closeEmojiPicker() {
        document.getElementById('emojiPicker').classList.remove('show');
    }

    // UI Functions
    toggleSidebar() {
        document.querySelector('.sidebar').classList.toggle('active');
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        
        if (this.isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.showNotification('Dark mode enabled');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            this.showNotification('Light mode enabled');
        }
        
        this.saveSettings();
    }

    clearChat() {
        if (confirm('Are you sure you want to clear all chat messages?')) {
            this.messages = [];
            document.getElementById('chatMessages').innerHTML = '';
            localStorage.removeItem('novaAI_messages');
            this.showNotification('Chat cleared');
        }
    }

    exportChat() {
        const chatContent = this.messages.map(msg => {
            return `${msg.sender === 'user' ? 'You' : this.getAIName(msg.ai)} (${new Date(msg.time).toLocaleString()}): ${msg.text}`;
        }).join('\n\n');
        
        const blob = new Blob([chatContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `novaai_chat_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Chat exported successfully!');
    }
}

// Global functions for HTML onclick handlers
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

function startVoiceInput() {
    novaAI.toggleVoiceMode();
}

function stopVoiceInput() {
    novaAI.toggleVoiceMode();
}

function toggleVoiceMode() {
    novaAI.toggleVoiceMode();
}

function toggleTTS() {
    novaAI.toggleTTS();
}

function toggleDarkMode() {
    novaAI.toggleDarkMode();
}

function clearChat() {
    novaAI.clearChat();
}

function exportChat() {
    novaAI.exportChat();
}

function speakText(text) {
    novaAI.speakText(text);
}

function copyText(text) {
    novaAI.copyText(text);
}

function toggleEmojiPicker() {
    novaAI.toggleEmojiPicker();
}

function closeEmojiPicker() {
    novaAI.closeEmojiPicker();
}

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        novaAI.sendMessage();
    }
}

function sendMessage() {
    novaAI.sendMessage();
}

// Initialize Nova AI when page loads
let novaAI;
window.addEventListener('DOMContentLoaded', () => {
    novaAI = new NovaAI();
});
