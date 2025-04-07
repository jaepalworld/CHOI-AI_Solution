import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TryAIDropdown from '../components/TryAIDropdown';
import KenBurnsSlider from '../components/KenBurnsSlider';
import {
  AppBar, Toolbar, Typography, Container, Box, Button, Card, CardMedia, CardContent, Grid, Avatar,
  Menu, MenuItem, IconButton,// useTheme,// alpha,  Fade,Zoom,CircularProgress,Paper,// Rating
  Fade, Zoom, CircularProgress, Paper,
} from '@mui/material';
// @mui/lab에서 제공하는 타임라인 컴포넌트
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot
} from '@mui/lab';

// 아이콘
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed'; // 속도계/테스트 아이콘
import SSTest from '../components/SSTest'; // SSTest 컴포넌트 import

// Firebase
import { auth } from '../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// 슬라이더
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { PaymentButton, PaymentModal } from '../pages/Payment/PaymentComponents';

// 지연 로딩된 컴포넌트
const ReviewCarousel = lazy(() => import('../components/ReviewCarousel'));
// const FeatureCard = lazy(() => import('../components/FeatureCard'));



// 웨이브 배경 컴포넌트
const WaveBackground = () => (
  <Box
    sx={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: 0,
      pointerEvents: 'none'
    }}
  >
    <svg
      viewBox="0 0 1440 320"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 'auto',
        transform: 'translateY(50%)',
        opacity: 0.1
      }}
    >
      <path
        fill="#2196F3"
        fillOpacity="0.5"
        d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      >
        <animate
          attributeName="d"
          dur="10s"
          repeatCount="indefinite"
          values="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                 M0,160L48,181.3C96,203,192,245,288,261.3C384,277,480,267,576,234.7C672,203,768,149,864,133.3C960,117,1056,139,1152,154.7C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </path>
    </svg>
  </Box>
);

