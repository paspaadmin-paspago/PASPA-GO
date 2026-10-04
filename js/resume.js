"use strict";

/* =====================================================
   PASPA GO - MYRESUME
   CLEAN VERSION
   PAGE 1 + PAGE 2 + QR + PDF + SHARE + MOBILE
===================================================== */


/* =====================================================
   SESSION
===================================================== */

function getResumeSession() {
  try {
    return JSON.parse(
      localStorage.getItem("paspaGoSession")
    );
  } catch (error) {
    console.error("RESUME SESSION ERROR:", error);
    return null;
  }
}


/* =====================================================
   SET TEXT
===================================================== */

function setResumeText(id, value) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  const text =
    value === null ||
    value === undefined ||
    String(value).trim() === ""
      ? "-"
      : String(value).trim();

  element.textContent = text;
}


/* =====================================================
   FORMAT IC
===================================================== */

function formatResumeIc(value) {
  const digits = String(value || "")
    .replace(/\D/g, "");

  if (digits.length !== 12) {
    return digits || "-";
  }

  return (
    digits.slice(0, 6) +
    "-" +
    digits.slice(6, 8) +
    "-" +
    digits.slice(8, 12)
  );
}


/* =====================================================
   FORMAT TARIKH
===================================================== */

function formatResumeDate(value) {
  if (!value) {
    return "-";
  }

  const text = String(value).trim();

  const iso = text.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (iso) {
    return (
      iso[3] +
      "/" +
      iso[2] +
      "/" +
      iso[1]
    );
  }

  const local = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (local) {
    return (
      local[1].padStart(2, "0") +
      "/" +
      local[2].padStart(2, "0") +
      "/" +
      local[3]
    );
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  return (
    String(date.getUTCDate()).padStart(2, "0") +
    "/" +
    String(date.getUTCMonth() + 1).padStart(2, "0") +
    "/" +
    date.getUTCFullYear()
  );
}


/* =====================================================
   FORMAT TARIKH PROGRAM / OPERASI
===================================================== */

function formatResumeActivityDate(value) {
  return formatResumeDate(value);
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeResumeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =====================================================
   UPPERCASE
===================================================== */

function resumeUpper(value) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "-";
  }

  return text.toUpperCase();
}


/* =====================================================
   GOOGLE DRIVE PHOTO URL
===================================================== */

function createResumePhotoUrl(fileId) {
  const id = String(fileId || "").trim();

  if (!id) {
    return "../images/default-avatar.png";
  }

  return (
    "https://drive.google.com/thumbnail?id=" +
    encodeURIComponent(id) +
    "&sz=w700"
  );
}


/* =====================================================
   BMI CATEGORY
===================================================== */

function getResumeBmiCategory(value) {
  const bmi = Number(value);

  if (!Number.isFinite(bmi)) {
    return "-";
  }

  if (bmi < 18.5) {
    return "Kurang berat badan";
  }

  if (bmi < 25) {
    return "Berat badan normal";
  }

  if (bmi < 30) {
    return "Berat badan berlebihan";
  }

  return "Obesiti";
}


/* =====================================================
   GET CURRENT ID PASPA
===================================================== */

function getCurrentResumeId() {
  const params = new URLSearchParams(
    window.location.search
  );

  const publicId = String(
    params.get("id") || ""
  ).trim();

  if (publicId) {
    return publicId;
  }

  const displayedId = document
    .getElementById("resumePaspaId")
    ?.textContent
    ?.trim();

  if (
    displayedId &&
    displayedId !== "-"
  ) {
    return displayedId;
  }

  const session = getResumeSession() || {};

  return String(
    session.idPaspa || ""
  ).trim();
}


/* =====================================================
   GET CURRENT MEMBER NAME
===================================================== */

function getCurrentResumeName() {
  const name = document
    .getElementById("resumeName")
    ?.textContent
    ?.trim();

  if (
    name &&
    name !== "-"
  ) {
    return name;
  }

  const activityName = document
    .getElementById("activityMemberName")
    ?.textContent
    ?.trim();

  if (
    activityName &&
    activityName !== "-"
  ) {
    return activityName;
  }

  const session = getResumeSession() || {};

  return (
    session.namaAhli ||
    "MEMBER"
  );
}


/* =====================================================
   PDF FILE NAME
===================================================== */

function getResumePdfFileName() {
  const idPaspa =
    getCurrentResumeId() ||
    "PASPA";

  const memberName =
    getCurrentResumeName() ||
    "MEMBER";

  const safeName = String(memberName)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return (
    idPaspa +
    "_" +
    (safeName || "MEMBER") +
    ".pdf"
  );
}


/* =====================================================
   PAPARKAN RESUME
===================================================== */

