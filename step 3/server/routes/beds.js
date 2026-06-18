const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { randomUUID } = require('crypto');

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

// Get all beds
router.get('/', auth(), async (req, res) => {
    try {
        await syncBedsWithPatients();
        const bedsSnap = await db.collection('beds').get();
        const beds = bedsSnap.docs.map(doc => ({ id: doc.id, _id: doc.id, ...doc.data() }));
        res.json(beds);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
});

// Create a bed
router.post('/', auth(['doctor', 'nurse']), async (req, res) => {
    try {
        const id = randomUUID();
        const { number, ward, type, status, patientId } = req.body;
        const newBed = {
            id,
            number,
            ward,
            type,
            status: status || 'available',
            patientId: patientId || null
        };
        await db.collection('beds').doc(id).set(newBed);
        res.json({ ...newBed, _id: id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
});

// Update a bed
router.put('/:id', auth(), async (req, res) => {
    try {
        const bedId = req.params.id;
        let bedRef = db.collection('beds').doc(bedId);
        let doc = await bedRef.get();
        
        if (!doc.exists) {
            const qSnap = await db.collection('beds').where('number', '==', bedId).get();
            if (qSnap.empty) {
                return res.status(404).json({ message: 'Bed not found' });
            }
            doc = qSnap.docs[0];
            bedRef = doc.ref;
        }

        const bed = { id: doc.id, ...doc.data() };
        const updated = { ...bed, ...req.body };
        
        const updatePayload = { ...updated };
        delete updatePayload.id;
        delete updatePayload._id;

        await bedRef.update(updatePayload);
        res.json({ ...updated, _id: doc.id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
});

// Delete a bed
router.delete('/:id', auth(['doctor', 'nurse']), async (req, res) => {
    try {
        const bedId = req.params.id;
        let bedRef = db.collection('beds').doc(bedId);
        let doc = await bedRef.get();
        
        if (!doc.exists) {
            const qSnap = await db.collection('beds').where('number', '==', bedId).get();
            if (qSnap.empty) {
                return res.status(404).json({ message: 'Bed not found' });
            }
            doc = qSnap.docs[0];
            bedRef = doc.ref;
        }

        const bed = { id: doc.id, ...doc.data() };
        await bedRef.delete();

        // Clear bed assignment for any patient assigned to this bed
        const patientsSnap = await db.collection('patients').where('bedNumber', '==', bed.number).get();
        for (const pDoc of patientsSnap.docs) {
            await pDoc.ref.update({ bedNumber: '' });
        }

        res.json({ message: 'Bed deleted successfully', deleted: bed });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;
