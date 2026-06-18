import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { incrementPageOpens } from '../firestoreService'

export default function Login() {
    useEffect(() => {
        incrementPageOpens()
            .then(() => {
                window.dispatchEvent(new Event('sync-login-attempts'))
            })
            .catch(err => {
                console.error("Error incrementing page opens:", err)
            })
    }, [])

    return (
        <div className="position-relative overflow-hidden w-100 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 120px)', py: '4rem' }}>
            {/* Tech mesh grid overlay */}
            <div className="auth-grid-bg"></div>

            <div className="container position-relative py-5" style={{ zIndex: 1 }}>
                
                {/* Header Section */}
                <div className="text-center mb-5 animate-fade-in-up">
                    <div className="live-indicator mb-3 text-primary" style={{ background: 'rgba(59, 82, 246, 0.06)', border: '1px solid rgba(59, 82, 246, 0.12)' }}>
                        <span className="live-pulse-dot" style={{ backgroundColor: 'hsl(var(--primary))' }}></span>
                        SECURE AUTHENTICATION GATEWAY
                    </div>
                    <h2 className="display-5 fw-extrabold text-dark" style={{ letterSpacing: '-0.03em' }}>
                        Access <span className="gradient-text">Operations Center</span>
                    </h2>
                    <p className="text-muted max-width-md mx-auto col-lg-8 mt-2" style={{ fontSize: '1.02rem', lineHeight: '1.6' }}>
                        Please select your authorized portal below to manage patient admissions, synchronize bed allocations, or evaluate live clinical telemetry.
                    </p>
                </div>

                {/* Portal Cards Grid */}
                <div className="row g-4 w-100 justify-content-center mt-2 animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
                    
                    {/* Receptionist Portal Card */}
                    <div className="col-lg-4 col-md-6">
                        <div className="glass-card portal-selection-card portal-card-receptionist p-4.5 text-center h-100 d-flex flex-column justify-content-between"
                             style={{ borderRadius: '1.25rem' }}>
                            <div>
                                {/* Security level & status indicators */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="badge" style={{ background: 'rgba(59, 82, 246, 0.08)', color: '#3b82f6', fontSize: '0.62rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px' }}>
                                        LEVEL 01 SECURE
                                    </span>
                                    <span className="small text-muted d-flex align-items-center gap-1.5" style={{ fontSize: '0.65rem', fontWeight: 700 }}>
                                        <span className="status-pulse bg-success" style={{ width: 6, height: 6, borderRadius: '50%' }}></span>
                                        ONLINE
                                    </span>
                                </div>

                                <div className="role-icon-halo mb-4 mx-auto d-flex align-items-center justify-content-center" 
                                     style={{ width: 68, height: 68, borderRadius: '18px', background: 'rgba(59, 82, 246, 0.08)', fontSize: '2.2rem', boxShadow: 'inset 0 0 12px rgba(59,82,246,0.1)' }}>
                                    📑
                                </div>
                                
                                <h4 className="fw-extrabold mb-2" style={{ color: 'hsl(var(--text-dark))' }}>Receptionist</h4>
                                <p className="text-muted small px-2 mb-0" style={{ lineHeight: '1.6' }}>
                                    Execute administrative duties: register incoming admissions, map vacant beds, or trigger patient discharge sequences.
                                </p>
                            </div>
                            
                            <div className="mt-4 pt-3 border-top border-light">
                                <Link className="btn btn-premium-outline text-decoration-none d-block py-2 fw-extrabold shadow-sm rounded-pill" 
                                      to="/login/receptionist"
                                      style={{ 
                                          fontSize: '0.85rem',
                                          border: '1px solid rgba(59, 82, 246, 0.25)', 
                                          color: 'hsl(var(--primary))',
                                          background: 'rgba(255,255,255,0.7)'
                                      }}>
                                    Open Portal &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Nurse Portal Card */}
                    <div className="col-lg-4 col-md-6">
                        <div className="glass-card portal-selection-card portal-card-nurse p-4.5 text-center h-100 d-flex flex-column justify-content-between"
                             style={{ borderRadius: '1.25rem' }}>
                            <div>
                                {/* Security level & status indicators */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', fontSize: '0.62rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px' }}>
                                        LEVEL 02 SECURE
                                    </span>
                                    <span className="small text-muted d-flex align-items-center gap-1.5" style={{ fontSize: '0.65rem', fontWeight: 700 }}>
                                        <span className="status-pulse bg-success" style={{ width: 6, height: 6, borderRadius: '50%' }}></span>
                                        TELEMETRY
                                    </span>
                                </div>

                                <div className="role-icon-halo mb-4 mx-auto d-flex align-items-center justify-content-center" 
                                     style={{ width: 68, height: 68, borderRadius: '18px', background: 'rgba(16, 185, 129, 0.08)', fontSize: '2.2rem', boxShadow: 'inset 0 0 12px rgba(16,185,129,0.1)' }}>
                                    🩺
                                </div>

                                <h4 className="fw-extrabold mb-2" style={{ color: 'hsl(var(--text-dark))' }}>Nurse Staff</h4>
                                <p className="text-muted small px-2 mb-0" style={{ lineHeight: '1.6' }}>
                                    Supervise clinical operations: inspect live vitals telemetry, evaluate warning alerts, and compile ward care reports.
                                </p>
                            </div>
                            
                            <div className="mt-4 pt-3 border-top border-light">
                                <Link className="btn btn-premium-outline text-decoration-none d-block py-2 fw-extrabold shadow-sm rounded-pill" 
                                      to="/login/nurse"
                                      style={{ 
                                          fontSize: '0.85rem',
                                          border: '1px solid rgba(16, 185, 129, 0.25)', 
                                          color: '#10b981',
                                          background: 'rgba(255,255,255,0.7)'
                                      }}>
                                    Open Portal &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Doctor Portal Card */}
                    <div className="col-lg-4 col-md-6">
                        <div className="glass-card portal-selection-card portal-card-doctor p-4.5 text-center h-100 d-flex flex-column justify-content-between"
                             style={{ borderRadius: '1.25rem' }}>
                            <div>
                                {/* Security level & status indicators */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', fontSize: '0.62rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px' }}>
                                        LEVEL 03 SECURE
                                    </span>
                                    <span className="small text-muted d-flex align-items-center gap-1.5" style={{ fontSize: '0.65rem', fontWeight: 700 }}>
                                        <span className="status-pulse bg-success" style={{ width: 6, height: 6, borderRadius: '50%' }}></span>
                                        DIAGNOSTICS
                                    </span>
                                </div>

                                <div className="role-icon-halo mb-4 mx-auto d-flex align-items-center justify-content-center" 
                                     style={{ width: 68, height: 68, borderRadius: '18px', background: 'rgba(245, 158, 11, 0.08)', fontSize: '2.2rem', boxShadow: 'inset 0 0 12px rgba(245,158,11,0.1)' }}>
                                    🧬
                                </div>

                                <h4 className="fw-extrabold mb-2" style={{ color: 'hsl(var(--text-dark))' }}>Clinical Doctor</h4>
                                <p className="text-muted small px-2 mb-0" style={{ lineHeight: '1.6' }}>
                                    Evaluate deep diagnostics: analyze integrated capacity charts, inspect specific patient logs, and trigger triage overrides.
                                </p>
                            </div>
                            
                            <div className="mt-4 pt-3 border-top border-light">
                                <Link className="btn btn-premium-outline text-decoration-none d-block py-2 fw-extrabold shadow-sm rounded-pill" 
                                      to="/login/doctor"
                                      style={{ 
                                          fontSize: '0.85rem',
                                          border: '1px solid rgba(245, 158, 11, 0.25)', 
                                          color: '#f59e0b',
                                          background: 'rgba(255,255,255,0.7)'
                                      }}>
                                    Open Portal &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Notice */}
                <div className="mt-5 text-center text-muted small animate-fade-in-up" style={{ animationDelay: '0.24s' }}>
                    <div className="d-inline-flex align-items-center gap-2 px-4 py-2.5 rounded-pill border bg-white shadow-sm" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        <span style={{ fontSize: '1rem' }}>🛡️</span> Secure AES 256-bit Encrypted Command Operations · Authorized Clinical Personnel Only
                    </div>
                </div>

            </div>
        </div>
    )
}
