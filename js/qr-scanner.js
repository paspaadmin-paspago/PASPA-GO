
"use strict";

/* ==========================================
   PASPA GO - QR SCANNER

   1. IMBAS QR
   2. SEMAK PROGRAM
   3. SEMAK JEMPUTAN
   4. TUNGGU PENGESAHAN
   5. REKOD HADIR JIKA TEKAN PASTI
========================================== */

/* ==========================================
   ELEMENT HTML
========================================== */

const qrVideo =
  document.getElementById("qrVideo");

const qrStartButton =
  document.getElementById("qrStartButton");

const qrStopButton =
  document.getElementById("qrStopButton");

const qrScanAgainButton =
  document.getElementById("qrScanAgainButton");

const qrBackButton =
  document.getElementById("qrBackButton");

const qrHomeButton =
  document.getElementById("qrHomeButton");

const qrStatus =
  document.getElementById("qrStatus");

const qrResultCard =
  document.getElementById("qrResultCard");

const qrResultText =
  document.getElementById("qrResultText");

const qrResultType =
  document.getElementById("qrResultType");

const qrCameraPlaceholder =
  document.getElementById("qrCameraPlaceholder");

const qrScanFrame =
  document.getElementById("qrScanFrame");

const qrConfirmPanel =
  document.getElementById("qrConfirmPanel");

const qrConfirmQuestion =
  document.getElementById("qrConfirmQuestion");

const qrConfirmButton =
  document.getElementById("qrConfirmButton");

const qrDeclineButton =
  document.getElementById("qrDeclineButton");

const qrResultNote =
  document.getElementById("qrResultNote");


/* ==========================================
   VARIABLES
========================================== */

let qrStream = null;
let qrAnimationId = null;

let qrIsScanning = false;
let qrStarting = false;
let qrProcessing = false;

let qrScanSession = 0;

let qrPendingData = null;

const qrCanvas =
  document.createElement("canvas");

const qrContext =
  qrCanvas.getContext(
    "2d",
    { willReadFrequently: true }
  );


/* ==========================================
   STATUS
========================================== */

function setQrStatus(message, type = "") {

  qrStatus.textContent = message;

  qrStatus.className =
    "qr-status" +
    (type ? " " + type : "");

  // Papar status hanya jika berlaku ralat.
  qrStatus.hidden = (type !== "error");

}



/* ==========================================
   HENTIKAN KAMERA
========================================== */

function stopQrScanner() {

  qrScanSession++;

  qrIsScanning = false;
  qrStarting = false;

  if (qrAnimationId !== null) {

    cancelAnimationFrame(qrAnimationId);

    qrAnimationId = null;

  }

  if (qrStream) {

    qrStream.getTracks().forEach(
      function(track) {
        track.stop();
      }
    );

    qrStream = null;

  }

  if (qrVideo.srcObject) {
    qrVideo.srcObject = null;
  }

  qrVideo.style.display = "none";

  qrCameraPlaceholder.style.display =
    "flex";

  qrScanFrame.hidden = true;

qrStartButton.disabled = false;

updateQrCameraButton();

}


/* ==========================================
   SEMAK URL QR RASMI PASPA GO
========================================== */

function parseQrProgram(value) {

  let url;

  try {

    url = new URL(value);

  } catch (error) {

    throw new Error(
      "Kod QR tidak mengandungi URL yang sah."
    );

  }

  const allowedOrigin =
    "https://paspaadmin-paspago.github.io";

  const allowedPath =
    "/PASPA-GO/pages/kehadiran-scan.html";

  if (
    url.origin !== allowedOrigin ||
    url.pathname !== allowedPath
  ) {

    throw new Error(
      "QR ini bukan QR kehadiran rasmi PASPA GO."
    );

  }

  const type = String(
    url.searchParams.get("type") || ""
  ).trim().toUpperCase();

  if (type !== "PROGRAM") {

    throw new Error(
      "Pengimbasan ini hanya menyokong QR Program."
    );

  }

  const courseId = String(
    url.searchParams.get("courseId") || ""
  ).trim();

  const recordId = String(
    url.searchParams.get("recordId") || ""
  ).trim();

  const qrId = courseId || recordId;

  if (
    !/^MSG-[A-Za-z0-9-]+$/.test(qrId) &&
    !/^CRS-[A-Za-z0-9-]+$/.test(qrId)
  ) {

    throw new Error(
      "ID program dalam QR tidak sah."
    );

  }

  return {
    type: "PROGRAM",
    qrId: qrId
  };

}


