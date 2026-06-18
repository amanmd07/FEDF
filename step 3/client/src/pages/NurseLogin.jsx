import React from 'react'
import { Link } from 'react-router-dom'
import LoginCard from '../ui/LoginCard'

export default function NurseLogin() {
    return (
        <div className="container py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
            <div className="w-100 mb-3" style={{ maxWidth: 440 }}>
                <Link to="/login" className="text-decoration-none text-muted small fw-bold hover-primary">
                    ← Back to Access Portals
                </Link>
            </div>
            <LoginCard role="Nurse" redirect="/nurse" />
        </div>
    )
}
