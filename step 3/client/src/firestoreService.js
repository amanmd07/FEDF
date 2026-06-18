/**
 * firestoreService.js
 * 
 * Central service layer replacing all Express API (axios) calls with
 * direct Cloud Firestore operations. Every function returns data in
 * the same shape as the original Express API responses.
 */

import { db, auth } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

// ──────────────────────────────────────────────
// Ward / bed auto-assignment logic
// (moved from server/routes/patients.js)
// ──────────────────────────────────────────────

function determineWardByProblem(problem) {
  const p = (problem || '').toLowerCase().trim();
  if (!p) return 'general';

  const icuKeywords = [
    'heart', 'chest', 'breath', 'stroke', 'unconscious', 'coma',
    'critical', 'icu', 'cardiac', 'seizure', 'respiratory',
    'oxygen', 'cardio', 'arrest', 'organ failure'
  ];
  const emergencyKeywords = [
    'accident', 'fracture', 'bleed', 'injury', 'burn', 'wound',
    'emergency', 'trauma', 'pain', 'poison', 'bite', 'cut',
    'broken', 'fall', 'laceration', 'blood loss'
  ];

  if (icuKeywords.some(kw => p.includes(kw))) return 'icu';
  if (emergencyKeywords.some(kw => p.includes(kw))) return 'emergency';
  return 'general';
}

// ──────────────────────────────────────────────
// Auth / Login Stats
// ──────────────────────────────────────────────

const STATS_DOC = doc(db, 'stats', 'loginAttempts');

/** GET /api/auth/login-attemptex */
export async function getLoginStats() {
  const snap = await getDoc(STATS_DOC);
  if (!snap.exists()) return { pageOpens: 0, attempts: 0, successes: 0 };
  return snap.data();
}

let lastIncrementTime = 0;

/** POST /api/auth/login-attemptex/increment-page */
export async function incrementPageOpens() {
  const now = Date.now();
  if (now - lastIncrementTime < 1000) {
    return getLoginStats();
  }
  lastIncrementTime = now;
  try {
    const snap = await getDoc(STATS_DOC);
    if (!snap.exists()) {
      await setDoc(STATS_DOC, { pageOpens: 1, attempts: 0, successes: 0 });
    } else {
      await updateDoc(STATS_DOC, { pageOpens: increment(1) });
    }
  } catch (e) {
    console.error('Error incrementing page opens:', e);
  }
  return getLoginStats();
}

/** POST /api/auth/login  —  validate credentials against Firestore user docs */
function mapUsernameToEmail(username) {
  return `${username}@hospital.com`;
}

export async function loginUser(username, password) {
  // Increment attempts count in Firestore metrics
  try {
    const snap = await getDoc(STATS_DOC);
    if (!snap.exists()) {
      await setDoc(STATS_DOC, { pageOpens: 0, attempts: 1, successes: 0 });
    } else {
      await updateDoc(STATS_DOC, { attempts: increment(1) });
    }
  } catch (e) {
    console.error('Error incrementing login attempts:', e);
  }

  const email = mapUsernameToEmail(username);
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    // Try a Firestore fallback when the user exists but auth account was not seeded.
    const userDoc = await getDoc(doc(db, 'users', username));
    if (userDoc.exists() && userDoc.data().password === password) {
      console.warn('Firebase Auth user missing; authenticated through Firestore fallback. Please seed Auth accounts.');
      try { await updateDoc(STATS_DOC, { successes: increment(1) }); } catch (_) { }
      return {
        token: 'firebase-fallback',
        user: { username: username, role: userDoc.data().role }
      };
    }
    throw new Error('Invalid credentials');
  }

  const userDoc = await getDoc(doc(db, 'users', username));
  if (!userDoc.exists()) {
    throw new Error('User profile missing in Firestore');
  }

  const user = userDoc.data();
  const firebaseCurrentUser = auth.currentUser;
  const token = firebaseCurrentUser ? await firebaseCurrentUser.getIdToken() : 'firebase-session';

  // Increment success count in Firestore metrics
  try { await updateDoc(STATS_DOC, { successes: increment(1) }); } catch (_) { }

  return {
    token,
    user: { username: user.username || username, role: user.role }
  };
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Firebase sign-out failed:', err);
  }
}

// ──────────────────────────────────────────────
// Patients
// ──────────────────────────────────────────────

/** GET /api/patients  —  returns array of patient objects */
export async function getAllPatients() {
  const snap = await getDocs(collection(db, 'patients'));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      _id: d.id,
      vitals: data.vitals || {},
      medicines: data.medicines || [],
      history: data.history || []
    };
  });
}

