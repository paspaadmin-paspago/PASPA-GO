"use strict";


/* =====================================================
   PASPA GO - DIREKTORI
===================================================== */


/* =====================================================
   STATE / BRANCH DATA
===================================================== */

const DIRECTORY_BRANCHES = [

  {
    name: "IPPA",
    image: "../images/negeri/ippa.png"
  },

  {
    name: "Perlis",
    image: "../images/negeri/perlis.png"
  },

  {
    name: "Kedah",
    image: "../images/negeri/kedah.png"
  },

  {
    name: "Pulau Pinang",
    image: "../images/negeri/pulauPinang.png"
  },

  {
    name: "Perak",
    image: "../images/negeri/perak.png"
  },

  {
    name: "Selangor",
    image: "../images/negeri/selangor.png"
  },

  {
    name: "WP Kuala Lumpur",
    image: "../images/negeri/WPKualaLumpur.png"
  },

  {
    name: "WP Putrajaya",
    image: "../images/negeri/WPPutrajaya.png"
  },

  {
    name: "Negeri Sembilan",
    image: "../images/negeri/negeriSembilan.png"
  },

  {
    name: "Melaka",
    image: "../images/negeri/melaka.png"
  },

  {
    name: "Johor",
    image: "../images/negeri/johor.png"
  },

  {
    name: "Pahang",
    image: "../images/negeri/pahang.png"
  },

  {
    name: "Kelantan",
    image: "../images/negeri/kelantan.png"
  },

  {
    name: "Terengganu",
    image: "../images/negeri/terengganu.png"
  },

  {
    name: "Sarawak",
    image: "../images/negeri/sarawak.png"
  },

  {
    name: "Sabah",
    image: "../images/negeri/sabah.png"
  },

  {
    name: "WP Labuan",
    image: "../images/negeri/WPLabuan.png"
  },

  {
    name: "ALPHA",
    image: "../images/negeri/alpha.png"
  },

  {
    name: "PULAPAU",
    image: "../images/negeri/pulapau.png"
  },

  {
    name: "PULAPAS",
    image: "../images/negeri/pulapas.png"
  },

  {
    name: "PULAPAT",
    image: "../images/negeri/pulapat.png"
  }

];


/* =====================================================
   RANK ORDER
===================================================== */

const DIRECTORY_RANK_ORDER = [

  "KOL.(PA)",
  "LT.KOL.(PA)",
  "MEJAR (PA)",
  "KAPTEN (PA)",
  "LT. (PA)",
  "LT.M (PA)",
  "ST. (PA)",
  "SK. (PA)",
  "SM. (PA)",
  "SJN. MEJ. I (PA)",
  "SJN. MEJ II (PA)",
  "SJN. (PA)",
  "KPL. (PA)",
  "L/KPL. (PA)",
  "PBT. (PA)"

];


/* =====================================================
   ELEMENTS
===================================================== */

const directoryStateList =
  document.getElementById(
    "directoryStateList"
  );

const directoryMemberList =
  document.getElementById(
    "directoryMemberList"
  );

const stateGrid =
  document.getElementById(
    "stateGrid"
  );

const selectedStateButton =
  document.getElementById(
    "selectedStateButton"
  );

const selectedStateFlag =
  document.getElementById(
    "selectedStateFlag"
  );

const selectedStateName =
  document.getElementById(
    "selectedStateName"
  );

const selectedStateTotal =
  document.getElementById(
    "selectedStateTotal"
  );

const directoryStatus =
  document.getElementById(
    "directoryStatus"
  );

const directoryLoading =
  document.getElementById(
    "directoryLoading"
  );

const memberDirectoryList =
  document.getElementById(
    "memberDirectoryList"
  );

const emptyDirectory =
  document.getElementById(
    "emptyDirectory"
  );

const backButton =
  document.getElementById(
    "backButton"
  );

const homeButton =
  document.getElementById(
    "homeButton"
  );


/* =====================================================
   STATE
===================================================== */

let directoryMembers = [];

let selectedDirectoryBranch =
  null;


/* =====================================================
   SESSION
===================================================== */

function getDirectorySession() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "paspaGoSession"
      )
    );

  } catch (error) {

    console.error(
      "DIRECTORY SESSION ERROR:",
      error
    );

    return null;

  }

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeDirectoryHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =====================================================
   NORMALIZE
===================================================== */

function normalizeDirectoryText(
  value
) {

  return String(
    value || ""
  )
    .trim()
    .toUpperCase();

}


/* =====================================================
   RANK INDEX
===================================================== */

function getDirectoryRankIndex(
  rank
) {

  const normalizedRank =
    normalizeDirectoryText(
      rank
    );


  const index =
    DIRECTORY_RANK_ORDER
      .findIndex(
        function (item) {

          return (
            normalizeDirectoryText(
              item
            ) ===
            normalizedRank
          );

        }
      );


  return index === -1
    ? 999
    : index;

}


