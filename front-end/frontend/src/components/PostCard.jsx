import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { likePost, addComment } from '../redux/postSlice';

export default function PostCard({ post }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasLiked = post.likes?.some((id) => id === user?._id || id?._id === user?._id);

  const handleLike = () => {
    dispatch(likePost(post._id));
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    await dispatch(addComment({ postId: post._id, text: commentText.trim() }));
    setCommentText('');
    setSubmitting(false);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <Link to={`/profile/${post.user?._id}`} style={styles.userLink}>
          <img
            src={post.user?.avatar || 'https://via.placeholder.com/40'}
            alt="avatar"
            style={styles.avatar}
          />
          <div>
            <div style={styles.username}>@{post.user?.username}</div>
            <div style={styles.date}>{formatDate(post.createdAt)}</div>
          </div>
        </Link>
      </div>

      <p style={styles.content}>{post.content}</p>

      {post.image && (
        <img src={post.image} alt="post" style={styles.postImage} />
      )}

      <div style={styles.actions}>
        <button
          onClick={handleLike}
          style={{ ...styles.actionBtn, color: hasLiked ? '#e74c3c' : '#888' }}
        >
          {hasLiked ? '♥' : '♡'} {post.likes?.length || 0}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          style={styles.actionBtn}
        >
          💬 {post.comments?.length || 0}
        </button>
      </div>

      {showComments && (
        <div style={styles.commentsSection}>
          {post.comments?.length > 0 && (
            <div style={styles.commentsList}>
              {post.comments.map((c, i) => (
                <div key={i} style={styles.comment}>
                  <img
                    src={c.user?.avatar || 'https://via.placeholder.com/24'}
                    alt=""
                    style={styles.commentAvatar}
                  />
                  <div>
                    <span style={styles.commentUser}>@{c.user?.username}</span>
                    <span style={styles.commentText}> {c.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleComment} style={styles.commentForm}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={styles.commentInput}
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              style={styles.commentSubmit}
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid #eee',
  },
  header: {
    marginBottom: '12px',
  },
  userLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  username: {
    fontWeight: 600,
    color: '#1a1a2e',
    fontSize: '14px',
  },
  date: {
    color: '#999',
    fontSize: '12px',
    marginTop: '2px',
  },
  content: {
    color: '#333',
    fontSize: '15px',
    lineHeight: '1.5',
    margin: '0 0 12px 0',
  },
  postImage: {
    width: '100%',
    borderRadius: '8px',
    marginBottom: '12px',
    maxHeight: '400px',
    objectFit: 'cover',
  },
  actions: {
    display: 'flex',
    gap: '16px',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '10px',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    color: '#888',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'background 0.2s',
  },
  commentsSection: {
    marginTop: '12px',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '12px',
  },
  commentsList: {
    marginBottom: '10px',
  },
  comment: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '8px',
  },
  commentAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  commentUser: {
    fontWeight: 600,
    fontSize: '13px',
    color: '#1a1a2e',
  },
  commentText: {
    fontSize: '13px',
    color: '#555',
  },
  commentForm: {
    display: 'flex',
    gap: '8px',
  },
  commentInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    fontSize: '13px',
    outline: 'none',
  },
  commentSubmit: {
    background: '#4f8ef7',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
  },
};
