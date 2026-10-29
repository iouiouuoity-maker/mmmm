(() => {
  const AI_API_URL = "https://purple-king-4918.vp5vy7g7db.workers.dev/api/ask";

  const {
    db,
    getSelected,
    selectProverb,
    escape
  } = window.ProverbApp;

  const form = document.querySelector("#ai-form");
  const input = document.querySelector("#ai-input");
  const messages = document.querySelector("#chat-messages");
  const status = document.querySelector("#connection-status");
  const select = document.querySelector("#ai-proverb");
  const context = document.querySelector("#ai-context-card");

  let action = "explain";
  let history = [];

  db.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.id} · ${item.text}`;
    select.append(option);
  });

  const initial = getSelected();
  if (initial) select.value = initial.id;

  function renderContext() {
    const item = db.find((entry) => entry.id === select.value);
    if (!item) return;

    selectProverb(item.id);
    context.innerHTML = `
      <span>${escape(item.category)}</span>
      <b>«${escape(item.text)}»</b>
      <p>${escape(item.meaning)}</p>
      <p><b>Граница:</b> ${escape(item.caution)}</p>
    `;
  }

  function addMessage(text, author) {
    const message = document.createElement("div");
    message.className = `bubble ${
      author === "user" ? "user-bubble" : "assistant-bubble"
    }`;

    const label = document.createElement("small");
    label.textContent = author === "user" ? "ТВОЙ ВОПРОС" : "ПОМОЩНИК";

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    message.append(label, paragraph);
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;

    return message;
  }

  document.querySelectorAll(".tool-pill").forEach((button) => {
    button.addEventListener("click", () => {
      action = button.dataset.action;

      document.querySelectorAll(".tool-pill").forEach((item) => {
        item.classList.toggle("selected", item === button);
      });

      input.focus();
    });
  });

  select.addEventListener("change", renderContext);
  renderContext();

  try {
    const prefill = sessionStorage.getItem("pvi-ai-prefill");

    if (prefill) {
      input.value = prefill;
      document.querySelector("#char-count").textContent = input.value.length;
      sessionStorage.removeItem("pvi-ai-prefill");
    }
  } catch {
    // Браузер может запретить доступ к sessionStorage.
  }

  input.addEventListener("input", () => {
    document.querySelector("#char-count").textContent = input.value.length;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = input.value.trim();
    if (!question) return;

    const item = db.find((entry) => entry.id === select.value) || getSelected();
    if (!item) return;

    const reference =
      `Смысл: ${item.meaning}\n` +
      `Граница применения: ${item.caution}`;

    addMessage(question, "user");

    input.value = "";
    document.querySelector("#char-count").textContent = "0";

    const waiting = addMessage("Разбираю вопрос…", "assistant");
    waiting.classList.add("waiting");
    status.textContent = "ИИ формирует ответ…";

    const sendButton = form.querySelector('button[type="submit"]');
    sendButton.disabled = true;

    try {
      const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action,
          question,
          proverb: item.text,
          reference,
          history: history.slice(-6)
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Не удалось получить ответ.");
      }

      waiting.remove();

      const answer = data.answer || "Модель вернула пустой ответ.";
      addMessage(answer, "assistant");

      history.push(
        { role: "user", content: question },
        { role: "assistant", content: answer }
      );
      history = history.slice(-8);

      status.textContent = "Ответ создан Workers AI";
    } catch (error) {
      waiting.remove();
      addMessage(error.message || "Проверь соединение и попробуй ещё раз.", "assistant");
      status.textContent = "Не удалось связаться с ИИ";
    } finally {
      sendButton.disabled = false;
      input.focus();
    }
  });
})();
