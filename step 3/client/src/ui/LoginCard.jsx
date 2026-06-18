import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../firestoreService'

export default function LoginCard({ role, redirect }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const nav = useNavigate()

    const submit = async (e) => {
        if (e) e.preventDefault()
        setErrorMsg('')
        setLoading(true)
        try {
            const result = await loginUser(username, password)
            localStorage.setItem('token', result.token)
            localStorage.setItem('role', result.user.role)
            
            // Dispatch sync event on successful login to update counters
            window.dispatchEvent(new Event('sync-login-attempts'))
            
            nav(redirect)
        } catch (err) {
            setErrorMsg(err.message || 'Authentication failed. Please check credentials.')
        } finally {
            setLoading(false)
        }
    }

    // Set demo credentials depending on the role
    const handleAutofill = () => {
        let demoUser = ''
        if (role === 'Receptionist') demoUser = 'reception1'
        else if (role === 'Nurse') demoUser = 'nurse1'
        else if (role === 'Doctor') demoUser = 'doctor1'
        
        setUsername(demoUser)
        setPassword('MediFlowSecure2026!')
        setErrorMsg('')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            submit()
        }
    }

    return (
        <div className="glass-card p-4 mx-auto animate-fade-in-up portal-selection-card" style={{ maxWidth: 440, borderRadius: '1.25rem' }}>
            {/* Header / Logo wrapper */}
            <div className="text-center mb-4">
                <div className="mx-auto d-flex align-items-center justify-content-center mb-3 role-icon-halo"
                     style={{ 
                         width: 60, 
                         height: 60, 
                         borderRadius: '16px', 
                         background: role === 'Receptionist' ? 'rgba(59, 82, 246, 0.08)' : 
                                     role === 'Nurse' ? 'rgba(16, 185, 129, 0.08)' : 
                                     'rgba(245, 158, 11, 0.08)',
                         boxShadow: role === 'Receptionist' ? 'inset 0 0 10px rgba(59,82,246,0.1)' : 
                                    role === 'Nurse' ? 'inset 0 0 10px rgba(16,185,129,0.1)' : 
                                    'inset 0 0 10px rgba(245,158,11,0.1)'
                     }}>
                    {role === 'Receptionist' ? (
                        <span style={{ fontSize: '1.8rem' }}>📑</span>
                    ) : role === 'Nurse' ? (
                        <span style={{ fontSize: '1.8rem' }}>🩺</span>
                    ) : (
                        <span style={{ fontSize: '1.8rem' }}>🧬</span>
                    )}
                </div>
                <h4 className="fw-extrabold mb-1" style={{ letterSpacing: '-0.02em', color: 'hsl(var(--text-dark))' }}>{role} Portal</h4>
                <p className="text-muted small">Establish secure clinical operations terminal session</p>
            </div>

            {errorMsg && (
                <div className="alert alert-danger py-2.5 px-3 rounded-3 small border-0 mb-3" style={{ background: 'rgba(244,63,94,0.08)', color: 'hsl(var(--danger))' }}>
                    ⚠️ {errorMsg}
                </div>
            )}

            <div onKeyDown={handleKeyDown}>
                {/* Username Input */}
                <div className="mb-3">
                    <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>OPERATOR ID</label>
                    <div className="terminal-input-wrapper">
                        <input 
                            className="form-control form-control-premium terminal-focused-glow" 
                            placeholder="Enter operator username" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="mb-4">
                    <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>PASSKEY VERIFICATION</label>
                    <div className="position-relative terminal-input-wrapper">
                        <input 
                            className="form-control form-control-premium pe-5 terminal-focused-glow" 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="Enter terminal passkey" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required
                        />
                        <button 
                            type="button"
                            className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0 bg-transparent pe-3"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ outline: 'none', boxShadow: 'none' }}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Login button */}
                <button 
                    type="button" 
                    onClick={submit}
                    className="btn btn-premium w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 terminal-btn-hover"
                    disabled={loading}
                    style={{
                        background: role === 'Receptionist' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 
                                    role === 'Nurse' ? 'linear-gradient(135deg, #10b981, #047857)' : 
                                    'linear-gradient(135deg, #f59e0b, #b45309)',
                        boxShadow: role === 'Receptionist' ? '0 4px 14px rgba(59, 82, 246, 0.25)' : 
                                   role === 'Nurse' ? '0 4px 14px rgba(16, 185, 129, 0.25)' : 
                                   '0 4px 14px rgba(245, 158, 11, 0.25)',
                        border: 'none',
                        borderRadius: '0.75rem',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Establishing Session...
                        </>
                    ) : (
                        <>
                            Sign In to Portal 🔑
                        </>
                    )}
                </button>
            </div>

            {/* Quick Demo Access Pill */}
            <div className="mt-4 pt-3 border-top text-center" style={{ borderTopColor: 'rgba(0,0,0,0.06)' }}>
                <small className="text-muted d-block mb-2 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>DEMO QUICK-ACCESS</small>
                <div 
                    onClick={handleAutofill} 
                    className="credential-pill py-2 px-4 shadow-sm"
                    style={{
                        background: role === 'Receptionist' ? 'rgba(59, 82, 246, 0.05)' : 
                                    role === 'Nurse' ? 'rgba(16, 185, 129, 0.05)' : 
                                    'rgba(245, 158, 11, 0.05)',
                        borderColor: role === 'Receptionist' ? 'rgba(59, 82, 246, 0.2)' : 
                                     role === 'Nurse' ? 'rgba(16, 185, 129, 0.2)' : 
                                     'rgba(245, 158, 11, 0.2)',
                        color: role === 'Receptionist' ? '#3b82f6' : 
                               role === 'Nurse' ? '#10b981' : 
                               '#f59e0b',
                        borderRadius: '30px',
                        fontSize: '0.8rem',
                        transition: 'all 0.25s ease'
                    }}
                    title="Click to fill credentials"
                >
                    <span>⚡ Fill Demo Login</span>
                </div>
            </div>
        </div>
    )
}
