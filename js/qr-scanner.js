
"use strict";

/* ==========================================
   PASPA GO - QR SCANNER
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
  document.getElementById(
    "qrCameraPlaceholder"
  );

const qrScanFrame =
  document.getElementById("qrScanFrame");


/* ==========================================
   KEADAAN PENGIMBAS
========================================== */

let qrStream = null;

let qrAnimationId = null;

let qrIsScanning = false;

let qrStarting = false;

let qrScanSession = 0;

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

function setQrStatus(
  message,
  type = ""
) {

  qrStatus.textContent = message;

  qrStatus.className =
    "qr-status" +
    (type ? " " + type : "");

}


/* ==========================================
   HENTIKAN KAMERA
========================================== */

function stopQrScanner() {

  qrScanSession++;

  qrIsScanning = false;

  qrStarting = false;

  if (qrAnimationId !== null) {

    cancelAnimationFrame(
      qrAnimationId
    );

    qrAnimationId = null;

  }

  if (qrStream) {

    qrStream
      .getTracks()
      .forEach(function (track) {

        track.stop();

      });

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

  qrStopButton.disabled = true;

}


/* ==========================================
   HASIL IMBASAN
========================================== */

function handleQrResult(value) {

  stopQrScanner();

  qrResultText.textContent = value;

  qrResultType.textContent =
    "Kod QR berjaya dibaca.";

  qrResultCard.hidden = false;

  setQrStatus(
    "Imbasan berjaya.",
    "success"
  );

  /*
    FASA SETERUSNYA:

    1. Kenal pasti QR program PASPA.
    2. Semak ahli yang sedang login.
    3. Hantar rekod kehadiran ke Apps Script.
    4. Paparkan pengesahan kehadiran.

    QR pengenalan PASPA akan menggunakan
    aliran pengesahan berasingan.
  */

}


/* ==========================================
   BACA VIDEO
========================================== */

function scanQrFrame() {

  if (!qrIsScanning) {
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

    const result =
      jsQR(
        imageData.data,
        width,
        height,
        {
          inversionAttempts:
            "dontInvert"
        }
      );

    if (result && result.data) {

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
    qrIsScanning
  ) {
    return;
  }

  qrStarting = true;

  const session =
    ++qrScanSession;

  qrResultCard.hidden = true;

  qrStartButton.disabled = true;

  qrStopButton.disabled = false;

  setQrStatus(
    "Sedang membuka kamera..."
  );

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    stopQrScanner();

    setQrStatus(
      "Kamera tidak tersedia. Gunakan HTTPS atau localhost pada pelayar yang menyokong kamera.",
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
      "Pustaka pembaca QR tidak dapat dimuatkan. Semak sambungan internet.",
      "error"
    );

    return;

  }

  let stream = null;

  try {

    /*
      Cuba kamera belakang dahulu.
    */

    try {

      stream =
        await navigator.mediaDevices
          .getUserMedia({

            audio: false,

            video: {

              facingMode: {
                ideal: "environment"
              }

            }

          });

    } catch (firstError) {

      /*
        Cuba kamera lalai jika
        kamera belakang gagal.
      */

      stream =
        await navigator.mediaDevices
          .getUserMedia({

            audio: false,

            video: true

          });

    }

    /*
      Pengguna mungkin sudah menutup
      halaman ketika dialog kamera
      masih terbuka.
    */

    if (session !== qrScanSession) {

      stream.getTracks().forEach(
        function (track) {

          track.stop();

        }
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

    qrCameraPlaceholder.style.display =
      "none";

    qrVideo.style.display =
      "block";

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
        function (track) {

          track.stop();

        }
      );

    }

    stopQrScanner();

    let message =
      "Kamera tidak dapat dibuka. Semak kebenaran kamera pada telefon.";

    if (
      error.name === "NotAllowedError"
    ) {

      message =
        "Akses kamera tidak dibenarkan. Sila benarkan kamera dalam tetapan pelayar atau aplikasi.";

    } else if (
      error.name === "NotFoundError"
    ) {

      message =
        "Tiada kamera dikesan pada peranti ini.";

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

    setQrStatus(
      "Kamera telah ditutup."
    );

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

    window.location.href =
      "dashboard.html";

  }
);

qrHomeButton.addEventListener(
  "click",
  function () {

    stopQrScanner();

    window.location.href =
      "dashboard.html";

  }
);


/* ==========================================
   TUTUP KAMERA JIKA KELUAR HALAMAN
========================================== */

window.addEventListener(
  "pagehide",
  stopQrScanner
);

document.addEventListener(
  "visibilitychange",
  function () {

    if (
      document.visibilityState ===
      "hidden"
    ) {

      stopQrScanner();

    }

  }
);