// 스크롤 진행 바 컴포넌트
const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        zIndex: 2000,
        background: '#e0e0e0'
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${scrollProgress}%`,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          transition: 'width 0.1s ease'
        }}
      />
    </Box>
  );
};

// 로딩 스켈레톤
const SkeletonLoader = () => (
  <Box sx={{ padding: 2 }}>
    <CircularProgress />
  </Box>
);

// HairAI 컴포넌트
const HairAI = () => {
  const navigate = useNavigate();
  const location = useLocation(); // useLocation 추가
  // const theme = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  // 결제 모달 상태 추가
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [ssTestOpen, setSSTestOpen] = useState(false);


  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 8000,
    arrows: false,
    pauseOnHover: false,
    dotsClass: "slick-dots custom-dots",
    fade: true,
    cssEase: 'linear'
  };

  const sliderContent = [
    {
      image: 'main1.png', // 흑백 이미지로 변경 필요
      title: 'DEV Portfolio',
      subtitle: 'AI Style Transform',
      description: 'Time, Place, Occasion 스튜디오'
    },
    {
      image: 'main2.png', // 흑백 이미지로 변경 필요
      title: 'DEV Portfolio',
      subtitle: 'AI Style Transform',
      description: 'Time, Place, Occasion 스튜디오'
    },
    {
      image: 'main3.png', // 흑백 이미지로 변경 필요
      title: 'DEV Portfolio',
      subtitle: 'AI Style Transform',
      description: 'Time, Place, Occasion 스튜디오'
    }
  ];

  // 기능 데이터
  const features = [
    {
      title: '룩북 에디터',
      description: '감성 한스푼을 넣어보세요',
      image: 'Advertising.jpg',
      icon: <AutoAwesomeIcon />
    },
    {
      title: '헤어 스튜디오',
      description: '머리도 한끗차이',
      image: 'hair.jpg',
      icon: <AutoAwesomeIcon />
    },
    {
      title: '페이스 스튜디오',
      description: '텔레비젼에 내가 나왔다면',
      image: 'face.jpg',
      icon: <AutoAwesomeIcon />
    },
    {
      title: 'Back & C',
      description: '배경 삭제 및 새로운 배경 생성',
      image: 'backc1.png',
      icon: <AutoAwesomeIcon />
    }
  ];

  // 타임라인 항목
  const timelineItems = [
    {
      title: '이미지 업로드',
      description: '변화를 원하는 사진을 업로드하세요'
    },
    {
      title: 'AI 분석',
      description: '인공지능이 최적의 스타일을 분석합니다'
    },
    {
      title: '스타일 선택',
      description: 'AI가 추천하는 다양한 스타일 중 선택하세요'
    },
    {
      title: '결과 확인',
      description: '새로운 모습을 확인하세요'
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

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 여기에 새로운 useEffect 추가
  useEffect(() => {
    // location.state에서 openPaymentModal 값을 확인하여 모달을 자동으로 열기
    if (location.state?.openPaymentModal) {
      // 모달 열기 전에 로그인 상태 확인
      if (isAuthenticated) {
        setPaymentModalOpen(true);
        // 상태 초기화 (브라우저 뒤로가기 시 모달이 다시 열리는 것 방지)
        navigate('/', { state: null, replace: true });
      } else {
        // 로그인되지 않은 경우 로그인 페이지로 이동
        navigate('/login');
      }
    }
  }, [location.state, isAuthenticated, navigate]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // 에러 메시지 표시
      alert('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
    handleProfileMenuClose();
  };

  // 프로필 메뉴 열기 핸들러
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  // 프로필 메뉴 닫기 핸들러
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentModalOpen = () => {
    if (!isAuthenticated) {
      alert('결제 진행을 위해 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    setPaymentModalOpen(true);
  };

  // 결제 모달 닫기 핸들러
  const handlePaymentModalClose = () => {
    setPaymentModalOpen(false);
  };

  // SSTest 모달 열기 핸들러
  const handleSSTestOpen = () => {
    setSSTestOpen(true);
  };

  // SSTest 모달 닫기 핸들러
  const handleSSTestClose = () => {
    setSSTestOpen(false);
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <ScrollProgressBar />

      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider'
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
            Drawing-Studio
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>

            <PaymentButton onClick={handlePaymentModalOpen} />
            <Button
              sx={{
                color: 'text.primary',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' }
              }}
              onClick={() => navigate('/service/chat')}
            >
              고객센터 상담
            </Button>
            <TryAIDropdown isAuthenticated={isAuthenticated} />
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
                  <MenuItem onClick={() => navigate('/mypage')}>마이페이지</MenuItem>
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

      {/* 슬라이더가 있는 히어로 섹션 */}
      <Box sx={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        <WaveBackground />
        <Slider {...sliderSettings}>
          {sliderContent.map((content, index) => (
            <Box key={index} sx={{ position: 'relative', height: '100vh' }}>
              <Box className="ken-burns-slide">
                <Box
                  component="img"
                  src={`/assets/images/${content.image}`}
                  alt={`Slide ${index + 1}`}
                  className="ken-burns-image"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain', // cover에서 contain으로 변경
                    objectPosition: 'center center'
                  }}
                />

              </Box>
              <Fade in timeout={1000}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '0 10%',
                    paddingBottom: '5%'
                  }}
                >
                  <Box sx={{ maxWidth: '500px' }}>
                    <Typography
                      variant="h1"
                      sx={{
                        color: 'white',
                        fontWeight: 600,
                        fontSize: { xs: '2.5rem', md: '4rem' },
                        mb: 1,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                        animation: 'fadeInUp 1s ease-out',
                        fontFamily: "'Playfair Display', serif"
                      }}
                    >
                      {content.title}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        mb: 1,
                        fontWeight: 500,
                        animation: 'fadeInUp 1s ease-out 0.2s',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                      }}
                    >
                      {content.subtitle}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: 300,
                        animation: 'fadeInUp 1s ease-out 0.3s',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                      }}
                    >
                      {content.description}
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            </Box>
          ))}
        </Slider>
      </Box>

      {/* 기능 섹션 */}
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
          Our Services
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Fade in timeout={500 * (index + 1)} key={index}>
              <Grid item xs={12} sm={6} md={3}>
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
                    image={`/assets/images/${feature.image}`}
                    alt={feature.title}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      gutterBottom
                      variant="h5"
                      sx={{ fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      {feature.description}
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
                          alert('로그인을 해주세요.');
                          navigate('/login');
                        } else {
                          // 각 서비스 별 경로
                          if (feature.title === '롤 모델 되어보기') {
                            navigate('/face/style');
                          } else if (feature.title === '헤어 스타일 바꾸기') {
                            navigate('/hair/style');
                          } else if (feature.title === 'AI 광고') {
                            navigate('/advertising');
                          } else if (feature.title === 'Back & C') {
                            navigate('/back');
                          }
                        }
                      }}
                    >
                      Try Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Fade>
          ))}
        </Grid>
      </Container>

      {/* 작동 방식 섹션 */}
      <Box sx={{ bgcolor: 'white', py: 12 }}>
        <Container>
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
            How It Works
          </Typography>
          <Timeline position="alternate">
            {timelineItems.map((item, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot sx={{
                    bgcolor: '#2196F3',
                    boxShadow: '0 0 0 4px rgba(33, 150, 243, 0.2)'
                  }}>
                    <AutoAwesomeIcon />
                  </TimelineDot>
                  {index < timelineItems.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}
                  >
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {item.description}
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Container>
      </Box>

      {/* 리뷰 섹션 */}
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
          What Our Users Say
        </Typography>
        <Suspense fallback={<SkeletonLoader />}>
          <ReviewCarousel />
        </Suspense>
      </Container>

      {/* 플로팅 액션 버튼 영역 */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1000 }}>
        {/* SSTest 버튼 */}
        <Zoom in={true}>
          <Box
            onClick={handleSSTestOpen}
            sx={{
              backgroundColor: '#FF5722', // 다른 색상으로 구분
              color: 'white',
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 8px rgba(0,0,0,0.3)'
              }
            }}
          >
            <SpeedIcon />
          </Box>
        </Zoom>

        {/* 맨 위로 스크롤 버튼 */}
        <Zoom in={showScrollTop}>
          <Box
            onClick={scrollToTop}
            sx={{
              backgroundColor: '#2196F3',
              color: 'white',
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 8px rgba(0,0,0,0.3)'
              }
            }}
          >
            <ArrowUpwardIcon />
          </Box>
        </Zoom>
      </Box>

      <SSTest open={ssTestOpen} onClose={handleSSTestClose} />

      {/* 모바일 관련 */}
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
        <MenuItem onClick={() => {
          if (!isAuthenticated) {
            alert('로그인을 해주세요.');
            navigate('/login');
          } else {
            navigate('/advertising');
          }
          setMobileMenuOpen(false);
        }}>
          AI 광고
        </MenuItem>
        <MenuItem onClick={() => {
          if (!isAuthenticated) {
            alert('로그인을 해주세요.');
            navigate('/login');
          } else {
            navigate('/hair/style');
          }
          setMobileMenuOpen(false);
        }}>
          헤어 스타일 바꾸기
        </MenuItem>
        <MenuItem onClick={() => {
          if (!isAuthenticated) {
            alert('로그인을 해주세요.');
            navigate('/login');
          } else {
            navigate('/face/style');
          }
          setMobileMenuOpen(false);
        }}>
          롤 모델 되어보기
        </MenuItem>
        <MenuItem onClick={() => {
          if (!isAuthenticated) {
            alert('로그인을 해주세요.');
            navigate('/login');
          } else {
            navigate('/back');
          }
          setMobileMenuOpen(false);
        }}>
          Back & C
        </MenuItem>
        {!isAuthenticated && (
          <MenuItem onClick={() => {
            navigate('/login');
            setMobileMenuOpen(false);
          }}>
            Login
          </MenuItem>
        )}
      </Menu>
      <PaymentModal
        open={paymentModalOpen}
        handleClose={handlePaymentModalClose}
      />
      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes kenBurns {
            0% {
              transform: scale(1.0);
            }
            100% {
              transform: scale(1.1);
            }
          }

          .custom-dots {
            position: absolute;
            bottom: 20px;
            display: flex !important;
            justify-content: center;
            width: 100%;
            padding: 0;
            margin: 0;
            list-style: none;
          }

          .custom-dots li {
            margin: 0 4px;
          }

          .custom-dots li button {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            border: none;
            cursor: pointer;
            padding: 0;
            transition: all 0.3s ease;
          }

          .custom-dots li.slick-active button {
            background: #2196F3;
            transform: scale(1.2);
          }

          .ken-burns-slide {
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          .ken-burns-image {
  width: 100%;
  height: 100%;
  object-fit: contain; // cover에서 contain으로 변경
  animation: kenBurns 20s ease-out forwards;
  transform-origin: center center;
}
        `}
      </style>

    </Box>
  );
};

export default HairAI;