/* =====================================================
   SORT MEMBERS
===================================================== */

function sortDirectoryMembers(
  members
) {

  return [...members]
    .sort(
      function (a, b) {

        const rankA =
          getDirectoryRankIndex(
            a.pangkat
          );


        const rankB =
          getDirectoryRankIndex(
            b.pangkat
          );


        if (
          rankA !==
          rankB
        ) {

          return (
            rankA -
            rankB
          );

        }


        return String(
          a.namaPenuh || ""
        )
          .localeCompare(
            String(
              b.namaPenuh || ""
            ),
            "ms",
            {
              sensitivity:
                "base"
            }
          );

      }
    );

}


/* =====================================================
   BUILD FLAG GRID
===================================================== */

function renderDirectoryBranches() {

  if (!stateGrid) {
    return;
  }


  stateGrid.innerHTML =
    "";


  DIRECTORY_BRANCHES
    .forEach(
      function (branch) {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";

        button.className =
          "state-card";


        button.innerHTML = `

          <div class="state-flag-wrapper">

            <img
              src="${escapeDirectoryHtml(
                branch.image
              )}"
              alt="${escapeDirectoryHtml(
                branch.name
              )}"
              class="state-flag"
            >

          </div>


          <span class="state-name">

            ${escapeDirectoryHtml(
              branch.name
            )}

          </span>

        `;


        button.addEventListener(
          "click",
          function () {

            openDirectoryBranch(
              branch
            );

          }
        );


        stateGrid.appendChild(
          button
        );

      }
    );

}


/* =====================================================
   SHOW STATE LIST
===================================================== */