/* ==========================================
   DAPATKAN TOKEN SESI
========================================== */

function getQrSessionToken() {

  let session;

  try {

    session = JSON.parse(
      localStorage.getItem(
        "paspaGoSession"
      ) || "null"
    );

  } catch (error) {

    throw new Error(
      "Sesi login tidak sah. Sila login semula."
    );

  }

  if (
    !session ||
    !session.isLoggedIn
  ) {

    throw new Error(
      "Sila log masuk ke PASPA GO."
    );

  }

  const sessionToken = String(
    session.sessionToken ||
    session.token ||
    ""
  ).trim();

  if (!sessionToken) {

    throw new Error(
      "Token sesi tidak ditemui. Sila login semula."
    );

  }

  return sessionToken;

}


/* ==========================================
   FORMAT TARIKH
========================================== */

function formatQrDate(value) {

  if (!value) return "-";

  const text = String(value).trim();

  const iso = text.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (iso) {

    return (
      iso[3] + "/" +
      iso[2] + "/" +
      iso[1]
    );

  }

  const date = new Date(text);

  if (isNaN(date.getTime())) {
    return text;
  }

  return date.toLocaleDateString(
    "ms-MY",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Kuala_Lumpur"
    }
  );

}


/* ==========================================
   BINA PAPARAN MAKLUMAT PROGRAM
========================================== */

function buildQrProgramText(
  info,
  status = ""
) {

  const mula =
    formatQrDate(info.tarikhMula);

  const tamat =
    formatQrDate(info.tarikhTamat);

  let tarikh = "-";

  if (
    mula === "-" &&
    tamat === "-"
  ) {

    tarikh =
      info.tarikhAcara || "-";

  } else if (
    tamat === "-" ||
    mula === tamat
  ) {

    tarikh = mula;

  } else {

    tarikh =
      mula + " hingga " + tamat;

  }

  let text =
    "Nama Program: " +
    (info.namaProgram || "-") +

    "\n\nTarikh: " +
    tarikh +

    "\n\nTempat: " +
    (info.tempat || "-");

  if (status) {

    text +=
      "\n\nStatus Kehadiran: " +
      status;

  }

  return text;

}


/* ==========================================
   RESET PANEL PENGESAHAN
========================================== */

function resetQrConfirmation() {

  qrPendingData = null;

  qrConfirmPanel.hidden = true;
  qrResultNote.hidden = true;

  qrConfirmButton.disabled = false;
  qrDeclineButton.disabled = false;

}


/* ==========================================
   IMBAS QR - SEMAK SAHAJA

   BELUM SIMPAN KEHADIRAN
========================================== */

