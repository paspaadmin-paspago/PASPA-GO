"use strict";


/* =====================================================
   STORAGE
===================================================== */

const OPERATION_REVIEW_STORAGE_KEY =
  "paspaOperationReviewDraft";


let operationReviewData =
  null;


/* =====================================================
   ELEMENTS
===================================================== */

const operationLetter =
  document.getElementById(
    "operationLetter"
  );


/* =====================================================
   ESCAPE
===================================================== */

function escapeOperationHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =====================================================
   FORMAT TARIKH
===================================================== */

function formatOperationReviewDate(
  value
) {

  if (!value) {
    return "-";
  }


  const parts =
    String(
      value
    ).split("-");


  if (
    parts.length !== 3
  ) {

    return String(
      value
    );

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
   TARIKH HARI INI
===================================================== */

function getOperationTodayDisplay() {

  const now =
    new Date();


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const year =
    now.getFullYear();


  return (
    day +
    "/" +
    month +
    "/" +
    year
  );

}


/* =====================================================
   MEMBER NAME
===================================================== */

function getOperationMemberName(
  member
) {

  return (
    String(
      member?.pangkat ||
      ""
    ) +
    " " +
    String(
      member?.namaPenuh ||
      ""
    )
  )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/* =====================================================
   SHOW MESSAGE
===================================================== */

function showOperationReviewMessage(
  message,
  type
) {

  const box =
    document.getElementById(
      "reviewMessage"
    );


  if (!box) {
    return;
  }


  box.textContent =
    message || "";


  box.className =
    "review-message " +
    (
      type || ""
    );


  box.hidden =
    false;

}


/* =====================================================
   RENDER LETTER
===================================================== */

function renderOperationReviewLetter() {

  if (
    !operationReviewData ||
    !operationLetter
  ) {

    return;

  }


  const operation =
    operationReviewData.operation ||
    {};


  const members =
    Array.isArray(
      operationReviewData.members
    )
      ? operationReviewData.members
      : [];


  const memberList =
    members
      .map(
        function (
          member,
          index
        ) {

          return `

            <li>

              ${escapeOperationHtml(
                getOperationMemberName(
                  member
                )
              )}

              ${
                member.idPaspa
                  ? " | ID PASPA: " +
                    escapeOperationHtml(
                      member.idPaspa
                    )
                  : ""
              }

            </li>

          `;

        }
      )
      .join("");


  let dateText =
    formatOperationReviewDate(
      operation.tarikhMula
    );


  if (
    operation.tarikhTamat &&
    operation.tarikhTamat !==
      operation.tarikhMula
  ) {

    dateText +=
      " hingga " +
      formatOperationReviewDate(
        operation.tarikhTamat
      );

  }


  operationLetter.innerHTML = `

    <section class="letter-sheet">


      <!-- LETTER HEAD -->

      <section class="letter-head">

        <img
          src="../images/logo.png"
          alt="Logo PASPA"
          class="letter-logo"
        >

        <div class="letter-organisation">

          PASUKAN KHAS PERTAHANAN AWAM

          <br>

          (PASPA)

        </div>

      </section>


      <!-- REFERENCE -->

      <section class="letter-reference">

        <div>

          <strong>
            NO. RUJUKAN:
          </strong>

          ${escapeOperationHtml(
            operationReviewData.noRujukan ||
            "DRAF"
          )}

        </div>


        <div class="letter-reference-right">

          <strong>
            TARIKH:
          </strong>

          ${escapeOperationHtml(
            getOperationTodayDisplay()
          )}

        </div>

      </section>


      <!-- SUBJECT -->

      <section class="letter-subject">

        <div class="letter-label">

          PERKARA

        </div>


        <div class="letter-value subject-value">

          ${escapeOperationHtml(
            operation.perkara ||
            "-"
          )}

        </div>

      </section>


      <!-- RECIPIENT -->

      <section class="recipient-section">

        <div class="recipient-label">

          KEPADA:

        </div>


        <div class="recipient-content">

          <strong>
            ANGGOTA OPERASI:
          </strong>


          <ol class="name-list">

            ${memberList}

          </ol>

        </div>

      </section>


      <!-- BODY -->

      <section class="letter-body">

        <p>

          Dengan segala hormatnya,
          tuan/puan adalah diarahkan
          untuk atur gerak bagi
          operasi berikut:

        </p>


        <div class="program-info">


          <div class="program-info-label">
            Kategori Operasi:
          </div>

          <div>
            ${escapeOperationHtml(
              operation.kategoriOperasi ||
              "-"
            )}
          </div>


          <div class="program-info-label">
            Jenis Kejadian:
          </div>

          <div>
            ${escapeOperationHtml(
              operation.jenisKejadian ||
              "-"
            )}
          </div>


          <div class="program-info-label">
            Perkara:
          </div>

          <div>
            ${escapeOperationHtml(
              operation.perkara ||
              "-"
            )}
          </div>


          <div class="program-info-label">
            Tarikh:
          </div>

          <div>
            ${escapeOperationHtml(
              dateText
            )}
          </div>


          <div class="program-info-label">
            Tempat:
          </div>

          <div>
            ${escapeOperationHtml(
              operation.tempat ||
              "-"
            )}
          </div>


          <div class="program-info-label">
            Negeri:
          </div>

          <div>
            ${escapeOperationHtml(
              operation.negeri ||
              "-"
            )}
          </div>


          ${
            operation.liveLocation
              ? `

                <div class="program-info-label">
                  Live Location:
                </div>

                <div>

                  ${escapeOperationHtml(
                    operation.liveLocation
                  )}

                </div>

              `
              : ""
          }

        </div>


        ${
          operation.catatan
            ? `

              <p class="letter-description">

                ${escapeOperationHtml(
                  operation.catatan
                )}

              </p>

            `
            : ""
        }


        <p class="response-text">

          Semua anggota yang disenaraikan
          hendaklah mengambil tindakan
          sewajarnya dan bersedia untuk
          digerakkan mengikut arahan semasa.

        </p>

      </section>


      <div class="page-footer-area">

        <div class="computer-generated-note">

          Dokumen ini dijana secara elektronik
          melalui PASPA GO.

        </div>

      </div>


    </section>

  `;

}


/* =====================================================
   LOAD REVIEW
===================================================== */

function loadOperationReviewData() {

  try {

    const text =
      localStorage.getItem(
        OPERATION_REVIEW_STORAGE_KEY
      );


    if (!text) {

      throw new Error(
        "Maklumat Panggilan Operasi tidak ditemui."
      );

    }


    operationReviewData =
      JSON.parse(
        text
      );


    if (
      !operationReviewData ||
      typeof operationReviewData !==
        "object"
    ) {

      throw new Error(
        "Data Panggilan Operasi tidak sah."
      );

    }


    renderOperationReviewLetter();


  } catch (error) {

    console.error(
      "LOAD OPERATION REVIEW ERROR:",
      error
    );


    showOperationReviewMessage(
      error.message ||
      "Memo Operasi tidak dapat dipaparkan.",
      "error"
    );

  }

}


/* =====================================================
   PRINT
===================================================== */

document
  .getElementById(
    "printButton"
  )
  .addEventListener(
    "click",
    function () {

      window.print();

    }
  );


/* =====================================================
   DOWNLOAD
===================================================== */

document
  .getElementById(
    "downloadButton"
  )
  .addEventListener(
    "click",
    async function () {

      if (
        !operationReviewData ||
        typeof html2pdf ===
          "undefined"
      ) {

        showOperationReviewMessage(
          "Fungsi Download PDF tidak tersedia.",
          "error"
        );

        return;

      }


      const operation =
        operationReviewData.operation ||
        {};


      const filename =
        (
          operation.perkara ||
          "Panggilan-Operasi"
        )
          .replace(
            /[^a-z0-9]+/gi,
            "-"
          )
          .replace(
            /^-|-$/g,
            ""
          ) +
        ".pdf";


      const options = {

        margin:
          0,

        filename:
          filename,

        image: {

          type:
            "jpeg",

          quality:
            0.98

        },

        html2canvas: {

          scale:
            2,

          useCORS:
            true,

          backgroundColor:
            "#ffffff"

        },

        jsPDF: {

          unit:
            "mm",

          format:
            "a4",

          orientation:
            "portrait"

        }

      };


      try {

        await html2pdf()
          .set(
            options
          )
          .from(
            operationLetter
          )
          .save();


      } catch (error) {

        console.error(
          "DOWNLOAD OPERATION PDF ERROR:",
          error
        );


        showOperationReviewMessage(
          "PDF gagal dijana. Gunakan Print dan pilih Save as PDF.",
          "error"
        );

      }

    }
  );




  function getAdminReviewEmail() {

  try {

    const sessionText =
      localStorage.getItem(
        "paspaGoSession"
      );


    if (!sessionText) {
      return "";
    }


    const session =
      JSON.parse(
        sessionText
      );


    return String(
      session.googleEmail ||
      session.email ||
      ""
    )
      .trim()
      .toLowerCase();


  } catch (error) {

    console.error(
      "GET REVIEW ADMIN EMAIL ERROR:",
      error
    );


    return "";

  }

}

/* =====================================================
   GET ADMIN EMAIL
===================================================== */

function getAdminReviewEmail() {

  try {

    const sessionText =
      localStorage.getItem(
        "paspaGoSession"
      );


    if (!sessionText) {
      return "";
    }


    const session =
      JSON.parse(
        sessionText
      );


    return String(
      session.googleEmail ||
      session.email ||
      ""
    )
      .trim()
      .toLowerCase();


  } catch (error) {

    console.error(
      "GET ADMIN REVIEW EMAIL ERROR:",
      error
    );

    return "";

  }

}


/* =====================================================
   PASTI PANGGILAN OPERASI
===================================================== */

const confirmButton =
  document.getElementById(
    "confirmButton"
  );


if (confirmButton) {

  confirmButton.addEventListener(
    "click",
    async function () {

      const originalText =
        confirmButton.textContent;


      try {

        /* =============================================
           SEMAK REVIEW DATA
        ============================================= */

        if (!operationReviewData) {

          throw new Error(
            "Data Operasi tidak ditemui."
          );

        }


        const operasiId =
          String(
            operationReviewData.operasiId ||
            ""
          ).trim();


        if (!operasiId) {

          throw new Error(
            "OPERASI_ID tidak ditemui."
          );

        }


        const adminEmail =
          getAdminReviewEmail();


        if (!adminEmail) {

          throw new Error(
            "Sesi pentadbir tidak ditemui. Sila log masuk semula."
          );

        }


        /* =============================================
           CONFIRM
        ============================================= */

        const confirmed =
          window.confirm(
            "Adakah anda pasti mahu mengaktifkan panggilan operasi ini?"
          );


        if (!confirmed) {
          return;
        }


        /* =============================================
           LOCK BUTTON
        ============================================= */

        confirmButton.disabled =
          true;


        confirmButton.textContent =
          "MEMPROSES...";


        /* =============================================
           API
        ============================================= */

        const result =
          await apiPost({

            action:
              "admin_operation_confirm_call",

            email:
              adminEmail,

            operasiId:
              operasiId

          });


        console.log(
          "CONFIRM OPERATION RESULT:",
          result
        );


        if (
          !result ||
          result.success !== true
        ) {

          throw new Error(
            result?.message ||
            result?.error ||
            "Panggilan Operasi gagal diaktifkan."
          );

        }


        localStorage.removeItem(
  "paspaOperationReviewDraft"
);

window.location.replace(
  "urus.html"
);


        /* =============================================
           PADAM DATA REVIEW TEMPORARY
        ============================================= */

        localStorage.removeItem(
          "paspaOperationReviewDraft"
        );


        /* =============================================
           TERUS KE URUS.HTML
        ============================================= */

        window.location.replace(
          "urus.html"
        );


      } catch (error) {

        console.error(
          "CONFIRM OPERATION CALL ERROR:",
          error
        );


        showOperationReviewMessage(
          error.message ||
          "Panggilan Operasi gagal diaktifkan.",
          "error"
        );


        confirmButton.disabled =
          false;


        confirmButton.textContent =
          originalText;

      }

    }
  );

}


/* =====================================================
   HEADER
===================================================== */

document
  .getElementById(
    "backButton"
  )
  .addEventListener(
    "click",
    function () {

      history.back();

    }
  );


document
  .getElementById(
    "homeButton"
  )
  .addEventListener(
    "click",
    function () {

      window.location.href =
        "dashboard.html";

    }
  );


/* =====================================================
   MOBILE SCALE
===================================================== */

function scaleOperationReviewForMobile() {

  const wrapper =
    document.getElementById(
      "reviewLetterScale"
    );


  if (!wrapper) {
    return;
  }


  if (
    window.innerWidth > 600
  ) {

    wrapper.style.transform =
      "";

    wrapper.style.height =
      "";

    return;

  }


  const a4WidthPx =
    793.7;


  const availableWidth =
    window.innerWidth - 20;


  const scale =
    Math.min(
      1,
      availableWidth /
      a4WidthPx
    );


  const originalHeight =
    wrapper.scrollHeight;


  wrapper.style.transform =
    "scale(" +
    scale +
    ")";


  wrapper.style.transformOrigin =
    "top left";


  wrapper.style.height =
    (
      originalHeight *
      scale
    ) +
    "px";

}


/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadOperationReviewData();


    requestAnimationFrame(
      function () {

        scaleOperationReviewForMobile();

      }
    );

  }
);


window.addEventListener(
  "resize",
  function () {

    requestAnimationFrame(
      function () {

        scaleOperationReviewForMobile();

      }
    );

  }
);