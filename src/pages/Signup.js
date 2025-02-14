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
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
        pl: direction === 'up' ? 9 : -1
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
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent'
            }}
          >
            <img
              src={`/assets/login/${direction === 'up' ? 'girl' : 'man'}/${img}`}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const Signup = () => {
  const navigate = useNavigate();
  const kakaoClientId = process.env.REACT_APP_KAKAO_CLIENT_ID;
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const kakaoOnSuccess = async (data) => {
    console.log('Kakao signup success:', data);
    navigate('/');
  };

  const kakaoOnFailure = (err) => {
    console.error('Kakao signup error:', err);
    setError('카카오 로그인 중 오류가 발생했습니다.');
  };

  // Google 로그인 관련 함수
  const googleOnSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log('Google signup success:', decoded);
    navigate('/');
  };

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const leftImages = ['g1.jpg', 'g2.jpg', 'g3.jpg', 'g4.jpg', 'g5.jpg', 'g6.jpg', 'g7.jpg'];
  const rightImages = ['m1.jpg', 'm2.jpg', 'm3.jpg', 'm4.jpg', 'm5.jpg'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
      setError('모든 필드를 입력해주세요.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      try {
        const userData = {
          name: formData.name,
          email: formData.email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        navigate('/login');
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        setError('사용자 정보 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('이미 사용 중인 이메일입니다.');
          break;
        case 'auth/invalid-email':
          setError('유효하지 않은 이메일 형식입니다.');
          break;
        case 'auth/weak-password':
          setError('비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용해주세요.');
          break;
        default:
          setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 50%, #e5e7eb 100%)'
      }}>
        <ImageMarquee images={leftImages} direction="up" />

        <Container maxWidth="sm" sx={{ py: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                label="Name"
                name="name"
                value={formData.name}
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
                      <IconButton onClick={handleClickShowPassword} edge="end">
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
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowConfirmPassword} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
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
                Already have an account?{' '}
                <Button
                  onClick={() => navigate('/login')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#2196F3',
                    '&:hover': {
                      background: 'rgba(33, 150, 243, 0.1)'
                    }
                  }}
                >
                  Sign in
                </Button>
              </Typography>
            </Box>
          </Paper>
        </Container>

        <ImageMarquee images={rightImages} direction="down" />
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Signup;