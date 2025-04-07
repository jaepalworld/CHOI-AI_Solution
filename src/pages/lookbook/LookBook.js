import React from 'react';
import { Box, Typography, Paper, Container, CircularProgress } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const Lookbook = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 6, 
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          textAlign: 'center'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 4
          }}
        >
          <RocketLaunchIcon sx={{ fontSize: 80, color: '#2196F3' }} />
          
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            개발 완료
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ fontWeight: 500 }}
            >
              GPU 준비중
            </Typography>
          </Box>
          
          <Typography 
            variant="body1" 
            sx={{ 
              maxWidth: '600px', 
              color: 'text.secondary',
              mt: 2 
            }}
          >
            룩북 에디터 서비스가 곧 시작됩니다. 현재 GPU 자원을 할당하고 있으니 잠시만 기다려 주세요.
            최고의 AI 룩북 에디터 경험을 제공하기 위해 최선을 다하고 있습니다.
          </Typography>
          
          <Box 
            sx={{ 
              mt: 4, 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e0e0e0',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '60%',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                animation: 'progress 2s infinite',
                borderRadius: 4
              }}
            />
          </Box>
        </Box>
      </Paper>
      
      {/* CSS Animation */}
      <style>
        {`
          @keyframes progress {
            0% {
              width: 0%;
              left: 0;
            }
            50% {
              width: 70%;
            }
            100% {
              width: 0%;
              left: 100%;
            }
          }
        `}
      </style>
    </Container>
  );
};

export default Lookbook;