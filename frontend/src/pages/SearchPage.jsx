import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { usersAPI, postsAPI } from '../services/api';
import PostCard from '../components/PostCard';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    
    const fetchResults = async () => {
      setLoading(true);
      try {
        const [usersRes, postsRes] = await Promise.all([
          usersAPI.search(query),
          postsAPI.search(query)
        ]);
        setUsers(usersRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [query]);

  return (
    <div className="search-container">
      <div className="card" style={styles.header}>
        <h2 style={styles.title}>Search Results for "{query}"</h2>
        
        <div style={styles.tabs}>
          <button 
            style={activeTab === 'users' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </button>
          <button 
            style={activeTab === 'posts' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('posts')}
          >
            Posts ({posts.length})
          </button>
        </div>
      </div>

      <div style={styles.resultsArea}>
        {loading ? (
          <div style={styles.message}>Searching...</div>
        ) : activeTab === 'users' ? (
          users.length === 0 ? (
            <div style={styles.message}>No users found.</div>
          ) : (
            <div style={styles.usersList}>
              {users.map(u => (
                <div key={u._id} className="card" style={styles.userCard}>
                  <img src={u.avatar || 'https://via.placeholder.com/60'} alt={u.username} style={styles.avatar} />
                  <div style={styles.userInfo}>
                    <div style={styles.name}>{u.name || u.username}</div>
                    <div style={styles.username}>@{u.username}</div>
                  </div>
                  <Link to={`/profile/${u._id}`} style={styles.viewBtn}>View Profile</Link>
                </div>
              ))}
            </div>
          )
        ) : (
          posts.length === 0 ? (
            <div style={styles.message}>No posts found.</div>
          ) : (
            <div>
              {posts.map(p => <PostCard key={p._id} post={p} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    background: 'var(--bg-secondary)',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '20px',
    color: 'var(--text-primary)',
    marginBottom: '20px',
  },
  tabs: {
    display: 'flex',
    gap: '24px',
    borderBottom: '1px solid var(--border-color)',
  },
  tab: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '8px 4px',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  activeTab: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid var(--primary-color)',
    padding: '8px 4px',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--primary-color)',
    cursor: 'pointer',
  },
  resultsArea: {
    marginTop: '20px',
  },
  message: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary)',
    fontSize: '15px',
  },
  usersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '16px',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  username: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  viewBtn: {
    background: 'var(--primary-color)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 600,
  }
};
