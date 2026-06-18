/**
 * seed-firestore-node.mjs
 * 
 * One-time script using client-side Firebase JS SDK to seed the database.
 * This runs natively in Node.js without requiring Google Admin SDK credentials (ADC).
 * 
 * Usage:
 *   cd client
 *   node seed-firestore-node.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCqGXqgrziq6Rvtj8qnPCwOhRlxXKOXNDU",
  authDomain: "hospital-fbccf.firebaseapp.com",
  projectId: "hospital-fbccf",
  storageBucket: "hospital-fbccf.firebasestorage.app",
  messagingSenderId: "862579505758",
  appId: "1:862579505758:web:2b9f19181a66a5659c52cf",
  measurementId: "G-WYKLG7QT31"
};

console.log('🔥 Initializing Firebase Client SDK...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
    console.log('🌱 Starting Firestore database seeding...\n');

    // ─── 1. Seed Users ──────────────────────────────────────────
    const users = [
        { username: 'reception1', password: 'MediFlowSecure2026!', role: 'receptionist' },
        { username: 'nurse1', password: 'MediFlowSecure2026!', role: 'nurse' },
        { username: 'doctor1', password: 'MediFlowSecure2026!', role: 'doctor' }
    ];

    console.log('👤 Seeding staff accounts...');
    for (const u of users) {
        await setDoc(doc(db, 'users', u.username), u);
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

    console.log('🏥 Seeding active patients...');
    for (const p of patients) {
        await setDoc(doc(db, 'patients', p.id), p);
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

    console.log('🛏️ Seeding clinical beds...');
    for (const b of beds) {
        await setDoc(doc(db, 'beds', b.id), b);
    }
    console.log(`✅ Seeded ${beds.length} clinical beds`);

    // ─── 4. Seed Login Stats ────────────────────────────────────
    console.log('📈 Seeding login stats...');
    await setDoc(doc(db, 'stats', 'loginAttempts'), {
        pageOpens: 0,
        attempts: 0,
        successes: 0
    });
    console.log('✅ Initialized login stats counter');

    console.log('\n🎉 Firestore seeding complete! You can close this script now.');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
