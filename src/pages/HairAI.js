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
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = 'http://localhost:3000';

const HairAI = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 인증 상태 확인
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
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('kakaoToken');
    setIsAuthenticated(false);
    navigate('/login');
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
          {isAuthenticated ? (
            <Button 
              color="inherit" 
              sx={{ color: '#333' }} 
              onClick={handleLogout}
            >
              Logout
            </Button>
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