import React, { useEffect, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Button, 
  Card,
  CardMedia,
  CardContent,
  Grid,
  Avatar,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const BACKEND_URL = 'http://localhost:3000';

const HairAI = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Firebase 인증 상태 감지
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    // 기존 토큰 확인
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    return () => unsubscribe();
  }, [navigate]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('kakaoToken');
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleClose();
  };

  const handleMyPage = () => {
    navigate('/mypage');
    handleClose();
  };

  return (
    <Box>
      <AppBar position="fixed" sx={{ background: '#ffffff', boxShadow: 1 }}>
        <Toolbar>
          <Typography 
            variant="h5" 
            sx={{ flexGrow: 1, color: '#333', cursor: 'pointer' }} 
            onClick={() => navigate('/')}
          >
            HairAI Style
          </Typography>
          <Button color="inherit" sx={{ color: '#333' }}>Try AI</Button>
          <Button color="inherit" sx={{ color: '#333' }}>Styles</Button>
          {isAuthenticated && user ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleMenu} sx={{ ml: 2 }}>
                <Avatar 
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                  sx={{ width: 32, height: 32 }}
                >
                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleMyPage}>마이페이지</MenuItem>
                <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button 
              color="inherit" 
              sx={{ color: '#333' }} 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Box sx={{ 
        height: '80vh',
        background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))',
        backgroundSize: 'cover',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        marginTop: '64px'
      }}>
        <Container>
          <Typography variant="h2" gutterBottom>
            Discover Your Perfect Style
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Try on new hairstyles with AI technology
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ 
              background: '#ff4081',
              '&:hover': { background: '#f50057' }
            }}
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login');
              }
              // else handle AI feature
            }}
          >
            Try Now
          </Button>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 6 }}>
          Popular Styles
        </Typography>
        <Grid container spacing={4}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={4} key={item}>
              <Card>
                <CardMedia
                  component="div"
                  sx={{ height: 240, background: '#f0f0f0' }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    Style {item}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login');
                      }
                      // else handle style selection
                    }}
                  >
                    Try This Style
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HairAI;