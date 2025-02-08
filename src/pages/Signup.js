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
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import KakaoLogin from 'react-kakao-login';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const Signup = () => {
  const navigate = useNavigate();
  const kakaoClientId = '026cb31474c35d7d573fd513fa87b9f6';
  const googleClientId = 'YOUR_GOOGLE_CLIENT_ID';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력이 변경될 때 에러 메시지 초기화
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
      setError('모든 필드를 입력해주세요.');
      return false;
    }

    // 이메일 형식 검사
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
      
      console.log('회원가입 시도:', { email: formData.email, name: formData.name });
      
      // Firebase Authentication으로 사용자 생성
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      console.log('Authentication 성공:', userCredential.user.uid);

      // Firestore에 사용자 추가 정보 저장
      try {
        const userData = {
          name: formData.name,
          email: formData.email,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        console.log('Firestore 데이터 저장 성공');
        
        // 성공 시 로그인 페이지로 이동
        navigate('/login');
      } catch (firestoreError) {
        console.error('Firestore 저장 오류:', firestoreError);
        setError('사용자 정보 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('회원가입 오류:', error.code, error.message);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('이미 사용 중인 이메일입니다.');
          break;
        case 'auth/invalid-email':
          setError('유효하지 않은 이메일 형식입니다.');
          break;
        case 'auth/operation-not-allowed':
          setError('이메일/비밀번호 로그인이 비활성화되어 있습니다.');
          break;
        case 'auth/weak-password':
          setError('비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용해주세요.');
          break;
        case 'auth/network-request-failed':
          setError('네트워크 연결을 확인해주세요.');
          break;
        default:
          setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const kakaoOnSuccess = async (data) => {
    console.log('Kakao signup success:', data);
    try {
      // 여기에 카카오 로그인 처리 로직 추가
      navigate('/hairai');
    } catch (error) {
      console.error('Kakao signup error:', error);
      setError('카카오 로그인 중 오류가 발생했습니다.');
    }
  };
  
  const kakaoOnFailure = (err) => {
    console.error('Kakao signup error:', err);
    setError('카카오 로그인 중 오류가 발생했습니다.');
  };

  const googleOnSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google signup success:', decoded);
      navigate('/hairai');
    } catch (error) {
      console.error('Google signup error:', error);
      setError('구글 로그인 중 오류가 발생했습니다.');
    }
  };

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
                Create Account
              </Typography>
              <Typography color="text.secondary">
                Join HairAI and transform your style
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
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                autoComplete="name"
                disabled={loading}
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
                autoComplete="email"
                disabled={loading}
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
                helperText="비밀번호는 최소 6자 이상이어야 합니다"
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                disabled={loading}
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
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign Up'
                )}
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
                      disabled={loading}
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
                  onError={() => {
                    console.log('Google Login Failed');
                    setError('구글 로그인에 실패했습니다.');
                  }}
                  width="100%"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  disabled={loading}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Already have an account?{' '}
                <Button 
                  color="primary" 
                  sx={{ textTransform: 'none' }}
                  onClick={() => navigate('/login')}
                  disabled={loading}
                >
                  Sign in
                </Button>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Signup;