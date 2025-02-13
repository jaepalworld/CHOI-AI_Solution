import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BACKEND_URL = 'http://localhost:3000';

const HairAI = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000, // 8초로 변경
    arrows: false,
    pauseOnHover: false,
    dotsClass: "slick-dots custom-dots",
  };

  // 슬라이더 콘텐츠를 배열로 정의합니다
  const sliderContent = [
    {
      image: 'main1.png',
      title: '당신이 꿈꾸던 모습을 현실로',
      subtitle: 'AI 기술로 완성하는 새로운 나'
    },
    {
      image: 'main2.png',
      title: '상상이 현실이 되는 순간',
      subtitle: 'AI가 만드는 당신만의 특별한 변신'
    },
    {
      image: 'main3.png',
      title: '무한한 변신의 시작',
      subtitle: 'AI 기술로 만나는 새로운 나'
    }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

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
  }, []);

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
    handleProfileMenuClose();
  };

  const handleMyPage = () => {
    navigate('/mypage');
    handleProfileMenuClose();
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa' }}>
      {/* Modern AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
            onClick={() => navigate('/')}
          >
            HairAI Style
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            <Button
              sx={{
                color: 'text.primary',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' }
              }}
            >
              Try AI
            </Button>
            <Button
              sx={{
                color: 'text.primary',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' }
              }}
            >
              Styles
            </Button>
            {isAuthenticated && user ? (
              <>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{
                    border: '2px solid',
                    borderColor: 'primary.main',
                    p: 0.5
                  }}
                >
                  {user.photoURL ? (
                    <Avatar src={user.photoURL} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <PersonIcon />
                  )}
                </IconButton>
                <Menu
                  anchorEl={profileAnchorEl}
                  open={Boolean(profileAnchorEl)}
                  onClose={handleProfileMenuClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      border: '1px solid',
                      borderColor: 'divider',
                      mt: 1.5,
                      '& .MuiMenuItem-root': {
                        typography: 'body2',
                        py: 1
                      }
                    }
                  }}
                >
                  <MenuItem onClick={handleMyPage}>마이페이지</MenuItem>
                  <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  color: 'white',
                  px: 4
                }}
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            )}
          </Box>
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' } }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Hero Section with Modernized Slider */}
      <Box sx={{ position: 'relative', width: '100%', height: '100vh', minHeight: '600px', marginTop: '0', overflow: 'hidden' }}>
        <Slider {...sliderSettings}>
          {sliderContent.map((content, index) => (
            <Box key={index} sx={{ position: 'relative', height: '100vh', minHeight: '600px' }}>
              <Box
                component="img"
                src={`/assets/images/${content.image}`}
                alt={`Slide ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center center'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: { xs: '0 5%', md: '0 10%' }, // 반응형 패딩 추가
                  paddingTop: '64px' // AppBar 높이만큼 패딩 추가
                }}
              >
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      fontSize: {
                        xs: '2rem',    // 모바일
                        sm: '2.5rem',  // 태블릿
                        md: '3.5rem',  // 데스크탑
                        lg: '4rem'     // 큰 화면
                      },
                      mb: 2,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      wordBreak: 'keep-all' // 한글 단어 단위 줄바꿈
                    }}
                  >
                    {content.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      mb: 4,
                      maxWidth: '600px',
                      fontSize: {
                        xs: '1rem',
                        sm: '1.2rem',
                        md: '1.5rem'
                      },
                      wordBreak: 'keep-all' // 한글 단어 단위 줄바꿈
                    }}
                  >
                    {content.subtitle}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                      px: 6,
                      py: 2,
                      borderRadius: '30px',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 5px 8px 2px rgba(33, 203, 243, .4)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login');
                      }
                    }}
                  >
                    Try Now
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}
        </Slider>
      </Box>

      {/* Modernized Popular Styles Section */}
      <Container sx={{ py: 12 }}>
        <Typography
          variant="h3"
          align="center"
          sx={{
            mb: 8,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Popular Styles
        </Typography>
        <Grid container spacing={4}>
          {[
            { title: 'AI 광고', image: 'Advertising.jpg' },
            { title: '헤어 스타일 바꾸기', image: 'hair.jpg' },
            { title: '얼굴 바꾸기', image: 'face.jpg' }
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(33, 150, 243, 0.2)'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="280"
                  image={`/assets/images/${item.image}`}
                  alt={item.title}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    sx={{ fontWeight: 600 }}
                  >
                    {item.title}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      mt: 2,
                      borderRadius: '25px',
                      px: 4,
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: 'white',
                        borderColor: 'transparent'
                      }
                    }}
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login');
                      }
                    }}
                  >
                    TRY THIS STYLE
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Mobile Menu */}
      <Menu
        anchorEl={null}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiPaper-root': {
            width: '100%',
            maxWidth: '100%',
            top: '64px !important',
            left: '0 !important'
          }
        }}
      >
        <MenuItem onClick={() => setMobileMenuOpen(false)}>Try AI</MenuItem>
        <MenuItem onClick={() => setMobileMenuOpen(false)}>Styles</MenuItem>
        {!isAuthenticated && (
          <MenuItem onClick={() => {
            navigate('/login');
            setMobileMenuOpen(false);
          }}>
            Login
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default HairAI;