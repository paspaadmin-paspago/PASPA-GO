// ========================================
// PASPA GO - WEB PUSH CONFIG
// ========================================

const PASPA_VAPID_PUBLIC_KEY =
  "BKeTwUcx1SZciZRMMiUu4n1HWw_G8LhHdChbTOPOxVTANKWRIm9BkqwRAIIYFsGOx9J4JFeT-zV_WxEyBdmNULk";

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

  // ========================================
// PASPA GO - WEB PUSH SUBSCRIPTION
// ========================================

function urlBase64ToUint8Array(base64String) {

  const padding =
    "=".repeat(
      (4 - base64String.length % 4) % 4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      char => char.charCodeAt(0)
    )
  );
}


async function registerPaspaPushSubscription() {

  try {

    // 1. Pastikan browser menyokong Web Push
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {

      console.log(
        "Web Push tidak disokong pada peranti ini."
      );

      return null;
    }


    // 2. Pastikan permission notification telah diberi
    if (Notification.permission !== "granted") {

      console.log(
        "Notification permission belum diberikan."
      );

      return null;
    }


    // 3. Tunggu Service Worker aktif
    const registration =
      await navigator.serviceWorker.ready;


    // 4. Semak subscription sedia ada
    let subscription =
      await registration.pushManager
        .getSubscription();


    // 5. Jika belum ada, cipta subscription
    if (!subscription) {

      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,

          applicationServerKey:
            urlBase64ToUint8Array(
              PASPA_VAPID_PUBLIC_KEY
            )
        });

    }


    console.log(
      "PASPA PUSH SUBSCRIPTION:",
      subscription
    );


    return subscription;

  } catch (error) {

    console.error(
      "PASPA PUSH SUBSCRIPTION ERROR:",
      error
    );

    return null;
  }

}


window.registerPaspaPushSubscription =
  registerPaspaPushSubscription;

  // ========================================
// PASPA GO - SAVE PUSH SUBSCRIPTION
// ========================================

async function savePaspaPushSubscription() {

  try {

    // 1. Ambil sesi ahli yang sedang login
    const sessionText =
      localStorage.getItem(
        "paspaGoSession"
      );

    if (!sessionText) {

      console.log(
        "Sesi PASPA GO tidak ditemui."
      );

      return false;
    }


    const session =
      JSON.parse(sessionText);


    const idPaspa =
      String(
        session.idPaspa || ""
      ).trim();


    if (!idPaspa) {

      console.log(
        "ID PASPA tidak ditemui dalam sesi."
      );

      return false;
    }


    // 2. Dapatkan Push Subscription telefon
    const subscription =
      await registerPaspaPushSubscription();


    if (!subscription) {

      console.log(
        "Push Subscription tidak berjaya diperoleh."
      );

      return false;
    }


    // 3. Tukar subscription kepada data JSON
    const subscriptionData =
      subscription.toJSON();


    // 4. Hantar subscription ke PASPA GO API
const result =
  await apiPost({
    action: "save_push_subscription",

    idPaspa:
      idPaspa,

    subscription:
      subscriptionData
  });


if (
  !result ||
  result.success !== true
) {

  console.error(
    "SAVE PUSH API ERROR:",
    result
  );

  alert(
    "Push Subscription gagal disimpan.\n\n" +
    (
      result?.message ||
      "Ralat tidak diketahui."
    )
  );

  return false;
}


console.log(
  "PASPA PUSH SUBSCRIPTION SAVED:",
  idPaspa
);


alert(
  "Push Notification PASPA GO berjaya didaftarkan."
);


return true;

  } catch (error) {

    console.error(
      "SAVE PASPA PUSH SUBSCRIPTION ERROR:",
      error
    );

    return false;
  }

}


window.savePaspaPushSubscription =
  savePaspaPushSubscription;