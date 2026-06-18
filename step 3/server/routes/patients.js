const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { randomUUID } = require('crypto');

function determineWardByProblem(problem) {
    const p = (problem || '').toLowerCase().trim();
    if (!p) return 'general'; // Default fallback
    
    // ICU Keywords
    const icuKeywords = [
        'heart', 'chest', 'breath', 'stroke', 'unconscious', 'coma', 
        'critical', 'icu', 'cardiac', 'seizure', 'respiratory', 
        'oxygen', 'cardio', 'arrest', 'organ failure'
    ];
    // Emergency Keywords
    const emergencyKeywords = [
        'accident', 'fracture', 'bleed', 'injury', 'burn', 'wound', 
        'emergency', 'trauma', 'pain', 'poison', 'bite', 'cut', 
        'broken', 'fall', 'laceration', 'blood loss'
    ];
    
    if (icuKeywords.some(keyword => p.includes(keyword))) {
        return 'icu';
    }
    if (emergencyKeywords.some(keyword => p.includes(keyword))) {
        return 'emergency';
    }
    return 'general';
}

// Synchronize beds table status with patients assignments
async function syncBedsWithPatients() {
    try {
        const bedsSnap = await db.collection('beds').get();
        const beds = bedsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const patientsSnap = await db.collection('patients').get();
        const patients = patientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const patientByBed = {};
        for (const p of patients) {
            if (p.bedNumber) {
                patientByBed[p.bedNumber] = p.id;
            }
        }

        for (const b of beds) {
            const patientId = patientByBed[b.number];
            if (patientId) {
                if (b.status !== 'occupied' || b.patientId !== patientId) {
                    await db.collection('beds').doc(b.id).update({
                        status: 'occupied',
                        patientId: patientId
                    });
                }
            } else {
                if (b.status === 'occupied' || b.patientId !== null) {
                    await db.collection('beds').doc(b.id).update({
                        status: 'available',
                        patientId: null
                    });
                }
            }
        }

        const existingBedNumbers = new Set(beds.map(b => b.number));
        for (const p of patients) {
            if (p.bedNumber && !existingBedNumbers.has(p.bedNumber)) {
                const isSpecial = p.bedNumber.toLowerCase().includes('icu') || p.bedNumber.toLowerCase().startsWith('s');
                const type = isSpecial ? 'icu' : 'general';
                const newBedId = p.bedNumber.toLowerCase();
                await db.collection('beds').doc(newBedId).set({
                    id: newBedId,
                    number: p.bedNumber,
                    ward: 'Ward 1',
                    type,
                    status: 'occupied',
                    patientId: p.id
                });
                existingBedNumbers.add(p.bedNumber);
            }
        }
    } catch (e) {
        console.error('Error synchronizing beds with patients:', e);
    }
}

// Map database patient row to response patient object
function parsePatient(p) {
    if (!p) return null;
    let vitals = p.vitals || {};
    let medicines = p.medicines || [];
    let history = p.history || [];
    if (typeof vitals === 'string') {
        try { vitals = JSON.parse(vitals); } catch (_) {}
    }
    if (typeof medicines === 'string') {
        try { medicines = JSON.parse(medicines); } catch (_) {}
    }
    if (typeof history === 'string') {
        try { history = JSON.parse(history); } catch (_) {}
    }
    return {
        ...p,
        _id: p.id,
        vitals,
        medicines,
        history
    };
}