/** GET /api/patients/search?q=  —  client-side filter by name */
export async function searchPatients(queryStr) {
  const all = await getAllPatients();
  if (!queryStr) return all;
  const q = queryStr.toLowerCase();
  return all.filter(p => (p.name || '').toLowerCase().includes(q));
}

/** POST /api/patients  —  create a patient with optional auto-assign bed */
export async function createPatient(data) {
  let { bedNumber, problem } = data;
  const beds = await getAllBeds();
  let assignedBed = null;

  if (!bedNumber || bedNumber === 'auto') {
    const targetType = determineWardByProblem(problem);
    assignedBed = beds.find(b => b.type === targetType && b.status === 'available') || null;
    bedNumber = assignedBed ? assignedBed.number : '';
  } else if (['general', 'icu', 'emergency'].includes(bedNumber)) {
    assignedBed = beds.find(b => b.type === bedNumber && b.status === 'available') || null;
    bedNumber = assignedBed ? assignedBed.number : '';
  } else {
    const found = beds.find(b => b.number === bedNumber || b.id === bedNumber);
    if (found) {
      if (found.status === 'occupied') throw new Error('Selected bed is already occupied');
      assignedBed = found;
      bedNumber = found.number;
    }
  }

  // Generate a unique ID
  const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);

  const patient = {
    id,
    name: data.name,
    age: data.age,
    gender: data.gender,
    roomNumber: data.roomNumber || '',
    bedNumber: bedNumber || '',
    problem: data.problem || '',
    vitals: data.vitals || {},
    medicines: data.medicines || [],
    history: data.history || []
  };

  await setDoc(doc(db, 'patients', id), patient);

  // Mark bed as occupied
  if (assignedBed) {
    await updateDoc(doc(db, 'beds', assignedBed.id), {
      status: 'occupied',
      patientId: id
    });
  }

  return { ...patient, _id: id };
}

/** PUT /api/patients/:id  —  update patient fields */
export async function updatePatient(patientId, data) {
  const patientRef = doc(db, 'patients', patientId);
  const snap = await getDoc(patientRef);
  if (!snap.exists()) throw new Error('Patient not found');

  const existing = snap.data();

  // Handle bed re-assignment if bedNumber changed
  if (data.bedNumber !== undefined && data.bedNumber !== existing.bedNumber) {
    const beds = await getAllBeds();
    let assignedBed = null;

    if (data.bedNumber === 'auto') {
      const targetType = determineWardByProblem(data.problem || existing.problem);
      assignedBed = beds.find(b => b.type === targetType && b.status === 'available') || null;
      data.bedNumber = assignedBed ? assignedBed.number : '';
    } else if (['general', 'icu', 'emergency'].includes(data.bedNumber)) {
      assignedBed = beds.find(b => b.type === data.bedNumber && b.status === 'available') || null;
      data.bedNumber = assignedBed ? assignedBed.number : '';
    } else if (data.bedNumber) {
      const found = beds.find(b => b.number === data.bedNumber || b.id === data.bedNumber);
      if (found) {
        if (found.status === 'occupied' && found.patientId !== patientId) {
          throw new Error('Selected bed is already occupied');
        }
        assignedBed = found;
        data.bedNumber = found.number;
      }
    }
  }

  const updated = { ...existing, ...data };
  await setDoc(patientRef, updated);

  // Sync bed statuses
  await syncBedsWithPatients();

  return { ...updated, _id: patientId };
}

/** POST /api/patients/:id/assign-bed */
export async function assignBed(patientId, bedId) {
  const patientRef = doc(db, 'patients', patientId);
  const patientSnap = await getDoc(patientRef);
  if (!patientSnap.exists()) throw new Error('Patient not found');

  // Find bed by id or number
  const beds = await getAllBeds();
  const bed = beds.find(b => b.id === bedId || b.number === bedId);
  if (!bed) throw new Error('Bed not found');
  if (bed.status === 'occupied') throw new Error('Bed occupied');

  // Update bed → occupied
  await updateDoc(doc(db, 'beds', bed.id), {
    status: 'occupied',
    patientId
  });

  // Update patient → bedNumber
  await updateDoc(patientRef, { bedNumber: bed.number });

  // Return updated objects
  const updatedPatient = (await getDoc(patientRef)).data();
  const updatedBed = (await getDoc(doc(db, 'beds', bed.id))).data();

  return {
    bed: { ...updatedBed, _id: bed.id },
    patient: { ...updatedPatient, _id: patientId }
  };
}

