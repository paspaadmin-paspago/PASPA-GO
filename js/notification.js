// ========================================
// PASPA GO - Notification Manager
// ========================================

async function enablePaspaNotifications() {

  // Semak sama ada browser menyokong Notification
  if (!("Notification" in window)) {
    alert("Peranti ini tidak menyokong notifikasi.");
    return false;
  }

  // Semak Service Worker
  if (!("serviceWorker" in navigator)) {
    alert("Peranti ini tidak menyokong Service Worker.");
    return false;
  }

  try {

    // Minta kebenaran notification
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Kebenaran notifikasi tidak diberikan.");
      return false;
    }

    console.log("Kebenaran notifikasi PASPA GO diberikan.");

    // Tunggu Service Worker aktif
    const registration = await navigator.serviceWorker.ready;

    // Notification ujian
    await registration.showNotification("PASPA GO", {
      body: "Notifikasi PASPA GO telah berjaya diaktifkan.",
      icon: "/PASPA-GO/images/launchericon-192x192.png",
      badge: "/PASPA-GO/images/launchericon-192x192.png",
      tag: "paspa-go-test",
      data: {
        url: "/PASPA-GO/pages/dashboard.html"
      }
    });

    return true;

  } catch (error) {

    console.error("Ralat mengaktifkan notifikasi:", error);
    return false;

  }
}

// Jadikan fungsi boleh dipanggil dari page lain
window.enablePaspaNotifications = enablePaspaNotifications;

// ========================================
// PASPA GO - Notification Diagnostic
// ========================================

async function checkPaspaNotificationStatus() {

  const result = {
    notificationSupported:
      "Notification" in window,

    permission:
      "Notification" in window
        ? Notification.permission
        : "not-supported",

    serviceWorkerSupported:
      "serviceWorker" in navigator,

    serviceWorkerReady: false,

    serviceWorkerController:
      !!navigator.serviceWorker?.controller
  };

  if ("serviceWorker" in navigator) {

    try {

      const registration =
        await navigator.serviceWorker.ready;

      result.serviceWorkerReady =
        !!registration.active;

    } catch (error) {

      console.error(
        "SERVICE WORKER CHECK ERROR:",
        error
      );

    }

  }

  alert(
    "PASPA GO NOTIFICATION STATUS\n\n" +
    "Permission: " +
    result.permission +
    "\n\nService Worker: " +
    (
      result.serviceWorkerReady
        ? "ACTIVE"
        : "NOT ACTIVE"
    ) +
    "\n\nController: " +
    (
      result.serviceWorkerController
        ? "ACTIVE"
        : "NOT ACTIVE"
    )
  );

  return result;
}

window.checkPaspaNotificationStatus =
  checkPaspaNotificationStatus;

  async function testPaspaNotification() {

  try {

    if (!("Notification" in window)) {
      alert("Notification tidak disokong.");
      return;
    }

    if (Notification.permission !== "granted") {
      alert("Kebenaran notification belum diberikan.");
      return;
    }

    const registration =
      await navigator.serviceWorker.ready;

    await registration.showNotification(
      "PASPA GO",
      {
        body:
          "Notifikasi PASPA GO berfungsi dengan baik.",

        icon:
          "/PASPA-GO/images/launchericon-192x192.png",

        badge:
          "/PASPA-GO/images/launchericon-192x192.png",

        tag:
          "paspa-go-test",

        renotify:
          true,

        data: {
          url:
            "/PASPA-GO/pages/dashboard.html"
        }
      }
    );

  } catch (error) {

    console.error(
      "TEST NOTIFICATION ERROR:",
      error
    );

    alert(
      "Ralat notification: " +
      error.message
    );
  }
}

window.testPaspaNotification =
  testPaspaNotification;