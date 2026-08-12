"use strict";


/* =====================================================
   ELEMENTS
===================================================== */

const messageList =
  document.getElementById(
    "messageList"
  );

const messageStatus =
  document.getElementById(
    "messageStatus"
  );

const backButton =
  document.getElementById(
    "backButton"
  );

const homeButton =
  document.getElementById(
    "homeButton"
  );


/* =====================================================
   SESSION
===================================================== */

function getSession() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "paspaGoSession"
      )
    );

  } catch (error) {

    return null;

  }

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =====================================================
   STATUS MESSAGE
===================================================== */

function showMessageStatus(
  message,
  type = "info"
) {

  if (!messageStatus) {
    return;
  }


  messageStatus.textContent =
    message;


  messageStatus.className =
    "message-status " +
    type;


  messageStatus.hidden =
    false;

}


function hideMessageStatus() {

  if (!messageStatus) {
    return;
  }


  messageStatus.hidden =
    true;

}

/* =====================================================
   FORMAT TARIKH
   yyyy-mm-dd → dd/mm/yyyy
===================================================== */

function formatMessageDate(value) {

  if (!value) {
    return "-";
  }

  const text =
    String(value).trim();


  /*
    Contoh:
    2026-09-11 hingga 2026-09-30
  */

  if (
    text.includes(" hingga ")
  ) {

    const parts =
      text.split(" hingga ");

    return (
      formatSingleDate(parts[0]) +
      " hingga " +
      formatSingleDate(parts[1])
    );

  }


  return formatSingleDate(
    text
  );

}


function formatSingleDate(value) {

  const text =
    String(value || "")
      .trim();

  const parts =
    text.split("-");


  if (
    parts.length !== 3
  ) {
    return text;
  }


  return (
    parts[2] +
    "/" +
    parts[1] +
    "/" +
    parts[0]
  );

}

/* =====================================================
   ASINGKAN KETERANGAN DAN PENGANJUR
===================================================== */

function parseMessageDetails(value) {

  const text =
    String(value || "");

  const lines =
    text.split("\n");

  let penganjur = "";

  const descriptionLines = [];


  lines.forEach(function (line) {

    const trimmed =
      line.trim();


    if (
      trimmed
        .toLowerCase()
        .startsWith("penganjur:")
    ) {

      penganjur =
        trimmed
          .substring(
            "penganjur:".length
          )
          .trim();

      return;
    }


    if (trimmed) {

      descriptionLines.push(
        trimmed
      );

    }

  });


  return {

    penganjur:
      penganjur || "-",

    keterangan:
      descriptionLines.join("\n")

  };

}

/* =====================================================
   FORMAT RESPONSE STATUS
===================================================== */

function getResponseDisplay(status) {

  const value =
    String(
      status || ""
    )
      .trim()
      .toLowerCase();


  if (value === "hadir") {
    return "HADIR";
  }


  if (value === "tidak hadir") {
    return "TIDAK HADIR";
  }


  return "BELUM RESPON";

}


/* =====================================================
   RENDER ONE MESSAGE
===================================================== */

function createMessageCard(
  message
) {

  const card =
    document.createElement(
      "article"
    );


  const statusBaca =
    String(
      message.statusBaca || ""
    )
      .trim()
      .toLowerCase();


  const alreadyRead =
    statusBaca ===
    "sudah dibaca";


  card.className =
    "message-card " +
    (
      alreadyRead
        ? "read"
        : "unread"
    );


  const statusRespon =
    getResponseDisplay(
      message.statusRespon
    );


  const details =
    parseMessageDetails(
      message.butiranMesej
    );


  card.innerHTML = `

    <div class="message-card-header">

      <h2 class="message-title">

        ${escapeHtml(
          message.tajuk ||
          "Jemputan Program"
        )}

      </h2>


      <button
        type="button"
        class="view-button"
        title="Lihat surat jemputan"
        aria-label="Lihat surat jemputan"
      >
        👁 LIHAT
      </button>

    </div>


    <div class="message-meta">

      <span class="message-label">
        Tarikh:
      </span>

      ${escapeHtml(
        formatMessageDate(
          message.tarikhAcara
        )
      )}

    </div>


    <div class="message-meta">

      <span class="message-label">
        Penganjur:
      </span>

      ${escapeHtml(
        details.penganjur
      )}

    </div>


    <div class="message-meta">

      <span class="message-label">
        Tempat:
      </span>

      ${escapeHtml(
        message.tempat ||
        "-"
      )}

    </div>


  <div class="message-description">
  <p>${escapeHtml(
    details.keterangan || "-"
  )}</p>
</div>




   


    <div class="response-status">

      Status Respon:
      ${escapeHtml(
        statusRespon
      )}

    </div>


    <div class="response-buttons">

      <button
        type="button"
        class="response-button hadir"
        data-action="hadir"
      >
        HADIR
      </button>


      <button
        type="button"
        class="response-button tidak-hadir"
        data-action="tidak hadir"
      >
        TIDAK HADIR
      </button>

    </div>

  `;


  /* ===================================================
     BUTTON LIHAT
  =================================================== */

  const viewButton =
    card.querySelector(
      ".view-button"
    );


  viewButton.addEventListener(
    "click",
    function () {

      if (!message.messageId) {

        showMessageStatus(
          "ID jemputan tidak ditemui.",
          "error"
        );

        return;

      }


      window.location.href =
        "admin-program-review.html" +
        "?messageId=" +
        encodeURIComponent(
          message.messageId
        ) +
        "&from=mesej";

    }
  );


  /* ===================================================
     HADIR
  =================================================== */

  const hadirButton =
    card.querySelector(
      '[data-action="hadir"]'
    );


  hadirButton.addEventListener(
    "click",
    function () {

      respondInvitation(
        message,
        "Hadir",
        card
      );

    }
  );


  /* ===================================================
     TIDAK HADIR
  =================================================== */

  const tidakHadirButton =
    card.querySelector(
      '[data-action="tidak hadir"]'
    );


  tidakHadirButton.addEventListener(
    "click",
    function () {

      respondInvitation(
        message,
        "Tidak Hadir",
        card
      );

    }
  );


  /* ===================================================
     MARK AS READ
  =================================================== */

  if (
    !alreadyRead &&
    message.recipientId
  ) {

    markMessageRead(
      message.recipientId
    );

  }


  return card;

}

