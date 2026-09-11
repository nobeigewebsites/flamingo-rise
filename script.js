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


  mainNav.All("a").forEach(link => {

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


/* =========================================================
   CLERK AUTHENTICATION
   ========================================================= */

window.addEventListener("load", async () => {

  if (typeof Clerk === "undefined") {
    return;
  }

  await Clerk.load();

     /* ---------- SUPABASE CLIENT ---------- */

  const supabaseClient =
    supabase.createClient(
      "https://pfksqkmbzfngznzejuxt.supabase.co",
      "sb_publishable_jp8Or8JiSyYPCday_0RoAA_bq5Zey38",
      {
        accessToken: async () => {
          return Clerk.session
            ? await Clerk.session.getToken()
            : null;
        }
      }
    );


  /* ---------- PAGE SECTIONS ---------- */

  const loginHero =
    document.(".login-hero");

  const createAccountSection =
    document.(".create-account-section");

  const memberPreview =
    document.(".member-preview");

  const memberDashboard =
  document.(".member-account-section");


  /* ---------- HELPER: AUTH MESSAGE ---------- */

  function showAuthMessage(form, message, type = "error") {

    let messageBox =
      form.(".auth-message");

    if (!messageBox) {

      messageBox =
        document.createElement("p");

      messageBox.className =
        "auth-message";

      form.appendChild(messageBox);

    }

    messageBox.textContent = message;
    messageBox.dataset.type = type;

  }


  /* =========================================================
     SHOW CORRECT VIEW
     ========================================================= */

  function updateMemberView() {

    if (Clerk.user) {

      /* Hide login/signup */

      if (loginHero) {
        loginHero.style.display = "none";
      }

      if (createAccountSection) {
        createAccountSection.style.display = "none";
      }


      /* Show member area */

      if (memberPreview) {
        memberPreview.style.display = "";
      }

      if (memberDashboard) {
        memberDashboard.style.display = "";
      }


      /* Member name */

      const firstName =
  Clerk.user.firstName ||
  Clerk.user.primaryEmailAddress
    ?.emailAddress
    ?.split("@")[0] ||
  "you";


const memberNavLink =
  document.getElementById("member-nav-link");

if (memberNavLink) {
  memberNavLink.textContent = "My Space";
}


document
  .querySelectorAll(".member-name")
  .forEach(element => {

    element.textContent =
      firstName;

  });

   

      const dashboardName =
        document.getElementById(
          "dashboard-first-name"
        );

      if (dashboardName) {

        dashboardName.textContent =
          firstName;

      }


      /* Add logout button */

      const logoutButton =
  document.getElementById("logout-button");

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async () => {

      await Clerk.signOut();

     window.location.reload();

    }
  );

}

}

else {
       
       const memberNavLink =
  document.getElementById("member-nav-link");

if (memberNavLink) {
  memberNavLink.textContent = "Login";
}

      /* Show login/signup */

      if (loginHero) {
        loginHero.style.display = "";
      }

      if (createAccountSection) {
        createAccountSection.style.display = "";
      }


      /* Hide member area */

      if (memberPreview) {
        memberPreview.style.display = "none";
      }

      if (memberDashboard) {
        memberDashboard.style.display = "none";
      }

    }

  }


  /* Run immediately */

  updateMemberView();


  /* =========================================================
     LOGIN
     ========================================================= */

  const loginForm =
    document.getElementById("login-form");

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        /* Prevent pointless second login */

        if (Clerk.user) {

          updateMemberView();

          return;

        }


        const email =
          document
            .getElementById("login-email")
            .value
            .trim();


        const password =
          document
            .getElementById("login-password")
            .value;


        const button =
          loginForm.querySelector(
            'button[type="submit"]'
          );


        const originalButtonText =
          button.textContent;


        button.disabled = true;

        button.textContent =
          "Letting you in...";


        try {

          const signInAttempt =
            await Clerk.client.signIn.create({
              identifier: email,
              password: password
            });


          if (
            signInAttempt.status ===
            "complete"
          ) {

            await Clerk.setActive({
              session:
                signInAttempt.createdSessionId
            });


            updateMemberView();

            return;

          }


          console.log(
            "Additional sign-in step required:",
            signInAttempt
          );


          showAuthMessage(
            loginForm,
            "One more verification step is needed."
          );

        }

        catch (error) {

          console.error(
            "Clerk login error:",
            error
          );


          const message =
            error?.errors?.[0]?.longMessage ||
            error?.errors?.[0]?.message ||
            "That login didn't work. Check your email and password and try again.";


          showAuthMessage(
            loginForm,
            message
          );

        }

        finally {

          button.disabled = false;

          button.textContent =
            originalButtonText;

        }

      }
    );

  }


  /* =========================================================
     CREATE ACCOUNT
     ========================================================= */

  const createAccountForm =
    document.querySelector(
      ".create-account-form"
    );


  if (createAccountForm) {

    createAccountForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        const firstName =
          document
            .getElementById("first-name")
            .value
            .trim();


        const email =
          document
            .getElementById("register-email")
            .value
            .trim();


        const password =
          document
            .getElementById("register-password")
            .value;


        const confirmPassword =
          document
            .getElementById("confirm-password")
            .value;


        const button =
          createAccountForm.querySelector(
            'button[type="submit"]'
          );


        const originalButtonText =
          button.textContent;


        if (
          password !== confirmPassword
        ) {

          showAuthMessage(
            createAccountForm,
            "Those passwords don't match. The little bastards need to be identical."
          );

          return;

        }


        button.disabled = true;

        button.textContent =
          "Creating your account...";


        try {

          await Clerk.client.signUp.create({
            firstName: firstName,
            emailAddress: email,
            password: password
          });


          await Clerk.client.signUp
            .prepareEmailAddressVerification({
              strategy: "email_code"
            });


          const code =
            window.prompt(
              "Check your email for your FlamingoRise verification code and enter it here."
            );


          if (!code) {

            showAuthMessage(
              createAccountForm,
              "Your account is waiting for email verification."
            );

            return;

          }


          const signUpAttempt =
            await Clerk.client.signUp
              .attemptEmailAddressVerification({
                code: code.trim()
              });


          if (
            signUpAttempt.status ===
            "complete"
          ) {

            await Clerk.setActive({
              session:
                signUpAttempt.createdSessionId
            });


            updateMemberView();

            return;

          }


          console.log(
            "Additional signup step required:",
            signUpAttempt
          );


          showAuthMessage(
            createAccountForm,
            "Your email was verified, but another step is needed."
          );

        }

        catch (error) {

          console.error(
            "Clerk signup error:",
            error
          );


          const message =
            error?.errors?.[0]?.longMessage ||
            error?.errors?.[0]?.message ||
            "Something went wrong creating your account. Try again.";


          showAuthMessage(
            createAccountForm,
            message
          );

        }

        finally {

          button.disabled = false;

          button.textContent =
            originalButtonText;

        }

      }
    );

  }

});


/* ---------- END ---------- */
