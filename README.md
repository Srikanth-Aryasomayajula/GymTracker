# Gym Tracker

A professional, mobile-first workout tracker designed to run as a static site on GitHub Pages with global data stored in Firebase Authentication + Cloud Firestore.

## Why Firebase instead of localStorage?

This version deliberately uses **Firebase Authentication + Cloud Firestore** for user data. That means a workout recorded on your phone is available when you sign in on your laptop or another device. The browser only keeps the current selected profile locally.

## Architecture

- **GitHub Pages**: hosts HTML/CSS/JavaScript.
- **Firebase Authentication**: email/password and Google sign-in.
- **Cloud Firestore**: global, per-user/per-profile data.
- **PWA**: installable on phone and basic offline shell caching.
- **No AI in this version**.

Firebase's free Spark plan currently includes no-cost quotas for Firestore and Authentication. Firestore currently includes 1 GiB stored data, 50,000 document reads/day, 20,000 writes/day, 20,000 deletes/day and 10 GiB/month outbound transfer. Quotas can change, so check Firebase pricing before public launch.

## 1. Create Firebase project

1. Open https://console.firebase.google.com/
2. Create a project, e.g. `gym-tracker`.
3. Add a **Web app**.
4. Copy its Firebase configuration.
5. Open `js/firebase-config.js`.
6. Replace the placeholder values.

The Firebase web config is not a secret. Do **not** put service-account/private keys into this repository.

## 2. Enable authentication

Firebase Console → Authentication → Sign-in method:

- Enable **Email/Password**
- Enable **Google**

Add your GitHub Pages domain under Authentication → Settings → Authorized domains.

Example:

`srikanth-aryasomayajula.github.io`

## 3. Create Firestore

Firebase Console → Firestore Database → Create database.

Use production mode.

Then deploy the rules in `firestore.rules` through the Firebase Console's Rules editor.

## 4. Create the first admin

The application intentionally does not have a client-side "make me admin" button.

After you register/sign in:

1. Open Profile → Account.
2. Copy your Firebase UID.
3. In Firestore create:

`admins/<YOUR_UID>`

with:

```text
email: your@email.com
createdAt: timestamp
```

The document ID must be your Firebase Authentication UID.

This is what the Firestore rules use to authorize admin operations.

## 5. GitHub Pages

Repository → Settings → Pages:

- Source: **GitHub Actions**

Push the repository. The workflow in `.github/workflows/deploy.yml` publishes the root folder.

Your URL will be approximately:

`https://YOUR-GITHUB-USERNAME.github.io/GymTracker/`

## 6. Local development

Because Firebase Authentication and ES modules work best over HTTP, do not open the HTML with `file://`.

For example:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000/`

Add `localhost` to Firebase Authentication authorized domains if required.

## 7. Data model

```text
admins/{uid}

profiles/{profileId}
    ownerUid
    name
    avatar
    createdAt

profiles/{profileId}/workouts/{workoutId}
profiles/{profileId}/calories/{entryId}
profiles/{profileId}/meditations/{sessionId}
profiles/{profileId}/personalRecords/{recordId}
```

Static reference data such as machines, exercises and foods lives in `/data/*.json`.

## 8. Migration from the old localStorage app

The old app's export JSON can be imported from the new History page after signing in. The importer maps the old `entries` format into Firestore workout documents.

## 9. Important security note

The Firebase client configuration is intentionally stored in the frontend. That is normal for Firebase web apps. Security comes from **Authentication + Firestore Security Rules**, not from hiding the Firebase config.

Never commit:

- service-account JSON
- Firebase Admin SDK private keys
- OpenAI/Claude API keys
- other server-side secrets

## Future

The architecture leaves room for:

- richer charts
- workout templates
- progressive overload suggestions
- friends/invitations
- meal-plan intelligence
- AI through a secure backend

AI is intentionally not included in this version.
