import {
  auth,
  signOut
} from "./firebase.js";

import {
  getProfilesForUser,
  getAllProfiles,
  isAdmin,
  createProfile,
  approveProfile,
  deleteProfile,
  setSelectedProfileId,
  getSelectedProfileId
} from "./storage.js";


export async function init() {

  const content =
    document.getElementById("page-content");

  const admin =
    await isAdmin();

  const mine =
    await getProfilesForUser();

  const profiles =
    admin
      ? await getAllProfiles()
      : mine;


  content.innerHTML = `

    <section class="page-heading">

      <div>

        <div class="eyebrow">
          ACCOUNT
        </div>

        <h1>
          Profile
        </h1>

        <p class="muted">
          Choose the profile whose data you want to use.
        </p>

      </div>

    </section>


    ${
      admin
        ? adminNotification(profiles)
        : ""
    }


    <section class="profile-grid">

      ${
        profiles.map(p => {

          const pending =
            p.approved === false;

          return `

            <div
              class="profile-card-wrapper
                     ${pending ? "pending-profile" : ""}"
            >

              <button
                "profile-card ${p.id === getSelectedProfileId() ? "selected" : ""}"
                data-id="${p.id}"
                ${pending && !admin ? "disabled" : ""}
              >

                <span class="profile-avatar">

                  ${p.avatar ||
                    p.name?.[0] ||
                    "G"}

                </span>

                <strong>

                  ${p.name}

                  ${
                    pending
                      ? `<span class="pending-star">*</span>`
                      : ""
                  }

                </strong>

                <small>

                  ${
                    pending
                      ? "Pending approval"
                      : p.ownerUid === auth.currentUser.uid
                        ? "Your profile"
                        : "Managed profile"
                  }

                </small>

              </button>


              ${
                admin && pending
                  ? `
                    <button
                      class="btn-primary approve-profile"
                      data-approve="${p.id}"
                    >
                      ✓ Approve
                    </button>
                  `
                  : ""
              }

            </div>

          `;

        }).join("")

        ||

        `
          <div class="card empty-state">

            An admin has to approve your account first.
            Please wait for approval.

          </div>
        `
      }

    </section>


    <section class="card account-card">

      <div class="eyebrow">
        SIGNED IN
      </div>

      <h2>
        ${
          auth.currentUser.displayName ||
          auth.currentUser.email
        }
      </h2>

      <p class="muted">
        UID:
        <code>
          ${auth.currentUser.uid}
        </code>
      </p>

      <button
        id="signout"
        class="btn-secondary"
      >
        Sign out
      </button>

    </section>


    ${
      admin
        ? adminPanel(profiles)
        : ""
    }

  `;


  /* -------------------------------------------------------
     PROFILE SELECTION
  ------------------------------------------------------- */

  document
    .querySelectorAll(".profile-card")
    .forEach(button => {

      button.onclick = () => {

        const id =
          button.dataset.id;

        const profile =
          profiles.find(p => p.id === id);

        /*
         * Don't allow pending profiles
         * to be selected.
         */

        if (
          profile &&
          profile.approved === false
        ) {
          return;
        }

        setSelectedProfileId(id);

        location.href =
          "index.html";
      };

    });


  /* -------------------------------------------------------
     SIGN OUT
  ------------------------------------------------------- */

  document
    .getElementById("signout")
    .onclick = async () => {

      await signOut(auth);

      location.href =
        "login.html";
    };


  /* -------------------------------------------------------
     ADMIN
     ------------------------------------------------------- */

  if (admin) {

    bindAdmin();

  }

}


/* -------------------------------------------------------
   ADMIN NOTIFICATION
------------------------------------------------------- */

function adminNotification(profiles) {

  const pending =
    profiles.filter(
      p => p.approved === false
    );

  if (!pending.length) {
    return "";
  }

  return `

    <section class="card pending-notification">

      <div>

        <strong>
          New profile${pending.length > 1 ? "s" : ""}
          waiting for approval
        </strong>

        <p class="muted">
          ${pending.length}
          account${pending.length > 1 ? "s" : ""}
          require${pending.length === 1 ? "s" : ""} your approval.
        </p>

      </div>

      <span class="pending-badge">
        ${pending.length}
      </span>

    </section>

  `;
}


/* -------------------------------------------------------
   ADMIN PANEL
------------------------------------------------------- */

