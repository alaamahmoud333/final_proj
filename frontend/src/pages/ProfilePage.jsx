import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { usersAPI } from '../services/api';
import { updateUser } from '../redux/authSlice';

import PostCard from '../components/PostCard';
import AvatarPicker from '../components/AvatarPicker';

export default function ProfilePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(false);
  const [requested, setRequested] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', avatar: '' });
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const profileRes = await usersAPI.getProfile(id);
        const actualId = profileRes.data._id;
        
        const postsRes = await usersAPI.getUserPosts(actualId);
        
        setProfile(profileRes.data);
        setPosts(postsRes.data);
        setFollowing(profileRes.data.followers?.includes(currentUser?._id));
        setRequested(profileRes.data.followRequests?.includes(currentUser?._id));
        setEditForm({ bio: profileRes.data.bio || '', avatar: profileRes.data.avatar || '' });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id, currentUser?._id]);

  const handleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      await usersAPI.follow(profile._id);
      setRequested(true);
      setProfile((p) => ({ ...p, followRequests: [...(p.followRequests || []), currentUser._id] }));
    } catch (err) {
      // already requested or error
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await usersAPI.updateProfile(profile._id, editForm);
      setProfile((p) => ({ ...p, ...res.data }));
      dispatch(updateUser(res.data));
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div style={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div style={styles.errorBox}>{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div style={styles.container}>
        {/* Profile header */}
        <div style={styles.profileHeader}>
          <div style={styles.coverBg} />
          <div style={styles.profileInfo}>
            <img
              src={profile?.avatar || 'https://via.placeholder.com/100'}
              alt="avatar"
              style={styles.avatar}
            />
            <div style={styles.nameSection}>
              <h2 style={styles.name}>{profile?.name || profile?.username}</h2>
              <p style={styles.username}>@{profile?.username}</p>
              {profile?.bio && <p style={styles.bio}>{profile.bio}</p>}
              <div style={styles.stats}>
                <span style={styles.stat}>
                  <strong>{posts.length}</strong> Posts
                </span>
                <span style={styles.stat}>
                  <strong>{profile?.followers?.length || 0}</strong> Followers
                </span>
                <span style={styles.stat}>
                  <strong>{profile?.following?.length || 0}</strong> Following
                </span>
              </div>
            </div>
            <div style={styles.actions}>
              {isOwnProfile ? (
                <button onClick={() => setEditing(!editing)} style={styles.editBtn}>
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={following || requested || followLoading}
                  style={{
                    ...styles.followBtn,
                    background: following || requested ? '#e0e7ff' : '#4f8ef7',
                    color: following || requested ? '#4f8ef7' : '#fff',
                  }}
                >
                  {followLoading ? '...' : following ? 'Following' : requested ? 'Requested' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit profile form */}
        {editing && (
          <div style={styles.editCard}>
            <h3 style={styles.editTitle}>Edit Profile</h3>
            <form onSubmit={handleSaveProfile}>
              <label style={styles.label}>Bio</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                style={styles.textarea}
                rows={3}
                placeholder="Tell us about yourself..."
              />
              <AvatarPicker
                selected={editForm.avatar}
                onSelect={(url) => setEditForm({ ...editForm, avatar: url })}
              />
              <div style={styles.editActions}>
                <button type="submit" disabled={saving} style={styles.saveBtn}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts */}
        <div style={styles.postsSection}>
          <h3 style={styles.postsTitle}>Posts</h3>
          
          {!isOwnProfile && !following ? (
            <div style={styles.lockedBox}>
              <div style={styles.lockedIcon}>🔒</div>
              <h4 style={styles.lockedTitle}>This Account is Private</h4>
              <p style={styles.lockedText}>Follow this user to see their posts and updates.</p>
            </div>
          ) : posts.length === 0 ? (
            <div style={styles.noPosts}>No posts yet.</div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '76px 16px 40px',
  },
  loading: {
    textAlign: 'center',
    padding: '80px',
    color: '#888',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '8px',
    margin: '80px auto',
    maxWidth: '400px',
    textAlign: 'center',
  },
  profileHeader: {
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid var(--border-color)',
  },
  coverBg: {
    height: '100px',
    background: 'linear-gradient(135deg, #1a1a2e, #4f8ef7)',
  },
  profileInfo: {
    padding: '16px 20px 20px',
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '3px solid #fff',
    objectFit: 'cover',
    marginTop: '-40px',
    flexShrink: 0,
  },
  nameSection: {
    flex: 1,
    minWidth: '180px',
  },
  name: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: '0 0 2px 0',
  },
  username: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    margin: '0 0 6px 0',
  },
  bio: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0 0 10px 0',
  },
  stats: {
    display: 'flex',
    gap: '16px',
  },
  stat: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  actions: {
    flexShrink: 0,
  },
  editBtn: {
    background: 'transparent',
    border: '1px solid #4f8ef7',
    color: '#4f8ef7',
    borderRadius: '20px',
    padding: '8px 18px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
  },
  followBtn: {
    border: 'none',
    borderRadius: '20px',
    padding: '8px 20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 700,
  },
  editCard: {
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid var(--border-color)',
  },
  editTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    marginTop: '12px',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  editActions: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  saveBtn: {
    background: '#4f8ef7',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 24px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 700,
  },
  postsSection: {
    marginTop: '8px',
  },
  postsTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '16px',
    paddingLeft: '4px',
  },
  noPosts: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    padding: '40px 0',
    fontSize: '15px',
  },
  lockedBox: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    marginTop: '10px',
  },
  lockedIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  lockedTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: '0 0 8px 0',
  },
  lockedText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
  }
};
