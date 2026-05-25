import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../redux/postSlice';

export default function CreatePost() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { creating } = useSelector((state) => state.posts);
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    await dispatch(createPost({ content: content.trim() }));
    setContent('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img
          src={user?.avatar || 'https://via.placeholder.com/44'}
          alt="avatar"
          style={styles.avatar}
        />
        <form onSubmit={handleSubmit} style={styles.form}>
          <textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={styles.textarea}
            rows={3}
            maxLength={500}
          />
          <div style={styles.footer}>
            <span style={styles.charCount}>{content.length}/500</span>
            <button
              type="submit"
              disabled={creating || !content.trim()}
              style={{
                ...styles.submitBtn,
                opacity: creating || !content.trim() ? 0.6 : 1,
                cursor: creating || !content.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {creating ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid #eee',
  },
  header: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
  },
  form: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  textarea: {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    color: '#333',
    resize: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    background: 'transparent',
    boxSizing: 'border-box',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '10px',
  },
  charCount: {
    fontSize: '12px',
    color: '#aaa',
  },
  submitBtn: {
    background: '#4f8ef7',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 24px',
    fontWeight: 700,
    fontSize: '14px',
    transition: 'opacity 0.2s',
  },
};
