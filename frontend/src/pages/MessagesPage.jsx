import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const INITIAL_CONTACTS = [
  { id: '1', name: 'Ahmed Ali', username: 'ahmed123', avatar: 'https://i.pravatar.cc/150?img=1', lastMessage: 'See you tomorrow!', time: '10:30 AM', unread: 2 },
  { id: '2', name: 'Sara Kamel', username: 'sara_k', avatar: 'https://i.pravatar.cc/150?img=5', lastMessage: 'Thanks!', time: 'Yesterday', unread: 0 },
  { id: '3', name: 'Mohamed Tarek', username: 'mo_tarek', avatar: 'https://i.pravatar.cc/150?img=12', lastMessage: 'Can you send the file?', time: 'Mon', unread: 0 },
];

const INITIAL_CHATS = {
  '1': [
    { id: 'm1', sender: 'them', text: 'Hello! How are you doing?', time: '10:00 AM' },
    { id: 'm2', sender: 'me', text: 'Hey! I am good, just working on the new UI. You?', time: '10:15 AM' },
    { id: 'm3', sender: 'them', text: 'See you tomorrow!', time: '10:30 AM' },
  ],
  '2': [
    { id: 'm4', sender: 'me', text: 'Did you get the email?', time: 'Yesterday' },
    { id: 'm5', sender: 'them', text: 'Yes, I got it.', time: 'Yesterday' },
    { id: 'm6', sender: 'them', text: 'Thanks!', time: 'Yesterday' },
  ],
  '3': [
    { id: 'm7', sender: 'them', text: 'Can you send the file?', time: 'Mon' },
  ]
};

export default function MessagesPage() {
  const { user } = useSelector((state) => state.auth);
  
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('mockContacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('mockChats');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [activeChatId, setActiveChatId] = useState(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    localStorage.setItem('mockContacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('mockChats', JSON.stringify(chats));
  }, [chats]);

  const activeChat = contacts.find(c => c.id === activeChatId);
  const activeMessages = chats[activeChatId] || [];

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now().toString(),
      sender: 'me',
      text: messageText,
      time: timeStr
    };
    
    // Update messages
    setChats(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg]
    }));

    // Update last message in contacts
    setContacts(prev => prev.map(c => 
      c.id === activeChatId 
        ? { ...c, lastMessage: messageText, time: timeStr, unread: 0 }
        : c
    ));

    setMessageText('');
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    // Clear unread when selected
    setContacts(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  return (
    <div className="messages-container card" style={styles.container}>
      
      {/* Left Side: Chat List */}
      <div style={styles.chatList}>
        <div style={styles.listHeader}>
          <h3>Messages</h3>
        </div>
        <div style={styles.contacts}>
          {contacts.map((contact) => (
            <div 
              key={contact.id} 
              style={{
                ...styles.contactItem, 
                background: activeChatId === contact.id ? 'var(--bg-primary)' : 'transparent'
              }}
              onClick={() => handleSelectChat(contact.id)}
            >
              <img src={contact.avatar} alt={contact.name} style={styles.avatar} />
              <div style={styles.contactInfo}>
                <div style={styles.contactTop}>
                  <span style={styles.contactName}>{contact.name}</span>
                  <span style={styles.contactTime}>{contact.time}</span>
                </div>
                <div style={styles.contactBottom}>
                  <span style={styles.lastMessage}>{contact.lastMessage}</span>
                  {contact.unread > 0 && <span style={styles.unreadBadge}>{contact.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Chat Box */}
      <div style={styles.chatBox}>
        {activeChat ? (
          <>
            <div style={styles.chatHeader}>
              <img src={activeChat.avatar} alt={activeChat.name} style={styles.avatar} />
              <div>
                <div style={styles.chatName}>{activeChat.name}</div>
                <div style={styles.chatStatus}>Online</div>
              </div>
            </div>

            <div style={styles.messagesArea}>
              {activeMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  style={{
                    ...styles.messageRow,
                    justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    ...styles.bubble,
                    background: msg.sender === 'me' ? 'var(--primary-color)' : 'var(--bg-primary)',
                    color: msg.sender === 'me' ? '#fff' : 'var(--text-primary)',
                    borderRadius: msg.sender === 'me' ? '12px 12px 0 12px' : '12px 12px 12px 0'
                  }}>
                    {msg.text}
                    <div style={{
                      ...styles.msgTime,
                      color: msg.sender === 'me' ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)'
                    }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} style={styles.inputArea}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                style={styles.messageInput}
              />
              <button type="submit" style={styles.sendBtn} disabled={!messageText.trim()}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={styles.emptyState}>
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 48px)',
    overflow: 'hidden',
    padding: 0,
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  chatList: {
    width: '320px',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
  },
  listHeader: {
    padding: '20px',
    borderBottom: '1px solid var(--border-color)',
  },
  contacts: {
    flex: 1,
    overflowY: 'auto',
  },
  contactItem: {
    display: 'flex',
    padding: '16px 20px',
    gap: '12px',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border-color)',
    transition: 'background 0.2s',
  },
  avatar: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  contactInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  },
  contactTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '4px',
  },
  contactName: {
    fontWeight: 600,
    fontSize: '15px',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  contactTime: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  contactBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px',
  },
  unreadBadge: {
    background: '#e74c3c',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '10px',
  },
  chatBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-secondary)',
  },
  chatHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chatName: {
    fontWeight: 700,
    fontSize: '16px',
    color: 'var(--text-primary)',
  },
  chatStatus: {
    fontSize: '12px',
    color: '#2ecc71',
    fontWeight: 600,
    marginTop: '2px',
  },
  messagesArea: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  bubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    fontSize: '14px',
    lineHeight: '1.4',
    position: 'relative',
  },
  msgTime: {
    fontSize: '10px',
    marginTop: '6px',
    textAlign: 'right',
  },
  inputArea: {
    padding: '20px 24px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    gap: '12px',
  },
  messageInput: {
    flex: 1,
    padding: '12px 20px',
    border: '1px solid var(--border-color)',
    borderRadius: '30px',
    fontSize: '14px',
    outline: 'none',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  },
  sendBtn: {
    background: 'var(--primary-color)',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    padding: '0 24px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    fontSize: '16px',
  }
};