function adminPanel(profiles) {

  return `

    <section class="card admin-panel">

      <div class="section-head">

        <div>

          <div class="eyebrow">
            ADMIN
          </div>

          <h2>
            Profile management
          </h2>

        </div>

        <span class="pill">
          ADMIN
        </span>

      </div>


      <p class="muted">

        Only accounts listed in Firestore
        <code>admins</code>
        can access this panel.

      </p>


      <div class="form-grid three">

        <div class="field">

          <label>
            Profile name
          </label>

          <input
            id="new-name"
            placeholder="Alex"
          >

        </div>


        <div class="field">

          <label>
            Owner UID
          </label>

          <input
            id="new-owner"
            placeholder="Firebase user UID"
          >

        </div>


        <div class="field">

          <label>
            Avatar
          </label>

          <input
            id="new-avatar"
            maxlength="2"
            placeholder="A"
          >

        </div>

      </div>


      <button
        class="btn-primary"
        id="create-profile"
      >
        Create Profile
      </button>


      <div class="admin-list">

        ${
          profiles.map(p => `

            <div class="recent-row">

              <div>

                <b>

                  ${p.name}

                  ${
                    p.approved === false
                      ? `<span class="pending-star">*</span>`
                      : ""
                  }

                </b>

                <small>
                  ${p.ownerUid}
                </small>

              </div>


              <div class="admin-row-actions">

                ${
                  p.approved === false
                    ? `
                      <button
                        class="btn-primary approve-profile"
                        data-approve="${p.id}"
                      >
                        ✓ Approve
                      </button>
                    `
                    : `
                      <span class="pill">
                        Approved
                      </span>
                    `
                }


                <button
                  class="icon-btn danger"
                  data-delete="${p.id}"
                >
                  ×
                </button>

              </div>

            </div>

          `).join("")

        }

      </div>

    </section>

  `;
}


/* -------------------------------------------------------
   ADMIN EVENTS
------------------------------------------------------- */

function bindAdmin() {


  /* -------------------------------------------------------
     CREATE PROFILE
  ------------------------------------------------------- */

  const createButton =
    document.getElementById(
      "create-profile"
    );


  if (createButton) {

    createButton.onclick =
      async () => {

        const name =
          document
            .getElementById("new-name")
            .value
            .trim();


        const ownerUid =
          document
            .getElementById("new-owner")
            .value
            .trim();


        const avatar =
          document
            .getElementById("new-avatar")
            .value
            .trim()
          ||
          name[0]
          ||
          "G";


        if (!name || !ownerUid) {

          return showToast(
            "Profile name and owner UID are required."
          );

        }


        try {

          await createProfile({
            name,
            ownerUid,
            avatar,
            approved: true
          });

          showToast(
            "Profile created."
          );

          location.reload();

        } catch (e) {

          showToast(
            e.message
          );

        }

      };

  }


  /* -------------------------------------------------------
     APPROVE PROFILE
  ------------------------------------------------------- */

  document
    .querySelectorAll(
      "[data-approve]"
    )
    .forEach(button => {

      button.onclick =
        async event => {

          event.stopPropagation();

          const profileId =
            button.dataset.approve;


          const profile =
            await getProfileForAdmin(
              profileId
            );


          const name =
            profile?.name ||
            "this profile";


          const confirmed =
            confirm(
              `Approve ${name}?\n\n` +
              `The user will be able to use Gym Tracker after approval.`
            );


          if (!confirmed) {
            return;
          }


          try {

            await approveProfile(
              profileId
            );

            showToast(
              `${name} approved.`
            );

            location.reload();

          } catch (e) {

            showToast(
              e.message
            );

          }

        };

    });


  /* -------------------------------------------------------
     DELETE PROFILE
  ------------------------------------------------------- */

  document
    .querySelectorAll(
      "[data-delete]"
    )
    .forEach(button => {

      button.onclick =
        async () => {

          if (
            !confirm(
              "Delete this profile document? " +
              "Workout subcollections remain unless removed separately."
            )
          ) {
            return;
          }


          try {

            await deleteProfile(
              button.dataset.delete
            );

            location.reload();

          } catch (e) {

            showToast(
              e.message
            );

          }

        };

    });

}


/* -------------------------------------------------------
   GET PROFILE
------------------------------------------------------- */

async function getProfileForAdmin(profileId) {

  const {
    getProfile
  } = await import("./storage.js");

  return await getProfile(
    profileId
  );

}