// Get all patients
router.get('/', auth(), async (req, res) => {
    try {
        const snap = await db.collection('patients').get();
        const patients = snap.docs.map(doc => parsePatient({ id: doc.id, ...doc.data() }));
        res.json(patients);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
});

// Search patients by name
router.get('/search', auth(), async (req, res) => {
    try {
        const q = (req.query.q || '').toLowerCase();
        const snap = await db.collection('patients').get();
        const patients = snap.docs.map(doc => parsePatient({ id: doc.id, ...doc.data() }));
        const filtered = patients.filter(p => (p.name || '').toLowerCase().includes(q));
        res.json(filtered);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
});

// Create a patient
router.post('/', auth(['receptionist', 'doctor', 'nurse']), async (req, res) => {
    try {
        let { bedNumber, problem } = req.body;
        const bedsSnap = await db.collection('beds').get();
        const beds = bedsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        let assignedBed = null;

        if (!bedNumber || bedNumber === 'auto') {
            const targetType = determineWardByProblem(problem);
            const vacantBedIdx = beds.findIndex(b => b.type === targetType && b.status === 'available');
            if (vacantBedIdx !== -1) {
                assignedBed = beds[vacantBedIdx];
                req.body.bedNumber = assignedBed.number;
            } else {
                req.body.bedNumber = ''; // Queue
            }
        } else if (['general', 'icu', 'emergency'].includes(bedNumber)) {
            const vacantBedIdx = beds.findIndex(b => b.type === bedNumber && b.status === 'available');
            if (vacantBedIdx !== -1) {
                assignedBed = beds[vacantBedIdx];
                req.body.bedNumber = assignedBed.number;
            } else {
                req.body.bedNumber = ''; // Queue
            }
        } else {
            const bidx = beds.findIndex(b => b.number === bedNumber || b.id === bedNumber);
            if (bidx !== -1) {
                if (beds[bidx].status === 'occupied') {
                    return res.status(400).json({ message: 'Selected bed is already occupied' });
                }
                assignedBed = beds[bidx];
                req.body.bedNumber = assignedBed.number;
            }
        }

        const id = randomUUID();
        const patient = {
            id,
            name: req.body.name,
            age: req.body.age,
            gender: req.body.gender,
            roomNumber: req.body.roomNumber || '',
            bedNumber: req.body.bedNumber || '',
            problem: req.body.problem || '',
            vitals: req.body.vitals || {},
            medicines: req.body.medicines || [],
            history: req.body.history || []
        };

        await db.collection('patients').doc(id).set(patient);

        if (assignedBed) {
            await db.collection('beds').doc(assignedBed.id).update({
                status: 'occupied',
                patientId: id
            });
        }

        res.json({ ...patient, _id: id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
});

// Update a patient
router.put('/:id', auth(), async (req, res) => {
    try {
        const patientId = req.params.id;
        const pDoc = await db.collection('patients').doc(patientId).get();
        if (!pDoc.exists) return res.status(404).json({ message: 'Patient not found' });
        
        const patient = parsePatient({ id: pDoc.id, ...pDoc.data() });
        let { bedNumber, problem } = req.body;

        if (bedNumber !== undefined && bedNumber !== patient.bedNumber) {
            const bedsSnap = await db.collection('beds').get();
            const beds = bedsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            let assignedBed = null;

            if (bedNumber === 'auto') {
                const targetType = determineWardByProblem(problem || patient.problem);
                const vacantBedIdx = beds.findIndex(b => b.type === targetType && b.status === 'available');
                if (vacantBedIdx !== -1) {
                    assignedBed = beds[vacantBedIdx];
                    req.body.bedNumber = assignedBed.number;
                } else {
                    req.body.bedNumber = ''; // Queue
                }
            } else if (['general', 'icu', 'emergency'].includes(bedNumber)) {
                const vacantBedIdx = beds.findIndex(b => b.type === bedNumber && b.status === 'available');
                if (vacantBedIdx !== -1) {
                    assignedBed = beds[vacantBedIdx];
                    req.body.bedNumber = assignedBed.number;
                } else {
                    req.body.bedNumber = ''; // Queue
                }
            } else if (bedNumber) {
                const bidx = beds.findIndex(b => b.number === bedNumber || b.id === bedNumber);
                if (bidx !== -1) {
                    if (beds[bidx].status === 'occupied' && beds[bidx].patientId !== patient.id) {
                        return res.status(400).json({ message: 'Selected bed is already occupied' });
                    }
                    assignedBed = beds[bidx];
                    req.body.bedNumber = assignedBed.number;
                }
            }
        }

        const updated = { ...patient, ...req.body };
        const updatePayload = { ...updated };
        delete updatePayload.id;
        delete updatePayload._id;

        await db.collection('patients').doc(patientId).update(updatePayload);

        // Run sync to update bed status mapping
        await syncBedsWithPatients();

        // Retrieve and return updated patient
        const freshDoc = await db.collection('patients').doc(patientId).get();
        res.json(parsePatient({ id: freshDoc.id, ...freshDoc.data() }));
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
});

// Assign bed to patient
router.post('/:id/assign-bed', auth(['receptionist', 'doctor']), async (req, res) => {
    try {
        const { bedId } = req.body;
        const pDoc = await db.collection('patients').doc(req.params.id).get();
        if (!pDoc.exists) return res.status(404).json({ message: 'Patient not found' });
        const patient = { id: pDoc.id, ...pDoc.data() };

        let bedRef = db.collection('beds').doc(bedId);
        let bDoc = await bedRef.get();
        if (!bDoc.exists) {
            const qSnap = await db.collection('beds').where('number', '==', bedId).get();
            if (qSnap.empty) return res.status(404).json({ message: 'Bed not found' });
            bDoc = qSnap.docs[0];
            bedRef = bDoc.ref;
        }

        const bed = { id: bDoc.id, ...bDoc.data() };
        if (bed.status === 'occupied') return res.status(400).json({ message: 'Bed occupied' });

        await bedRef.update({ status: 'occupied', patientId: patient.id });
        await db.collection('patients').doc(patient.id).update({ bedNumber: bed.number });

        const freshPatient = await db.collection('patients').doc(patient.id).get();
        const freshBed = await bedRef.get();

        res.json({ 
            bed: { id: freshBed.id, _id: freshBed.id, ...freshBed.data() }, 
            patient: parsePatient({ id: freshPatient.id, ...freshPatient.data() }) 
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
});

// Discharge patient and free bed
router.post('/:id/discharge', auth(['receptionist', 'doctor', 'nurse']), async (req, res) => {
    try {
        const pDoc = await db.collection('patients').doc(req.params.id).get();
        if (!pDoc.exists) return res.status(404).json({ message: 'Patient not found' });

        const p = parsePatient({ id: pDoc.id, ...pDoc.data() });

        // Find bed assigned to this patient
        let bed = null;
        let bedRef = null;
        if (p.bedNumber) {
            const qSnap = await db.collection('beds').where('number', '==', p.bedNumber).get();
            if (!qSnap.empty) {
                const bDoc = qSnap.docs[0];
                bed = { id: bDoc.id, ...bDoc.data() };
                bedRef = bDoc.ref;
            }
        }
        if (!bed) {
            const qSnap = await db.collection('beds').where('patientId', '==', p.id).get();
            if (!qSnap.empty) {
                const bDoc = qSnap.docs[0];
                bed = { id: bDoc.id, ...bDoc.data() };
                bedRef = bDoc.ref;
            }
        }

        if (bed && bedRef) {
            await bedRef.update({ status: 'available', patientId: null });
            bed.status = 'available';
            bed.patientId = null;
        }

        await db.collection('patients').doc(p.id).delete();

        res.json({ message: 'Discharged', patient: p, bed: bed ? { id: bed.id, _id: bed.id, ...bed } : null });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;
