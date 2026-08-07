"use strict";

const loginForm =
  document.getElementById("loginForm");

const registrationForm =
  document.getElementById("registrationForm");

const loginEmail =
  document.getElementById("loginEmail");

const registrationEmail =
  document.getElementById("registrationEmail");

const idPaspaInput =
  document.getElementById("idPaspa");

const noKPInput =
  document.getElementById("noKP");

const loginButton =
  document.getElementById("loginButton");

const registrationButton =
  document.getElementById("registrationButton");

const backToLoginButton =
  document.getElementById("backToLoginButton");

const systemMessage =
  document.getElementById("systemMessage");


function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}


function normalizeDigits(value) {
  return String(value || "")
    .replace(/\D/g, "");
}


function showMessage(text, type = "info") {
  systemMessage.textContent = text;
  systemMessage.className = `message ${type}`;
}


function hideMessage() {
  systemMessage.textContent = "";
  systemMessage.className = "message hidden";
}


function setButtonLoading(
  button,
  isLoading,
  normalText,
  loadingText
) {
  button.disabled = isLoading;
  button.textContent =
    isLoading ? loadingText : normalText;
}


function showLoginForm() {
  registrationForm.classList.add("hidden");
  loginForm.classList.remove("hidden");

  idPaspaInput.value = "";
  noKPInput.value = "";

  hideMessage();
}


function showRegistrationForm(email, message) {
  loginForm.classList.add("hidden");
  registrationForm.classList.remove("hidden");

  registrationEmail.value = email;

  showMessage(
    message ||
      "Akaun belum didaftarkan. Sila lengkapkan pengesahan ahli.",
    "info"
  );
}


function saveUserSession(result) {
  const user = result.user || {};

  localStorage.setItem(
    "paspaGoSession",
    JSON.stringify({
      isLoggedIn: true,
      userId: user.userId || "",
      idPaspa: user.idPaspa || "",
      namaAhli: user.namaAhli || "",
      googleEmail: user.googleEmail || "",
      statusAkaun: user.statusAkaun || "",
      loginTime: new Date().toISOString()
    })
  );
}


function proceedToDashboard(result) {
  saveUserSession(result);

  showMessage(
    result.message || "Log masuk berjaya.",
    "success"
  );

  setTimeout(function () {
    window.location.href =
      CONFIG.DASHBOARD_URL;
  }, 700);
}


async function loginUser(email) {
  return apiPost({
    action: "login",
    email: email
  });
}


loginForm.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();
    hideMessage();

    const email = normalizeEmail(
      loginEmail.value
    );

    if (!email) {
      showMessage(
        "Sila masukkan alamat email Google.",
        "error"
      );
      return;
    }

    setButtonLoading(
      loginButton,
      true,
      "Log Masuk",
      "Sedang menyemak..."
    );

    try {
      const result = await loginUser(email);

      if (
        result.success === true &&
        result.loggedIn === true
      ) {
        proceedToDashboard(result);
        return;
      }

      if (
        result.requiresRegistration === true ||
        result.registered === false
      ) {
        showRegistrationForm(
          email,
          result.message
        );
        return;
      }

      showMessage(
        result.message ||
          "Log masuk tidak berjaya.",
        "error"
      );

    } catch (error) {
      console.error(error);

      showMessage(
        "Tidak dapat berhubung dengan server. " +
          error.message,
        "error"
      );

    } finally {
      setButtonLoading(
        loginButton,
        false,
        "Log Masuk",
        "Sedang menyemak..."
      );
    }
  }
);


registrationForm.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();
    hideMessage();

    const email = normalizeEmail(
      registrationEmail.value
    );

    const idPaspa = normalizeDigits(
      idPaspaInput.value
    );

    const noKP = normalizeDigits(
      noKPInput.value
    );

    if (!idPaspa) {
      showMessage(
        "Sila masukkan ID PASPA.",
        "error"
      );
      return;
    }

    if (noKP.length !== 12) {
      showMessage(
        "Nombor kad pengenalan mesti mempunyai 12 digit.",
        "error"
      );
      return;
    }

    setButtonLoading(
      registrationButton,
      true,
      "Aktifkan Akaun",
      "Sedang mengesahkan..."
    );

    try {
      const result = await apiPost({
        action: "register",
        email: email,
        idPaspa: idPaspa,
        noKP: noKP
      });

      if (result.success !== true) {
        showMessage(
          result.message ||
            "Pengaktifan akaun tidak berjaya.",
          "error"
        );
        return;
      }

      showMessage(
        result.message ||
          "Akaun berjaya diaktifkan. Sedang log masuk...",
        "success"
      );

      const loginResult =
        await loginUser(email);

      if (
        loginResult.success === true &&
        loginResult.loggedIn === true
      ) {
        proceedToDashboard(loginResult);
        return;
      }

      showLoginForm();
      loginEmail.value = email;

      showMessage(
        "Akaun berjaya diaktifkan. Sila log masuk semula.",
        "success"
      );

    } catch (error) {
      console.error(error);

      showMessage(
        "Tidak dapat mengaktifkan akaun. " +
          error.message,
        "error"
      );

    } finally {
      setButtonLoading(
        registrationButton,
        false,
        "Aktifkan Akaun",
        "Sedang mengesahkan..."
      );
    }
  }
);


backToLoginButton.addEventListener(
  "click",
  function () {
    showLoginForm();
  }
);