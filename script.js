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


/* =========================================================
   CLERK AUTHENTICATION
   ========================================================= */

window.addEventListener("load", async () => {

  /*
    Clerk only exists on pages where the Clerk scripts
    have been loaded — currently login.html.
  */

  if (typeof Clerk === "undefined") {
    return;
  }

  await Clerk.load();


  /* ---------- HELPER: SHOW FORM MESSAGE ---------- */

  function showAuthMessage(form, message, type = "error") {

    let messageBox = form.querySelector(".auth-message");

    if (!messageBox) {

      messageBox = document.createElement("p");

      messageBox.className = "auth-message";

      form.appendChild(messageBox);

    }

    messageBox.textContent = message;
    messageBox.dataset.type = type;

  }


  /* ---------- ALREADY SIGNED IN ---------- */

  if (Clerk.user) {

    const firstName =
      Clerk.user.firstName ||
      Clerk.user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
      "you";

    document
      .querySelectorAll(".member-name")
      .forEach(element => {
        element.textContent = firstName;
      });

    const dashboardName =
      document.getElementById("dashboard-first-name");

    if (dashboardName) {
      dashboardName.textContent = firstName;
    }

  }


  /* =========================================================
     LOGIN
     ========================================================= */

  const loginForm =
    document.getElementById("login-form");

  if (loginForm) {

    loginForm.addEventListener("submit", async event => {

      event.preventDefault();

      const email =
        document.getElementById("login-email").value.trim();

      const password =
        document.getElementById("login-password").value;

      const button =
        loginForm.querySelector('button[type="submit"]');

      const originalButtonText =
        button.textContent;

      button.disabled = true;
      button.textContent = "Letting you in...";

      try {

        const signInAttempt =
          await Clerk.client.signIn.create({
            identifier: email,
            password: password
          });


        if (signInAttempt.status === "complete") {

          await Clerk.setActive({
            session: signInAttempt.createdSessionId
          });

          showAuthMessage(
            loginForm,
            "You're in. 🎉",
            "success"
          );

          window.location.reload();

          return;

        }


        /*
          Clerk can sometimes require an additional
          verification step depending on account/security
          settings. We'll wire that UI next if it occurs.
        */

        console.log(
          "Additional sign-in step required:",
          signInAttempt
        );

        showAuthMessage(
          loginForm,
          "One more verification step is needed. We'll sort that next."
        );

      }

      catch (error) {

        console.error("Clerk login error:", error);

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
        button.textContent = originalButtonText;

      }

    });

  }


  /* =========================================================
     CREATE ACCOUNT
     ========================================================= */

  const createAccountForm =
    document.querySelector(".create-account-form");

  if (createAccountForm) {

    createAccountForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        const firstName =
          document.getElementById("first-name").value.trim();

        const email =
          document.getElementById("register-email").value.trim();

        const password =
          document.getElementById("register-password").value;

        const confirmPassword =
          document.getElementById("confirm-password").value;

        const button =
          createAccountForm.querySelector(
            'button[type="submit"]'
          );

        const originalButtonText =
          button.textContent;


        /* Passwords must match */

        if (password !== confirmPassword) {

          showAuthMessage(
            createAccountForm,
            "Those passwords don't match. The little bastards need to be identical."
          );

          return;

        }


        button.disabled = true;
        button.textContent = "Creating your account...";


        try {

          await Clerk.client.signUp.create({
            firstName: firstName,
            emailAddress: email,
            password: password
          });


          /*
            Send Clerk's email verification code.
          */

          await Clerk.client.signUp
            .prepareEmailAddressVerification({
              strategy: "email_code"
            });


          /*
            Ask for the verification code.

            Temporary simple prompt for our first test.
            Once we know everything works, we'll replace
            this with a proper FlamingoRise verification box.
          */

          const code = window.prompt(
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


          if (signUpAttempt.status === "complete") {

            await Clerk.setActive({
              session: signUpAttempt.createdSessionId
            });


            showAuthMessage(
              createAccountForm,
              "Account created. Welcome to FlamingoRise 🦩",
              "success"
            );


            window.location.reload();

            return;

          }


          console.log(
            "Additional signup step required:",
            signUpAttempt
          );


          showAuthMessage(
            createAccountForm,
            "Your email was verified, but Clerk needs another step before finishing the account."
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
          button.textContent = originalButtonText;

        }

      }
    );

  }

});


/* ---------- END ---------- */
