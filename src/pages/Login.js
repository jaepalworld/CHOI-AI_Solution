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
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import KakaoLogin from 'react-kakao-login';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const navigate = useNavigate();
  const kakaoClientId = '026cb31474c35d7d573fd513fa87b9f6';
  const googleClientId = 'YOUR_GOOGLE_CLIENT_ID';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  // Rest of the component remains the same
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{
            padding: 4,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 2
          }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Welcome Back
              </Typography>
              <Typography color="text.secondary">
                Transform your style with HairAI
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
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
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
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
                  background: 'linear-gradient(45deg, #FF6A88 30%, #FF99AC 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF5277 30%, #FF8599 90%)'
                  }
                }}
              >
                {loading ? 'Loading...' : 'Sign In'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>or</Divider>

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
                        '&:hover': {
                          bgcolor: '#FDD800',
                          borderColor: '#FDD800'
                        }
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

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Don't have an account?{' '}
                <Button
                  color="primary"
                  sx={{ textTransform: 'none' }}
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </Button>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Login;