function displayResume(result, session) {
  const profile =
    result.profile || {};

  const service =
    result.perkhidmatan || {};

  const membership =
    result.keahlianPaspa || {};

  const fitness =
    result.kecergasan || {};

  const sizes =
    result.saiz || {};

  const safeSession =
    session || {};


  /* =================================================
     ID AHLI
  ================================================= */

  const activityId =
    profile.idPaspa ||
    safeSession.idPaspa ||
    "";

  const activityName =
    profile.namaPenuh ||
    safeSession.namaAhli ||
    "-";


  /* =================================================
     QR
  ================================================= */

  generateResumeQr(activityId);


  /* =================================================
     PAGE 2 - IDENTITI
  ================================================= */

  const activityMemberName =
    document.getElementById(
      "activityMemberName"
    );

  const activityMemberId =
    document.getElementById(
      "activityMemberId"
    );

  if (activityMemberName) {
    activityMemberName.textContent =
      resumeUpper(activityName);
  }

  if (activityMemberId) {
    activityMemberId.textContent =
      "ID PASPA: " +
      (
        activityId ||
        "-"
      );
  }


  /* =================================================
     PROGRAM + OPERASI
  ================================================= */

  loadResumeActivities(
    activityId
  );


  /* =================================================
     GAMBAR
  ================================================= */

  const photo =
    document.getElementById(
      "resumePhoto"
    );

  if (photo) {
    photo.src =
      createResumePhotoUrl(
        profile.fotoFileId
      );
  }


  /* =================================================
     IDENTITI
  ================================================= */

  setResumeText(
    "resumeRank",
    profile.pangkat
  );

  setResumeText(
    "resumeName",
    profile.namaPenuh ||
    safeSession.namaAhli
  );

  setResumeText(
    "resumePaspaId",
    profile.idPaspa ||
    safeSession.idPaspa
  );


  /* =================================================
     DOCUMENT TITLE
  ================================================= */

  const pdfIdPaspa =
    String(
      profile.idPaspa ||
      safeSession.idPaspa ||
      "PASPA"
    ).trim();

  const pdfNamaAhli =
    String(
      profile.namaPenuh ||
      safeSession.namaAhli ||
      "AHLI"
    )
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  document.title =
    pdfIdPaspa +
    "_" +
    pdfNamaAhli;


  /* =================================================
     MAKLUMAT PERIBADI
  ================================================= */

  setResumeText(
    "rIc",
    formatResumeIc(
      profile.noKadPengenalan
    )
  );

  setResumeText(
    "rGender",
    profile.jantina
  );

  setResumeText(
    "rEmail",
    profile.googleEmail ||
    safeSession.googleEmail
  );

  setResumeText(
    "rBodyNumber",
    service.noBadan
  );

  setResumeText(
    "rAppointmentDate",
    formatResumeDate(
      membership.tarikhLantikan
    )
  );

  setResumeText(
    "rPaspaPosition",
    membership.jawatanPaspa
  );


  /* =================================================
     MAKLUMAT PERKHIDMATAN
  ================================================= */

  setResumeText(
    "rServiceRank",
    profile.pangkat
  );

  setResumeText(
    "rAppointmentType",
    service.tarafLantikan
  );

  setResumeText(
    "rGrade",
    service.gredJawatan
  );

  setResumeText(
    "rServiceDate",
    formatResumeDate(
      membership.tarikhLantikan
    )
  );

  setResumeText(
    "rBranch",
    service.cawanganBerkhidmat
  );

  setResumeText(
    "rServiceState",
    service.negeriBerkhidmat
  );


  /* =================================================
     MAKLUMAT PERHUBUNGAN
  ================================================= */

  setResumeText(
    "rPhone",
    profile.noTelefon
  );

  setResumeText(
    "rEmergencyPhone",
    profile.noTelWaris
  );

  setResumeText(
    "rAddress",
    profile.alamat
  );

  setResumeText(
    "rPostcode",
    profile.poskod
  );

  setResumeText(
    "rDistrict",
    profile.daerah
  );

  setResumeText(
    "rState",
    profile.negeri
  );

  setResumeText(
    "rMaritalStatus",
    profile.tarafPerkahwinan
  );


  /* =================================================
     KECERGASAN
  ================================================= */

  setResumeText(
    "rBlood",
    profile.jenisDarah
  );

  setResumeText(
    "rHeight",
    fitness.tinggiCm
      ? fitness.tinggiCm + " cm"
      : "-"
  );

  setResumeText(
    "rWeight",
    fitness.beratKg
      ? fitness.beratKg + " kg"
      : "-"
  );

  setResumeText(
    "rBmi",
    fitness.bmi
  );

  setResumeText(
    "rBmiCategory",
    getResumeBmiCategory(
      fitness.bmi
    )
  );


  /* =================================================
     PAKAIAN
  ================================================= */

  setResumeText(
    "rTshirt",
    sizes.tshirt
  );

  setResumeText(
    "rSportPants",
    sizes.seluarSukan
  );

  setResumeText(
    "rUniform",
    sizes.uniform
  );

  setResumeText(
    "rBeret",
    sizes.beret
  );

  setResumeText(
    "rJacket",
    sizes.jaket
  );

  setResumeText(
    "rSportShoes",
    sizes.kasutSukan
  );

  setResumeText(
    "rBoot",
    sizes.boot
  );

  setResumeText(
    "rBelt",
    sizes.taliPinggang
  );


  /* =================================================
     TARIKH
  ================================================= */

  const today =
    new Date();

  setResumeText(
    "resumeDate",

    String(
      today.getDate()
    ).padStart(2, "0") +

    "/" +

    String(
      today.getMonth() + 1
    ).padStart(2, "0") +

    "/" +

    today.getFullYear()
  );


  /* =================================================
     HIDE LOADING
  ================================================= */

  document
    .getElementById(
      "resumeLoading"
    )
    ?.classList
    .add("hidden");


  /* =================================================
     SHOW PAGE 1
  ================================================= */

  document
    .getElementById(
      "resumePage"
    )
    ?.classList
    .remove("hidden");


  /* =================================================
     SHOW PAGE 2
  ================================================= */

  document
    .getElementById(
      "resumePage2"
    )
    ?.classList
    .remove("hidden");


  /* =================================================
     MOBILE SCALE
  ================================================= */

  setTimeout(
    refreshResumeMobileLayout,
    100
  );
}


