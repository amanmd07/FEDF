import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { onLoginStatsSnapshot } from '../firestoreService'
import doctorHero from '../doctor_hero.png'

const FLOORS_DATA = {
    ICU: {
        name: 'ICU Critical Care',
        level: '3rd Floor',
        color: 'danger',
        total: 24,
        available: 3,
        occupied: 21,
        crews: 'ICU Team A (Active)',
        vitalsAvg: 'Heart Rate: 84 bpm (Avg)',
        alert: '🚨 High risk patient telemetry active'
    },
    ER: {
        name: 'Emergency Department',
        level: '2nd Floor',
        color: 'success',
        total: 40,
        available: 28,
        occupied: 12,
        crews: 'Trauma Unit B (Active)',
        vitalsAvg: 'Triage Waiting: < 5 mins',
        alert: '🟢 All ambulance bays operational'
    },
    WARD: {
        name: 'General Medicine Ward',
        level: '1st Floor',
        color: 'warning',
        total: 60,
        available: 11,
        occupied: 49,
        crews: 'Ward Nurse Shift 2 (Active)',
        vitalsAvg: 'Routine Vitals Cycle: Completed',
        alert: '⚠️ 2 beds flagged for deep sanitize'
    }
}

export default function Landing() {
    const [activeFloorId, setActiveFloorId] = useState('ICU')
    const currentFloor = FLOORS_DATA[activeFloorId]

    const [loginCount, setLoginCount] = useState(0)

    useEffect(() => {
        // Subscribe to real-time login stats from Firestore
        const unsub = onLoginStatsSnapshot((stats) => {
            setLoginCount(stats.attempts || 0)
        })
        return () => unsub()
    }, [])

    return (
        <div className="animate-fade-in-up">
            {/* Split Premium 3D Hero Section */}
            <section className="py-5 d-flex align-items-center position-relative overflow-hidden" style={{ minHeight: 'calc(95vh - 72px)' }}>
                <div className="container position-relative" style={{ zIndex: 2 }}>
                    <div className="row align-items-center g-5">
                        
                        {/* Left Column: Typography & CTAs */}
                        <div className="col-lg-6">
                            <div className="live-indicator mb-3">
                                <span className="live-pulse-dot"></span>
                                CLINICAL COMMAND CENTER
                            </div>
                            <h1 className="display-4 fw-extrabold mb-3" style={{ lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                                Hospital Capacity <br />
                                <span className="gradient-text">Clinical Live Command</span>
                            </h1>
                            <p className="lead text-muted mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.75' }}>
                                A uniquely structured live bed tracking platform. Instantly view entire hospital wards, nursing rotations, and occupancy states in real-time on our interactive clinical command console.
                            </p>
                            
                            <div className="d-flex flex-wrap gap-3 mb-5 align-items-center">
                                <Link to="/login" className="btn-premium text-decoration-none d-inline-flex align-items-center justify-content-center">
                                    Access Portals ⚡
                                </Link>
                                <input 
                                    type="text" 
                                    readOnly 
                                    className="login-attempts-textbox-large" 
                                    value={`🔑 Attempts: ${loginCount}`}
                                    title="Home page login attempts synced with server"
                                    style={{ outline: 'none' }}
                                />
                                <a href="#contact" className="btn-premium-outline text-decoration-none d-inline-flex align-items-center justify-content-center">
                                    Contact Us
                                </a>
                            </div>

                            {/* Impact Stats */}
                            <div className="row g-3">
                                <div className="col-4">
                                    <div className="glass-card p-3 text-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
                                        <div className="h4 mb-0 fw-bold text-primary">1.2s</div>
                                        <small className="text-muted small">Update Latency</small>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="glass-card p-3 text-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
                                        <div className="h4 mb-0 fw-bold text-primary">99.9%</div>
                                        <small className="text-muted small">SLA Uptime</small>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="glass-card p-3 text-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
                                        <div className="h4 mb-0 fw-bold text-primary">&lt;3m</div>
                                        <small className="text-muted small">Triage Alloc</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Premium Interactive 3D Wards Map & Telemetry Console */}
                        <div className="col-lg-6 d-flex flex-column align-items-center justify-content-center">
                            <div className="w-100 position-relative animate-fade-in-up" style={{ maxWidth: 460 }}>
                                
                                {/* High-Tech Interactive 3D Wards Map */}
                                <div className="isometric-scene mb-4 rounded-4 overflow-hidden position-relative"
                                     style={{
                                         border: '1px solid rgba(255, 255, 255, 0.45)',
                                         background: 'rgba(255, 255, 255, 0.18)',
                                         backdropFilter: 'blur(8px)',
                                         WebkitBackdropFilter: 'blur(8px)',
                                         boxShadow: '0 20px 40px rgba(31, 38, 135, 0.04)'
                                     }}>
                                    <div className="tech-grid-bg"></div>
                                    <div className="isometric-stack">
                                        
                                        {/* Floor 3: ICU */}
                                        <div 
                                            onClick={() => setActiveFloorId('ICU')}
                                            className={`ward-floor ward-floor-3 ${activeFloorId === 'ICU' ? 'active' : ''}`}
                                        >
                                            <div className="floor-title-wrapper d-flex justify-content-between align-items-center">
                                                <span className="badge bg-danger text-uppercase fw-extrabold" style={{ fontSize: '0.62rem', padding: '3px 6px', borderRadius: '4px' }}>3F · ICU</span>
                                                <span className="small text-danger fw-bold" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <span className="status-pulse bg-danger" style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block' }}></span>
                                                    Telemetry Active
                                                </span>
                                            </div>
                                            <div className="floor-stats-wrapper">
                                                <div className="d-flex justify-content-between align-items-baseline mb-1">
                                                    <span className="fw-extrabold text-dark" style={{ fontSize: '1.25rem' }}>{FLOORS_DATA.ICU.occupied}/{FLOORS_DATA.ICU.total}</span>
                                                    <span className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 600 }}>Beds Occupied</span>
                                                </div>
                                                <div className="progress" style={{ height: 5, background: 'rgba(0,0,0,0.06)', borderRadius: '3px' }}>
                                                    <div className="progress-bar bg-danger" style={{ width: `${(FLOORS_DATA.ICU.occupied/FLOORS_DATA.ICU.total)*100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Floor 2: ER */}
                                        <div 
                                            onClick={() => setActiveFloorId('ER')}
                                            className={`ward-floor ward-floor-2 ${activeFloorId === 'ER' ? 'active' : ''}`}
                                        >
                                            <div className="floor-title-wrapper d-flex justify-content-between align-items-center">
                                                <span className="badge bg-success text-uppercase fw-extrabold" style={{ fontSize: '0.62rem', padding: '3px 6px', borderRadius: '4px' }}>2F · ER</span>
                                                <span className="small text-success fw-bold" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <span className="status-pulse bg-success" style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block' }}></span>
                                                    All Bays Ready
                                                </span>
                                            </div>
                                            <div className="floor-stats-wrapper">
                                                <div className="d-flex justify-content-between align-items-baseline mb-1">
                                                    <span className="fw-extrabold text-dark" style={{ fontSize: '1.25rem' }}>{FLOORS_DATA.ER.occupied}/{FLOORS_DATA.ER.total}</span>
                                                    <span className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 600 }}>Beds Occupied</span>
                                                </div>
                                                <div className="progress" style={{ height: 5, background: 'rgba(0,0,0,0.06)', borderRadius: '3px' }}>
                                                    <div className="progress-bar bg-success" style={{ width: `${(FLOORS_DATA.ER.occupied/FLOORS_DATA.ER.total)*100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Floor 1: General Ward */}
                                        <div 
                                            onClick={() => setActiveFloorId('WARD')}
                                            className={`ward-floor ward-floor-1 ${activeFloorId === 'WARD' ? 'active' : ''}`}
                                        >
                                            <div className="floor-title-wrapper d-flex justify-content-between align-items-center">
                                                <span className="badge bg-warning text-dark text-uppercase fw-extrabold" style={{ fontSize: '0.62rem', padding: '3px 6px', borderRadius: '4px' }}>1F · Ward</span>
                                                <span className="small text-warning fw-bold" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <span className="status-pulse bg-warning" style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block' }}></span>
                                                    Deep Clean
                                                </span>
                                            </div>
                                            <div className="floor-stats-wrapper">
                                                <div className="d-flex justify-content-between align-items-baseline mb-1">
                                                    <span className="fw-extrabold text-dark" style={{ fontSize: '1.25rem' }}>{FLOORS_DATA.WARD.occupied}/{FLOORS_DATA.WARD.total}</span>
                                                    <span className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 600 }}>Beds Occupied</span>
                                                </div>
                                                <div className="progress" style={{ height: 5, background: 'rgba(0,0,0,0.06)', borderRadius: '3px' }}>
                                                    <div className="progress-bar bg-warning" style={{ width: `${(FLOORS_DATA.WARD.occupied/FLOORS_DATA.WARD.total)*100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Active Floor Telemetry Console Panel */}
                                <div className="glass-container p-3.5" 
                                     style={{ 
                                         background: activeFloorId === 'ICU' ? 'rgba(254, 242, 242, 0.88)' : 
                                                     activeFloorId === 'ER' ? 'rgba(240, 253, 244, 0.88)' : 
                                                     'rgba(254, 243, 199, 0.88)', 
                                         borderColor: activeFloorId === 'ICU' ? 'rgba(244, 63, 94, 0.25)' : 
                                                      activeFloorId === 'ER' ? 'rgba(16, 185, 129, 0.25)' : 
                                                      'rgba(245, 158, 11, 0.25)',
                                         position: 'relative', 
                                         zIndex: 10 
                                     }}>
                                    
                                    {/* Floor Selector Interactive Tabs */}
                                    <div className="d-flex gap-1.5 p-1 mb-3 rounded-pill" style={{ background: 'rgba(59,82,246,0.06)', border: '1px solid rgba(59,82,246,0.1)' }}>
                                        <button 
                                            onClick={() => setActiveFloorId('ICU')}
                                            className="btn btn-sm flex-fill rounded-pill py-1.5 px-3 fw-bold transition-all"
                                            style={{ 
                                                fontSize: '0.72rem',
                                                background: activeFloorId === 'ICU' ? '#f43f5e' : 'transparent',
                                                color: activeFloorId === 'ICU' ? '#fff' : 'hsl(var(--text-muted))',
                                                border: 'none',
                                                boxShadow: activeFloorId === 'ICU' ? '0 4px 12px rgba(244, 63, 94, 0.3)' : 'none'
                                            }}
                                        >
                                            3F · ICU
                                        </button>
                                        <button 
                                            onClick={() => setActiveFloorId('ER')}
                                            className="btn btn-sm flex-fill rounded-pill py-1.5 px-3 fw-bold transition-all"
                                            style={{ 
                                                fontSize: '0.72rem',
                                                background: activeFloorId === 'ER' ? '#10b981' : 'transparent',
                                                color: activeFloorId === 'ER' ? '#fff' : 'hsl(var(--text-muted))',
                                                border: 'none',
                                                boxShadow: activeFloorId === 'ER' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                                            }}
                                        >
                                            2F · ER
                                        </button>
                                        <button 
                                            onClick={() => setActiveFloorId('WARD')}
                                            className="btn btn-sm flex-fill rounded-pill py-1.5 px-3 fw-bold transition-all"
                                            style={{ 
                                                fontSize: '0.72rem',
                                                background: activeFloorId === 'WARD' ? '#f59e0b' : 'transparent',
                                                color: activeFloorId === 'WARD' ? '#fff' : 'hsl(var(--text-muted))',
                                                border: 'none',
                                                boxShadow: activeFloorId === 'WARD' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
                                            }}
                                        >
                                            1F · Ward
                                        </button>
                                    </div>
 
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <span className="eyebrow text-uppercase small font-bold">{currentFloor.level} Telemetry Feed</span>
                                            <h5 className="fw-extrabold text-dark mt-0.5 mb-0">{currentFloor.name}</h5>
                                        </div>
                                        <Link to="/login" className="btn-premium-outline text-decoration-none" style={{ fontSize: '0.72rem', borderRadius: '20px', padding: '5px 12px', border: '1px solid rgba(59,82,246,0.2)' }}>
                                            Manage Floor ⚡
                                        </Link>
                                    </div>

                                    <div className="row g-3 mt-2 py-2 border-top border-bottom border-light">
                                        <div className="col-12">
                                            <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.65rem' }}>Assigned Crew</small>
                                            <span className="fw-bold">{currentFloor.crews}</span>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between mt-2.5 small">
                                        <span className="text-muted font-medium">{currentFloor.vitalsAvg}</span>
                                        <span className="fw-bold" style={{ 
                                            fontSize: '0.78rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            background: currentFloor.color === 'danger' ? 'rgba(244, 63, 94, 0.08)' : 
                                                        currentFloor.color === 'success' ? 'rgba(16, 185, 129, 0.08)' : 
                                                        'rgba(245, 158, 11, 0.08)',
                                            color: currentFloor.color === 'danger' ? '#e11d48' : 
                                                   currentFloor.color === 'success' ? '#059669' : 
                                                   '#d97706',
                                            border: currentFloor.color === 'danger' ? '1px solid rgba(244, 63, 94, 0.15)' : 
                                                    currentFloor.color === 'success' ? '1px solid rgba(16, 185, 129, 0.15)' : 
                                                    '1px solid rgba(245, 158, 11, 0.15)',
                                            padding: '4px 10px',
                                            borderRadius: '6px'
                                        }}>{currentFloor.alert}</span>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* Testimonials */}
            <section className="py-5 bg-white border-top border-light">
                <div className="container py-4">
                    <div className="glass-container p-5 text-center col-lg-10 mx-auto" style={{ border: '1px solid rgba(59,82,246,0.12)' }}>
                        <div className="mb-4 text-primary" style={{ fontSize: '2.5rem', lineHeight: 1 }}>“</div>
                        <p className="h5 text-dark fw-medium lh-base mb-4">
                            "Before implementing this platform, coordinates for emergency admissions took multiple phone calls. Now, we see live availability across wards immediately, helping us make critical decisions faster."
                        </p>
                        <div className="fw-bold text-dark">Dr. Sarah Jenkins</div>
                        <small className="text-muted">Chief Medical Officer, Metro Health General</small>
                    </div>
                </div>
            </section>

            {/* Footer */}
             <footer id="contact" className="py-5 bg-dark text-white" style={{ background: '#0a0f1d' }}>
                <div className="container">
                    <div className="row g-4 align-items-center border-bottom border-secondary border-opacity-25 pb-4 mb-4">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center justify-content-center" 
                                     style={{ 
                                         width: 40, 
                                         height: 40, 
                                         borderRadius: '9px', 
                                         background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                                         padding: '7px'
                                     }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                    </svg>
                                </div>
                                <div>
                                    <h5 className="mb-0 text-white fw-bold">
                                        MediFlow <span className="text-info">Command</span>
                                    </h5>
                                    <small className="text-white-50 d-block mb-1">Real-time clinical operations platform</small>
                                    <small className="text-white-50">
                                        📞 Emergency Contact: <span className="text-white fw-bold">{import.meta.env.VITE_HOSPITAL_NUMBER || '108'}</span>
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <span className="status-pulse bg-success" style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }}></span>
                                <small className="text-white-50 fw-semibold">Operations Center Online</small>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <small className="text-white-50">© 2026 MediFlow Command. Authorized personnel only.</small>
                        <div className="d-flex gap-4">
                            <Link to="/login" className="text-white-50 text-decoration-none small hover-white">Staff Login</Link>
                            <a href="#" className="text-white-50 text-decoration-none small hover-white">Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
