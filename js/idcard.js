"use strict";


/* =====================================================
   ELEMENT
===================================================== */

const digitalCard =
  document.getElementById(
    "digitalCard"
  );

const cardStage =
  document.getElementById(
    "cardStage"
  );

const flipCardButton =
  document.getElementById(
    "flipCardButton"
  );

const fullscreenButton =
  document.getElementById(
    "fullscreenButton"
  );

const downloadCardButton =
  document.getElementById(
    "downloadCardButton"
  );

const idCardPhoto =
  document.getElementById(
    "idCardPhoto"
  );

const idCardPaspaId =
  document.getElementById(
    "idCardPaspaId"
  );

const idCardName =
  document.getElementById(
    "idCardName"
  );

const idCardIc =
  document.getElementById(
    "idCardIc"
  );

const idCardBlood =
  document.getElementById(
    "idCardBlood"
  );

const idCardMessage =
  document.getElementById(
    "idCardMessage"
  );


let currentSession = null;


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
   FORMAT IC
===================================================== */

function formatIc(value) {

  const digits =
    String(value || "")
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
   GOOGLE DRIVE PHOTO
===================================================== */

function createDrivePhotoUrl(
  fileId
) {

  const id =
    String(fileId || "")
      .trim();


  if (!id) {

    return (
      "../images/default-avatar.png"
    );

  }


  return (
    "https://drive.google.com/thumbnail?id=" +
    encodeURIComponent(id) +
    "&sz=w800"
  );

}


/* =====================================================
   MESSAGE
===================================================== */

function showCardMessage(
  message,
  type = "info"
) {

  if (!idCardMessage) {
    return;
  }


  idCardMessage.textContent =
    message;


  idCardMessage.className =
    "message " + type;

}


/* =====================================================
   LOAD MEMBER DATA
===================================================== */

async function loadDigitalCard() {

  currentSession =
    getSession();


  if (
    !currentSession ||
    currentSession.isLoggedIn !== true ||
    !currentSession.googleEmail
  ) {

    window.location.href =
      "../index.html";

    return;

  }


  try {

    /*
     * Kita guna profile API kerana
     * profile mempunyai:
     *
     * - Nama
     * - ID PASPA
     * - IC
     * - Jenis Darah
     * - FOTO_FILE_ID
     */

    const result =
      await apiPost({

        action: "profile",

        email:
          currentSession.googleEmail

      });


    if (
      result.success !== true
    ) {

      throw new Error(
        result.message ||
        "Maklumat ID Kad tidak dapat diperoleh."
      );

    }


    const profile =
      result.profile || {};


    /* Nama */

    idCardName.textContent =
      profile.namaPenuh ||
      currentSession.namaAhli ||
      "-";


    /* ID PASPA */

    idCardPaspaId.textContent =
      profile.idPaspa ||
      currentSession.idPaspa ||
      "-";


    /* IC */

    idCardIc.textContent =
      formatIc(
        profile.noKadPengenalan
      );


    /* Blood */

    idCardBlood.textContent =
      "Blood Type: " +
      (
        profile.jenisDarah ||
        "-"
      );


    /* Gambar */

    if (profile.fotoFileId) {

  try {

    const photoResult =
      await apiPost({
        action: "member_photo_base64",
        fileId: profile.fotoFileId
      });

    if (
      photoResult.success === true &&
      photoResult.dataUrl
    ) {

      idCardPhoto.src =
        photoResult.dataUrl;

    } else {

      idCardPhoto.src =
        createDrivePhotoUrl(
          profile.fotoFileId
        );

    }

  } catch (photoError) {

    console.error(
      "LOAD PHOTO BASE64 ERROR:",
      photoError
    );

    idCardPhoto.src =
      createDrivePhotoUrl(
        profile.fotoFileId
      );

  }

} else {

  idCardPhoto.src =
    "../images/default-avatar.png";

}


  } catch (error) {

    console.error(
      "LOAD DIGITAL CARD ERROR:",
      error
    );


    showCardMessage(
      error.message,
      "error"
    );

  }

}


/* =====================================================
   FLIP
===================================================== */

function flipCard() {

  if (!digitalCard) {
    return;
  }


  digitalCard.classList.toggle(
    "is-flipped"
  );

}


if (flipCardButton) {

  flipCardButton.addEventListener(
    "click",
    flipCard
  );

}


/* =====================================================
   FULLSCREEN
===================================================== */

if (fullscreenButton) {

  fullscreenButton.addEventListener(
    "click",
    async function () {

      try {

        if (
          !document.fullscreenElement
        ) {

          await cardStage
            .requestFullscreen();

        } else {

          await document
            .exitFullscreen();

        }

      } catch (error) {

        console.error(
          "FULLSCREEN ERROR:",
          error
        );

      }

    }
  );

}


/* =====================================================
   SENTUH CARD KETIKA FULLSCREEN
   = FLIP
===================================================== */

if (digitalCard) {

  digitalCard.addEventListener(
    "click",
    function () {

      if (
        document.fullscreenElement
      ) {

        flipCard();

      }

    }
  );

}

/* =====================================================
   TUNGGU GAMBAR AHLI SIAP LOAD
===================================================== */

function waitForImage(image) {

  return new Promise(function (resolve) {

    if (
      image.complete &&
      image.naturalWidth > 0
    ) {
      resolve();
      return;
    }

    image.onload = function () {
      resolve();
    };

    image.onerror = function () {
      resolve();
    };

  });

}


/* =====================================================
   DOWNLOAD FRONT + BACK PNG
===================================================== */

if (downloadCardButton) {

  downloadCardButton.addEventListener(
    "click",
    async function () {

      const originalContent =
        downloadCardButton.innerHTML;

      const wasFlipped =
        digitalCard.classList.contains(
          "is-flipped"
        );

      try {

        downloadCardButton.disabled =
          true;

        downloadCardButton.innerHTML =
          "⏳ <span>Memproses...</span>";


        /* =============================================
           PASTIKAN GAMBAR AHLI SIAP
        ============================================= */

        await waitForImage(
          idCardPhoto
        );


        /* =============================================
           PASTIKAN CARD KEMBALI KE FRONT
        ============================================= */

        if (wasFlipped) {

          digitalCard.classList.remove(
            "is-flipped"
          );

          await new Promise(
            function (resolve) {
              setTimeout(
                resolve,
                750
              );
            }
          );

        }


        /* =============================================
           NAMA FAIL
        ============================================= */

        const memberId =
          String(
            idCardPaspaId.textContent ||
            "MEMBER"
          )
          .trim()
          .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
          );


        /* =============================================
           DOWNLOAD FRONT
        ============================================= */

        const frontCard =
          digitalCard.querySelector(
            ".card-front"
          );


        const frontCanvas =
          await html2canvas(
            frontCard,
            {
              scale: 3,
              useCORS: true,
              allowTaint: false,
              backgroundColor: null
            }
          );


        const frontLink =
          document.createElement(
            "a"
          );


        frontLink.download =
          "PASPA-ID-" +
          memberId +
          "-FRONT.png";


        frontLink.href =
          frontCanvas.toDataURL(
            "image/png"
          );


        document.body.appendChild(
          frontLink
        );

        frontLink.click();

        frontLink.remove();


        /* Tunggu sedikit sebelum file kedua */

        await new Promise(
          function (resolve) {
            setTimeout(
              resolve,
              800
            );
          }
        );


        /* =============================================
           DOWNLOAD BACK
        ============================================= */

        const backCard =
          digitalCard.querySelector(
            ".card-back"
          );


        /*
         * Simpan style asal kerana card-back
         * mempunyai rotateY(180deg).
         */

        const oldTransform =
          backCard.style.transform;

        const oldPosition =
          backCard.style.position;

        const oldInset =
          backCard.style.inset;

        const oldVisibility =
          backCard.style.visibility;


        /*
         * Jadikan back normal sementara
         * supaya html2canvas boleh screenshot.
         */

        backCard.style.transform =
          "none";

        backCard.style.position =
          "relative";

        backCard.style.inset =
          "auto";

        backCard.style.visibility =
          "visible";


        const backCanvas =
          await html2canvas(
            backCard,
            {
              scale: 3,
              useCORS: true,
              allowTaint: false,
              backgroundColor: null
            }
          );


        const backLink =
          document.createElement(
            "a"
          );


        backLink.download =
          "PASPA-ID-" +
          memberId +
          "-BACK.png";


        backLink.href =
          backCanvas.toDataURL(
            "image/png"
          );


        document.body.appendChild(
          backLink
        );

        backLink.click();

        backLink.remove();


        /* =============================================
           PULIHKAN CARD BACK
        ============================================= */

        backCard.style.transform =
          oldTransform;

        backCard.style.position =
          oldPosition;

        backCard.style.inset =
          oldInset;

        backCard.style.visibility =
          oldVisibility;


        showCardMessage(
          "ID Kad depan dan belakang berjaya dimuat turun.",
          "success"
        );


      } catch (error) {

        console.error(
          "DOWNLOAD ID CARD ERROR:",
          error
        );

        showCardMessage(
          "ID Kad tidak dapat dimuat turun.",
          "error"
        );


      } finally {

        downloadCardButton.disabled =
          false;

        downloadCardButton.innerHTML =
          originalContent;


        /* Pulihkan posisi asal jika tadi back */

        if (wasFlipped) {

          digitalCard.classList.add(
            "is-flipped"
          );

        }

      }

    }
  );

}


/* =====================================================
   GAMBAR GAGAL LOAD
===================================================== */

if (idCardPhoto) {

  idCardPhoto.addEventListener(
    "error",
    function () {

      idCardPhoto.src =
        "../images/default-avatar.png";

    }
  );

}


/* =====================================================
   START
===================================================== */

loadDigitalCard();