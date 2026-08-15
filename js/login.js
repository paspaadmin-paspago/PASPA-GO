"use strict";


/* =====================================================
   ELEMEN
===================================================== */

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

const googleSignInButton =
  document.getElementById("googleSignInButton");

const googleLoginSection =
  document.querySelector(".google-login-section");


/* =====================================================
   PEMBOLEH UBAH
===================================================== */

let verifiedGoogleCredential = "";


/* =====================================================
   UTILITI
===================================================== */

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}


function normalizeDigits(value) {
  return String(value || "")
    .replace(/\D/g, "");
}


function showMessage(
  text,
  type = "info"
) {

  if (!systemMessage) {
    return;
  }

  systemMessage.textContent =
    text;

  systemMessage.className =
    `message ${type}`;

}


function hideMessage() {

  if (!systemMessage) {
    return;
  }

  systemMessage.textContent = "";

  systemMessage.className =
    "message hidden";

}


function setButtonLoading(
  button,
  isLoading,
  normalText,
  loadingText
) {

  if (!button) {
    return;
  }

  button.disabled =
    isLoading;

  button.textContent =
    isLoading
      ? loadingText
      : normalText;

}


/* =====================================================
   PAPAR GOOGLE LOGIN
===================================================== */

function showLoginForm() {

  if (registrationForm) {
    registrationForm.classList.add(
      "hidden"
    );
  }

  /*
   * Login lama masih wujud tetapi
   * parent legacy-login-hidden
   * akan terus menyembunyikannya.
   */
  if (loginForm) {
    loginForm.classList.remove(
      "hidden"
    );
  }

  if (googleLoginSection) {
    googleLoginSection.style.display =
      "block";
  }

  if (idPaspaInput) {
    idPaspaInput.value = "";
  }

  if (noKPInput) {
    noKPInput.value = "";
  }

  hideMessage();

}


/* =====================================================
   PAPAR BORANG PENGAKTIFAN
===================================================== */

function showRegistrationForm(
  email,
  message
) {

  /*
   * Google button disembunyikan
   * semasa ahli membuat pengesahan.
   */
  if (googleLoginSection) {
    googleLoginSection.style.display =
      "none";
  }

  /*
   * Login lama kekal tersembunyi.
   */
  if (loginForm) {
    loginForm.classList.add(
      "hidden"
    );
  }

  /*
   * Paparkan borang ID PASPA + IC.
   */
  if (registrationForm) {
    registrationForm.classList.remove(
      "hidden"
    );
  }

  /*
   * Email datang terus daripada Google.
   */
  if (registrationEmail) {
    registrationEmail.value =
      normalizeEmail(email);
  }

  showMessage(
    message ||
      "Akaun Google berjaya disahkan. Sila sahkan ID PASPA dan No. Kad Pengenalan.",
    "info"
  );

}


/* =====================================================
   SESSION
===================================================== */

function saveUserSession(result) {

  const user =
    result.user || {};

  localStorage.setItem(
    "paspaGoSession",
    JSON.stringify({

      isLoggedIn:
        true,

      userId:
        user.userId || "",

      idPaspa:
        user.idPaspa || "",

      namaAhli:
        user.namaAhli || "",

      googleEmail:
        user.googleEmail || "",

      googleSub:
        user.googleSub || "",

      statusAkaun:
        user.statusAkaun || "",

      loginTime:
        new Date().toISOString()

    })
  );

}


function proceedToDashboard(result) {

  saveUserSession(result);


  /* =================================================
     WELCOME HANYA SELEPAS LOGIN BERJAYA
  ================================================= */

  sessionStorage.setItem(
    "showWelcomeSplash",
    "1"
  );


  showMessage(
    result.message ||
      "Log masuk berjaya.",
    "success"
  );


  setTimeout(
    function () {

      window.location.href =
        CONFIG.DASHBOARD_URL;

    },
    400
  );

}

/* =====================================================
   LOGIN LAMA
   DIKEKALKAN SEMENTARA
===================================================== */

async function loginUser(email) {

  return apiPost({

    action:
      "login",

    email:
      email

  });

}


