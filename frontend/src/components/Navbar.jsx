import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { useEffect } from 'react';
import { fetchNotifications } from '../redux/notificationSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);

  useEffect(() => {
    if (user) dispatch(fetchNotifications());
  }, [dispatch, user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>SocialApp</Link>
      <div style={styles.right}>
        {user && (
          <>
            <Link to={`/profile/${user._id}`} style={styles.profileLink}>
              <img
                src={user.avatar || 'https://via.placeholder.com/32'}
                alt="avatar"
                style={styles.avatar}
              />
              <span style={styles.username}>@{user.username}</span>
            </Link>
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount}</span>
            )}
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '56px',
    background: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  logo: {
    color: '#4f8ef7',
    fontWeight: 700,
    fontSize: '20px',
    textDecoration: 'none',
    letterSpacing: '0.5px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  profileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #4f8ef7',
  },
  username: {
    color: '#e0e0e0',
    fontSize: '14px',
  },
  badge: {
    background: '#e74c3c',
    color: '#fff',
    borderRadius: '50%',
    padding: '2px 7px',
    fontSize: '12px',
    fontWeight: 700,
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #4f8ef7',
    color: '#4f8ef7',
    padding: '6px 14px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
  },
};