/* =====================================================
   LOAD RESUME
===================================================== */

async function loadResume() {
  const params =
    new URLSearchParams(
      window.location.search
    );

  const publicId =
    String(
      params.get("id") || ""
    ).trim();


  /* =================================================
     PUBLIC / QR MODE
  ================================================= */

  if (publicId) {
    try {
      const result =
        await apiPost({
          action:
            "resume_public",

          idPaspa:
            publicId
        });

      console.log(
        "PUBLIC RESUME RESULT:",
        result
      );

      if (
        !result ||
        result.success !== true
      ) {
        throw new Error(
          result?.message ||
          "Maklumat ahli tidak dapat diperoleh."
        );
      }

      const publicSession = {
        isLoggedIn:
          false,

        idPaspa:
          result.profile?.idPaspa ||
          publicId,

        namaAhli:
          result.profile?.namaPenuh ||
          "Ahli PASPA",

        googleEmail:
          ""
      };

      displayResume(
        result,
        publicSession
      );

      document.body.classList.add(
        "resume-public-mode"
      );

      return;

    } catch (error) {
      console.error(
        "LOAD PUBLIC RESUME ERROR:",
        error
      );

      showResumeError(
        error.message ||
        "Resume ahli tidak dapat dipaparkan."
      );

      return;
    }
  }


  /* =================================================
     LOGIN MODE
  ================================================= */

  const session =
    getResumeSession();

  if (
    !session ||
    session.isLoggedIn !== true ||
    !session.googleEmail
  ) {
    window.location.href =
      "../index.html";

    return;
  }

  try {
    const result =
      await apiPost({
        action:
          "profile",

        email:
          session.googleEmail
      });

    console.log(
      "RESUME PROFILE RESULT:",
      result
    );

    if (
      !result ||
      result.success !== true
    ) {
      throw new Error(
        result?.message ||
        "Maklumat ahli tidak dapat diperoleh."
      );
    }

    displayResume(
      result,
      session
    );

  } catch (error) {
    console.error(
      "LOAD RESUME ERROR:",
      error
    );

    showResumeError(
      error.message ||
      "Ralat semasa memuatkan maklumat ahli."
    );
  }
}


/* =====================================================
   SHOW ERROR
===================================================== */

function showResumeError(text) {
  document
    .getElementById(
      "resumeLoading"
    )
    ?.classList
    .add("hidden");

  const message =
    document.getElementById(
      "resumeMessage"
    );

  if (message) {
    message.textContent = text;

    message.classList.remove(
      "hidden"
    );
  }
}


/* =====================================================
   GENERATE QR CODE
===================================================== */

function generateResumeQr(idPaspa) {
  const normalizedId =
    String(
      idPaspa || ""
    ).trim();

  if (!normalizedId) {
    console.warn(
      "QR tidak dijana: ID PASPA tiada."
    );

    return;
  }

  const qrContainer =
    document.getElementById(
      "resumeQrCode"
    );

  const qrId =
    document.getElementById(
      "resumeQrId"
    );

  if (!qrContainer) {
    console.warn(
      "Container resumeQrCode tidak ditemui."
    );

    return;
  }

  qrContainer.innerHTML = "";

  const publicUrl =
    new URL(
      "resume.html",
      window.location.href
    );

  publicUrl.search = "";

  publicUrl.searchParams.set(
    "id",
    normalizedId
  );

  console.log(
    "RESUME QR URL:",
    publicUrl.toString()
  );

  if (
    typeof QRCode ===
    "undefined"
  ) {
    console.error(
      "QRCode library tidak ditemui."
    );

    return;
  }

  new QRCode(
    qrContainer,
    {
      text:
        publicUrl.toString(),

      width:
        176,

      height:
        176,

      correctLevel:
        QRCode.CorrectLevel.H
    }
  );

  if (qrId) {
    qrId.textContent =
      "ID PASPA " +
      normalizedId;
  }
}


/* =====================================================
   LOAD PROGRAM + OPERASI
===================================================== */

