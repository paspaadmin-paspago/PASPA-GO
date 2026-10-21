
"use strict";

/* ==========================================
   PASPA GO - QR SCANNER + ATTENDANCE
========================================== */

const qrVideo = document.getElementById("qrVideo");
const qrStartButton = document.getElementById("qrStartButton");
const qrStopButton = document.getElementById("qrStopButton");
const qrScanAgainButton = document.getElementById("qrScanAgainButton");
const qrBackButton = document.getElementById("qrBackButton");
const qrHomeButton = document.getElementById("qrHomeButton");
const qrStatus = document.getElementById("qrStatus");
const qrResultCard = document.getElementById("qrResultCard");
const qrResultText = document.getElementById("qrResultText");
const qrResultType = document.getElementById("qrResultType");
const qrCameraPlaceholder = document.getElementById("qrCameraPlaceholder");
const qrScanFrame = document.getElementById("qrScanFrame");

let qrStream = null;
let qrAnimationId = null;
let qrIsScanning = false;
let qrStarting = false;
let qrProcessing = false;
let qrScanSession = 0;

const qrCanvas = document.createElement("canvas");
const qrContext = qrCanvas.getContext(
  "2d",
  { willReadFrequently: true }
);

/* ==========================================
   STATUS
========================================== */

function setQrStatus(message, type = "") {
  qrStatus.textContent = message;
  qrStatus.className =
    "qr-status" + (type ? " " + type : "");
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
    qrStream.getTracks().forEach(function (track) {
      track.stop();
    });
    qrStream = null;
  }

  if (qrVideo.srcObject) {
    qrVideo.srcObject = null;
  }

  qrVideo.style.display = "none";
  qrCameraPlaceholder.style.display = "flex";
  qrScanFrame.hidden = true;

  qrStartButton.disabled = false;
  qrStopButton.disabled = true;
}

/* ==========================================
   BACA QR PROGRAM PASPA
========================================== */

function parsePaspaAttendanceQr(value) {
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
      "Kod QR ini bukan QR kehadiran rasmi PASPA GO."
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

  if (!/^CRS-[A-Za-z0-9-]+$/.test(courseId)) {
    throw new Error(
      "QR belum mengandungi COURSE_ID yang sah. " +
      "Sila jana semula QR program dalam senarai.html."
    );
  }

  return {
    type: type,
    courseId: courseId
  };
}

/* ==========================================
   DAPATKAN SESI LOGIN
========================================== */

function getQrLoginSession() {
  let session;

  try {
    session = JSON.parse(
      localStorage.getItem("paspaGoSession") || "null"
    );
  } catch (error) {
    throw new Error(
      "Maklumat sesi login tidak sah. Sila login semula."
    );
  }

  if (!session || !session.isLoggedIn) {
    throw new Error(
      "Sila login ke PASPA GO sebelum mengimbas QR."
    );
  }

  const sessionToken = String(
    session.sessionToken || ""
  ).trim();

  if (!sessionToken) {
    throw new Error(
      "Token sesi tidak ditemui. Sila login semula. " +
      "Backend perlu menyokong pengesahan sesi."
    );
  }

  return { sessionToken };
}

/* ==========================================
   HANTAR KEHADIRAN KE BACKEND
========================================== */

async function submitQrAttendance(qrData) {
  const session = getQrLoginSession();

  if (typeof apiPost !== "function") {
    throw new Error(
      "Fungsi apiPost tidak tersedia. " +
      "Semak config.js dan api.js."
    );
  }

  const response = await apiPost({
    action: "qr_attendance_scan",
    sessionToken: session.sessionToken,
    type: qrData.type,
    courseId: qrData.courseId
  });

  if (!response || response.success !== true) {
    throw new Error(
      response && response.message
        ? response.message
        : "Kehadiran gagal direkodkan."
    );
  }

  if (
    String(response.statusKehadiran || "")
      .trim()
      .toUpperCase() !== "HADIR"
  ) {
    throw new Error(
      "Backend belum mengesahkan status HADIR. " +
      "Sila semak rekod kehadiran."
    );
  }

  return response;
}

/* ==========================================
   HASIL IMBASAN
========================================== */

/* ==========================================
   HASIL IMBASAN QR KEHADIRAN
========================================== */

let qrAttendanceProcessing = false;

