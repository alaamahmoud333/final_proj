import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { fetchNotifications, markNotificationRead } from '../redux/notificationSlice';
import { ThemeContext } from '../context/ThemeProvider';
import { usersAPI } from '../services/api';

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
      loadSuggestions();
    }
  }, [dispatch, user]);

  const loadSuggestions = async () => {
    try {
      const res = await usersAPI.getSuggestions();
      setSuggestions(res.data);
    } catch (err) {
      console.error('Failed to load suggestions', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="layout-container">
      {/* LEFT SIDEBAR - Navigation */}
      <aside className="left-sidebar">
        <Link to="/" className="logo">SocialApp</Link>
        <nav className="nav-menu">
          <Link to="/" className="nav-item">🏠 Home</Link>
          <Link to={`/profile/${user?._id}`} className="nav-item">👤 Profile</Link>
          <Link to="/messages" className="nav-item">✉️ Messages</Link>
          <div className="nav-item notif-wrapper" onClick={() => setShowNotif(!showNotif)}>
            🔔 Notifications 
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            
            {showNotif && (
              <div className="notif-panel card" onClick={e => e.stopPropagation()}>
                <div className="notif-header">
                  <h4>Notifications</h4>
                </div>
                <div className="notif-body">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No notifications</div>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div 
                        key={n._id} 
                        className={`notif-item-panel ${n.read ? '' : 'unread'}`}
                        onClick={() => {
                          if(!n.read) dispatch(markNotificationRead(n._id));
                          navigate('/notifications');
                          setShowNotif(false);
                        }}
                      >
                         <img src={n.sender?.avatar || 'https://via.placeholder.com/30'} alt="avatar" />
                         <div className="notif-text">
                           <b>@{n.sender?.username}</b> {n.type === 'like' ? 'liked your post' : n.type === 'comment' ? 'commented' : n.type === 'follow' ? 'followed you' : 'mentioned you'}
                         </div>
                      </div>
                    ))
                  )}
                </div>
                <Link to="/notifications" className="notif-footer" onClick={() => setShowNotif(false)}>
                  View All Notifications
                </Link>
              </div>
            )}
          </div>
          <button onClick={toggleTheme} className="theme-toggle">
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </nav>

        <div className="sidebar-profile">
          <img src={user?.avatar || 'https://via.placeholder.com/40'} alt="avatar" />
          <div className="user-info">
            <span className="name">{user?.name || user?.username}</span>
            <span className="username">@{user?.username}</span>
          </div>
        </div>
        
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </aside>

      {/* CENTER - Dynamic Content */}
      <main className="main-content">
        {children}
      </main>

      {/* RIGHT SIDEBAR - Search & Suggestions */}
      <aside className="right-sidebar">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <div className="suggestions-box">
          <h3>Suggested for you</h3>
          {suggestions.length === 0 ? (
            <p className="no-suggestions">No suggestions</p>
          ) : (
            suggestions.map(s => (
              <div key={s._id} className="suggestion-item">
                <img src={s.avatar || 'https://via.placeholder.com/32'} alt="avatar" />
                <div className="s-info">
                  <span className="s-name">{s.username}</span>
                </div>
                <Link to={`/profile/${s._id}`} className="s-btn">View</Link>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