async function loadResumeActivities(
  idPaspa
) {
  const normalizedId =
    String(
      idPaspa || ""
    ).trim();

  const programBody =
    document.getElementById(
      "resumeProgramBody"
    );

  const operationBody =
    document.getElementById(
      "resumeOperationBody"
    );

  if (!normalizedId) {
    console.warn(
      "Resume activities: ID PASPA tiada."
    );

    return;
  }

  try {
    const result =
      await apiPost({
        action:
          "resume_activities",

        idPaspa:
          normalizedId
      });

    console.log(
      "RESUME ACTIVITIES RESULT:",
      result
    );

    if (
      !result ||
      result.success !== true
    ) {
      throw new Error(
        result?.message ||
        "Rekod penglibatan tidak dapat diperoleh."
      );
    }


    /* =================================================
       PROGRAM
    ================================================= */

    const programs =
      Array.isArray(
        result.programs
      )
        ? result.programs
        : [];

    if (programBody) {
      programBody.innerHTML = "";

      if (
        programs.length === 0
      ) {
        programBody.innerHTML = `
          <tr>
            <td
              colspan="5"
              class="activity-empty"
            >
              TIADA REKOD PROGRAM.
            </td>
          </tr>
        `;
      } else {
        programs.forEach(
          function (
            program,
            index
          ) {
            const row =
              document.createElement(
                "tr"
              );

            row.innerHTML = `
              <td>
                ${index + 1}
              </td>

              <td>
                ${escapeResumeHtml(
                  resumeUpper(
                    program.nama
                  )
                )}
              </td>

              <td>
                ${escapeResumeHtml(
                  resumeUpper(
                    program.tempat
                  )
                )}
              </td>

              <td>
                ${escapeResumeHtml(
                  formatResumeActivityDate(
                    program.tarikhMula
                  )
                )}
              </td>

              <td>
                ${escapeResumeHtml(
                  formatResumeActivityDate(
                    program.tarikhTamat
                  )
                )}
              </td>
            `;

            programBody.appendChild(
              row
            );
          }
        );
      }
    }


    /* =================================================
       OPERASI
    ================================================= */

    const operations =
      Array.isArray(
        result.operations
      )
        ? result.operations
        : [];

    if (operationBody) {
      operationBody.innerHTML = "";

      if (
        operations.length === 0
      ) {
        operationBody.innerHTML = `
          <tr>
            <td
              colspan="5"
              class="activity-empty"
            >
              TIADA REKOD OPERASI.
            </td>
          </tr>
        `;
      } else {
        operations.forEach(
          function (
            operation,
            index
          ) {
            const row =
              document.createElement(
                "tr"
              );

            row.innerHTML = `
              <td>
                ${index + 1}
              </td>

              <td>
                ${escapeResumeHtml(
                  resumeUpper(
                    operation.nama
                  )
                )}
              </td>

              <td>
                ${escapeResumeHtml(
                  resumeUpper(
                    operation.tempat
                  )
                )}
              </td>

              <td>
                ${escapeResumeHtml(
                  formatResumeActivityDate(
                    operation.tarikhMula
                  )
                )}
              </td>

              <td>
                ${escapeResumeHtml(
                  formatResumeActivityDate(
                    operation.tarikhTamat
                  )
                )}
              </td>
            `;

            operationBody.appendChild(
              row
            );
          }
        );
      }
    }

  } catch (error) {
    console.error(
      "LOAD RESUME ACTIVITIES ERROR:",
      error
    );

    if (programBody) {
      programBody.innerHTML = `
        <tr>
          <td
            colspan="5"
            class="activity-empty"
          >
            REKOD PROGRAM TIDAK DAPAT DIMUATKAN.
          </td>
        </tr>
      `;
    }

    if (operationBody) {
      operationBody.innerHTML = `
        <tr>
          <td
            colspan="5"
            class="activity-empty"
          >
            REKOD OPERASI TIDAK DAPAT DIMUATKAN.
          </td>
        </tr>
      `;
    }

  } finally {
    window.dispatchEvent(
      new Event(
        "resumeActivitiesLoaded"
      )
    );
  }
}


/* =====================================================
   GET PHOTO BASE64
   1. PUBLIC ID
   2. LOGIN EMAIL
   3. FALLBACK ID PASPA
===================================================== */

async function getResumePhotoBase64() {
  const params =
    new URLSearchParams(
      window.location.search
    );

  const publicId =
    String(
      params.get("id") || ""
    ).trim();


  /* =================================================
     PUBLIC / QR
  ================================================= */

  if (publicId) {
    const result =
      await apiPost({
        action:
          "resume_public_photo",

        idPaspa:
          publicId
      });

    console.log(
      "PUBLIC RESUME PHOTO BASE64:",
      result
    );

    if (
      !result ||
      result.success !== true ||
      !result.imageDataUrl
    ) {
      throw new Error(
        result?.message ||
        "Gambar ahli tidak dapat diperoleh."
      );
    }

    return result.imageDataUrl;
  }


  /* =================================================
     LOGIN MODE - CUBA EMAIL
  ================================================= */

  const session =
    getResumeSession() || {};

  if (session.googleEmail) {
    try {
      const result =
        await apiPost({
          action:
            "resume_photo",

          email:
            session.googleEmail
        });

      console.log(
        "RESUME PHOTO BASE64:",
        result
      );

      if (
        result &&
        result.success === true &&
        result.imageDataUrl
      ) {
        return result.imageDataUrl;
      }

    } catch (error) {
      console.warn(
        "RESUME PHOTO BY EMAIL FAILED:",
        error
      );
    }
  }


  /* =================================================
     FALLBACK - GUNA ID PASPA
  ================================================= */

  const idPaspa =
    getCurrentResumeId();

  if (!idPaspa) {
    throw new Error(
      "ID PASPA tidak ditemui."
    );
  }

  const fallbackResult =
    await apiPost({
      action:
        "resume_public_photo",

      idPaspa:
        idPaspa
    });

  console.log(
    "RESUME PHOTO FALLBACK:",
    fallbackResult
  );

  if (
    !fallbackResult ||
    fallbackResult.success !== true ||
    !fallbackResult.imageDataUrl
  ) {
    throw new Error(
      fallbackResult?.message ||
      "Gambar ahli tidak dapat diperoleh."
    );
  }

  return fallbackResult.imageDataUrl;
}