async function handleQrResult(value) {

  if (
    qrProcessing ||
    qrPendingData
  ) {
    return;
  }

  qrProcessing = true;

  stopQrScanner();

  resetQrConfirmation();

  qrResultCard.hidden = false;

  qrResultType.textContent =
    "Kod QR berjaya dibaca.";

  qrResultText.textContent =
    "Sedang menyemak maklumat program...";

  qrScanAgainButton.disabled = true;

  setQrStatus(
    "Sedang menyemak jemputan..."
  );

  try {

    /* SEMAK QR */

    const qrData =
      parseQrProgram(value);

    /* SEMAK SESI */

    const sessionToken =
      getQrSessionToken();

    if (
      typeof apiPost !== "function"
    ) {

      throw new Error(
        "Sambungan API tidak tersedia."
      );

    }

    /* PANGGIL API PREVIEW */

    const response = await apiPost({

      action: "qr_attendance_preview",

      sessionToken: sessionToken,

      type: qrData.type,

      courseId: qrData.qrId

    });

    if (
      !response ||
      response.success !== true
    ) {

      throw new Error(
        response && response.message
          ? response.message
          : "Gagal menyemak QR."
      );

    }

    /* PAPAR MAKLUMAT PROGRAM */

    const info =
      response.programInfo || {};

    qrResultText.textContent =
      buildQrProgramText(info);

    qrResultText.style.whiteSpace =
      "pre-line";

    /* KEHADIRAN DIMUKTAMADKAN ADMIN */

    if (response.adminLocked) {

      qrResultType.textContent =
        "Kehadiran telah dimuktamadkan oleh admin.";

      qrResultText.textContent =
        buildQrProgramText(
          info,
          response.existingStatus ||
          "Dimuktamadkan"
        );

      setQrStatus(
        "Status kehadiran tidak boleh diubah."
      );

      return;

    }

    /* SUDAH HADIR SEBELUM INI */

    if (response.alreadyRecorded) {

      qrResultType.textContent =
        "Kehadiran anda telah direkodkan sebelum ini.";

      qrResultText.textContent =
        buildQrProgramText(
          info,
          "HADIR"
        );

      setQrStatus(
        "Kehadiran: HADIR",
        "success"
      );

      return;

    }

    /* SIMPAN DATA SEMENTARA
       BUKAN DALAM DATABASE */

    qrPendingData = {

      qrId: qrData.qrId,

      sessionToken: sessionToken,

      programInfo: info

    };

    /* SOALAN MENGIKUT JEMPUTAN */

    if (response.invited === true) {

      qrConfirmQuestion.textContent =
        "Adakah anda pasti hadir program ini?";

    } else {

      qrConfirmQuestion.textContent =
        "Maaf. Nama anda tiada dalam " +
        "senarai jemputan program ini. " +
        "Adakah anda ingin menyertainya?";

    }

    qrResultType.textContent =
      "Sila sahkan kehadiran anda.";

    qrConfirmPanel.hidden = false;
    qrResultNote.hidden = false;

    setQrStatus(
      "Menunggu pengesahan anda."
    );

  } catch (error) {

    console.error(
      "QR PREVIEW ERROR:",
      error
    );

    resetQrConfirmation();

    qrResultType.textContent =
      "Semakan QR gagal.";

    qrResultText.textContent =
      error.message ||
      "Sila cuba lagi.";

    setQrStatus(
      "Semakan gagal.",
      "error"
    );

  } finally {

    qrProcessing = false;

    qrScanAgainButton.disabled = false;

  }

}


/* ==========================================
   BUTANG PASTI

   HANYA DI SINI KEHADIRAN DISIMPAN
========================================== */

