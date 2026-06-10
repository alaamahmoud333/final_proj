import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, resendOtp, clearError, setRegistrationEmail } from '../redux/authSlice';

export default function VerifyOtpPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, registrationEmail } = useSelector((state) => state.auth);
  const [otp, setOtp] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  
  // Try to get email from state, Redux store, or location state fallback
  const email = registrationEmail || location.state?.email;

  // Timer state for resending OTP (10 minutes = 600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (!email) {
      // If we don't know the email, redirect to register
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setResendMessage('');

    if (otp.length !== 6) {
      return;
    }

    const resultAction = await dispatch(verifyOtp({ email, otp }));
    if (verifyOtp.fulfilled.match(resultAction)) {
      setSuccessMessage('Account verified successfully! Redirecting to login...');
      // Clear registration email
      dispatch(setRegistrationEmail(null));
      setTimeout(() => {
        navigate('/login', { state: { message: 'Your account is verified. You can now log in.' } });
      }, 3000);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    setSuccessMessage('');
    setResendMessage('');

    const resultAction = await dispatch(resendOtp({ email }));
    if (resendOtp.fulfilled.match(resultAction)) {
      setResendMessage('A new verification code has been sent!');
      setTimeLeft(600); // Reset to 10 minutes
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>SocialApp</h1>
        <h2 style={styles.title}>Verify your account</h2>
        
        <p style={styles.instructions}>
          We sent a 6-digit verification code to <br />
          <strong style={styles.emailText}>{email}</strong>
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {resendMessage && <div style={styles.success}>{resendMessage}</div>}
        {successMessage && <div style={styles.success}>{successMessage}</div>}

        <form onSubmit={handleVerify} style={styles.form}>
          <label style={styles.label}>Verification Code</label>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            required
            placeholder="123456"
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || !!successMessage}
            style={{ ...styles.btn, opacity: (loading || otp.length !== 6 || successMessage) ? 0.7 : 1 }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <div style={styles.resendContainer}>
          {timeLeft > 0 ? (
            <p style={styles.timerText}>
              Resend code in <span style={styles.timerHighlight}>{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <button 
              onClick={handleResend} 
              disabled={loading}
              style={styles.resendBtn}
            >
              Resend verification code
            </button>
          )}
        </div>

        <p style={styles.footer}>
          Back to <span style={styles.link} onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center',
  },
  logo: {
    color: '#4f8ef7',
    fontSize: '28px',
    fontWeight: 800,
    marginBottom: '8px',
    letterSpacing: '1px',
  },
  title: {
    color: '#1a1a2e',
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  instructions: {
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  emailText: {
    color: '#1a1a2e',
    wordBreak: 'break-all',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
    textAlign: 'left',
  },
  success: {
    background: '#f0fdf4',
    border: '1px solid #86efac',
    color: '#16a34a',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
    textAlign: 'left',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'left',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#555',
    marginBottom: '4px',
  },
  input: {
    padding: '11px 14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '22px',
    letterSpacing: '8px',
    textAlign: 'center',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '16px',
  },
  btn: {
    background: '#4f8ef7',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '13px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  resendContainer: {
    marginTop: '20px',
    fontSize: '14px',
  },
  timerText: {
    color: '#666',
  },
  timerHighlight: {
    fontWeight: 600,
    color: '#1a1a2e',
  },
  resendBtn: {
    background: 'none',
    border: 'none',
    color: '#4f8ef7',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
  },
  footer: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#4f8ef7',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
  },
};