/* =====================================================
   LOAD MESSAGES
===================================================== */

async function loadMessages() {

  hideMessageStatus();


  const session =
    getSession();


  if (
    !session ||
    session.isLoggedIn !== true ||
    !session.googleEmail
  ) {

    window.location.href =
      "../index.html";

    return;

  }


  messageList.innerHTML =
    `
      <div class="loading-message">
        Memuatkan mesej...
      </div>
    `;


  try {

    const result =
      await apiPost({

        action:
          "messages",

        email:
          session.googleEmail

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Mesej tidak dapat diperoleh."
      );

    }


    const messages =
      Array.isArray(
        result.messages
      )
        ? result.messages
        : [];


    if (!messages.length) {

      messageList.innerHTML =
        `
          <div class="empty-message">

            Tiada mesej atau jemputan
            buat masa ini.

          </div>
        `;

      return;

    }


    messageList.innerHTML =
      "";


    messages.forEach(
      function (message) {

        const card =
          createMessageCard(
            message
          );


        messageList.appendChild(
          card
        );

      }
    );


  } catch (error) {

    console.error(
      "LOAD MESSAGE ERROR:",
      error
    );


    messageList.innerHTML =
      `
        <div class="empty-message">
          Mesej tidak dapat dipaparkan.
        </div>
      `;


    showMessageStatus(
      error.message ||
      "Ralat semasa mendapatkan mesej.",
      "error"
    );

  }

}


/* =====================================================
   MARK MESSAGE READ
===================================================== */

async function markMessageRead(
  recipientId
) {

  const session =
    getSession();


  if (
    !session ||
    !session.googleEmail
  ) {
    return;
  }


  try {

    const result =
      await apiPost({

        action:
          "mark_message_read",

        email:
          session.googleEmail,

        recipientId:
          recipientId

      });


    if (
      !result ||
      result.success !== true
    ) {

      console.warn(
        "MARK READ FAILED:",
        result
      );

    }


  } catch (error) {

    console.error(
      "MARK READ ERROR:",
      error
    );

  }

}


/* =====================================================
   RESPOND INVITATION
===================================================== */

async function respondInvitation(
  message,
  status,
  card
) {

  const session =
    getSession();


  if (
    !session ||
    !session.googleEmail
  ) {

    showMessageStatus(
      "Sesi log masuk tidak ditemui.",
      "error"
    );

    return;

  }


  if (!message.recipientId) {

    showMessageStatus(
      "ID penerima tidak ditemui.",
      "error"
    );

    return;

  }


  const confirmed =
    window.confirm(
      "Sahkan respon: " +
      status +
      "?"
    );


  if (!confirmed) {
    return;
  }


  const buttons =
    card.querySelectorAll(
      ".response-button"
    );


  buttons.forEach(
    function (button) {

      button.disabled =
        true;

    }
  );


  showMessageStatus(
    "Respon sedang disimpan...",
    "info"
  );


  try {

    const result =
      await apiPost({

        action:
          "respond_invitation",

        email:
          session.googleEmail,

        recipientId:
          message.recipientId,

        status:
          status,

        catatan:
          ""

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Respon gagal disimpan."
      );

    }


    const statusBox =
      card.querySelector(
        ".response-status"
      );


    if (statusBox) {

      statusBox.textContent =
        "Status Respon: " +
        result.statusRespon;

    }


    showMessageStatus(
      "Respon " +
      result.statusRespon +
      " berjaya disimpan.",
      "success"
    );


    /*
      Selepas berjaya, button dibuka semula.
      Ahli masih boleh tukar jawapan
      selagi admin belum sahkan kehadiran.
    */

    buttons.forEach(
      function (button) {

        button.disabled =
          false;

      }
    );


  } catch (error) {

    console.error(
      "RESPOND INVITATION ERROR:",
      error
    );


    showMessageStatus(
      error.message ||
      "Respon gagal disimpan.",
      "error"
    );


    buttons.forEach(
      function (button) {

        button.disabled =
          false;

      }
    );

  }

}


/* =====================================================
   HEADER BUTTONS
===================================================== */

backButton.addEventListener(
  "click",
  function () {

    history.back();

  }
);


homeButton.addEventListener(
  "click",
  function () {

    window.location.href =
      "dashboard.html";

  }
);


/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadMessages();

  }
);