async function handleQrResult(value) {

  if (qrAttendanceProcessing) {
    return;
  }

  qrAttendanceProcessing = true;

  stopQrScanner();

  qrResultCard.hidden = false;

  qrResultText.textContent =
    "Sedang memproses kehadiran...";

  qrResultType.textContent =
    "Kod QR berjaya dibaca.";

  qrScanAgainButton.disabled = true;

  setQrStatus(
    "Sedang merekod kehadiran..."
  );

  try {

    /* SEMAK QR RASMI */

    const url = new URL(value);

    const expectedOrigin =
      "https://paspaadmin-paspago.github.io";

    const expectedPath =
      "/PASPA-GO/pages/kehadiran-scan.html";

    if (
      url.origin !== expectedOrigin ||
      url.pathname !== expectedPath
    ) {
      throw new Error(
        "QR ini bukan QR kehadiran rasmi PASPA GO."
      );
    }

    /* DAPATKAN JENIS PROGRAM */

    const type = String(
      url.searchParams.get("type") || ""
    ).trim().toUpperCase();

    if (type !== "PROGRAM") {
      throw new Error(
        "QR kehadiran Operasi belum disokong."
      );
    }

    /* DAPATKAN ID DARIPADA QR */

    const recordId = String(
      url.searchParams.get("recordId") || ""
    ).trim();

    const courseId = String(
      url.searchParams.get("courseId") || ""
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

    /* SEMAK SESI LOGIN */

    const session = JSON.parse(
      localStorage.getItem(
        "paspaGoSession"
      ) || "null"
    );

    if (!session || !session.isLoggedIn) {
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
        "Token sesi tidak ditemui. " +
        "Sila log masuk semula."
      );
    }

    /* SEMAK API */

    if (typeof apiPost !== "function") {
      throw new Error(
        "Sambungan API tidak tersedia."
      );
    }

    /* HANTAR KE GOOGLE APPS SCRIPT */

    const response = await apiPost({

      action: "qr_attendance_scan",

      sessionToken: sessionToken,

      type: "PROGRAM",

      courseId: qrId

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

    /* SEMAK STATUS SEBENAR */

    const status = String(
      response.statusKehadiran || ""
    ).trim().toUpperCase();

    if (status !== "HADIR") {

      qrResultType.textContent =
        response.message ||
        "Status kehadiran dikekalkan oleh admin.";

      qrResultText.textContent =
        "Program: " + qrId +
        "\nStatus: " +
        (status || "Tidak diketahui");

      setQrStatus(
        "Kehadiran tidak diubah.",
        "error"
      );

      return;
    }

    /* BERJAYA */

    qrResultType.textContent =
      response.message ||
      "Kehadiran berjaya direkodkan.";

    qrResultText.textContent =
      "Program: " + qrId +
      "\nStatus Kehadiran: HADIR";

    setQrStatus(
      "Kehadiran: HADIR",
      "success"
    );

  } catch (error) {

    console.error(
      "QR ATTENDANCE ERROR:",
      error
    );

    qrResultType.textContent =
      "Kehadiran belum direkodkan.";

    qrResultText.textContent =
      error.message ||
      "Ralat semasa merekod kehadiran.";

    setQrStatus(
      "Imbasan gagal direkodkan.",
      "error"
    );

  } finally {

    qrAttendanceProcessing = false;

    qrScanAgainButton.disabled = false;

  }

}


/* ==========================================
   BACA VIDEO
========================================== */

function scanQrFrame() {
  if (!qrIsScanning || qrProcessing) return;

  if (
    qrVideo.readyState >=
      HTMLMediaElement.HAVE_CURRENT_DATA &&
    qrVideo.videoWidth > 0 &&
    qrVideo.videoHeight > 0
  ) {
    const width = qrVideo.videoWidth;
    const height = qrVideo.videoHeight;

    qrCanvas.width = width;
    qrCanvas.height = height;

    qrContext.drawImage(
      qrVideo, 0, 0, width, height
    );

    const imageData =
      qrContext.getImageData(
        0, 0, width, height
      );

    const result = jsQR(
      imageData.data,
      width,
      height,
      { inversionAttempts: "dontInvert" }
    );

    if (result && result.data) {
      handleQrResult(result.data);
      return;
    }
  }

  qrAnimationId =
    requestAnimationFrame(scanQrFrame);
}

/* ==========================================
   BUKA KAMERA
========================================== */

async function startQrScanner() {
  if (qrStarting || qrIsScanning || qrProcessing) {
    return;
  }

  qrStarting = true;
  const session = ++qrScanSession;

  qrResultCard.hidden = true;
  qrStartButton.disabled = true;
  qrStopButton.disabled = false;

  setQrStatus("Sedang membuka kamera...");

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
    try {
      stream =
        await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" }
          }
        });
    } catch (firstError) {
      stream =
        await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true
        });
    }

    if (session !== qrScanSession) {
      stream.getTracks().forEach(
        track => track.stop()
      );
      return;
    }

    qrStream = stream;
    qrVideo.srcObject = stream;

    await qrVideo.play();

    if (session !== qrScanSession) {
      stopQrScanner();
      return;
    }

    qrCameraPlaceholder.style.display = "none";
    qrVideo.style.display = "block";
    qrScanFrame.hidden = false;

    qrIsScanning = true;
    qrStarting = false;

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

    if (error.name === "NotAllowedError") {
      message =
        "Akses kamera tidak dibenarkan.";
    } else if (error.name === "NotFoundError") {
      message =
        "Tiada kamera dikesan.";
    } else if (error.name === "NotReadableError") {
      message =
        "Kamera sedang digunakan oleh aplikasi lain.";
    }

    setQrStatus(message, "error");
  }
}

/* ==========================================
   BUTANG
========================================== */

qrStartButton.addEventListener(
  "click",
  startQrScanner
);

qrStopButton.addEventListener(
  "click",
  function () {
    stopQrScanner();
    setQrStatus("Kamera telah ditutup.");
  }
);

qrScanAgainButton.addEventListener(
  "click",
  startQrScanner
);

qrBackButton.addEventListener(
  "click",
  function () {
    stopQrScanner();
    window.location.href = "dashboard.html";
  }
);

qrHomeButton.addEventListener(
  "click",
  function () {
    stopQrScanner();
    window.location.href = "dashboard.html";
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
  function () {
    if (document.visibilityState === "hidden") {
      stopQrScanner();
    }
  }
);
