import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { onLoginStatsSnapshot, logoutUser } from './firestoreService'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ReceptionistLogin from './pages/ReceptionistLogin'
import NurseLogin from './pages/NurseLogin'
import DoctorLogin from './pages/DoctorLogin'
import ReceptionistDashboard from './pages/ReceptionistDashboard'
import NurseDashboard from './pages/NurseDashboard'
import DoctorDashboard from './pages/DoctorDashboard'

export default function App() {
    const location = useLocation()
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    const [loginCount, setLoginCount] = useState(0)

    useEffect(() => {
        // Real-time listener for login stats — updates instantly across tabs
        const unsub = onLoginStatsSnapshot((stats) => {
            setLoginCount(stats.attempts || 0)
        })
        return () => unsub()
    }, [])

    const logout = async () => {
        await logoutUser()
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        navigate('/')
    }

    let dashboardPath = '/'
    if (role === 'nurse') dashboardPath = '/nurse'
    else if (role === 'receptionist') dashboardPath = '/receptionist'
    else if (role === 'doctor') dashboardPath = '/doctor'

    const showLogout = !!(token && ['/receptionist', '/nurse', '/doctor'].includes(location.pathname))

    return (
        <div className="position-relative" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Ambient Background Glowing Orbs */}
            <div className="glowing-bg-orb orb-blue"></div>
            <div className="glowing-bg-orb orb-cyan"></div>
            <div className="glowing-bg-orb orb-purple"></div>

            <nav className="navbar navbar-expand-lg navbar-dark bg-transparent border-bottom border-light border-opacity-10 py-3 shadow-sm">
                <div className="container">
                    <Link className="navbar-brand d-flex align-items-center gap-2.5" to={showLogout ? dashboardPath : '/'} style={{ textDecoration: 'none' }}>
                        <div className="d-flex align-items-center justify-content-center"
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, hsl(var(--primary)), #06b6d4)',
                                padding: '6px'
                            }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                        </div>
                        <span className="fs-4 fw-extrabold text-primary tracking-tight">MediFlow</span>
                        <div className="d-flex flex-column" style={{ borderLeft: '1px solid rgba(0,0,0,0.12)', paddingLeft: '10px' }}>
                            <span className="text-dark fw-bold" style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>HOSPITAL PORTAL</span>
                            <small className="text-muted text-uppercase" style={{ fontSize: '0.62rem', letterSpacing: '0.05em', marginTop: '1px' }}>
                                Clinical Operations
                            </small>
                        </div>
                    </Link>
                    <div className="d-flex align-items-center gap-2">
                        {showLogout ? (
                            <>
                                <button className="btn btn-sm btn-outline-danger rounded-pill px-3 border-opacity-50 small fw-semibold" onClick={logout}>🚪 Logout</button>
                            </>
                        ) : (
                            <>
                                <Link className="nav-link-custom d-inline-block text-decoration-none" to="/">Home</Link>
                                <a className="nav-link-custom d-inline-block text-decoration-none d-none d-md-inline-block" href="#contact">Contact</a>
                                <input
                                    type="text"
                                    readOnly
                                    className="login-attempts-textbox"
                                    value={`Attempts: ${loginCount}`}
                                    title="Home page login attempts synced with server"
                                    style={{ marginRight: '6px' }}
                                />
                                <Link className="btn-premium py-1.5 px-4 text-decoration-none d-inline-block small" to="/login" style={{ fontSize: '0.85rem' }}>Login ⚡</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login/receptionist" element={<ReceptionistLogin />} />
                <Route path="/login/nurse" element={<NurseLogin />} />
                <Route path="/login/doctor" element={<DoctorLogin />} />
                <Route path="/receptionist" element={<ReceptionistDashboard />} />
                <Route path="/nurse" element={<NurseDashboard />} />
                <Route path="/doctor" element={<DoctorDashboard />} />
            </Routes>
        </div>
    )
}
