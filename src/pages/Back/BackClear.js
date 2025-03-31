import React, { useState, useEffect } from 'react';
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
  IconButton,
  Paper,
  Fade,
  Zoom
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import VideocamIcon from '@mui/icons-material/Videocam';
import BrushIcon from '@mui/icons-material/Brush';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

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

// BackC 메인 컴포넌트
const BackC = () => {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <ScrollProgressBar />

      {/* 헤더 영역 */}
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
            BackClear
          </Typography>
          <Button
            sx={{
              color: 'text.primary',
              fontWeight: 500,
              '&:hover': { color: 'primary.main' },
              mr: 2
            }}
            onClick={() => navigate('/')}
          >
            Home
          </Button>
        </Toolbar>
      </AppBar>

      {/* 히어로 섹션 - 데모 영상 */}
      <Box sx={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', pt: 8 }}>
        <WaveBackground />
        <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    BackClear
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ mb: 4, color: 'text.secondary' }}
                  >
                    배경 삭제와 생성을 한번에! 당신의 이미지에 새로운 생명을 불어넣으세요.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<PlayCircleOutlineIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                      px: 4,
                      py: 1.5,
                      borderRadius: '30px',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 5px 8px 2px rgba(33, 203, 243, .4)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => document.getElementById('demoVideo').scrollIntoView({ behavior: 'smooth' })}
                  >
                    사용법 보기
                  </Button>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Fade in timeout={1500}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.3), rgba(33, 203, 243, 0.3))',
                      zIndex: 1
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    image="/assets/images/backclear-hero.jpg"
                    alt="BackClear Hero"
                    sx={{
                      height: { xs: '300px', md: '400px' },
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 사용법 데모 영상 섹션 */}
      <Box id="demoVideo" sx={{ py: 12, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{
              mb: 6,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            BackClear 사용 방법
          </Typography>
          <Box
            sx={{
              position: 'relative',
              paddingTop: '56.25%', // 16:9 비율
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              mb: 8
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(33, 150, 243, 0.7)',
                  '&:hover': {
                    bgcolor: 'rgba(33, 150, 243, 0.9)',
                  },
                  p: 2
                }}
              >
                <VideocamIcon sx={{ fontSize: 60 }} />
              </IconButton>
              <Typography
                variant="h5"
                sx={{
                  position: 'absolute',
                  bottom: '20px',
                  color: 'white',
                  textAlign: 'center',
                  width: '100%'
                }}
              >
                데모 영상: BackClear 사용 가이드
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={6} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<DeleteIcon />}
                sx={{
                  py: 3,
                  borderRadius: '12px',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 6px 15px rgba(33, 150, 243, 0.4)',
                  }
                }}
                onClick={() => navigate('/back/clear')}
              >
                <Typography variant="h5">BackClear</Typography>
              </Button>
              <Typography
                align="center"
                sx={{ mt: 2, color: 'text.secondary' }}
              >
                이미지에서 배경을 자동으로 제거하세요
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<BrushIcon />}
                sx={{
                  py: 3,
                  borderRadius: '12px',
                  background: 'linear-gradient(45deg, #FF9800 30%, #FFCA28 90%)', // 다른 그라데이션 색상
                  boxShadow: '0 4px 10px rgba(255, 152, 0, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 6px 15px rgba(255, 152, 0, 0.4)',
                  }
                }}
                onClick={() => navigate('/back/create')}
              >
                <Typography variant="h5">BackCreate</Typography>
              </Button>
              <Typography
                align="center"
                sx={{ mt: 2, color: 'text.secondary' }}
              >
                AI로 새로운 배경을 생성하세요
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 특징 섹션 */}
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
          BackClear의 특징
        </Typography>
        <Grid container spacing={4}>
          {[
            { 
              title: '간편한 배경 제거', 
              desc: '단 한 번의 클릭으로 완벽한 배경 제거를 경험하세요.',
              image: 'backclear1.jpg'
            },
            { 
              title: 'AI 기반 배경 생성', 
              desc: '원하는 분위기의 배경을 텍스트로 설명하면 AI가 자동 생성합니다.',
              image: 'backclear2.jpg'
            },
            { 
              title: '빠른 처리 속도', 
              desc: '고성능 AI 엔진으로 몇 초 만에 결과를 확인하세요.',
              image: 'backclear3.jpg'
            }
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Fade in timeout={500 * (index + 1)}>
                <Card sx={{
                  height: '100%',
                  borderRadius: '16px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 25px rgba(33, 150, 243, 0.15)',
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={`/assets/images/${feature.image}`}
                    alt={feature.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 푸터 */}
      <Box sx={{ bgcolor: '#f1f8fe', py: 6 }}>
        <Container>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                BackClear
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                © 2025 BackClear. All rights reserved.
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                }}
                onClick={() => navigate('/back/clear')}
              >
                시작하기
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 스크롤 탑 버튼 */}
      <Zoom in={showScrollTop}>
        <Box
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
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
            zIndex: 1000,
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
  );
};

export default BackC;