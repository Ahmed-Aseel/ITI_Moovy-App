// chatbot.ts
import { getBotReply } from "./api.js";
export function initChatbot() {
    const chatContainer = document.createElement("div");
    chatContainer.id = "moovy-chatbot";
    chatContainer.innerHTML = `
    <div id="chat-window">
      <div id="chat-header">
        Moovy Chat
        <span id="close-chat" title="Close">&times;</span>
      </div>
      <div id="chat-messages"></div>
      <div id="chat-input">
        <input type="text" id="chatPrompt" placeholder="Ask something..." />
        <button id="sendChat">Send</button>
      </div>
    </div>
    <div id="chat-bubble" title="Chat">💬</div>
  `;
    document.body.appendChild(chatContainer);
    const bubble = document.getElementById("chat-bubble");
    const chatWindow = document.getElementById("chat-window");
    const closeBtn = document.getElementById("close-chat");
    const input = document.getElementById("chatPrompt");
    const sendBtn = document.getElementById("sendChat");
    const chatMessages = document.getElementById("chat-messages");
    bubble.addEventListener("click", () => {
        chatWindow.style.display = chatWindow.style.display === "flex" ? "none" : "flex";
    });
    closeBtn.addEventListener("click", () => {
        chatWindow.style.display = "none";
    });
    sendBtn.addEventListener("click", async () => {
        const prompt = input.value.trim();
        if (!prompt)
            return;
        appendMessage("user", prompt);
        input.value = "";
        try {
            const reply = await getBotReply(prompt);
            appendMessage("bot", reply);
        }
        catch {
            appendMessage("bot", "⚠️ Something went wrong.");
        }
    });
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            sendBtn.click();
        }
    });
    function appendMessage(role, text) {
        const p = document.createElement("p");
        p.className = role;
        p.textContent = text;
        chatMessages.appendChild(p);
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });
    }
}
