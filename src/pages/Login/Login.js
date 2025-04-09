import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Visibility, VisibilityOff } from '@mui/icons-material';

// 커스텀 컴포넌트 가져오기
import ImageMarquee from './components/ImageMarquee';
import SocialLogins from './components/SocialLogins';

// CSS 가져오기
import './styles/Login.css';

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
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const leftImages = ['g1.jpg', 'g2.jpg', 'g3.jpg', 'g4.jpg', 'g5.jpg', 'g6.jpg', 'g7.jpg'];
  const rightImages = ['m1.jpg', 'm2.jpg', 'm3.jpg', 'm4.jpg', 'm5.jpg'];

  // 페이지 로드 시 관리자 로그인 체크 및 로그아웃
  useEffect(() => {
    const checkAndLogoutAdmin = async () => {
      if (auth.currentUser && auth.currentUser.email.endsWith('@drawing-studio-admin.com')) {
        setAlertMessage('관리자 계정으로 로그인되어 있어 로그아웃 처리되었습니다. 일반 계정으로 로그인해주세요.');
        setShowAlert(true);

        try {
          await signOut(auth);
        } catch (error) {
          console.error('로그아웃 중 오류:', error);
        }
      }
    };

    checkAndLogoutAdmin();
  }, []);

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

    // 관리자 도메인 체크
    if (formData.email.endsWith('@drawing-studio-admin.com')) {
      setError('관리자 계정은 관리자 로그인 페이지를 이용해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 이미 로그인되어 있는 경우 로그아웃 먼저 실행
      if (auth.currentUser) {
        await signOut(auth);
      }

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

  // 카카오 로그인 성공 핸들러
  const kakaoOnSuccess = async (data) => {
    console.log('Kakao login success:', data);
    setLoading(true);
    setError('');

    try {
      // 이미 로그인되어 있는 경우 로그아웃 먼저 실행
      if (auth.currentUser) {
        await signOut(auth);
      }

      // 테스트용 알림
      setAlertMessage('카카오 로그인 테스트 중입니다. 프로필 정보: ' +
        (data.profile?.kakao_account?.profile?.nickname || '이름 없음'));
      setShowAlert(true);

      // 테스트 중이므로 홈으로 리디렉션 비활성화
      // navigate('/');
    } catch (error) {
      console.error('Kakao auth error:', error);
      setError('카카오 로그인 처리 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 카카오 로그인 실패 핸들러
  const kakaoOnFailure = (err) => {
    console.error('Kakao login error:', err);
    setError('카카오 로그인 연결 중 오류가 발생했습니다.');
  };

  // 구글 로그인 성공 핸들러
  const googleOnSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      // 이미 로그인되어 있는 경우 로그아웃 먼저 실행
      if (auth.currentUser) {
        await signOut(auth);
      }

      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google login success:', decoded);

      // 테스트용 알림
      setAlertMessage('구글 로그인 테스트 중입니다. 이메일: ' +
        (decoded.email || '이메일 없음'));
      setShowAlert(true);

      // 테스트 중이므로 홈으로 리디렉션 비활성화
      // navigate('/');
    } catch (error) {
      console.error('Google auth error:', error);
      setError('구글 로그인 처리 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 구글 로그인 실패 핸들러
  const googleOnError = () => {
    console.log('Google Login Failed');
    setError('구글 로그인 연결 중 오류가 발생했습니다.');
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
          {showAlert && (
            <Alert
              severity="info"
              sx={{ mb: 4 }}
              onClose={() => setShowAlert(false)}
            >
              {alertMessage}
            </Alert>
          )}

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

            {/* 소셜 로그인 컴포넌트 */}
            <SocialLogins 
              kakaoClientId={kakaoClientId}
              onKakaoSuccess={kakaoOnSuccess}
              onKakaoFailure={kakaoOnFailure}
              onGoogleSuccess={googleOnSuccess}
              onGoogleError={googleOnError}
            />

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

export default Login;