"use strict";

const memberPhoto =
  document.getElementById("memberPhoto");

const memberName =
  document.getElementById("memberName");

const memberRank =
  document.getElementById("memberRank");

const memberId =
  document.getElementById("memberId");

const memberIc =
  document.getElementById("memberIc");

const dashboardMessage =
  document.getElementById("dashboardMessage");

const logoutButton =
  document.getElementById("logoutButton");


function getSession() {
  try {
    return JSON.parse(
      localStorage.getItem("paspaGoSession")
    );
  } catch (error) {
    return null;
  }
}


function maskIdentityCard(value) {
  const digits = String(value || "")
    .replace(/\D/g, "");

  if (digits.length !== 12) {
    return "-";
  }

  return (
    digits.slice(0, 6) +
    "-**-" +
    digits.slice(8)
  );
}


function createDrivePhotoUrl(fileId) {
  const id = String(fileId || "").trim();

  if (!id) {
    return "../images/default-avatar.png";
  }

  return (
    "https://drive.google.com/thumbnail?id=" +
    encodeURIComponent(id) +
    "&sz=w500"
  );
}


function showDashboardMessage(text) {
  dashboardMessage.textContent = text;
  dashboardMessage.className = "message error";
}


async function loadDashboard() {
  const session = getSession();

  if (
    !session ||
    session.isLoggedIn !== true ||
    !session.googleEmail
  ) {
    window.location.href = "../index.html";
    return;
  }

  try {
    const result = await apiPost({
      action: "dashboard_v2",
      email: session.googleEmail
    });

    if (result.success !== true) {
      throw new Error(
        result.message ||
        "Maklumat dashboard tidak dapat diperoleh."
      );
    }

    const member = result.member || {};

const pangkat =
  member.pangkat || "";

const nama =
  member.namaPenuh ||
  member.namaAhli ||
  session.namaAhli ||
  "-";

memberName.textContent =
  (pangkat ? pangkat + " " : "") + nama;

    memberId.textContent =
      member.idPaspa ||
      session.idPaspa ||
      "-";

const noKP =
  String(
    member.noKP ||
    member.noKp ||
    member.noKadPengenalan ||
    ""
  ).replace(/\D/g, "");

if (noKP.length === 12) {

  memberIc.textContent =
    noKP.substring(0,6) + "-" +
    noKP.substring(6,8) + "-" +
    noKP.substring(8,12);

} else {

  memberIc.textContent =
    noKP || "-";

}

    if (member.photoUrl) {
      memberPhoto.src = member.photoUrl;

    } else if (member.fotoFileId) {
      memberPhoto.src =
        createDrivePhotoUrl(
          member.fotoFileId
        );
    }

  } catch (error) {
    console.error(error);

    showDashboardMessage(
      error.message
    );
  }
}


memberPhoto.addEventListener(
  "error",
  function () {
    memberPhoto.src =
      "../images/default-avatar.png";
  }
);


logoutButton.addEventListener(
  "click",
  function () {
    localStorage.removeItem(
      "paspaGoSession"
    );

    window.location.href =
      "../index.html";
  }
);



loadDashboard();