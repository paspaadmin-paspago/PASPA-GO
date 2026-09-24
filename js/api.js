"use strict";

/* =====================================================
   PASPA GO - API CLIENT
===================================================== */

async function apiPost(payload) {

  /* ===================================================
     SEMAK KONFIGURASI
  =================================================== */

  const apiUrl = String(
    CONFIG.API_URL || ""
  ).trim();

  if (!apiUrl) {

    throw new Error(
      "API URL belum dikonfigurasi."
    );

  }

  /* ===================================================
     URL REQUEST
  =================================================== */

  const requestUrl =
    apiUrl +
    (
      apiUrl.includes("?")
        ? "&"
        : "?"
    ) +
    "_ts=" +
    Date.now();

  /* ===================================================
     HANTAR REQUEST
  =================================================== */

  let response;

  try {

    response = await fetch(
      requestUrl,
      {

        method: "POST",

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

  } catch (error) {

    console.error(
      "PASPA GO API FETCH ERROR:",
      error
    );

    throw new Error(
      "Sambungan API terganggu atau respons " +
      "disekat oleh browser. " +
      "Semak Google Sheets sebelum cuba simpan semula."
    );

  }

  /* ===================================================
     BACA RESPONSE
  =================================================== */

  let responseText;

  try {

    responseText =
      await response.text();

  } catch (error) {

    console.error(
      "PASPA GO API RESPONSE ERROR:",
      error
    );

    throw new Error(
      "Respons API tidak dapat dibaca. " +
      "Semak sama ada rekod telah disimpan " +
      "sebelum mencuba semula."
    );

  }

  /* ===================================================
     SEMAK STATUS HTTP
  =================================================== */

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
      "Server memberikan status " +
      response.status +
      "."
    );

  }

  /* ===================================================
     TUKAR RESPONSE KEPADA JSON
  =================================================== */

  try {

    return JSON.parse(
      responseText
    );

  } catch (error) {

    console.error(
      "RESPONS SERVER:",
      responseText
    );

    throw new Error(
      "Respons server bukan dalam format JSON yang sah."
    );

  }

}