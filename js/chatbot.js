
/* =====================================================
   PASPA GO AI CHATBOT
   FRONTEND JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const chatForm = document.getElementById("chatForm");
  const questionInput = document.getElementById("questionInput");
  const chatMessages = document.getElementById("chatMessages");
  const sendBtn = document.getElementById("sendBtn");

  // Dapatkan sesi log masuk PASPA GO
  function getSessionToken() {
    try {
      const session = JSON.parse(
        localStorage.getItem("paspaGoSession") || "{}"
      );

      return String(session.sessionToken || "").trim();

    } catch (error) {
      return "";
    }
  }

  // Paparkan mesej dalam ruangan chatbot
 
function addMessage(text, sender) {

  const message = document.createElement("div");

  message.className = "message " + sender;

  const content = String(text || "");

  // Jawapan AI dipaparkan sebagai Markdown
  if (
    sender === "bot" &&
    typeof marked !== "undefined" &&
    typeof DOMPurify !== "undefined"
  ) {

    const html = marked.parse(content, {
      gfm: true,
      breaks: true
    });

    // Bersihkan HTML sebelum dipaparkan
    message.innerHTML = DOMPurify.sanitize(html);

    // Pautan dibuka dalam tab baharu
    message.querySelectorAll("a").forEach(function(link) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });

  } else {

    // Mesej pengguna kekal sebagai teks biasa
    message.textContent = content;

  }

  chatMessages.appendChild(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;

  return message;
}


  // Semak sesi sebelum pengguna menghantar soalan
  if (!getSessionToken()) {
    addMessage(
      "Sila log masuk ke PASPA GO terlebih dahulu.",
      "bot"
    );

    questionInput.disabled = true;
    sendBtn.disabled = true;
    return;
  }

  // Hantar soalan kepada API PASPA GO
  chatForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const question = questionInput.value.trim();

    if (!question) return;

    const sessionToken = getSessionToken();

    if (!sessionToken) {
      addMessage(
        "Sesi log masuk tidak ditemui. Sila log masuk semula.",
        "bot"
      );
      return;
    }

    addMessage(question, "user");

    questionInput.value = "";
    questionInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.textContent = "Tunggu...";

   const loadingMessage = addMessage("", "bot");

loadingMessage.classList.add("ai-loading");

const dots = document.createElement("div");
dots.className = "typing-dots";

for (let i = 0; i < 3; i++) {
  const dot = document.createElement("span");
  dots.appendChild(dot);
}

loadingMessage.appendChild(dots);
loadingMessage.setAttribute("aria-label", "PASPA GO AI sedang mencari jawapan");

    try {

      const result = await apiPost({
        action: "chatbot_ask",
        sessionToken: sessionToken,
        question: question
      });

      loadingMessage.remove();

      if (result && result.success === true) {

        addMessage(
          result.answer || "Tiada jawapan diterima.",
          "bot"
        );

      } else {

        addMessage(
          result?.message ||
          "Maaf, pertanyaan tidak dapat diproses.",
          "bot"
        );

      }

    } catch (error) {

      loadingMessage.remove();

      console.error("PASPA CHATBOT ERROR:", error);

      addMessage(
        "Sambungan chatbot gagal. Sila cuba lagi.",
        "bot"
      );

    } finally {

      questionInput.disabled = false;
      sendBtn.disabled = false;
      sendBtn.textContent = "Hantar";
      questionInput.focus();

    }

  });

});
