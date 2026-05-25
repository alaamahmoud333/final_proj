import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPosts } from '../redux/postSlice';
import { fetchNotifications, markNotificationRead } from '../redux/notificationSlice';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { posts, loading, error } = useSelector((state) => state.posts);
  const { notifications } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.layout}>
        {/* Left sidebar - user info */}
        <aside style={styles.sidebar}>
          <div style={styles.profileCard}>
            <img
              src={user?.avatar || 'https://via.placeholder.com/80'}
              alt="avatar"
              style={styles.sidebarAvatar}
            />
            <div style={styles.sidebarName}>{user?.name || user?.username}</div>
            <div style={styles.sidebarUsername}>@{user?.username}</div>
            {user?.bio && <p style={styles.sidebarBio}>{user.bio}</p>}
            <button
              onClick={() => navigate(`/profile/${user?._id}`)}
              style={styles.profileBtn}
            >
              View Profile
            </button>
          </div>
        </aside>

        {/* Main feed */}
        <main style={styles.feed}>
          <CreatePost />

          {error && (
            <div style={styles.errorBox}>
              Failed to load posts: {error}
              <button onClick={() => dispatch(fetchPosts())} style={styles.retryBtn}>
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div style={styles.loading}>Loading posts...</div>
          ) : posts.length === 0 ? (
            <div style={styles.empty}>
              <p>No posts yet. Be the first to post!</p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </main>

        {/* Right sidebar - notifications */}
        <aside style={styles.rightSidebar}>
          <div style={styles.notifCard}>
            <h3 style={styles.notifTitle}>
              Notifications
              {unreadNotifications.length > 0 && (
                <span style={styles.notifBadge}>{unreadNotifications.length}</span>
              )}
            </h3>
            {unreadNotifications.length === 0 ? (
              <p style={styles.noNotif}>No new notifications</p>
            ) : (
              unreadNotifications.map((n) => (
                <div key={n._id} style={styles.notifItem}>
                  <img
                    src={n.sender?.avatar || 'https://via.placeholder.com/28'}
                    alt=""
                    style={styles.notifAvatar}
                  />
                  <div style={styles.notifText}>
                    <span style={styles.notifUser}>@{n.sender?.username}</span>
                    {' '}{n.type === 'like' ? 'liked your post' : n.type === 'comment' ? 'commented on your post' : n.type === 'follow' ? 'followed you' : 'mentioned you'}
                  </div>
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    style={styles.markReadBtn}
                  >
                    ✓
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f3f4f8',
  },
  layout: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '76px 16px 40px',
    display: 'grid',
    gridTemplateColumns: '240px 1fr 240px',
    gap: '24px',
  },
  sidebar: {
    position: 'sticky',
    top: '72px',
    height: 'fit-content',
  },
  profileCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid #eee',
  },
  sidebarAvatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #4f8ef7',
    marginBottom: '10px',
  },
  sidebarName: {
    fontWeight: 700,
    fontSize: '16px',
    color: '#1a1a2e',
  },
  sidebarUsername: {
    color: '#888',
    fontSize: '13px',
    marginBottom: '8px',
  },
  sidebarBio: {
    color: '#666',
    fontSize: '13px',
    lineHeight: '1.4',
    marginBottom: '12px',
  },
  profileBtn: {
    background: '#4f8ef7',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
  },
  feed: {
    minWidth: 0,
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryBtn: {
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#888',
    fontSize: '15px',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#aaa',
    fontSize: '15px',
  },
  rightSidebar: {
    position: 'sticky',
    top: '72px',
    height: 'fit-content',
  },
  notifCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid #eee',
  },
  notifTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  notifBadge: {
    background: '#e74c3c',
    color: '#fff',
    borderRadius: '50%',
    padding: '1px 6px',
    fontSize: '11px',
    fontWeight: 700,
  },
  noNotif: {
    color: '#aaa',
    fontSize: '13px',
    textAlign: 'center',
    padding: '12px 0',
  },
  notifItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
    borderBottom: '1px solid #f5f5f5',
  },
  notifAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
  },
  notifText: {
    flex: 1,
    fontSize: '12px',
    color: '#555',
    lineHeight: '1.4',
  },
  notifUser: {
    fontWeight: 600,
    color: '#1a1a2e',
  },
  markReadBtn: {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    cursor: 'pointer',
    fontSize: '11px',
    color: '#4f8ef7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};
