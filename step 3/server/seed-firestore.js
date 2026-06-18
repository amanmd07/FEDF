/**
 * seed-firestore.js
 * 
 * One-time script to populate the Cloud Firestore database with the same
 * seed data that was in the SQLite database.
 * 
 * Usage:
 *   cd server
 *   node seed-firestore.js
 * 
 * Requires: firebase-admin package (installed by this script's instructions)
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// ─── Initialize Firebase Admin SDK ──────────────────────────────
// For simplicity, we use the project ID directly.
// In production, you'd use a service account key file.
initializeApp({
    projectId: 'hospital-fbccf'
});

const db = getFirestore();

async function seed() {
    console.log('🔥 Seeding Firestore database...\n');

    // ─── 1. Seed Users ──────────────────────────────────────────
    const users = [
        { username: 'reception1', password: 'MediFlowSecure2026!', role: 'receptionist' },
        { username: 'nurse1', password: 'MediFlowSecure2026!', role: 'nurse' },
        { username: 'doctor1', password: 'MediFlowSecure2026!', role: 'doctor' }
    ];

    for (const u of users) {
        await db.collection('users').doc(u.username).set(u);
    }
    console.log(`✅ Seeded ${users.length} staff accounts`);

    // ─── 2. Seed Patients ───────────────────────────────────────
    const patients = [
        {
            id: "p-1",
            name: "pragnya",
            age: 18,
            gender: "female",
            bedNumber: "B-2",
            roomNumber: "101",
            problem: "",
            vitals: { heartRate: 78, bloodPressure: "120/80", temperature: 36.7 },
            medicines: ["Paracetamol"],
            history: []
        },
        {
            id: "b007f050-0f55-4f76-966a-e4a33e8079b9",
            name: "Aman",
            age: 18,
            gender: "male",
            roomNumber: "102",
            bedNumber: "B-1",
            problem: "",
            vitals: { heartRate: null, bloodPressure: "", temperature: null },
            medicines: [],
            history: []
        },
        {
            id: "28a5992f-bd08-450c-b6ea-73da4f710749",
            name: "GVST Sumith",
            age: 18,
            gender: "male",
            roomNumber: "202",
            bedNumber: "S-1",
            problem: "",
            vitals: { heartRate: null, bloodPressure: "", temperature: null },
            medicines: [],
            history: []
        },
        {
            id: "acedea67-b412-46a7-b751-1daca79080da",
            name: "akshaya",
            age: 18,
            gender: "female",
            problem: "fever",
            bedNumber: "B-1",
            roomNumber: "",
            vitals: { heartRate: null, bloodPressure: "", temperature: null },
            medicines: ["dolo 650"],
            history: ["[23/05/2026, 17:45:25] high temperature"]
        }
    ];

    for (const p of patients) {
        await db.collection('patients').doc(p.id).set(p);
    }
    console.log(`✅ Seeded ${patients.length} active patients`);

    // ─── 3. Seed Beds ───────────────────────────────────────────
    const wardTypes = ['general', 'icu', 'emergency'];
    const beds = [
        {
            id: "b-1",
            number: "B-1",
            ward: "Ward 1",
            type: "emergency",
            status: "occupied",
            patientId: "acedea67-b412-46a7-b751-1daca79080da"
        },
        {
            id: "b-2",
            number: "B-2",
            ward: "Ward 1",
            type: "icu",
            status: "occupied",
            patientId: "p-1"
        }
    ];

    for (let i = 3; i <= 89; i++) {
        beds.push({
            id: `b-${i}`,
            number: `B-${i}`,
            ward: `Ward ${Math.ceil(i / 30)}`,
            type: wardTypes[i % 3],
            status: 'available',
            patientId: null
        });
    }

    for (const b of beds) {
        await db.collection('beds').doc(b.id).set(b);
    }
    console.log(`✅ Seeded ${beds.length} clinical beds`);

    // ─── 4. Seed Login Stats ────────────────────────────────────
    await db.collection('stats').doc('loginAttempts').set({
        pageOpens: 0,
        attempts: 0,
        successes: 0
    });
    console.log('✅ Initialized login stats counter');

    console.log('\n🎉 Firestore seeding complete!');
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
