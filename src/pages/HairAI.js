import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HairHeader from './HairHeader';
import {
  Typography, Container, Box, Button, Card, CardMedia, CardContent, Grid, 
  Fade, Zoom, CircularProgress, Paper
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot
} from '@mui/lab';

// TickerSlider 임포트
import TickerSlider from '../components/TickerSlider';

// 아이콘
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
import { PaymentModal } from '../pages/Payment/PaymentComponents';

// CSS 파일 임포트
import './HairAI.css';

// 지연 로딩된 컴포넌트
const ReviewCarousel = lazy(() => import('../components/ReviewCarousel'));

// 웨이브 배경 컴포넌트
const WaveBackground = () => (
  <Box className="wave-background">
    <svg
      viewBox="0 0 1440 320"
      className="wave-svg"
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
    <Box className="scroll-progress-container">
      <Box 
        className="scroll-progress-bar"
        sx={{ width: `${scrollProgress}%` }}
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
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [ssTestOpen, setSSTestOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

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
      image: 'main1.png',
      title: 'DEV Portfolio',
      subtitle: 'AI Style Transform',
      description: 'Time, Place, Occasion 스튜디오'
    },
    {
      image: 'main2.png',
      title: 'DEV Portfolio',
      subtitle: 'AI Style Transform',
      description: 'Time, Place, Occasion 스튜디오'
    },
    {
      image: 'main3.png',
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
      
      // 스크롤 위치에 따라 헤더 스타일 변경 (100px 이상 스크롤 시 배경색 변경)
      setHeaderScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (location.state?.openPaymentModal) {
      if (isAuthenticated) {
        setPaymentModalOpen(true);
        navigate('/', { state: null, replace: true });
      } else {
        navigate('/login');
      }
    }
  }, [location.state, isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

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

  const handlePaymentModalClose = () => {
    setPaymentModalOpen(false);
  };

  const handleSSTestOpen = () => {
    setSSTestOpen(true);
  };

  const handleSSTestClose = () => {
    setSSTestOpen(false);
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* TickerSlider 컴포넌트 */}
      <TickerSlider />
      
      <ScrollProgressBar />

      {/* HairHeader 컴포넌트에 함수 props 전달 */}
      <HairHeader 
        isAuthenticated={isAuthenticated} 
        user={user} 
        handleLogout={handleLogout}
        handlePaymentModalOpen={handlePaymentModalOpen}
        headerScrolled={headerScrolled}
      />

      {/* 히어로 섹션 영역에 상단 여백 추가 */}
      <Box sx={{ 
        position: 'relative', 
        width: '100%', 
        height: 'calc(100vh + 45px)', // 티커 높이(45px)만큼 더 늘려서 여백 제거
        overflow: 'hidden',
        marginTop: '0' // 여백 제거
      }}>
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
                      className="hero-title"
                      sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, mb: 1 }}
                    >
                      {content.title}
                    </Typography>
                    <Typography
                      variant="h5"
                      className="hero-subtitle"
                      sx={{ mb: 1 }}
                    >
                      {content.subtitle}
                    </Typography>
                    <Typography
                      variant="h6"
                      className="hero-description"
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
          className="section-title"
          sx={{ mb: 8 }}
        >
          Our Services
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Fade in timeout={500 * (index + 1)} key={index}>
              <Grid item xs={12} sm={6} md={3}>
                <Card className="feature-card">
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
                          if (feature.title === '페이스 스튜디오') {
                            navigate('/face/FaceStan');
                          } else if (feature.title === '헤어 스튜디오') {
                            navigate('/hair/style');
                          } else if (feature.title === '룩북 에디터') {
                            navigate('/lookbook');
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
            className="section-title"
            sx={{ mb: 8 }}
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
                    className="timeline-paper"
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
          className="section-title"
          sx={{ mb: 8 }}
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
            className="floating-button secondary"
          >
            <SpeedIcon />
          </Box>
        </Zoom>

        {/* 맨 위로 스크롤 버튼 */}
        <Zoom in={showScrollTop}>
          <Box
            onClick={scrollToTop}
            className="floating-button primary"
          >
            <ArrowUpwardIcon />
          </Box>
        </Zoom>
      </Box>

      <SSTest open={ssTestOpen} onClose={handleSSTestClose} />
      
      {/* 결제 모달 */}
      <PaymentModal
        open={paymentModalOpen}
        handleClose={handlePaymentModalClose}
      />
    </Box>
  );
};

export default HairAI;