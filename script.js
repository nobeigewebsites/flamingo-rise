/* =========================================================
   FLAMINGORISE — MAIN JAVASCRIPT
   ========================================================= */


/* ---------- MOBILE NAVIGATION ---------- */

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {

  menuToggle.addEventListener("click", () => {

    const isOpen = mainNav.classList.toggle("active");

    menuToggle.setAttribute(
      "aria-expanded",
      isOpen ? "true" : "false"
    );

  });


  /* Close menu after clicking a navigation link */

  mainNav.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      mainNav.classList.remove("active");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

    });

  });

}


/* ---------- AUTOMATIC COPYRIGHT YEAR ---------- */

const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}


/* ---------- END ---------- */
