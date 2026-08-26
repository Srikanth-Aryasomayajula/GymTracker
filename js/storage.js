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
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getProfilesForUser() {
  const user = requireUser();
  const q = query(collection(db, "profiles"), where("ownerUid", "==", user.uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.name||"").localeCompare(b.name||""));
}

export async function getAllProfiles() {
  requireUser();
  const snap = await getDocs(collection(db, "profiles"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.name||"").localeCompare(b.name||""));
}

export async function createProfile({name, ownerUid, avatar = "S"}) {
  requireUser();
  const ref = await addDoc(collection(db, "profiles"), {
    name, ownerUid, avatar, createdAt: serverTimestamp()
  });
  return ref.id;
}

export async function updateProfile(profileId, data) {
  requireUser();
  await updateDoc(doc(db, "profiles", profileId), data);
}

export async function deleteProfile(profileId) {
  requireUser();
  // Subcollections are intentionally not recursively deleted here.
  // Use the Admin SDK/CLI for a full destructive cascade if ever needed.
  await deleteDoc(doc(db, "profiles", profileId));
  if (getSelectedProfileId() === profileId) clearSelectedProfile();
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
