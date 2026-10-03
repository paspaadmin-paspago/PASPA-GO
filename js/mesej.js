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
   FORMAT TARIKH / MASA INBOX

   Hari ini  → MASA_HANTAR
   Hari lain → TARIKH_HANTAR
===================================================== */

function formatInboxDateTime(
  tarikhHantar,
  masaHantar
) {

  if (!tarikhHantar) {
    return "-";
  }


  const rawDate =
    String(
      tarikhHantar
    ).trim();


  /*
   * Tukar TARIKH_HANTAR kepada format
   * yang boleh dibandingkan.
   *
   * Sokong:
   * dd/mm/yyyy
   * yyyy-mm-dd
   */

  let day;
  let month;
  let year;


  if (
    rawDate.includes("/")
  ) {

    const parts =
      rawDate.split("/");

    if (parts.length === 3) {

      day =
        Number(parts[0]);

      month =
        Number(parts[1]);

      year =
        Number(parts[2]);

    }

  } else if (
    rawDate.includes("-")
  ) {

    const parts =
      rawDate.split("-");

    if (parts.length === 3) {

      year =
        Number(parts[0]);

      month =
        Number(parts[1]);

      day =
        Number(parts[2]);

    }

  }


  const now =
    new Date();


  const isToday =
    day === now.getDate() &&
    month ===
      now.getMonth() + 1 &&
    year ===
      now.getFullYear();


  /*
   * Jika mesej dihantar hari ini,
   * paparkan masa.
   */

  if (
    isToday &&
    masaHantar
  ) {

    return String(
      masaHantar
    ).trim();

  }


  /*
   * Jika bukan hari ini,
   * paparkan tarikh.
   */

  if (
    day &&
    month &&
    year
  ) {

    return (
      String(day).padStart(2, "0") +
      "/" +
      String(month).padStart(2, "0") +
      "/" +
      year
    );

  }


  return rawDate;

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
   RENDER ONE MESSAGE - INBOX STYLE
===================================================== */

function createMessageCard(
  message
) {

  const row =
    document.createElement(
      "button"
    );


  row.type =
    "button";


  const statusBaca =
    String(
      message.statusBaca || ""
    )
      .trim()
      .toLowerCase();


  const alreadyRead =
    statusBaca ===
    "sudah dibaca";


  row.className =
    "inbox-item " +
    (
      alreadyRead
        ? "read"
        : "unread"
    );


  const title =
    message.tajuk ||
    "Jemputan Program";


  /*
   * Untuk Inbox kita gunakan
   * tarikh mesej diterima jika API
   * membekalkannya.
   *
   * Jika belum ada, tarikh acara
   * digunakan sebagai fallback.
   */

const receivedDateTime =
  formatInboxDateTime(
    message.tarikhHantar,
    message.masaHantar
  );

row.innerHTML = `

  <div class="inbox-type">

    ${
      alreadyRead
        ? ""
        : '<span class="unread-dot"></span>'
    }

    <span class="inbox-type-text">
      Jemputan Program
    </span>

  </div>


  <div class="inbox-content">

    <div class="inbox-title">

      ${escapeHtml(
        title
      )}

    </div>

  </div>


  <div class="inbox-date">

    ${escapeHtml(
  receivedDateTime
)}

  </div>

`;


  row.addEventListener(
    "click",
    function () {

      openMessageDetail(
        message,
        row
      );

    }
  );


  return row;

}




/* =====================================================
   OPEN MESSAGE DETAIL
===================================================== */

function openMessageDetail(
  message,
  inboxRow
) {

  const statusRespon =
    getResponseDisplay(
      message.statusRespon
    );


  const details =
    parseMessageDetails(
      message.butiranMesej
    );


  /* ===================================================
     MARK AS READ
  =================================================== */

  const statusBaca =
    String(
      message.statusBaca || ""
    )
      .trim()
      .toLowerCase();


  if (
    statusBaca !== "sudah dibaca" &&
    message.recipientId
  ) {

    markMessageRead(
      message.recipientId
    );


    message.statusBaca =
      "Sudah Dibaca";


    if (inboxRow) {

      inboxRow.classList.remove(
        "unread"
      );

      inboxRow.classList.add(
        "read"
      );

    }

  }


  /* ===================================================
     PAPAR DETAIL
  =================================================== */

  messageList.innerHTML = `

    <div class="message-detail">

      <button
        type="button"
        class="inbox-back-button"
        id="inboxBackButton"
      >
        ← Kembali ke Inbox
      </button>


      <div class="message-detail-header">

        <div class="message-detail-type">
          JEMPUTAN PROGRAM
        </div>

        <h2 class="message-detail-title">

          ${escapeHtml(
            message.tajuk ||
            "Jemputan Program"
          )}

        </h2>

      </div>


      <div class="message-detail-info">

        <div class="detail-info-row">

          <span class="detail-label">
            Tarikh
          </span>

          <span class="detail-value">
            ${escapeHtml(
              formatMessageDate(
                message.tarikhAcara
              )
            )}
          </span>

        </div>


        ${
          message.masaMula ||
          message.masaTamat
            ? `
                <div class="detail-info-row">

                  <span class="detail-label">
                    Masa
                  </span>

                  <span class="detail-value">

                    ${escapeHtml(
                      message.masaMula ||
                      "-"
                    )}

                    ${
                      message.masaTamat
                        ? " - " +
                          escapeHtml(
                            message.masaTamat
                          )
                        : ""
                    }

                  </span>

                </div>
              `
            : ""
        }


        <div class="detail-info-row">

          <span class="detail-label">
            Penganjur
          </span>

          <span class="detail-value">

            ${escapeHtml(
              details.penganjur
            )}

          </span>

        </div>


        <div class="detail-info-row">

          <span class="detail-label">
            Tempat
          </span>

          <span class="detail-value">

            ${escapeHtml(
              message.tempat ||
              "-"
            )}

          </span>

        </div>

      </div>


      <div class="message-detail-body">

        ${escapeHtml(
          details.keterangan ||
          "-"
        )}

      </div>


      <div class="message-detail-actions">

        <button
          type="button"
          class="view-button"
          id="detailViewButton"
        >
          👁 LIHAT
        </button>


        ${
          message.pautan
            ? `
                <button
                  type="button"
                  class="attachment-button"
                  id="detailAttachmentButton"
                >
                  📎 LAMPIRAN
                </button>
              `
            : ""
        }

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

    </div>

  `;


  /* ===================================================
     KEMBALI KE INBOX
  =================================================== */

  const inboxBackButton =
    document.getElementById(
      "inboxBackButton"
    );


  if (inboxBackButton) {

    inboxBackButton.addEventListener(
      "click",
      function () {

        loadMessages();

      }
    );

  }


  /* ===================================================
     LIHAT
  =================================================== */

  const detailViewButton =
    document.getElementById(
      "detailViewButton"
    );


  if (detailViewButton) {

    detailViewButton.addEventListener(
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

  }


  /* ===================================================
     LAMPIRAN
  =================================================== */

  const attachmentButton =
    document.getElementById(
      "detailAttachmentButton"
    );


  if (
    attachmentButton &&
    message.pautan
  ) {

    attachmentButton.addEventListener(
      "click",
      function () {

        window.open(
          message.pautan,
          "_blank",
          "noopener,noreferrer"
        );

      }
    );

  }


  /* ===================================================
     HADIR
  =================================================== */

  const hadirButton =
    messageList.querySelector(
      '[data-action="hadir"]'
    );


  if (hadirButton) {

    hadirButton.addEventListener(
      "click",
      function () {

        const detailCard =
          messageList.querySelector(
            ".message-detail"
          );


        respondInvitation(
          message,
          "Hadir",
          detailCard
        );

      }
    );

  }


  /* ===================================================
     TIDAK HADIR
  =================================================== */

  const tidakHadirButton =
    messageList.querySelector(
      '[data-action="tidak hadir"]'
    );


  if (tidakHadirButton) {

    tidakHadirButton.addEventListener(
      "click",
      function () {

        const detailCard =
          messageList.querySelector(
            ".message-detail"
          );


        respondInvitation(
          message,
          "Tidak Hadir",
          detailCard
        );

      }
    );

  }

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


    messageList.innerHTML = `

  <div class="inbox-table-header">

    <div class="inbox-header-type">
      JENIS MESEJ
    </div>

    <div class="inbox-header-title">
      PERKARA / TAJUK
    </div>

    <div class="inbox-header-date">
      MASA / TARIKH
    </div>

  </div>

`;

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