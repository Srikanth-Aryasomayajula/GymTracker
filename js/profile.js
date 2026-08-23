import { auth, signOut, getDoc, db, doc } from "./firebase.js";
import { getProfilesForUser, getAllProfiles, isAdmin, createProfile, updateProfile, deleteProfile, setSelectedProfileId, getSelectedProfileId } from "./storage.js";

export async function init(){
 const content=document.getElementById("page-content");const admin=await isAdmin();const mine=await getProfilesForUser();
 const profiles=admin?await getAllProfiles():mine;
 content.innerHTML=`
 <section class="page-heading"><div><div class="eyebrow">ACCOUNT</div><h1>Profile</h1><p class="muted">Choose the profile whose data you want to use.</p></div></section>
 <section class="profile-grid">${profiles.map(p=>`<button class="profile-card ${p.id===getSelectedProfileId()?"selected":""}" data-id="${p.id}"><span class="profile-avatar">${p.avatar||p.name?.[0]||"G"}</span><strong>${p.name}</strong><small>${p.ownerUid===auth.currentUser.uid?"Your profile":"Managed profile"}</small></button>`).join("")||`<div class="card empty-state">An admin has to approve your account first. Please use the contact form to make a request.</div>`}</section>
 <section class="card account-card"><div class="eyebrow">SIGNED IN</div><h2>${auth.currentUser.displayName||auth.currentUser.email}</h2><p class="muted">UID: <code>${auth.currentUser.uid}</code></p><button id="signout" class="btn-secondary">Sign out</button></section>
 ${admin?adminPanel(profiles):""}`;
 document.querySelectorAll(".profile-card").forEach(b=>b.onclick=()=>{setSelectedProfileId(b.dataset.id);location.href="index.html"});
 document.getElementById("signout").onclick=async()=>{await signOut(auth);location.href="login.html"};
 if(admin) bindAdmin();
}

function adminPanel(profiles){
 return `<section class="card admin-panel"><div class="section-head"><div><div class="eyebrow">ADMIN</div><h2>Profile management</h2></div><span class="pill">ADMIN</span></div>
 <p class="muted">Only accounts listed in Firestore <code>admins</code> can access this panel.</p>
 <div class="form-grid three"><div class="field"><label>Profile name</label><input id="new-name" placeholder="Alex"></div><div class="field"><label>Owner UID</label><input id="new-owner" placeholder="Firebase user UID"></div><div class="field"><label>Avatar</label><input id="new-avatar" maxlength="2" placeholder="A"></div></div>
 <button class="btn-primary" id="create-profile">Create Profile</button>
 <div class="admin-list">${profiles.map(p=>`<div class="recent-row"><div><b>${p.name}</b><small>${p.ownerUid}</small></div><button class="icon-btn danger" data-delete="${p.id}">×</button></div>`).join("")}</div></section>`;
}
function bindAdmin(){
 document.getElementById("create-profile").onclick=async()=>{
  const name=document.getElementById("new-name").value.trim(),ownerUid=document.getElementById("new-owner").value.trim(),avatar=document.getElementById("new-avatar").value.trim()||name[0]||"G";
  if(!name||!ownerUid)return showToast("Profile name and owner UID are required.");
  try{await createProfile({name,ownerUid,avatar});showToast("Profile created.");location.reload();}catch(e){showToast(e.message)}
 };
 document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this profile document? Workout subcollections remain unless removed separately."))return;try{await deleteProfile(b.dataset.delete);location.reload()}catch(e){showToast(e.message)}});
}