if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      hideMessage();

      const email =
        normalizeEmail(
          loginEmail
            ? loginEmail.value
            : ""
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

        const result =
          await loginUser(email);


        if (
          result.success === true &&
          result.loggedIn === true
        ) {

          proceedToDashboard(
            result
          );

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

        console.error(
          "LOGIN ERROR:",
          error
        );

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

}


/* =====================================================
   GOOGLE LOGIN
===================================================== */

async function handleGoogleCredential(
  response
) {

  hideMessage();


  if (
    !response ||
    !response.credential
  ) {

    showMessage(
      "Log masuk Google tidak berjaya.",
      "error"
    );

    return;

  }


  try {

    verifiedGoogleCredential =
      response.credential;


    showMessage(
      "Sedang mengesahkan Akaun Google...",
      "info"
    );


    const result =
      await apiPost({

        action:
          "google_login",

        credential:
          verifiedGoogleCredential

      });


    /*
     * ===========================================
     * AKAUN SUDAH AKTIF
     * ===========================================
     */

    if (
      result.success === true &&
      result.loggedIn === true
    ) {

      proceedToDashboard(
        result
      );

      return;

    }


    /*
     * ===========================================
     * GOOGLE SAH TETAPI BELUM DAFTAR PASPA GO
     * ===========================================
     */

    if (
      result.success === true &&
      result.requiresRegistration === true
    ) {

      showRegistrationForm(
        result.googleEmail || "",
        "Akaun Google berjaya disahkan. Sila sahkan ID PASPA dan No. Kad Pengenalan."
      );

      return;

    }


    showMessage(
      result.message ||
        "Akaun Google tidak dibenarkan.",
      "error"
    );


  } catch (error) {

    console.error(
      "GOOGLE LOGIN ERROR:",
      error
    );

    showMessage(
      "Tidak dapat mengesahkan Akaun Google. " +
        error.message,
      "error"
    );

  }

}


/* =====================================================
   INITIALIZE GOOGLE LOGIN
===================================================== */

function initializeGoogleLogin() {

  /*
   * Pastikan div Google button memang ada.
   */
  if (!googleSignInButton) {

    console.error(
      "Elemen #googleSignInButton tidak dijumpai."
    );

    return;

  }


  /*
   * Tunggu library Google Identity Services.
   */
  if (
    !window.google ||
    !google.accounts ||
    !google.accounts.id
  ) {

    setTimeout(
      initializeGoogleLogin,
      300
    );

    return;

  }


  /*
   * Pastikan Client ID telah dimasukkan.
   */
  if (
    !CONFIG ||
    !CONFIG.GOOGLE_CLIENT_ID
  ) {

    console.error(
      "GOOGLE_CLIENT_ID belum ditetapkan dalam config.js."
    );

    showMessage(
      "Konfigurasi Google Login belum lengkap.",
      "error"
    );

    return;

  }


  google.accounts.id.initialize({

    client_id:
      CONFIG.GOOGLE_CLIENT_ID,

    callback:
      handleGoogleCredential,

    ux_mode:
      "popup",

    auto_select:
      false

  });


  /*
   * Kosongkan button lama sekiranya
   * fungsi ini dipanggil semula.
   */
  googleSignInButton.innerHTML = "";


  /*
   * Render button rasmi Google.
   */
  const googleButtonWidth =
  window.innerWidth <= 600 ? 100 : 320;

google.accounts.id.renderButton(
  document.getElementById("googleSignInButton"),
  {
    theme: "outline",
    size: "large",
    text: "signin_with",
    width: googleButtonWidth
  }
);

}


/* =====================================================
   PENDAFTARAN / PENGAKTIFAN AKAUN
===================================================== */

if (registrationForm) {

  registrationForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      hideMessage();


      const email =
        normalizeEmail(
          registrationEmail
            ? registrationEmail.value
            : ""
        );


      const idPaspa =
        normalizeDigits(
          idPaspaInput
            ? idPaspaInput.value
            : ""
        );


      const noKP =
        normalizeDigits(
          noKPInput
            ? noKPInput.value
            : ""
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


      if (!verifiedGoogleCredential) {

        showMessage(
          "Sesi Google telah tamat. Sila kembali dan log masuk menggunakan Google sekali lagi.",
          "error"
        );

        return;

      }


      setButtonLoading(
        registrationButton,
        true,
        "Sahkan & Aktifkan Akaun",
        "Sedang mengesahkan..."
      );


      try {

        const result =
          await apiPost({

            action:
              "google_register",

            email:
              email,

            credential:
              verifiedGoogleCredential,

            idPaspa:
              idPaspa,

            noKP:
              noKP

          });


        if (
          result.success !== true
        ) {

          showMessage(
            result.message ||
              "Pengaktifan akaun tidak berjaya.",
            "error"
          );

          return;

        }


        /*
         * Backend terus login selepas
         * pendaftaran berjaya.
         */
        if (
          result.loggedIn === true
        ) {

          proceedToDashboard(
            result
          );

          return;

        }


        showMessage(
          result.message ||
            "Akaun berjaya diaktifkan. Sila log masuk semula.",
          "success"
        );


      } catch (error) {

        console.error(
          "GOOGLE REGISTER ERROR:",
          error
        );

        showMessage(
          "Tidak dapat mengaktifkan akaun. " +
            error.message,
          "error"
        );


      } finally {

        setButtonLoading(
          registrationButton,
          false,
          "Sahkan & Aktifkan Akaun",
          "Sedang mengesahkan..."
        );

      }

    }
  );

}


/* =====================================================
   KEMBALI KE GOOGLE LOGIN
===================================================== */

if (backToLoginButton) {

  backToLoginButton.addEventListener(
    "click",
    function () {

      /*
       * Credential lama dibuang.
       */
      verifiedGoogleCredential =
        "";


      /*
       * Sembunyikan borang pendaftaran.
       */
      if (registrationForm) {

        registrationForm.classList.add(
          "hidden"
        );

      }


      /*
       * Kosongkan input.
       */
      if (registrationEmail) {

        registrationEmail.value =
          "";

      }

      if (idPaspaInput) {

        idPaspaInput.value =
          "";

      }

      if (noKPInput) {

        noKPInput.value =
          "";

      }


      /*
       * Paparkan Google Login semula.
       */
      if (googleLoginSection) {

        googleLoginSection.style.display =
          "block";

      }


      hideMessage();


      /*
       * Render semula Google button.
       */
      initializeGoogleLogin();

    }
  );

}


/* =====================================================
   MULAKAN GOOGLE LOGIN
===================================================== */

window.addEventListener(
  "load",
  initializeGoogleLogin
);