qrConfirmButton.addEventListener(
  "click",
  async function() {

    if (
      !qrPendingData ||
      qrProcessing
    ) {
      return;
    }

    qrProcessing = true;

    qrConfirmButton.disabled = true;
    qrDeclineButton.disabled = true;
    qrScanAgainButton.disabled = true;

    setQrStatus(
      "Sedang merekodkan kehadiran..."
    );

    const pending = qrPendingData;

    try {

      /* PANGGIL API SIMPAN KEHADIRAN */

      const response = await apiPost({

        action: "qr_attendance_scan",

        sessionToken: pending.sessionToken,

        type: "PROGRAM",

        courseId: pending.qrId

      });

      if (
        !response ||
        response.success !== true
      ) {

        throw new Error(
          response && response.message
            ? response.message
            : "Gagal merekodkan kehadiran."
        );

      }

      const status = String(
        response.statusKehadiran || ""
      ).trim().toUpperCase();

      const info =
        response.programInfo ||
        pending.programInfo;

      qrResultText.textContent =
        buildQrProgramText(
          info,
          status || "Tidak diketahui"
        );

      qrResultType.textContent =
        response.message ||
        "Semakan kehadiran selesai.";

      /* TUTUP PANEL SELEPAS BERJAYA */

      resetQrConfirmation();

      if (status === "HADIR") {

        setQrStatus(
          "Kehadiran: HADIR",
          "success"
        );

      } else {

        setQrStatus(
          "Status kehadiran dikekalkan oleh admin.",
          "error"
        );

      }

    } catch (error) {

      console.error(
        "QR CONFIRM ERROR:",
        error
      );

      qrResultType.textContent =
        "Kehadiran belum dapat disahkan.";

      setQrStatus(
        error.message ||
        "Sila cuba lagi.",
        "error"
      );

      /* KEKALKAN PANEL UNTUK CUBA LAGI */

    } finally {

      qrProcessing = false;

      qrConfirmButton.disabled = false;
      qrDeclineButton.disabled = false;
      qrScanAgainButton.disabled = false;

    }

  }
);


/* ==========================================
   BUTANG TIDAK

   TIDAK MENGUBAH DATABASE
========================================== */

qrDeclineButton.addEventListener(
  "click",
  function() {

    if (qrProcessing) {
      return;
    }

    resetQrConfirmation();

    qrResultType.textContent =
      "Pengesahan dibatalkan.";

    qrResultText.textContent =
      "Tiada kehadiran baharu direkodkan.";

    setQrStatus(
      "Anda memilih TIDAK."
    );

  }
);


/* ==========================================
   BACA VIDEO KAMERA
========================================== */

function scanQrFrame() {

  if (
    !qrIsScanning ||
    qrProcessing
  ) {
    return;
  }

  if (
    qrVideo.readyState >=
      HTMLMediaElement.HAVE_CURRENT_DATA &&
    qrVideo.videoWidth > 0 &&
    qrVideo.videoHeight > 0
  ) {

    const width =
      qrVideo.videoWidth;

    const height =
      qrVideo.videoHeight;

    qrCanvas.width = width;
    qrCanvas.height = height;

    qrContext.drawImage(
      qrVideo,
      0,
      0,
      width,
      height
    );

    const imageData =
      qrContext.getImageData(
        0,
        0,
        width,
        height
      );

    const result = jsQR(
      imageData.data,
      width,
      height,
      {
        inversionAttempts: "dontInvert"
      }
    );

    if (
      result &&
      result.data
    ) {

      handleQrResult(
        result.data
      );

      return;

    }

  }

  qrAnimationId =
    requestAnimationFrame(
      scanQrFrame
    );

}


/* ==========================================
   BUKA KAMERA
========================================== */

