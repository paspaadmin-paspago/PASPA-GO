"use strict";


/* =====================================================
   SESSION
===================================================== */

function getResumeSession() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "paspaGoSession"
      )
    );

  } catch (error) {

    console.error(
      "RESUME SESSION ERROR:",
      error
    );

    return null;

  }

}


/* =====================================================
   SET TEXT
===================================================== */

function setResumeText(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (!element) {
    return;
  }


  const text =
    value === null ||
    value === undefined ||
    String(value).trim() === ""
      ? "-"
      : String(value).trim();


  element.textContent =
    text;

}


/* =====================================================
   FORMAT IC
===================================================== */

function formatResumeIc(value) {

  const digits =
    String(value || "")
      .replace(/\D/g, "");


  if (
    digits.length !== 12
  ) {

    return (
      digits ||
      "-"
    );

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


  const text =
    String(value).trim();


  const iso =
    text.match(
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


  const local =
    text.match(
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


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return text;

  }


  return (
    String(
      date.getUTCDate()
    ).padStart(2, "0") +
    "/" +
    String(
      date.getUTCMonth() + 1
    ).padStart(2, "0") +
    "/" +
    date.getUTCFullYear()
  );

}


/* =====================================================
   GOOGLE DRIVE PHOTO
===================================================== */

function createResumePhotoUrl(
  fileId
) {

  const id =
    String(
      fileId || ""
    ).trim();


  if (!id) {

    return (
      "../images/default-avatar.png"
    );

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

function getResumeBmiCategory(
  value
) {

  const bmi =
    Number(value);


  if (
    !Number.isFinite(bmi)
  ) {

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
   PAPARKAN RESUME
===================================================== */

function displayResume(
  result,
  session
) {

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


/* Jana QR unik ahli */
generateResumeQr(
  profile.idPaspa ||
  session?.idPaspa ||
  ""
);

/* =========================================
   PAGE 2 - IDENTITI & REKOD PENGLIBATAN
========================================= */

const activityId =
  profile.idPaspa ||
  session?.idPaspa ||
  "";


const activityName =
  profile.namaPenuh ||
  session?.namaAhli ||
  "-";


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
    activityName;

}


if (activityMemberId) {

  activityMemberId.textContent =
    "ID PASPA: " +
    (
      activityId ||
      "-"
    );

}


/* Ambil Program + Operasi */
loadResumeActivities(
  activityId
);

  /* =========================
     GAMBAR
  ========================= */

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

  /* =========================
     IDENTITI
  ========================= */

  setResumeText(
    "resumeRank",
    profile.pangkat
  );


  setResumeText(
    "resumeName",
    profile.namaPenuh ||
    session.namaAhli
  );


  setResumeText(
    "resumePaspaId",
    profile.idPaspa ||
    session.idPaspa
  );

  /* =====================================================
   NAMA FAIL PDF
===================================================== */

const pdfIdPaspa =
  String(
    profile.idPaspa ||
    session.idPaspa ||
    "PASPA"
  )
  .trim();


const pdfNamaAhli =
  String(
    profile.namaPenuh ||
    session.namaAhli ||
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


  /* =========================
     PERIBADI
  ========================= */

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
    session.googleEmail
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


  /* =========================
     PERKHIDMATAN
  ========================= */

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


  /* =========================
     PERHUBUNGAN
  ========================= */

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


  /* =========================
     KECERGASAN
  ========================= */

  setResumeText(
    "rBlood",
    profile.jenisDarah
  );


  setResumeText(
    "rHeight",
    fitness.tinggiCm
      ? fitness.tinggiCm +
        " cm"
      : "-"
  );


  setResumeText(
    "rWeight",
    fitness.beratKg
      ? fitness.beratKg +
        " kg"
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


  /* =========================
     PAKAIAN
  ========================= */

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


  /* =========================
     TARIKH CETAK
  ========================= */

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


  document
    .getElementById(
      "resumeLoading"
    )
    ?.classList
    .add(
      "hidden"
    );

/* =========================
   PAPARKAN PAGE 1
========================= */

document
  .getElementById(
    "resumePage"
  )
  ?.classList
  .remove(
    "hidden"
  );


/* =========================
   PAPARKAN PAGE 2
========================= */

document
  .getElementById(
    "resumePage2"
  )
  ?.classList
  .remove(
    "hidden"
  );


/* =========================
   SCALE UNTUK MOBILE
========================= */

setTimeout(
  fitResumeToMobile,
  100
);

}


/* =====================================================
   LOAD DATA
===================================================== */
/* =====================================================
   LOAD RESUME
   - BIASA : guna pengguna login
   - QR    : guna ?id=ID_PASPA
===================================================== */

async function loadResume() {

  /*
   * Semak sama ada URL mempunyai ID PASPA.
   *
   * Contoh:
   * resume.html?id=001
   */

  const params =
    new URLSearchParams(
      window.location.search
    );

  const publicId =
    String(
      params.get("id") || ""
    ).trim();


  /* =================================================
     MODE QR / PUBLIC
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


      /*
       * displayResume() sedia ada
       * memerlukan session.
       *
       * Jadi kita bina session sementara
       * daripada data public.
       */

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


      /*
       * Tandakan page sebagai
       * Public / QR mode.
       */

      document.body.classList.add(
        "resume-public-mode"
      );


      return;


    } catch (error) {

      console.error(
        "LOAD PUBLIC RESUME ERROR:",
        error
      );


      document
        .getElementById(
          "resumeLoading"
        )
        ?.classList
        .add(
          "hidden"
        );


      const message =
        document.getElementById(
          "resumeMessage"
        );


      if (message) {

        message.textContent =
          error.message ||
          "Resume ahli tidak dapat dipaparkan.";

        message.classList.remove(
          "hidden"
        );

      }


      return;

    }

  }


  /* =================================================
     MODE BIASA — AHLI LOGIN
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


    document
      .getElementById(
        "resumeLoading"
      )
      ?.classList
      .add(
        "hidden"
      );


    const message =
      document.getElementById(
        "resumeMessage"
      );


    if (message) {

      message.textContent =
        error.message ||
        "Ralat semasa memuatkan maklumat ahli.";

      message.classList.remove(
        "hidden"
      );

    }

  }

}

/* =====================================================
   PRINT / SAVE PDF
===================================================== */
/* =====================================================
   RESUME PDF FUNCTIONS
===================================================== */

function getResumePdfFileName() {

  const session =
    getResumeSession() || {};


  const idPaspa =
    document
      .getElementById("resumePaspaId")
      ?.textContent
      ?.trim() ||
    session.idPaspa ||
    "PASPA";


  const nama =
    document
      .getElementById("resumeName")
      ?.textContent
      ?.trim() ||
    session.namaAhli ||
    "AHLI";


  const cleanName =
    String(nama)
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");


  return (
    idPaspa +
    "_" +
    cleanName +
    ".pdf"
  );

}

/* =====================================================
   RESUME PHOTO BASE64
   - MyResume biasa : guna email
   - QR / Public    : guna ID PASPA
===================================================== */

async function getResumePhotoBase64() {

  /* -----------------------------------------------
     SEMAK MODE QR / PUBLIC
  ----------------------------------------------- */

  const params =
    new URLSearchParams(
      window.location.search
    );

  const publicId =
    String(
      params.get("id") || ""
    ).trim();


  /* =================================================
     MODE QR / PUBLIC
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
     MODE BIASA / PENGGUNA LOGIN
  ================================================= */

  const session =
    getResumeSession();


  if (
    !session ||
    !session.googleEmail
  ) {

    throw new Error(
      "Sesi pengguna tidak ditemui."
    );

  }


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
     GAMBAR AHLI
  ================================================= */

  const photo =
    page1.querySelector(
      "#resumePhoto"
    );


  const originalPhotoSrc =
    photo
      ? photo.src
      : "";


  /* =================================================
     SIMPAN STYLE ASAL PAGE 1
  ================================================= */

  const page1OldStyle = {

    transform:
      page1.style.transform,

    left:
      page1.style.left,

    margin:
      page1.style.margin,

    marginBottom:
      page1.style.marginBottom

  };


  /* =================================================
     SIMPAN STYLE ASAL PAGE 2
  ================================================= */

  const page2OldStyle = {

    transform:
      page2.style.transform,

    left:
      page2.style.left,

    margin:
      page2.style.margin,

    marginBottom:
      page2.style.marginBottom

  };


  /*
   * Pastikan kedua-dua muka surat
   * berada pada saiz asal semasa PDF.
   */

  page1.style.transform =
    "none";

  page1.style.left =
    "0";

  page1.style.margin =
    "0";

  page1.style.marginBottom =
    "0";


  page2.style.transform =
    "none";

  page2.style.left =
    "0";

  page2.style.margin =
    "0";

  page2.style.marginBottom =
    "0";


  try {

    /* =================================================
       TUNGGU FONT
    ================================================= */

    if (document.fonts?.ready) {

      await document.fonts.ready;

    }


    /* =================================================
       TUNGGU DATA PROGRAM + OPERASI
    ================================================= */

    const programBody =
      document.getElementById(
        "resumeProgramBody"
      );

    const operationBody =
      document.getElementById(
        "resumeOperationBody"
      );


    /*
     * Beri sedikit masa sekiranya API activities
     * masih sedang mengisi jadual.
     */

    let activityWaitCount = 0;


    while (
      activityWaitCount < 30 &&
      (
        programBody?.textContent
          ?.includes(
            "Memuatkan rekod program"
          ) ||

        operationBody?.textContent
          ?.includes(
            "Memuatkan rekod operasi"
          )
      )
    ) {

      await new Promise(
        function (resolve) {

          setTimeout(
            resolve,
            100
          );

        }
      );


      activityWaitCount++;

    }


    /* =================================================
       GUNA GAMBAR BASE64 UNTUK PDF
    ================================================= */

    if (photo) {

      try {

        const base64Photo =
          await getResumePhotoBase64();


        photo.removeAttribute(
          "crossorigin"
        );


        photo.src =
          base64Photo;


        await new Promise(
          function (resolve) {

            if (
              photo.complete &&
              photo.naturalWidth > 0
            ) {

              resolve();
              return;

            }


            photo.onload =
              resolve;

            photo.onerror =
              resolve;

          }
        );


      } catch (photoError) {

        console.error(
          "PDF PHOTO ERROR:",
          photoError
        );

      }

    }


    /* =================================================
       TUNGGU SEMUA GAMBAR PAGE 1 + PAGE 2
    ================================================= */

    const allImages =
      Array.from(
        document.querySelectorAll(
          "#resumePage img, #resumePage2 img"
        )
      );


    await Promise.all(

      allImages.map(
        function (img) {

          if (
            img.complete &&
            img.naturalWidth > 0
          ) {

            return Promise.resolve();

          }


          return new Promise(
            function (resolve) {

              img.onload =
                resolve;

              img.onerror =
                resolve;

            }
          );

        }
      )

    );


    /* =================================================
       CANVAS PAGE 1
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
            false

        }
      );


    /* =================================================
       CANVAS PAGE 2
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
            false

        }
      );


    const imageData1 =
      canvas1.toDataURL(
        "image/jpeg",
        0.98
      );


    const imageData2 =
      canvas2.toDataURL(
        "image/jpeg",
        0.98
      );


    /* =================================================
       BINA PDF
    ================================================= */

    const {
      jsPDF
    } =
      window.jspdf;


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
       PDF PAGE 1
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
       PDF PAGE 2
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
       RETURN PDF BLOB
    ================================================= */

    return pdf.output(
      "blob"
    );


  } finally {

    /* =================================================
       PULIHKAN GAMBAR ASAL
    ================================================= */

    if (
      photo &&
      originalPhotoSrc
    ) {

      photo.src =
        originalPhotoSrc;

    }


    /* =================================================
       PULIHKAN STYLE PAGE 1
    ================================================= */

    page1.style.transform =
      page1OldStyle.transform;

    page1.style.left =
      page1OldStyle.left;

    page1.style.margin =
      page1OldStyle.margin;

    page1.style.marginBottom =
      page1OldStyle.marginBottom;


    /* =================================================
       PULIHKAN STYLE PAGE 2
    ================================================= */

    page2.style.transform =
      page2OldStyle.transform;

    page2.style.left =
      page2OldStyle.left;

    page2.style.margin =
      page2OldStyle.margin;

    page2.style.marginBottom =
      page2OldStyle.marginBottom;


    /* =================================================
       PULIHKAN PAPARAN MOBILE
    ================================================= */

    if (
      window.innerWidth <= 850 &&
      typeof fitResumeToMobile ===
        "function"
    ) {

      setTimeout(
        fitResumeToMobile,
        50
      );

    }

  }

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
   DOWNLOAD PDF
===================================================== */

document
  .getElementById(
    "downloadResumeButton"
  )
  ?.addEventListener(
    "click",
    async function () {

      const button =
        this;


      const oldText =
        button.innerHTML;


      try {

        button.disabled =
          true;

        button.innerHTML =
          "Generating...";


        const blob =
          await generateResumePdfBlob();


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
          getResumePdfFileName();


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
          1000
        );


      } catch (error) {

        console.error(
          "DOWNLOAD RESUME ERROR:",
          error
        );


        alert(
          "PDF tidak dapat dihasilkan. " +
          (
            error.message ||
            ""
          )
        );


      } finally {

        button.disabled =
          false;

        button.innerHTML =
          oldText;

      }

    }
  );


/* =====================================================
   SHARE PDF
===================================================== */

document
  .getElementById(
    "shareResumeButton"
  )
  ?.addEventListener(
    "click",
    async function () {

      const button =
        this;


      const oldText =
        button.innerHTML;


      try {

        button.disabled =
          true;

        button.innerHTML =
          "Preparing...";


        const blob =
          await generateResumePdfBlob();


        const fileName =
          getResumePdfFileName();


        const file =
          new File(
            [blob],
            fileName,
            {
              type:
                "application/pdf"
            }
          );


        /*
          Android / browser yang support
          Web Share API + file.
        */

        if (
          navigator.share &&
          (
            !navigator.canShare ||
            navigator.canShare({
              files: [file]
            })
          )
        ) {

          await navigator.share({

            title:
              "Maklumat Ahli PASPA",

            text:
              "Maklumat Ahli PASPA",

            files:
              [file]

          });


          return;

        }


        /*
          Jika browser tak support
          share fail, download PDF.
        */

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
          fileName;


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
          1000
        );


        alert(
          "Peranti ini tidak menyokong perkongsian fail secara terus. PDF telah dimuat turun."
        );


      } catch (error) {

        /*
          User tekan Cancel pada Share
          bukan dianggap error.
        */

        if (
          error?.name ===
          "AbortError"
        ) {

          return;

        }


        console.error(
          "SHARE RESUME ERROR:",
          error
        );


        alert(
          "Resume tidak dapat dikongsi. " +
          (
            error.message ||
            ""
          )
        );


      } finally {

        button.disabled =
          false;

        button.innerHTML =
          oldText;

      }

    }
  );

/* =====================================================
   GENERATE RESUME QR CODE
===================================================== */

function generateResumeQr(idPaspa) {

  const normalizedId =
    String(idPaspa || "").trim();

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


  /* Kosongkan QR lama jika ada */
  qrContainer.innerHTML = "";


  /*
   * Bina URL public Resume.
   *
   * Contoh:
   * https://paspaadmin-paspago.github.io/PASPA-GO/pages/resume.html?id=001
   */

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


  /* Pastikan library QR tersedia */
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


  /* Paparkan ID di bawah QR */
  if (qrId) {

    qrId.textContent =
      "ID PASPA " +
      normalizedId;

  }

}

/* =====================================================
   LOAD RESUME ACTIVITIES
   PROGRAM + OPERASI
===================================================== */

async function loadResumeActivities(idPaspa) {

  const normalizedId =
    String(idPaspa || "").trim();


  if (!normalizedId) {

    console.warn(
      "Resume activities: ID PASPA tiada."
    );

    return;
  }


  const programBody =
    document.getElementById(
      "resumeProgramBody"
    );

  const operationBody =
    document.getElementById(
      "resumeOperationBody"
    );


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
      Array.isArray(result.programs)
        ? result.programs
        : [];


    if (programBody) {

      programBody.innerHTML = "";


      if (programs.length === 0) {

        programBody.innerHTML = `
          <tr>
            <td
              colspan="5"
              class="activity-empty"
            >
              Tiada rekod program.
            </td>
          </tr>
        `;

      } else {

        programs.forEach(
          function (program, index) {

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
                  program.nama || "-"
                )}
              </td>

              <td>
                ${escapeResumeHtml(
                  program.tempat || "-"
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
      Array.isArray(result.operations)
        ? result.operations
        : [];


    if (operationBody) {

      operationBody.innerHTML = "";


      if (operations.length === 0) {

        operationBody.innerHTML = `
          <tr>
            <td
              colspan="5"
              class="activity-empty"
            >
              Tiada rekod operasi.
            </td>
          </tr>
        `;

      } else {

        operations.forEach(
          function (operation, index) {

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
                  operation.nama || "-"
                )}
              </td>

              <td>
                ${escapeResumeHtml(
                  operation.tempat || "-"
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
            Rekod program tidak dapat dimuatkan.
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
            Rekod operasi tidak dapat dimuatkan.
          </td>
        </tr>
      `;

    }

  }

}


/* =====================================================
   FORMAT TARIKH PROGRAM / OPERASI
===================================================== */

function formatResumeActivityDate(value) {

  if (!value) {
    return "-";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value);

  }


  return date.toLocaleDateString(
    "ms-MY",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

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
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadResume();

  }
);
/* =====================================================
   MOBILE A4 AUTO SCALE
   PAGE 1 + PAGE 2
   FIX ANDROID / PWA / TWA
===================================================== */

function fitResumeToMobile() {

  const page1 =
    document.getElementById("resumePage");

  const page2 =
    document.getElementById("resumePage2");

  const pages =
    [page1, page2].filter(Boolean);


  if (pages.length === 0) {
    return;
  }


  /* =================================================
     DESKTOP
  ================================================= */

  if (window.innerWidth > 850) {

    document.documentElement.style.overflowX = "";
    document.body.style.overflowX = "";

    pages.forEach(function (page) {

      page.style.transform = "";
      page.style.transformOrigin = "";

      page.style.position = "";
      page.style.left = "";
      page.style.right = "";

      page.style.marginLeft = "";
      page.style.marginRight = "";
      page.style.marginBottom = "";

    });

    return;
  }


  /* =================================================
     MOBILE
  ================================================= */

  /*
   * Saiz sebenar A4 yang digunakan oleh Resume.
   * 210mm ≈ 793.7px pada 96dpi.
   */

  const originalWidth = 793.7;


  /*
   * Gunakan lebar viewport sebenar.
   *
   * Jangan gunakan document.body.clientWidth kerana
   * body mungkin sudah menjadi 793px disebabkan A4.
   */

  const viewportWidth =
    document.documentElement.clientWidth ||
    window.innerWidth;


  /*
   * Sedikit ruang kiri + kanan.
   */

  const sideGap = 8;

  const availableWidth =
    Math.max(
      280,
      viewportWidth - (sideGap * 2)
    );


  const scale =
    Math.min(
      1,
      availableWidth / originalWidth
    );


  /*
   * Elakkan keseluruhan website menjadi selebar
   * A4 pada Android / PWA.
   */

  document.documentElement.style.overflowX =
    "hidden";

  document.body.style.overflowX =
    "hidden";


  pages.forEach(function (page) {

    /*
     * Sangat penting:
     *
     * Scale mesti bermula daripada KIRI ATAS.
     *
     * Jika "top center" digunakan, browser masih
     * meletakkan pusat A4 pada kedudukan asal dan
     * hasilnya Resume tertolak ke sebelah kanan.
     */

    page.style.transformOrigin =
      "top left";


    /*
     * Jangan gunakan:
     *
     * left: 50%
     * translateX(-50%)
     *
     * kerana ia menyebabkan masalah pada sesetengah
     * Android WebView / TWA.
     */

    page.style.position =
      "relative";

    page.style.left =
      "0";

    page.style.right =
      "auto";


    /*
     * Letakkan muka surat bermula daripada kiri
     * viewport.
     */

    page.style.marginLeft =
      sideGap + "px";

    page.style.marginRight =
      "0";


    /*
     * Scale A4.
     */

    page.style.transform =
      "scale(" + scale + ")";


    /*
     * Transform tidak mengubah ruang layout sebenar.
     *
     * Browser masih menganggap page mempunyai tinggi
     * A4 asal.
     *
     * Jadi kita tolak lebihan tinggi supaya Page 2
     * terus berada selepas Page 1.
     */

    const originalHeight =
      page.offsetHeight;


    const scaledHeight =
      originalHeight * scale;


    const unusedHeight =
      originalHeight -
      scaledHeight;


    /*
     * 12px = ruang sebenar antara Page 1 dan Page 2.
     */

    page.style.marginBottom =
      (-unusedHeight + 12) + "px";

  });

}


/* =====================================================
   RUN MOBILE SCALE
===================================================== */

function refreshResumeMobileLayout() {

  /*
   * requestAnimationFrame membantu Android menunggu
   * browser selesai membuat layout sebelum scale.
   */

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
   WINDOW LOAD
===================================================== */

window.addEventListener(
  "load",
  function () {

    setTimeout(
      refreshResumeMobileLayout,
      250
    );

    /*
     * Jalankan sekali lagi selepas gambar / font
     * berkemungkinan selesai dimuatkan.
     */

    setTimeout(
      refreshResumeMobileLayout,
      800
    );

  }
);


/* =====================================================
   RESIZE / ORIENTATION
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
        150
      );

  }
);


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
   REFRESH SELEPAS DATA PROGRAM / OPERASI SIAP
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