/** POST /api/patients/:id/discharge */
export async function dischargePatient(patientId) {
  const patientRef = doc(db, 'patients', patientId);
  const patientSnap = await getDoc(patientRef);
  if (!patientSnap.exists()) throw new Error('Patient not found');

  const patient = { ...patientSnap.data(), _id: patientId };

  // Find and free the bed
  let freedBed = null;
  if (patient.bedNumber) {
    const beds = await getAllBeds();
    const bed = beds.find(b => b.number === patient.bedNumber);
    if (bed) {
      await updateDoc(doc(db, 'beds', bed.id), {
        status: 'available',
        patientId: null
      });
      freedBed = { ...bed, status: 'available', patientId: null, _id: bed.id };
    }
  }

  // Also check for any bed pointing to this patient
  if (!freedBed) {
    const beds = await getAllBeds();
    const bed = beds.find(b => b.patientId === patientId);
    if (bed) {
      await updateDoc(doc(db, 'beds', bed.id), {
        status: 'available',
        patientId: null
      });
      freedBed = { ...bed, status: 'available', patientId: null, _id: bed.id };
    }
  }

  // Delete the patient document
  await deleteDoc(patientRef);

  return { message: 'Discharged', patient, bed: freedBed };
}

// ──────────────────────────────────────────────
// Beds
// ──────────────────────────────────────────────

/** GET /api/beds */
export async function getAllBeds() {
  const snap = await getDocs(collection(db, 'beds'));
  return snap.docs.map(d => ({
    ...d.data(),
    id: d.id,
    _id: d.id
  }));
}

/** POST /api/beds  —  create a bed */
export async function createBed(data) {
  const id = data.id || (data.number ? data.number.toLowerCase() : crypto.randomUUID());
  const bed = {
    id,
    number: data.number,
    ward: data.ward,
    type: data.type,
    status: data.status || 'available',
    patientId: data.patientId || null
  };
  await setDoc(doc(db, 'beds', id), bed);
  return { ...bed, _id: id };
}

/** PUT /api/beds/:id  —  update a bed */
export async function updateBed(bedId, data) {
  // Find by id or number
  const beds = await getAllBeds();
  const bed = beds.find(b => b.id === bedId || b.number === bedId);
  if (!bed) throw new Error('Bed not found');

  const updated = { ...bed, ...data };
  await setDoc(doc(db, 'beds', bed.id), updated);
  return { ...updated, _id: bed.id };
}

/** DELETE /api/beds/:id */
export async function deleteBed(bedId) {
  // Find by id or number
  const beds = await getAllBeds();
  const bed = beds.find(b => b.id === bedId || b.number === bedId);
  if (!bed) throw new Error('Bed not found');

  await deleteDoc(doc(db, 'beds', bed.id));

  // Clear bed assignment from any patient using this bed
  const patients = await getAllPatients();
  for (const p of patients) {
    if (p.bedNumber === bed.number) {
      await updateDoc(doc(db, 'patients', p.id), { bedNumber: '' });
    }
  }

  return { message: 'Bed deleted successfully', deleted: bed };
}

// ──────────────────────────────────────────────
// Bed ↔ Patient Sync
// (moved from server/routes/beds.js and patients.js)
// ──────────────────────────────────────────────

async function syncBedsWithPatients() {
  try {
    const beds = await getAllBeds();
    const patients = await getAllPatients();

    const patientByBed = {};
    for (const p of patients) {
      if (p.bedNumber) patientByBed[p.bedNumber] = p.id;
    }

    for (const b of beds) {
      const pid = patientByBed[b.number];
      if (pid) {
        if (b.status !== 'occupied' || b.patientId !== pid) {
          await updateDoc(doc(db, 'beds', b.id), { status: 'occupied', patientId: pid });
        }
      } else {
        if (b.status === 'occupied' || b.patientId !== null) {
          await updateDoc(doc(db, 'beds', b.id), { status: 'available', patientId: null });
        }
      }
    }
  } catch (e) {
    console.error('Error syncing beds with patients:', e);
  }
}

// ──────────────────────────────────────────────
// Real-time Listeners
// ──────────────────────────────────────────────

/** Subscribe to real-time patient updates */
export function onPatientsSnapshot(callback) {
  return onSnapshot(collection(db, 'patients'), (snap) => {
    const patients = snap.docs.map(d => ({
      ...d.data(),
      id: d.id,
      _id: d.id,
      vitals: d.data().vitals || {},
      medicines: d.data().medicines || [],
      history: d.data().history || []
    }));
    callback(patients);
  });
}

/** Subscribe to real-time bed updates */
export function onBedsSnapshot(callback) {
  return onSnapshot(collection(db, 'beds'), (snap) => {
    const beds = snap.docs.map(d => ({
      ...d.data(),
      id: d.id,
      _id: d.id
    }));
    callback(beds);
  });
}

/** Subscribe to real-time login stats updates */
export function onLoginStatsSnapshot(callback) {
  return onSnapshot(STATS_DOC, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      callback({ pageOpens: 0, attempts: 0, successes: 0 });
    }
  });
}
