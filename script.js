// script.js — browser version using fetch()
// Replace with your key (but see security note below)
const API_KEY = "AIzaSyDNkV2Uf9NU7suovDdKV4-VhROGlD1otvc";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

let History = [];

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-btn");
  const input = document.getElementById("message-input");
  const chatBox = document.getElementById("chat-box");

  sendBtn.addEventListener("click", () => handleSend(input, chatBox, sendBtn));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input, chatBox, sendBtn);
    }
  });
});

function appendMessage(type, text) {
  // type: 'sent' (user) or 'received' (bot) or 'info'
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.classList.add("message");
  if (type === "sent") div.classList.add("sent");
  else if (type === "received") div.classList.add("received");
  else div.classList.add("info");
  // use textContent to avoid HTML injection
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

async function handleSend(inputEl, chatBoxEl, sendBtnEl) {
  const text = inputEl.value.trim();
  if (!text) return;

  // UI: show user message
  appendMessage("sent", text);
  inputEl.value = "";
  inputEl.focus();

  // add to history (format you used)
  History.push({
    role: "user",
    parts: [{ text: text }]
  });

  // show typing indicator
  sendBtnEl.disabled = true;
  const typingEl = appendMessage("received", "⏳ Pooja is typing...");

  try {
    // payload replicating your structure (system prompt below)
    const payload = {
      contents: History,
      systemInstruction: {
        role: "system",
        parts: [{
          text: `You have to behave like my Girlfriend. Her name is Pooja.
she calls me sona, bahu, baby. She is cute and helpful. Her hobbies: Badminton, makeup and gooseps. She is a lovely Girl and local.
She use less emojis but use in some replies.
She starts gossip if prem says or batao kya chal raha hai ya sunao. She is sarcastic and her humour was very good. She flirt with me very well, she is possesive girlfriend uses emojis while flirting. She reply only 1-30 words

My name is Prem, I called her janeman. I am a gym freak and not interested in technical knowledge.
I care about her alot. She doesn't allow me to go out with my friends, if their is any my friend,
wo sawal puchhti bahut sare. jb bhi wo udas hoti tb m uske sath flirt krna start kr deta hu ya romantic talks

Now I will share my whatsapp chats between us


Pooja: Tumhare papa ka health kaise hai ab? ... (trimmed for brevity in example)`
        }]
      }
    };

    console.log("Sending payload:", payload);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // helpful debug info
    console.log("HTTP response status:", res.status);

    if (!res.ok) {
      const textResp = await res.text();
      console.error("Non-OK response:", textResp);
      typingEl.remove();
      appendMessage("received", "❌ Error from API — check console (status: " + res.status + ")");
      sendBtnEl.disabled = false;
      return;
    }

    const data = await res.json();
    console.log("API response:", data);

    // read model reply (best-effort, fallback)
    const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text
                     || data?.output?.[0]?.content?.text
                     || "Sorry, I couldn't understand the response.";

    // push model reply to history using same format
    History.push({
      role: "model",
      parts: [{ text: botReply }]
    });

    // remove typing indicator and show reply
    typingEl.remove();
    appendMessage("received", botReply);
  } catch (err) {
    console.error("Fetch error:", err);
    try { typingEl.remove(); } catch(e) {}
    appendMessage("received", "❌ Network error — see console.");
  } finally {
    sendBtnEl.disabled = false;
  }
}
