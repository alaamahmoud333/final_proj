import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationRead } from '../redux/notificationSlice';

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  return (
    <div className="card" style={styles.container}>
      <h2 style={styles.title}>Notifications</h2>
      
      {loading ? (
        <div style={styles.loading}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={styles.empty}>You have no notifications.</div>
      ) : (
        <div style={styles.list}>
          {notifications.map((n) => (
            <div 
              key={n._id} 
              style={{
                ...styles.item,
                background: n.read ? 'transparent' : 'rgba(79, 142, 247, 0.05)'
              }}
            >
              <img src={n.sender?.avatar || 'https://via.placeholder.com/40'} alt="avatar" style={styles.avatar} />
              <div style={styles.info}>
                <span style={styles.user}>@{n.sender?.username}</span>
                <span style={styles.text}>
                  {' '}{n.type === 'like' ? 'liked your post' : n.type === 'comment' ? 'commented on your post' : n.type === 'follow' ? 'followed you' : 'mentioned you'}
                </span>
                <div style={styles.time}>{new Date(n.createdAt).toLocaleDateString()}</div>
              </div>
              {!n.read && (
                <button onClick={() => handleMarkRead(n._id)} style={styles.markReadBtn}>
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px 0',
    color: 'var(--text-secondary)',
  },
  empty: {
    textAlign: 'center',
    padding: '40px 0',
    color: 'var(--text-secondary)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    gap: '16px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  info: {
    flex: 1,
  },
  user: {
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  text: {
    color: 'var(--text-secondary)',
  },
  time: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  markReadBtn: {
    background: 'var(--primary-color)',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  }
};
