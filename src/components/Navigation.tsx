import { Home, Plus } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';

export default function Navigation() {
    const navStyle = {
        position: 'fixed' as const,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: '12px 24px 24px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #E5E7EB',
        zIndex: 100,
        maxWidth: '480px', // Mobile constraint
        margin: '0 auto',
    };

    const linkStyle = ({ isActive }: { isActive: boolean }) => ({
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '4px',
        color: isActive ? '#00d09c' : '#6B7280',
        textDecoration: 'none',
        fontSize: '10px',
        fontWeight: 600
    });

    return (
        <nav style={navStyle}>
            <NavLink to="/" style={linkStyle}>
                <Home size={24} />
                <span>INÍCIO</span>
            </NavLink>

            <div style={{ position: 'relative', top: '-24px' }}>
                <Link to="/add">
                    <button style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: '#00d09c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(0, 208, 156, 0.3)',
                        color: '#000',
                        border: 'none',
                        cursor: 'pointer'
                    }}>
                        <Plus size={32} />
                    </button>
                </Link>
            </div>

            <div style={{ width: '40px' }} /> {/* Spacer to keep layout balanced if needed, or just center them */}

        </nav>
    );
}
