"use strict";

async function apiPost(payload) {
  if (!CONFIG.API_URL) {
    throw new Error("API URL belum dikonfigurasi.");
  }

  const response = await fetch(CONFIG.API_URL, {
    method: "POST",

    // Gunakan text/plain supaya tidak mencetuskan CORS preflight.
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify({
      ...payload,
      apiKey: CONFIG.API_KEY
    }),

    redirect: "follow"
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Server memberikan status ${response.status}.`
    );
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Respons server:", responseText);

    throw new Error(
      "Respons server bukan dalam format JSON yang sah."
    );
  }
}