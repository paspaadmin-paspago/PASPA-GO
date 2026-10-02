// PASPA GO Service Worker

self.addEventListener("install", (event) => {
  console.log("PASPA GO Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("PASPA GO Service Worker activated");

  event.waitUntil(
    self.clients.claim()
  );
});

// Terima arahan untuk paparkan notification
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {

    const title = event.data.title || "PASPA GO";

    const options = {
      body: event.data.body || "Anda mempunyai notifikasi baharu.",
      icon: "/PASPA-GO/images/launchericon-192x192.png",
      badge: "/PASPA-GO/images/launchericon-192x192.png",
      tag: "paspa-go-notification",
      renotify: true,
      data: {
        url: event.data.url || "/PASPA-GO/pages/mesej.html"
      }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// =====================================================
// TERIMA WEB PUSH DARI SERVER
// =====================================================

self.addEventListener("push", (event) => {

  console.log(
    "PASPA GO menerima Web Push."
  );


  let data = {};


  try {

    if (event.data) {

      data =
        event.data.json();

    }

  } catch (error) {

    console.error(
      "PUSH DATA PARSE ERROR:",
      error
    );


    data = {
      body:
        event.data
          ? event.data.text()
          : ""
    };

  }


  const title =
    data.title ||
    "PASPA GO";


  const options = {

    body:
      data.body ||
      "Anda mempunyai notifikasi baharu.",

    icon:
      "/PASPA-GO/images/launchericon-192x192.png",

    badge:
      "/PASPA-GO/images/launchericon-192x192.png",

    tag:
      data.tag ||
      "paspa-go-notification",

    renotify:
      true,

    data: {

      url:
        data.url ||
        "/PASPA-GO/pages/dashboard.html"

    }

  };


  event.waitUntil(

    self.registration.showNotification(
      title,
      options
    )

  );

});




// Apabila pengguna tekan notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.notification.data?.url ||
    "/PASPA-GO/pages/mesej.html";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {

      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});