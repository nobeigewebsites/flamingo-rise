/* =========================================================
   FLAMINGORISE — MAIN JAVASCRIPT
   ========================================================= */


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

const menuToggle =
  document.querySelector(".menu-toggle");

const mainNav =
  document.querySelector(".main-nav");


if (menuToggle && mainNav) {

  menuToggle.addEventListener(
    "click",
    () => {

      const isOpen =
        mainNav.classList.toggle("active");

      menuToggle.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
      );

    }
  );


  mainNav
    .querySelectorAll("a")
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {

          mainNav.classList.remove(
            "active"
          );

          menuToggle.setAttribute(
            "aria-expanded",
            "false"
          );

        }
      );

    });

}


/* =========================================================
   AUTOMATIC COPYRIGHT YEAR
   ========================================================= */

const year =
  document.getElementById("year");

if (year) {

  year.textContent =
    new Date().getFullYear();

}


/* =========================================================
   CLERK + SUPABASE
   ========================================================= */

window.addEventListener(
  "load",
  async () => {


    /* ---------------------------------------------------------
       CHECK CLERK EXISTS
       --------------------------------------------------------- */

    if (typeof Clerk === "undefined") {

      console.error(
        "Clerk failed to load."
      );

      return;

    }


    await Clerk.load();


    /* ---------------------------------------------------------
       CHECK SUPABASE EXISTS
       --------------------------------------------------------- */

    if (
      typeof supabase === "undefined"
    ) {

      console.error(
        "Supabase failed to load."
      );

      return;

    }


    /* =========================================================
       SUPABASE CLIENT
       ========================================================= */

    const supabaseClient =
      supabase.createClient(

        "https://pfksqkmbzfngznzejuxt.supabase.co",

        "sb_publishable_jp8Or8JiSyYPCday_0RoAA_bq5Zey38",

        {

          accessToken: async () => {

            if (!Clerk.session) {
              return null;
            }

            return await Clerk.session.getToken();

          }

        }

      );


    /* =========================================================
       PAGE ELEMENTS
       ========================================================= */

    const loginHero =
      document.querySelector(
        ".login-hero"
      );

    const createAccountSection =
      document.querySelector(
        ".create-account-section"
      );

    const memberPreview =
      document.querySelector(
        ".member-preview"
      );

    const memberDashboard =
      document.querySelector(
        ".member-account-section"
      );

    const memberNavLink =
      document.getElementById(
        "member-nav-link"
      );

    const logoutButton =
      document.getElementById(
        "logout-button"
      );


    /* ---------------------------------------------------------
       MEMBER RESOURCE ELEMENTS
       --------------------------------------------------------- */

    const memberResourceSummary =
      document.getElementById(
        "member-resource-summary"
      );

    const memberResourceToggle =
      document.getElementById(
        "member-resource-toggle"
      );

    const memberResourcesPanel =
      document.getElementById(
        "member-resources-panel"
      );

    const memberResourcesList =
      document.getElementById(
        "member-resources-list"
      );


    /* =========================================================
       AUTH MESSAGE HELPER
       ========================================================= */

    function showAuthMessage(
      form,
      message,
      type = "error"
    ) {

      let messageBox =
        form.querySelector(
          ".auth-message"
        );


      if (!messageBox) {

        messageBox =
          document.createElement("p");

        messageBox.className =
          "auth-message";

        form.appendChild(
          messageBox
        );

      }


      messageBox.textContent =
        message;

      messageBox.dataset.type =
        type;

    }


    /* =========================================================
       MEMBER NAME HELPER
       ========================================================= */

    function getMemberFirstName() {

      return (

        Clerk.user?.firstName ||

        Clerk.user
          ?.primaryEmailAddress
          ?.emailAddress
          ?.split("@")[0] ||

        "you"

      );

    }


    /* =========================================================
       SYNC MEMBER PROFILE TO SUPABASE
       ========================================================= */

    async function syncMemberProfile() {

      if (!Clerk.user) {
        return;
      }


      const email =
        Clerk.user
          .primaryEmailAddress
          ?.emailAddress ||
        null;


      const firstName =
        Clerk.user.firstName ||
        null;


      const { error } =
        await supabaseClient

          .from(
            "member_profiles"
          )

          .upsert(

            {

              clerk_user_id:
                Clerk.user.id,

              email:
                email,

              first_name:
                firstName,

              updated_at:
                new Date()
                  .toISOString()

            },

            {

              onConflict:
                "clerk_user_id"

            }

          );


      if (error) {

        console.error(
          "Supabase profile sync error:",
          error
        );

        return;

      }


      console.log(
        "Supabase member profile synced."
      );

    }


    /* =========================================================
       LOAD MEMBER RESOURCES
       ========================================================= */

    async function loadMemberResources() {

      if (!Clerk.user) {
        return [];
      }


      const {
        data,
        error
      } =
        await supabaseClient

          .from(
            "member_resources"
          )

          .select(`
            resource_id,
            resources (
              id,
              slug,
              title,
              resource_type,
              description,
              is_free,
              price_pence,
              payhip_url,
              storage_path,
              is_active
            )
          `);


      if (error) {

        console.error(
          "Supabase member resources error:",
          error
        );

        return [];

      }


      console.log(
        "Member resources:",
        data
      );


      return data || [];

    }


    /* =========================================================
       NORMALISE RESOURCE
       ========================================================= */

    function getResourceFromEntitlement(
      entitlement
    ) {

      if (!entitlement) {
        return null;
      }


      const resource =
        entitlement.resources;


      if (
        Array.isArray(resource)
      ) {

        return resource[0] || null;

      }


      return resource || null;

    }


    /* =========================================================
       RENDER MEMBER RESOURCES
       ========================================================= */

    function renderMemberResources(
      entitlements
    ) {

      if (
        !memberResourceSummary ||
        !memberResourcesList
      ) {
        return;
      }


      const resources =
        entitlements

          .map(
            getResourceFromEntitlement
          )

          .filter(
            resource =>
              resource &&
              resource.is_active !== false
          );


      /* ---------------------------------------------------------
         NOTHING OWNED
         --------------------------------------------------------- */

      if (
        resources.length === 0
      ) {

        memberResourceSummary.textContent =
          "Nothing here yet — your resources will appear here when you get them.";

        memberResourcesList.replaceChildren();


        if (memberResourceToggle) {

          memberResourceToggle.hidden =
            true;

        }


        if (memberResourcesPanel) {

          memberResourcesPanel.hidden =
            true;

        }


        return;

      }


      /* ---------------------------------------------------------
         RESOURCE COUNT
         --------------------------------------------------------- */

      if (
        resources.length === 1
      ) {

        memberResourceSummary.textContent =
          "You've got 1 resource waiting for you.";

      }

      else {

        memberResourceSummary.textContent =
          `You've got ${resources.length} resources waiting for you.`;

      }


      if (memberResourceToggle) {

        memberResourceToggle.hidden =
          false;

      }


      /* ---------------------------------------------------------
         CLEAR OLD CONTENT
         --------------------------------------------------------- */

      memberResourcesList.replaceChildren();


      /* ---------------------------------------------------------
         BUILD RESOURCE CARDS
         --------------------------------------------------------- */

      resources.forEach(
        resource => {


          const article =
            document.createElement(
              "article"
            );

          article.className =
            "member-resource-item";


          /* TYPE */

          if (resource.resource_type) {

            const type =
              document.createElement(
                "p"
              );

            type.className =
              "member-resource-type";

            type.textContent =
              resource.resource_type;

            article.appendChild(
              type
            );

          }


          /* TITLE */

          const title =
            document.createElement(
              "h3"
            );

          title.textContent =
            resource.title ||
            "FlamingoRise Resource";

          article.appendChild(
            title
          );


          /* DESCRIPTION */

          if (resource.description) {

            const description =
              document.createElement(
                "p"
              );

            description.className =
              "member-resource-description";

            description.textContent =
              resource.description;

            article.appendChild(
              description
            );

          }


          /* STATUS */

          const status =
            document.createElement(
              "p"
            );

          status.className =
            "member-resource-status";

          status.textContent =
            resource.is_free
              ? "Included in your library"
              : "Purchased resource";

          article.appendChild(
            status
          );


          /* -----------------------------------------------------
             EXTERNAL / PAYHIP LINK
             ----------------------------------------------------- */

          if (resource.payhip_url) {

            const link =
              document.createElement(
                "a"
              );

            link.href =
              resource.payhip_url;

            link.target =
              "_blank";

            link.rel =
              "noopener noreferrer";

            link.className =
              "button button-primary";

            link.textContent =
              "Open resource →";

            article.appendChild(
              link
            );

          }


          /* -----------------------------------------------------
             PRIVATE STORAGE PLACEHOLDER
             ----------------------------------------------------- */

          else if (
            resource.storage_path
          ) {

            const privateNote =
              document.createElement(
                "p"
              );

            privateNote.className =
              "member-resource-private-note";

            privateNote.textContent =
              "Secure download available.";

            article.appendChild(
              privateNote
            );

          }


          /* -----------------------------------------------------
             TEST / NO FILE ATTACHED YET
             ----------------------------------------------------- */

          else {

            const testNote =
              document.createElement(
                "p"
              );

            testNote.className =
              "member-resource-private-note";

            testNote.textContent =
              "Access confirmed — this resource is attached to your account.";

            article.appendChild(
              testNote
            );

          }


          memberResourcesList.appendChild(
            article
          );

        }

      );

    }


    /* =========================================================
       MEMBER RESOURCE PANEL TOGGLE
       ========================================================= */

    if (
      memberResourceToggle &&
      memberResourcesPanel
    ) {

      memberResourceToggle.addEventListener(
        "click",
        () => {


          const opening =
            memberResourcesPanel.hidden;


          memberResourcesPanel.hidden =
            !opening;


          memberResourceToggle.textContent =
            opening
              ? "Hide my stuff ↑"
              : "See my stuff →";


          if (opening) {

            memberResourcesPanel
              .scrollIntoView({

                behavior:
                  "smooth",

                block:
                  "start"

              });

          }

        }
      );

    }


    /* =========================================================
       SHOW CORRECT MEMBER VIEW
       ========================================================= */

    async function updateMemberView() {


      /* ---------------------------------------------------------
         SIGNED IN
         --------------------------------------------------------- */

      if (Clerk.user) {


        /* Sync member with database */

        await syncMemberProfile();


        /* Load owned resources */

        const entitlements =
          await loadMemberResources();


        /* Render owned resources */

        renderMemberResources(
          entitlements
        );


        /* Hide login */

        if (loginHero) {

          loginHero.style.display =
            "none";

        }


        /* Hide registration */

        if (
          createAccountSection
        ) {

          createAccountSection
            .style
            .display =
            "none";

        }


        /* Show member area */

        if (memberPreview) {

          memberPreview.style.display =
            "";

        }


        if (memberDashboard) {

          memberDashboard.style.display =
            "";

        }


        /* Change nav */

        if (memberNavLink) {

          memberNavLink.textContent =
            "My Space";

        }


        /* Display member name */

        const firstName =
          getMemberFirstName();


        document

          .querySelectorAll(
            ".member-name"
          )

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


        return;

      }


      /* ---------------------------------------------------------
         SIGNED OUT
         --------------------------------------------------------- */

      if (memberNavLink) {

        memberNavLink.textContent =
          "Login";

      }


      if (loginHero) {

        loginHero.style.display =
          "";

      }


      if (
        createAccountSection
      ) {

        createAccountSection
          .style
          .display =
          "";

      }


      if (memberPreview) {

        memberPreview.style.display =
          "none";

      }


      if (memberDashboard) {

        memberDashboard.style.display =
          "none";

      }


      if (memberResourcesPanel) {

        memberResourcesPanel.hidden =
          true;

      }

    }


    /* =========================================================
       LOGOUT
       ========================================================= */

    if (logoutButton) {

      logoutButton.addEventListener(
        "click",
        async () => {

          try {

            await Clerk.signOut();

            window.location.reload();

          }

          catch (error) {

            console.error(
              "Clerk logout error:",
              error
            );

          }

        }
      );

    }


    /* =========================================================
       INITIAL PAGE VIEW
       ========================================================= */

    await updateMemberView();


    /* =========================================================
       LOGIN
       ========================================================= */

    const loginForm =
      document.getElementById(
        "login-form"
      );


    if (loginForm) {

      loginForm.addEventListener(
        "submit",
        async event => {


          event.preventDefault();


          if (Clerk.user) {

            await updateMemberView();

            return;

          }


          const email =
            document
              .getElementById(
                "login-email"
              )
              .value
              .trim();


          const password =
            document
              .getElementById(
                "login-password"
              )
              .value;


          const button =
            loginForm.querySelector(
              'button[type="submit"]'
            );


          const originalButtonText =
            button.textContent;


          button.disabled =
            true;

          button.textContent =
            "Letting you in...";


          try {


            const signInAttempt =
              await Clerk.client
                .signIn
                .create({

                  identifier:
                    email,

                  password:
                    password

                });


            if (
              signInAttempt.status ===
              "complete"
            ) {


              await Clerk.setActive({

                session:
                  signInAttempt
                    .createdSessionId

              });


              await updateMemberView();

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

              error
                ?.errors
                ?.[0]
                ?.longMessage ||

              error
                ?.errors
                ?.[0]
                ?.message ||

              "That login didn't work. Check your email and password and try again.";


            showAuthMessage(
              loginForm,
              message
            );

          }


          finally {

            button.disabled =
              false;

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

      createAccountForm
        .addEventListener(
          "submit",
          async event => {


            event.preventDefault();


            const firstName =
              document
                .getElementById(
                  "first-name"
                )
                .value
                .trim();


            const email =
              document
                .getElementById(
                  "register-email"
                )
                .value
                .trim();


            const password =
              document
                .getElementById(
                  "register-password"
                )
                .value;


            const confirmPassword =
              document
                .getElementById(
                  "confirm-password"
                )
                .value;


            const button =
              createAccountForm
                .querySelector(
                  'button[type="submit"]'
                );


            const originalButtonText =
              button.textContent;


            if (
              password !==
              confirmPassword
            ) {


              showAuthMessage(

                createAccountForm,

                "Those passwords don't match. The little bastards need to be identical."

              );


              return;

            }


            button.disabled =
              true;

            button.textContent =
              "Creating your account...";


            try {


              await Clerk.client
                .signUp
                .create({

                  firstName:
                    firstName,

                  emailAddress:
                    email,

                  password:
                    password

                });


              await Clerk.client
                .signUp
                .prepareEmailAddressVerification({

                  strategy:
                    "email_code"

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
                await Clerk.client
                  .signUp
                  .attemptEmailAddressVerification({

                    code:
                      code.trim()

                  });


              if (
                signUpAttempt.status ===
                "complete"
              ) {


                await Clerk.setActive({

                  session:
                    signUpAttempt
                      .createdSessionId

                });


                await updateMemberView();

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

                error
                  ?.errors
                  ?.[0]
                  ?.longMessage ||

                error
                  ?.errors
                  ?.[0]
                  ?.message ||

                "Something went wrong creating your account. Try again.";


              showAuthMessage(
                createAccountForm,
                message
              );

            }


            finally {

              button.disabled =
                false;

              button.textContent =
                originalButtonText;

            }

          }

        );

    }

  }

);


/* =========================================================
   END
   ========================================================= */