/* =====================================================
   WAIT IMAGE
===================================================== */

function waitForResumeImage(img) {
  return new Promise(
    function (resolve) {
      if (!img) {
        resolve();
        return;
      }

      if (
        img.complete &&
        img.naturalWidth > 0
      ) {
        resolve();
        return;
      }

      const finish =
        function () {
          resolve();
        };

      img.addEventListener(
        "load",
        finish,
        {
          once: true
        }
      );

      img.addEventListener(
        "error",
        finish,
        {
          once: true
        }
      );

      setTimeout(
        finish,
        5000
      );
    }
  );
}


/* =====================================================
   WAIT PROGRAM + OPERASI
===================================================== */

async function waitForResumeActivities() {
  const programBody =
    document.getElementById(
      "resumeProgramBody"
    );

  const operationBody =
    document.getElementById(
      "resumeOperationBody"
    );

  let count = 0;

  while (
    count < 50
  ) {
    const programText =
      programBody?.textContent || "";

    const operationText =
      operationBody?.textContent || "";

    const loadingProgram =
      programText.includes(
        "Memuatkan rekod program"
      );

    const loadingOperation =
      operationText.includes(
        "Memuatkan rekod operasi"
      );

    if (
      !loadingProgram &&
      !loadingOperation
    ) {
      return;
    }

    await new Promise(
      function (resolve) {
        setTimeout(
          resolve,
          100
        );
      }
    );

    count++;
  }
}


/* =====================================================
   SAVE PAGE INLINE STYLE
===================================================== */

function saveResumePageStyle(page) {
  return {
    cssText:
      page.getAttribute(
        "style"
      ) || ""
  };
}


/* =====================================================
   RESTORE PAGE INLINE STYLE
===================================================== */

function restoreResumePageStyle(
  page,
  saved
) {
  if (!page) {
    return;
  }

  if (
    saved &&
    saved.cssText
  ) {
    page.setAttribute(
      "style",
      saved.cssText
    );
  } else {
    page.removeAttribute(
      "style"
    );
  }
}


/* =====================================================
   PREPARE PAGE FOR PDF
===================================================== */

function prepareResumePageForPdf(
  page
) {
  if (!page) {
    return;
  }

  page.style.setProperty(
    "zoom",
    "1",
    "important"
  );

  page.style.setProperty(
    "transform",
    "none",
    "important"
  );

  page.style.setProperty(
    "transform-origin",
    "top left",
    "important"
  );

  page.style.setProperty(
    "width",
    "793.7px",
    "important"
  );

  page.style.setProperty(
    "min-width",
    "793.7px",
    "important"
  );

  page.style.setProperty(
    "max-width",
    "793.7px",
    "important"
  );

  page.style.setProperty(
    "height",
    "1122.5px",
    "important"
  );

  page.style.setProperty(
    "min-height",
    "1122.5px",
    "important"
  );

  page.style.setProperty(
    "max-height",
    "1122.5px",
    "important"
  );

  page.style.setProperty(
    "margin",
    "0",
    "important"
  );

  page.style.setProperty(
    "left",
    "0",
    "important"
  );

  page.style.setProperty(
    "right",
    "auto",
    "important"
  );

  page.style.setProperty(
    "position",
    "relative",
    "important"
  );

  page.style.setProperty(
    "overflow",
    "hidden",
    "important"
  );
}


/* =====================================================
   GENERATE PDF
   PAGE 1 + PAGE 2
===================================================== */

