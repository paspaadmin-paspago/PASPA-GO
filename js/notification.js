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