const AVATARS = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=10',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=15',
  'https://i.pravatar.cc/150?img=20',
  'https://i.pravatar.cc/150?img=25',
  'https://i.pravatar.cc/150?img=33',
  'https://i.pravatar.cc/150?img=36',
  'https://i.pravatar.cc/150?img=44',
  'https://i.pravatar.cc/150?img=50',
  'https://i.pravatar.cc/150?img=57',
];

export default function AvatarPicker({ selected, onSelect }) {
  return (
    <div>
      <p style={styles.label}>Choose a profile photo</p>
      <div style={styles.grid}>
        {AVATARS.map((url) => {
          const isSelected = selected === url;
          return (
            <button
              key={url}
              type="button"
              onClick={() => onSelect(url)}
              style={{
                ...styles.btn,
                outline: isSelected ? '3px solid #4f8ef7' : '3px solid transparent',
                outlineOffset: '2px',
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
              }}
              title="Select this photo"
            >
              <img src={url} alt="avatar option" style={styles.img} />
              {isSelected && <span style={styles.check}>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#555',
    marginBottom: '10px',
    marginTop: '12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px',
  },
  btn: {
    position: 'relative',
    background: 'none',
    border: 'none',
    borderRadius: '50%',
    padding: 0,
    cursor: 'pointer',
    transition: 'transform 0.15s, outline 0.15s',
  },
  img: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block',
  },
  check: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    background: '#4f8ef7',
    color: '#fff',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },
};