async function generateResumePdfBlob() {
  const page1 =
    document.getElementById(
      "resumePage"
    );

  const page2 =
    document.getElementById(
      "resumePage2"
    );

  if (!page1) {
    throw new Error(
      "Muka surat pertama Resume tidak ditemui."
    );
  }

  if (!page2) {
    throw new Error(
      "Muka surat kedua Resume tidak ditemui."
    );
  }

  if (
    typeof html2canvas ===
    "undefined"
  ) {
    throw new Error(
      "html2canvas belum dimuatkan."
    );
  }

  if (
    !window.jspdf ||
    !window.jspdf.jsPDF
  ) {
    throw new Error(
      "jsPDF belum dimuatkan."
    );
  }


  /* =================================================
     SAVE STYLE SEBELUM PDF
  ================================================= */

  const page1SavedStyle =
    saveResumePageStyle(
      page1
    );

  const page2SavedStyle =
    saveResumePageStyle(
      page2
    );


  /* =================================================
     PHOTO
  ================================================= */

  const photo =
    page1.querySelector(
      "#resumePhoto"
    );

  const originalPhotoSrc =
    photo
      ? photo.getAttribute("src") || ""
      : "";


  try {

    /* =================================================
       TUNGGU FONT
    ================================================= */

    if (
      document.fonts &&
      document.fonts.ready
    ) {
      await document.fonts.ready;
    }


    /* =================================================
       TUNGGU PROGRAM + OPERASI
    ================================================= */

    await waitForResumeActivities();


    /* =================================================
       GUNA BASE64 UNTUK GAMBAR AHLI
    ================================================= */

    if (photo) {
      try {
        const base64Photo =
          await getResumePhotoBase64();

        if (base64Photo) {
          photo.removeAttribute(
            "crossorigin"
          );

          photo.src =
            base64Photo;

          await waitForResumeImage(
            photo
          );
        }

      } catch (photoError) {
        console.warn(
          "PDF PHOTO BASE64 ERROR:",
          photoError
        );

        /*
         * Jangan hentikan PDF jika gambar gagal.
         * html2canvas akan cuba capture gambar
         * yang sedang dipaparkan.
         */
      }
    }


    /* =================================================
       PAKSA A4 ASAL
       PENTING UNTUK MOBILE
    ================================================= */

    prepareResumePageForPdf(
      page1
    );

    prepareResumePageForPdf(
      page2
    );


    /* =================================================
       TUNGGU BROWSER REFLOW
    ================================================= */

    await new Promise(
      function (resolve) {
        requestAnimationFrame(
          function () {
            requestAnimationFrame(
              resolve
            );
          }
        );
      }
    );


    /* =================================================
       TUNGGU SEMUA GAMBAR
    ================================================= */

    const allImages =
      Array.from(
        document.querySelectorAll(
          "#resumePage img, #resumePage2 img"
        )
      );

    await Promise.all(
      allImages.map(
        waitForResumeImage
      )
    );


    /* =================================================
       CAPTURE PAGE 1
    ================================================= */

    const canvas1 =
      await html2canvas(
        page1,
        {
          scale:
            2,

          useCORS:
            true,

          allowTaint:
            false,

          backgroundColor:
            "#ffffff",

          logging:
            false,

          width:
            794,

          height:
            1123,

          windowWidth:
            794,

          windowHeight:
            1123,

          scrollX:
            0,

          scrollY:
            0
        }
      );


    /* =================================================
       CAPTURE PAGE 2
    ================================================= */

    const canvas2 =
      await html2canvas(
        page2,
        {
          scale:
            2,

          useCORS:
            true,

          allowTaint:
            false,

          backgroundColor:
            "#ffffff",

          logging:
            false,

          width:
            794,

          height:
            1123,

          windowWidth:
            794,

          windowHeight:
            1123,

          scrollX:
            0,

          scrollY:
            0
        }
      );


    /* =================================================
       CANVAS -> JPEG
    ================================================= */

    const imageData1 =
      canvas1.toDataURL(
        "image/jpeg",
        0.95
      );

    const imageData2 =
      canvas2.toDataURL(
        "image/jpeg",
        0.95
      );


    /* =================================================
       CREATE PDF
    ================================================= */

    const {
      jsPDF
    } = window.jspdf;

    const pdf =
      new jsPDF({
        orientation:
          "portrait",

        unit:
          "mm",

        format:
          "a4",

        compress:
          true
      });


    /* =================================================
       PAGE 1
    ================================================= */

    pdf.addImage(
      imageData1,
      "JPEG",
      0,
      0,
      210,
      297,
      undefined,
      "FAST"
    );


    /* =================================================
       PAGE 2
    ================================================= */

    pdf.addPage(
      "a4",
      "portrait"
    );

    pdf.addImage(
      imageData2,
      "JPEG",
      0,
      0,
      210,
      297,
      undefined,
      "FAST"
    );


    /* =================================================
       RETURN BLOB
    ================================================= */

    return pdf.output(
      "blob"
    );

  } finally {

    /* =================================================
       RESTORE PHOTO
    ================================================= */

    if (
      photo &&
      originalPhotoSrc
    ) {
      photo.src =
        originalPhotoSrc;
    }


    /* =================================================
       RESTORE PAGE STYLES
       INI GANTI page1OldStyle/page2OldStyle
    ================================================= */

    restoreResumePageStyle(
      page1,
      page1SavedStyle
    );

    restoreResumePageStyle(
      page2,
      page2SavedStyle
    );


    /* =================================================
       KEMBALIKAN PAPARAN MOBILE
    ================================================= */

    setTimeout(
      refreshResumeMobileLayout,
      50
    );
  }
}


/* =====================================================
   DOWNLOAD BLOB
===================================================== */

function downloadResumeBlob(
  blob,
  filename
) {
  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    filename;

  link.style.display =
    "none";

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  setTimeout(
    function () {
      URL.revokeObjectURL(
        url
      );
    },
    2000
  );
}


