import {
  db, auth, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc,
  deleteDoc, query, orderBy, limit, where, serverTimestamp
} from "./firebase.js";

const selectedKey = "gymtracker-selected-profile";
const cacheKey = "gymtracker-profile-cache";

export const getSelectedProfileId = () => localStorage.getItem(selectedKey);
export const setSelectedProfileId = id => localStorage.setItem(selectedKey, id);
export const clearSelectedProfile = () => localStorage.removeItem(selectedKey);

export function requireUser() {
  if (!auth.currentUser) throw new Error("Please sign in first.");
  return auth.currentUser;
}

export async function isAdmin() {
  const user = requireUser();
  const snap = await getDoc(doc(db, "admins", user.uid));
  return snap.exists();
}

export async function getProfile(profileId = getSelectedProfileId()) {
  if (!profileId) return null;

  const snap = await getDoc(doc(db, "profiles", profileId));

  return snap.exists()
    ? { id: snap.id, ...snap.data() }
    : null;
}


/* -------------------------------------------------------
   USER PROFILES
------------------------------------------------------- */

export async function getProfilesForUser() {
  const user = requireUser();

  const q = query(
    collection(db, "profiles"),
    where("ownerUid", "==", user.uid),
    where("approved", "==", true)
  );

  const snap = await getDocs(q);

  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
}


/* -------------------------------------------------------
   ADMIN - ALL PROFILES
------------------------------------------------------- */

export async function getAllProfiles() {
  requireUser();

  const snap = await getDocs(
    collection(db, "profiles")
  );

  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
}


/* -------------------------------------------------------
   CREATE PROFILE
------------------------------------------------------- */

export async function createProfile({
  name,
  ownerUid,
  avatar = "",
  approved = false
}) {
  requireUser();

  const profileName = name.trim();

  // If no avatar is provided, generate it from the profile name.
  // Example:
  // "Joe Muller" → "JM"
  // "Joe" → "J"
  const generatedAvatar = profileName
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const finalAvatar = avatar.trim().toUpperCase() || generatedAvatar || "G";

  const ref = await addDoc(
    collection(db, "profiles"),
    {
      name: profileName,
      ownerUid,
      avatar: finalAvatar,
      approved,
      createdAt: serverTimestamp(),
      approvedAt: approved ? serverTimestamp() : null
    }
  );

  return ref.id;
}


/* -------------------------------------------------------
   AUTOMATIC PROFILE CREATION
------------------------------------------------------- */

export async function createPendingProfile(
  user,
  firstName = "",
  lastName = "",
  email = ""
) {

  if (!user?.uid) {
    throw new Error("No authenticated user.");
  }

  /*
   * Check whether this user already has a profile.
   * This prevents duplicate profiles if the function
   * is accidentally called more than once.
   */

  const q = query(
    collection(db, "profiles"),
    where("ownerUid", "==", user.uid)
  );

  const existing = await getDocs(q);

  if (!existing.empty) {
    return existing.docs[0].id;
  }

  firstName = firstName.trim();
  lastName = lastName.trim();
  email = email.trim();

  const fullName = `${firstName} ${lastName}`.trim();

  /*
   * CURRENT AVATAR
   *
   * We currently use the first letter of the first name.
   *
   * Example:
   * Joe Muller → J
   *
   * FUTURE VERSION:
   * When first + last name are fully implemented,
   * use:
   *
   * const avatar =
   *   `${firstName.charAt(0)}${lastName.charAt(0)}`
   *     .toUpperCase();
   *
   * Example:
   * Joe Muller → JM
   */

  const avatar = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "G";

  const ref = await addDoc(
    collection(db, "profiles"),
    {
      firstName,
      lastName,

      // Full name used throughout the existing UI
      name: fullName,

      email,
      ownerUid: user.uid,

      avatar,

      // New registrations always require admin approval
      approved: false,

      createdAt: serverTimestamp(),
      approvedAt: null
    }
  );

  return ref.id;
}

/* -------------------------------------------------------
   APPROVE PROFILE
------------------------------------------------------- */

export async function approveProfile(profileId) {

  if (!(await isAdmin())) {
    throw new Error("Only administrators can approve profiles.");
  }

  await updateDoc(
    doc(db, "profiles", profileId),
    {
      approved: true,
      approvedAt: serverTimestamp()
    }
  );
}


/* -------------------------------------------------------
   UPDATE PROFILE
------------------------------------------------------- */

export async function updateProfile(profileId, data) {

  requireUser();

  await updateDoc(
    doc(db, "profiles", profileId),
    data
  );
}


/* -------------------------------------------------------
   DELETE PROFILE
------------------------------------------------------- */

export async function deleteProfile(profileId) {

  requireUser();

  // Subcollections are intentionally not recursively deleted here.
  await deleteDoc(
    doc(db, "profiles", profileId)
  );

  if (getSelectedProfileId() === profileId) {
    clearSelectedProfile();
  }
}

function col(profileId, type) {
  return collection(db, "profiles", profileId, type);
}
function item(profileId, type, id) {
  return doc(db, "profiles", profileId, type, id);
}

export async function listEntries(type, profileId = getSelectedProfileId()) {
  if (!profileId) return [];
  const q = query(col(profileId, type), orderBy("date", "desc"), limit(500));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addEntry(type, data, profileId = getSelectedProfileId()) {
  if (!profileId) throw new Error("Select a profile first.");
  const ref = await addDoc(col(profileId, type), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
}

export async function updateEntry(type, id, data, profileId = getSelectedProfileId()) {
  if (!profileId) throw new Error("Select a profile first.");
  await updateDoc(item(profileId, type, id), {...data, updatedAt: serverTimestamp()});
}

export async function deleteEntry(type, id, profileId = getSelectedProfileId()) {
  if (!profileId) throw new Error("Select a profile first.");
  await deleteDoc(item(profileId, type, id));
}

export async function getEntriesByDate(type, date, profileId = getSelectedProfileId()) {
  if (!profileId) return [];
  const q = query(col(profileId, type), where("date", "==", date));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({id:d.id, ...d.data()}));
}

export function cleanDate(value) {
  if (!value) return new Date().toISOString().slice(0,10);
  return value;
}

export function toNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday:"short", month:"short", day:"numeric", year:"numeric"
  });
}