function showDirectoryStateList() {

  selectedDirectoryBranch =
    null;


  if (
    directoryStateList
  ) {

    directoryStateList.hidden =
      false;

  }


  if (
    directoryMemberList
  ) {

    directoryMemberList.hidden =
      true;

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =====================================================
   OPEN BRANCH
===================================================== */

function openDirectoryBranch(
  branch
) {

  selectedDirectoryBranch =
    branch;


  if (
    directoryStateList
  ) {

    directoryStateList.hidden =
      true;

  }


  if (
    directoryMemberList
  ) {

    directoryMemberList.hidden =
      false;

  }


  if (
    selectedStateFlag
  ) {

    selectedStateFlag.src =
      branch.image;

    selectedStateFlag.alt =
      branch.name;

  }


  if (
    selectedStateName
  ) {

    selectedStateName.textContent =
      branch.name.toUpperCase();

  }


  renderSelectedDirectoryMembers();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =====================================================
   FILTER MEMBERS BY BRANCH
===================================================== */

function getMembersForBranch(
  branchName
) {

  const normalizedBranch =
    normalizeDirectoryText(
      branchName
    );


  return directoryMembers
    .filter(
      function (member) {

        const negeri =
          normalizeDirectoryText(
            member.negeriBerkhidmat
          );


        const cawangan =
          normalizeDirectoryText(
            member.cawanganBerkhidmat
          );


        return (
          negeri ===
            normalizedBranch ||
          cawangan ===
            normalizedBranch
        );

      }
    );

}


/* =====================================================
   MEMBER PHOTO URL
===================================================== */

function getDirectoryPhotoUrl(
  member
) {

  if (
    member.photoUrl
  ) {

    return member.photoUrl;

  }


  if (
    member.fotoFileId
  ) {

    return (
      "https://drive.google.com/thumbnail?id=" +
      encodeURIComponent(
        member.fotoFileId
      ) +
      "&sz=w500"
    );

  }


  return "../images/default-avatar.png";

}


/* =====================================================
   WHATSAPP NUMBER
===================================================== */

function normalizeWhatsAppNumber(
  value
) {

  let phone =
    String(
      value || ""
    )
      .replace(
        /\D/g,
        ""
      );


  if (!phone) {
    return "";
  }


  /*
   * Malaysia:
   * 0123456789
   * menjadi
   * 60123456789
   */

  if (
    phone.startsWith(
      "0"
    )
  ) {

    phone =
      "6" +
      phone;

  }


  /*
   * Kalau sudah 60...
   * kekalkan.
   */

  return phone;

}


/* =====================================================
   CREATE MEMBER CARD
===================================================== */

function createDirectoryMemberCard(
  member
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "directory-member-card";


  const fullName =
    (
      String(
        member.pangkat || ""
      ) +
      " " +
      String(
        member.namaPenuh || ""
      )
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();


  const whatsappNumber =
    normalizeWhatsAppNumber(
      member.noTel
    );


  const whatsappUrl =
    whatsappNumber
      ? (
          "https://wa.me/" +
          whatsappNumber
        )
      : "";


  card.innerHTML = `

    <div class="directory-member-photo-wrapper">

      <img
        src="${escapeDirectoryHtml(
          getDirectoryPhotoUrl(
            member
          )
        )}"
        alt="${escapeDirectoryHtml(
          member.namaPenuh ||
          "Ahli PASPA"
        )}"
        class="directory-member-photo"
      >

    </div>


    <div class="directory-member-information">

      <h3 class="directory-member-name">

        ${escapeDirectoryHtml(
          fullName ||
          "-"
        )}

      </h3>


      <div class="directory-member-meta">

        <span>

          ID PASPA:

          <strong>

            ${escapeDirectoryHtml(
              member.idPaspa ||
              "-"
            )}

          </strong>

        </span>


       ${
  member.jawatanPaspa &&
  String(
    member.jawatanPaspa
  )
    .trim()
    .toLowerCase() !== "ahli"
    ? `

      <span>

        Jawatan PASPA:

        <strong>

          ${escapeDirectoryHtml(
            member.jawatanPaspa
          )}

        </strong>

      </span>

    `
    : ""
}


        <span>

          Cawangan Berkhidmat:

          <strong>

            ${escapeDirectoryHtml(
              member.cawanganBerkhidmat ||
              member.negeriBerkhidmat ||
              "-"
            )}

          </strong>

        </span>

      </div>


      <div class="directory-member-contact">

        ${
          whatsappUrl
            ? `

              <a
                href="${escapeDirectoryHtml(
                  whatsappUrl
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="whatsapp-button"
              >

                📱 WhatsApp

              </a>

            `
            : `

              <span
                class="
                  whatsapp-button
                  disabled
                "
              >

                📱 Tiada No. Telefon

              </span>

            `
        }

      </div>

    </div>

  `;


  const photo =
    card.querySelector(
      ".directory-member-photo"
    );


  if (photo) {

    photo.addEventListener(
      "error",
      function () {

        photo.src =
          "../images/default-avatar.png";

      },
      {
        once: true
      }
    );

  }


  return card;

}


/* =====================================================
   RENDER SELECTED MEMBERS
===================================================== */

function renderSelectedDirectoryMembers() {

  if (
    !selectedDirectoryBranch ||
    !memberDirectoryList
  ) {

    return;

  }


  const members =
    sortDirectoryMembers(
      getMembersForBranch(
        selectedDirectoryBranch.name
      )
    );


  if (
    selectedStateTotal
  ) {

    selectedStateTotal.textContent =
      members.length;

  }


  memberDirectoryList.innerHTML =
    "";


  if (
    emptyDirectory
  ) {

    emptyDirectory.hidden =
      members.length !== 0;

  }


  if (!members.length) {

    return;

  }


  members.forEach(
    function (member) {

      memberDirectoryList
        .appendChild(
          createDirectoryMemberCard(
            member
          )
        );

    }
  );

}


/* =====================================================
   LOAD DIRECTORY DATA
===================================================== */

async function loadDirectoryMembers() {

  const session =
    getDirectorySession();


  if (
    !session ||
    session.isLoggedIn !== true ||
    !session.googleEmail
  ) {

    window.location.href =
      "../index.html";

    return;

  }


  if (
    directoryLoading
  ) {

    directoryLoading.hidden =
      false;

  }


  if (
    emptyDirectory
  ) {

    emptyDirectory.hidden =
      true;

  }


  try {

    const result =
      await apiPost({

        action:
          "directory_members",

        email:
          session.googleEmail

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Direktori ahli tidak dapat dimuatkan."
      );

    }


    directoryMembers =
      Array.isArray(
        result.members
      )
        ? result.members
        : [];


    if (
      selectedDirectoryBranch
    ) {

      renderSelectedDirectoryMembers();

    }


  } catch (error) {

    console.error(
      "LOAD DIRECTORY ERROR:",
      error
    );


    if (
      directoryStatus
    ) {

      directoryStatus.textContent =
        error.message ||
        "Direktori ahli gagal dimuatkan.";

      directoryStatus.hidden =
        false;

    }


  } finally {

    if (
      directoryLoading
    ) {

      directoryLoading.hidden =
        true;

    }

  }

}


/* =====================================================
   SELECTED FLAG = BACK TO STATES
===================================================== */

if (
  selectedStateButton
) {

  selectedStateButton.addEventListener(
    "click",
    function () {

      showDirectoryStateList();

    }
  );

}


/* =====================================================
   HEADER BACK
===================================================== */

if (
  backButton
) {

  backButton.addEventListener(
    "click",
    function () {

      /*
       * Kalau sedang lihat ahli,
       * kembali ke senarai bendera dahulu.
       */

      if (
        selectedDirectoryBranch
      ) {

        showDirectoryStateList();

        return;

      }


      window.history.back();

    }
  );

}


/* =====================================================
   HOME
===================================================== */

if (
  homeButton
) {

  homeButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "dashboard.html";

    }
  );

}


/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    renderDirectoryBranches();

    showDirectoryStateList();

    await loadDirectoryMembers();

  }
);