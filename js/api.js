"use strict";

async function apiPost(payload) {

  if (!CONFIG.API_URL) {
    throw new Error(
      "API URL belum dikonfigurasi."
    );
  }


  const requestUrl =
    CONFIG.API_URL +
    (
      CONFIG.API_URL.includes("?")
        ? "&"
        : "?"
    ) +
    "_ts=" +
    Date.now();


  const response =
    await fetch(
      requestUrl,
      {
        method: "POST",

        // Gunakan text/plain supaya
        // tidak mencetuskan CORS preflight.
        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify({
          ...payload,
          apiKey: CONFIG.API_KEY
        }),

        redirect: "follow",

        cache: "no-store"
      }
    );


  const responseText =
    await response.text();


  if (!response.ok) {

    console.error(
      "API STATUS:",
      response.status
    );

    console.error(
      "API RESPONSE:",
      responseText
    );

    throw new Error(
      `Server memberikan status ${response.status}.`
    );

  }


  try {

    return JSON.parse(
      responseText
    );

  } catch (error) {

    console.error(
      "Respons server:",
      responseText
    );

    throw new Error(
      "Respons server bukan dalam format JSON yang sah."
    );

  }

}