import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import KakaoLogin from 'react-kakao-login';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Visibility, VisibilityOff } from '@mui/icons-material';

const ImageMarquee = ({ images, direction }) => {
  return (
    <Box
      sx={{
        height: '100vh',
        overflow: 'hidden',
        width: '16.666667%',
        pl: direction === 'up' ? 9 : -1 // Add padding-left only to the left marquee
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          animation: `slide 20s linear infinite ${direction === 'up' ? 'reverse' : 'normal'}`
        }}
      >
        {[...images, ...images].map((img, index) => (
          <Box
            key={index}
            sx={{
              width: '12rem',
              height: '12rem',
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex', // 추가
              justifyContent: 'center', // 추가
              alignItems: 'center', // 추가
              backgroundColor: 'transparent' // 추가
            }}
          >
            <img
              src={`/assets/login/${direction === 'up' ? 'girl' : 'man'}/${img}`}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block' // 추가
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const kakaoClientId = '026cb31474c35d7d573fd513fa87b9f6';
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const leftImages = ['g1.jpg', 'g2.jpg', 'g3.jpg', 'g4.jpg', 'g5.jpg', 'g6.jpg', 'g7.jpg'];
  const rightImages = ['m1.jpg', 'm2.jpg', 'm3.jpg', 'm4.jpg', 'm5.jpg'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError('로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const kakaoOnSuccess = (data) => {
    console.log('Kakao login success:', data);
    navigate('/');
  };

  const kakaoOnFailure = (err) => {
    console.error('Kakao login error:', err);
  };

  const googleOnSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log('Google login success:', decoded);
    navigate('/');
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 50%, #e5e7eb 100%)'
      }}>
        {/* Left Marquee */}
        <ImageMarquee images={leftImages} direction="up" />

        {/* Main Content */}
        <Container maxWidth="sm" sx={{ py: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h4"
              component="div"
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                mb: 2
              }}
              onClick={() => navigate('/')}
            >
              {/* HAIR AI */}
            </Typography>
          </Box>

          <Paper elevation={24} sx={{
            padding: { xs: 3, md: 4 },
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                HAIR AI
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                Design Your Self
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#2196F3',
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#2196F3',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #21CBF3 90%)',
                    boxShadow: '0 4px 6px 2px rgba(33, 203, 243, .4)',
                  },
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
                {loading ? 'Loading...' : 'Sign In'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>or continue with</Divider>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <KakaoLogin
                  token={kakaoClientId}
                  onSuccess={kakaoOnSuccess}
                  onFail={kakaoOnFailure}
                  render={({ onClick }) => (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={onClick}
                      sx={{
                        py: 1.5,
                        bgcolor: '#FEE500',
                        color: '#000000',
                        borderColor: '#FEE500',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: '#FDD800',
                          borderColor: '#FDD800',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        },
                        textTransform: 'none',
                        fontSize: '1rem'
                      }}
                    >
                      Continue with Kakao
                    </Button>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <GoogleLogin
                  onSuccess={googleOnSuccess}
                  onError={() => console.log('Google Login Failed')}
                  width="100%"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Don't have an account?{' '}
                <Button
                  onClick={() => navigate('/signup')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#2196F3',
                    '&:hover': {
                      background: 'rgba(33, 150, 243, 0.1)'
                    }
                  }}
                >
                  Sign up
                </Button>
              </Typography>
            </Box>
          </Paper>
        </Container>

        {/* Right Marquee */}
        <ImageMarquee images={rightImages} direction="down" />
      </Box>
    </GoogleOAuthProvider>
  );
};

// Add this to your global CSS or styles
const styles = `
@keyframes slide {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}
`;

const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Login;