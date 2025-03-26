const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chatId = crypto.randomUUID();

let receiving = false;
const systemPrompt =
  "You are an environmental advocate guiding users on their journey to reduce their carbon footprint with personalized calculations, actionable insights, and gamified challenges.";

function createMessageElement(text, alignment) {
  const messageElement = document.createElement("div");

  messageElement.className = `inline-block my-2.5 p-2.5 rounded border ${
    alignment === "left" ? "self-start bg-green-200" : "self-end bg-green-300"
  }`;
  messageElement.textContent = text;
  return messageElement;
}

function connectWebSocket(message) {
  receiving = true;
  const url = "wss://backend.buildpicoapps.com/api/chatbot/chat";
  const websocket = new WebSocket(url);

  websocket.addEventListener("open", () => {
    websocket.send(
      JSON.stringify({
        chatId: chatId,
        appId: "painting-attack",
        systemPrompt: systemPrompt,
        message: message,
      })
    );
  });

  const messageElement = createMessageElement("", "left");
  chatbox.appendChild(messageElement);

  websocket.onmessage = (event) => {
    messageElement.innerText += event.data;
    chatbox.scrollTop = chatbox.scrollHeight;
  };

  websocket.onclose = (event) => {
    if (event.code === 1000) {
      receiving = false;
    } else {
      messageElement.textContent +=        "Error getting response from server. Refresh the page and try again.";
      chatbox.scrollTop = chatbox.scrollHeight;
      receiving = false;
    }
  };
}

sendButton.addEventListener("click", () => {
  if (!receiving && messageInput.value.trim() !== "") {
    const messageText = messageInput.value.trim();
    messageInput.value = "";
    const messageElement = createMessageElement(messageText, "right");
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;

    connectWebSocket(messageText);
  }
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !receiving && messageInput.value.trim() !== "") {
    event.preventDefault();
    sendButton.click();
  }
});