/* =====================================================
   PRINT
===================================================== */

document
  .getElementById(
    "printResumeButton"
  )
  ?.addEventListener(
    "click",
    function () {
      window.print();
    }
  );


/* =====================================================
   DOWNLOAD
===================================================== */

const downloadResumeButton =
  document.getElementById(
    "downloadResumeButton"
  );

if (downloadResumeButton) {
  downloadResumeButton.addEventListener(
    "click",
    async function () {
      const oldText =
        downloadResumeButton.innerHTML;

      try {
        downloadResumeButton.disabled =
          true;

        downloadResumeButton.innerHTML =
          "…";

        const pdfBlob =
          await generateResumePdfBlob();

        const filename =
          getResumePdfFileName();

        downloadResumeBlob(
          pdfBlob,
          filename
        );

      } catch (error) {
        console.error(
          "DOWNLOAD RESUME ERROR:",
          error
        );

        alert(
          "PDF tidak dapat dimuat turun."
        );

      } finally {
        downloadResumeButton.disabled =
          false;

        downloadResumeButton.innerHTML =
          oldText;
      }
    }
  );
}


/* =====================================================
   SHARE
===================================================== */

const shareResumeButton =
  document.getElementById(
    "shareResumeButton"
  );

if (shareResumeButton) {

  shareResumeButton.addEventListener(
    "click",
    async function () {

      const oldText =
        shareResumeButton.innerHTML;

      try {

        shareResumeButton.disabled = true;
        shareResumeButton.innerHTML = "…";


        /* =============================================
           GENERATE PDF
        ============================================= */

        const pdfBlob =
          await generateResumePdfBlob();

        const filename =
          getResumePdfFileName();

        const memberName =
          getCurrentResumeName();

        const idPaspa =
          getCurrentResumeId();


        /* =============================================
           CREATE PDF FILE
        ============================================= */

        let pdfFile = null;

        try {

          pdfFile =
            new File(
              [pdfBlob],
              filename,
              {
                type: "application/pdf"
              }
            );

        } catch (fileError) {

          console.warn(
            "CREATE SHARE FILE ERROR:",
            fileError
          );

        }


        /* =============================================
           CUBA SHARE PDF FILE
        ============================================= */

        if (
          pdfFile &&
          navigator.share
        ) {

          let canShareFile = true;


          /*
           * Jika browser mempunyai canShare(),
           * semak dahulu sama ada PDF boleh dikongsi.
           */

          if (
            typeof navigator.canShare ===
            "function"
          ) {

            try {

              canShareFile =
                navigator.canShare({
                  files: [pdfFile]
                });

            } catch (canShareError) {

              console.warn(
                "navigator.canShare ERROR:",
                canShareError
              );

              canShareFile = false;
            }

          }


          if (canShareFile) {

            try {

              await navigator.share({
                title: "MyResume PASPA",

                text:
                  "MyResume PASPA - " +
                  memberName,

                files: [pdfFile]
              });

              console.log(
                "PDF SHARE SUCCESS"
              );

              return;

            } catch (shareFileError) {

              /*
               * User sendiri tekan Cancel.
               * Tak perlu tunjuk ralat.
               */

              if (
                shareFileError.name ===
                "AbortError"
              ) {

                console.log(
                  "Share dibatalkan oleh pengguna."
                );

                return;
              }


              /*
               * Jangan berhenti.
               * Cuba share URL pula.
               */

              console.warn(
                "PDF FILE SHARE FAILED:",
                shareFileError
              );

            }

          }

        }


        /* =============================================
           FALLBACK:
           SHARE PUBLIC MYRESUME URL
        ============================================= */

        const publicUrl =
          new URL(
            "resume.html",
            window.location.href
          );

        publicUrl.search = "";

        if (idPaspa) {

          publicUrl.searchParams.set(
            "id",
            idPaspa
          );

        }


        if (navigator.share) {

          try {

            await navigator.share({

              title:
                "MyResume PASPA",

              text:
                "MyResume PASPA - " +
                memberName,

              url:
                publicUrl.toString()

            });

            console.log(
              "URL SHARE SUCCESS"
            );

            return;

          } catch (shareUrlError) {

            if (
              shareUrlError.name ===
              "AbortError"
            ) {

              console.log(
                "Share dibatalkan oleh pengguna."
              );

              return;
            }

            console.warn(
              "URL SHARE FAILED:",
              shareUrlError
            );

          }

        }


        /* =============================================
           LAST FALLBACK:
           COPY LINK
        ============================================= */

        if (
          navigator.clipboard &&
          window.isSecureContext
        ) {

          await navigator.clipboard.writeText(
            publicUrl.toString()
          );

          alert(
            "Link MyResume telah disalin."
          );

          return;
        }


        /* =============================================
           JIKA SEMUA TAK SUPPORT
        ============================================= */

        alert(
          "Fungsi Share tidak disokong oleh browser ini. Sila gunakan butang Download."
        );


      } catch (error) {

        if (
          error &&
          error.name === "AbortError"
        ) {

          return;
        }

        console.error(
          "SHARE RESUME ERROR:",
          error
        );

        alert(
          "Resume tidak dapat dikongsi."
        );


      } finally {

        shareResumeButton.disabled =
          false;

        shareResumeButton.innerHTML =
          oldText;

      }

    }
  );

}
/* =====================================================
   MOBILE A4 AUTO SCALE
===================================================== */

