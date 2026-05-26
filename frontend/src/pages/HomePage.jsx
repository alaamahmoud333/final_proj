import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../redux/postSlice';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

export default function HomePage() {
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <div className="feed-container">
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
    </div>
  );
}

const styles = {
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
    color: 'var(--text-secondary, #888)',
    fontSize: '15px',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'var(--text-secondary, #aaa)',
    fontSize: '15px',
  },
};
