
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

    // textContent menghalang HTML daripada
    // dilaksanakan sebagai kod berbahaya.
    message.textContent = String(text || "");

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

    const loadingMessage = addMessage(
      "PASPA GO AI sedang menyediakan jawapan...",
      "bot"
    );

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