function fitResumeToMobile() {
  const pages = [
    document.getElementById(
      "resumePage"
    ),

    document.getElementById(
      "resumePage2"
    )
  ].filter(Boolean);

  if (!pages.length) {
    return;
  }


  /* =================================================
     DESKTOP
  ================================================= */

  if (
    window.innerWidth >
    850
  ) {
    pages.forEach(
      function (page) {
        page.style.removeProperty(
          "zoom"
        );

        page.style.removeProperty(
          "transform"
        );

        page.style.removeProperty(
          "transform-origin"
        );

        page.style.removeProperty(
          "width"
        );

        page.style.removeProperty(
          "min-width"
        );

        page.style.removeProperty(
          "max-width"
        );

        page.style.removeProperty(
          "height"
        );

        page.style.removeProperty(
          "min-height"
        );

        page.style.removeProperty(
          "max-height"
        );

        page.style.removeProperty(
          "margin-left"
        );

        page.style.removeProperty(
          "margin-right"
        );

        page.style.removeProperty(
          "margin-top"
        );

        page.style.removeProperty(
          "margin-bottom"
        );

        page.style.removeProperty(
          "left"
        );

        page.style.removeProperty(
          "right"
        );

        page.style.removeProperty(
          "position"
        );

        page.style.removeProperty(
          "overflow"
        );
      }
    );

    document.documentElement.style.overflowX =
      "";

    document.body.style.overflowX =
      "";

    return;
  }


  /* =================================================
     MOBILE
  ================================================= */

  const A4_WIDTH =
    793.7;

  const viewportWidth =
    document.documentElement.clientWidth ||
    window.innerWidth;

  const sideGap =
    6;

  const availableWidth =
    viewportWidth -
    (
      sideGap *
      2
    );

  const scale =
    Math.min(
      1,
      availableWidth /
      A4_WIDTH
    );

  document.documentElement.style.overflowX =
    "hidden";

  document.body.style.overflowX =
    "hidden";

  pages.forEach(
    function (
      page,
      index
    ) {
      page.style.setProperty(
        "transform",
        "none",
        "important"
      );

      page.style.setProperty(
        "transform-origin",
        "top left",
        "important"
      );

      page.style.setProperty(
        "position",
        "relative",
        "important"
      );

      page.style.setProperty(
        "left",
        "0",
        "important"
      );

      page.style.setProperty(
        "right",
        "auto",
        "important"
      );

      page.style.setProperty(
        "width",
        A4_WIDTH + "px",
        "important"
      );

      page.style.setProperty(
        "min-width",
        A4_WIDTH + "px",
        "important"
      );

      page.style.setProperty(
        "max-width",
        A4_WIDTH + "px",
        "important"
      );

      /*
       * GUNA ZOOM UNTUK MOBILE.
       * JANGAN GUNA transform:scale()
       * kerana transform meninggalkan ruang A4 kosong.
       */

      page.style.setProperty(
        "zoom",
        String(scale)
      );

      page.style.setProperty(
        "margin-left",
        sideGap + "px",
        "important"
      );

      page.style.setProperty(
        "margin-right",
        "0",
        "important"
      );

      page.style.setProperty(
        "margin-bottom",
        "12px",
        "important"
      );

      if (
        index === 0
      ) {
        page.style.setProperty(
          "margin-top",
          "12px",
          "important"
        );
      } else {
        page.style.setProperty(
          "margin-top",
          "0",
          "important"
        );
      }
    }
  );
}


/* =====================================================
   REFRESH MOBILE LAYOUT
===================================================== */

function refreshResumeMobileLayout() {
  requestAnimationFrame(
    function () {
      requestAnimationFrame(
        function () {
          fitResumeToMobile();
        }
      );
    }
  );
}


/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {
    loadResume();
  }
);


/* =====================================================
   WINDOW LOAD
===================================================== */

window.addEventListener(
  "load",
  function () {
    setTimeout(
      refreshResumeMobileLayout,
      100
    );

    setTimeout(
      refreshResumeMobileLayout,
      500
    );

    setTimeout(
      refreshResumeMobileLayout,
      1000
    );
  }
);


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
  "resize",
  function () {
    clearTimeout(
      window.__resumeResizeTimer
    );

    window.__resumeResizeTimer =
      setTimeout(
        refreshResumeMobileLayout,
        120
      );
  }
);


/* =====================================================
   ORIENTATION CHANGE
===================================================== */

window.addEventListener(
  "orientationchange",
  function () {
    setTimeout(
      refreshResumeMobileLayout,
      300
    );
  }
);


/* =====================================================
   AFTER ACTIVITIES LOADED
===================================================== */

window.addEventListener(
  "resumeActivitiesLoaded",
  function () {
    setTimeout(
      refreshResumeMobileLayout,
      100
    );
  }
);