async function startQrScanner() {

  if (
    qrStarting ||
    qrIsScanning ||
    qrProcessing
  ) {
    return;
  }

  qrStarting = true;

  const session =
    ++qrScanSession;

  resetQrConfirmation();

  qrResultCard.hidden = true;

qrStartButton.disabled = true;

updateQrCameraButton();

  setQrStatus(
    "Sedang membuka kamera..."
  );

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    stopQrScanner();

    setQrStatus(
      "Kamera tidak tersedia. Gunakan HTTPS.",
      "error"
    );

    return;

  }

  if (
    typeof jsQR !== "function" ||
    !qrContext
  ) {

    stopQrScanner();

    setQrStatus(
      "Pustaka QR tidak dapat dimuatkan.",
      "error"
    );

    return;

  }

  let stream = null;

  try {

    /* CUBA KAMERA BELAKANG */

    try {

      stream =
        await navigator.mediaDevices.getUserMedia({

          audio: false,

          video: {
            facingMode: {
              ideal: "environment"
            }
          }

        });

    } catch (firstError) {

      /* FALLBACK KAMERA */

      stream =
        await navigator.mediaDevices.getUserMedia({

          audio: false,
          video: true

        });

    }

    if (
      session !== qrScanSession
    ) {

      stream.getTracks().forEach(
        track => track.stop()
      );

      return;

    }

    qrStream = stream;

    qrVideo.srcObject = stream;

    await qrVideo.play();

    if (
      session !== qrScanSession
    ) {

      stopQrScanner();
      return;

    }

    qrCameraPlaceholder.style.display =
      "none";

    qrVideo.style.display =
      "block";

    qrScanFrame.hidden = false;

    qrIsScanning = true;
    qrStarting = false;

    updateQrCameraButton();

    setQrStatus(
      "Halakan kamera ke kod QR."
    );

    scanQrFrame();

  } catch (error) {

    console.error(
      "QR CAMERA ERROR:",
      error
    );

    if (stream) {

      stream.getTracks().forEach(
        track => track.stop()
      );

    }

    stopQrScanner();

    let message =
      "Kamera tidak dapat dibuka. Semak kebenaran kamera.";

    if (
      error.name === "NotAllowedError"
    ) {

      message =
        "Akses kamera tidak dibenarkan.";

    } else if (
      error.name === "NotFoundError"
    ) {

      message =
        "Tiada kamera dikesan.";

    } else if (
      error.name === "NotReadableError"
    ) {

      message =
        "Kamera sedang digunakan oleh aplikasi lain.";

    }

    setQrStatus(
      message,
      "error"
    );

  }

}



/* ==========================================
   PASPA GO - CAMERA ON/OFF ICON
========================================== */

function updateQrCameraButton() {

  const offIcon =
    document.getElementById("qrCameraOffIcon");

  const onIcon =
    document.getElementById("qrCameraOnIcon");

  const cameraActive =
    qrIsScanning || qrStarting;

  if (offIcon) {
    offIcon.hidden = !cameraActive;
  }

  if (onIcon) {
    onIcon.hidden = cameraActive;
  }

  qrStopButton.disabled = qrProcessing;

  qrStopButton.title = cameraActive
    ? "Matikan Kamera"
    : "Hidupkan Kamera";

  qrStopButton.setAttribute(
    "aria-label",
    qrStopButton.title
  );

}



/* ==========================================
   BUTANG NAVIGASI
========================================== */

qrStartButton.addEventListener(
  "click",
  startQrScanner
);


/* ==========================================
   TOGGLE CAMERA ON / OFF
========================================== */

qrStopButton.addEventListener(
  "click",
  async function() {

    if (qrProcessing || qrPendingData) {
      return;
    }

    if (qrIsScanning || qrStarting) {

      // Kamera aktif: matikan
      stopQrScanner();

      updateQrCameraButton();

    } else {

      // Kamera tidak aktif: hidupkan
      await startQrScanner();

      updateQrCameraButton();

    }

  }
);


qrScanAgainButton.addEventListener(
  "click",
  startQrScanner
);

qrBackButton.addEventListener(
  "click",
  function() {

    stopQrScanner();

    window.location.href =
      "dashboard.html";

  }
);

qrHomeButton.addEventListener(
  "click",
  function() {

    stopQrScanner();

    window.location.href =
      "dashboard.html";

  }
);


/* ==========================================
   TUTUP KAMERA APABILA KELUAR HALAMAN
========================================== */

window.addEventListener(
  "pagehide",
  stopQrScanner
);

document.addEventListener(
  "visibilitychange",
  function() {

    if (
      document.visibilityState === "hidden"
    ) {

      stopQrScanner();

    }

  }
);



/* ==========================================
   AUTO START QR CAMERA - PASPA GO
========================================== */

function autoStartQrScanner() {

  if (
    qrIsScanning ||
    qrStarting ||
    qrProcessing
  ) {
    return;
  }

  startQrScanner();

}

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    autoStartQrScanner,
    { once: true }
  );

} else {

  autoStartQrScanner();

}
/* Tetapkan ikon kamera pada permulaan */

updateQrCameraButton();