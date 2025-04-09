import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TryAIDropdown from '../components/TryAIDropdown';
import {
  AppBar, Toolbar, Typography, Box, Button, IconButton, Menu, MenuItem, Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';

// HairHeader 컴포넌트 - 완전히 투명한 배경으로 개선
const HairHeader = ({ isAuthenticated, user, handleLogout, handlePaymentModalOpen, headerScrolled }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  // 프로필 메뉴 열기 핸들러
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  // 프로필 메뉴 닫기 핸들러
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        top: '45px', 
        backgroundColor: 'transparent', // 완전 투명 배경
    backdropFilter: 'none', // 블러 효과 제거
    borderBottom: 'none', // 경계선 제거
    top: '45px', // 티커 슬라이더 높이만큼 아래로
    zIndex: 1100, // 티커 슬라이더보다 낮은 z-index
    boxShadow: 'none' // 그림자 효과 제거
      }}
      className={headerScrolled ? 'header-scrolled' : ''}
    >
      <Toolbar sx={{ py: 1, justifyContent: 'space-between' }}>
        {/* 왼쪽 버튼 영역 */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
          <Button
            className="header-nav-button"
            sx={{
              color: headerScrolled ? '#333333' : '#ffffff', // 스크롤 여부에 따라 색상 변경
              fontWeight: 500,
              '&:hover': { color: '#2196F3' }
            }}
            onClick={handlePaymentModalOpen}
          >
            멤버십
          </Button>
          <Button
            className="header-nav-button"
            sx={{
              color: headerScrolled ? '#333333' : '#ffffff', // 스크롤 여부에 따라 색상 변경
              fontWeight: 500,
              '&:hover': { color: '#2196F3' }
            }}
            onClick={() => navigate('/service/chat')}
          >
            고객센터 상담
          </Button>
        </Box>
        
        {/* 중앙 로고 - 필기체 폰트 적용 */}
        <Typography
          className="studio-logo"
          variant="h5"
          component="div"
          onClick={() => navigate('/')}
          sx={{ 
            position: 'absolute', 
            left: '50%', 
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            fontWeight: 600,
            fontFamily: 'Dancing Script, cursive', // 필기체 폰트
            fontSize: '2.2rem', 
            color: headerScrolled ? '#333333' : '#ffffff', // 스크롤 여부에 따라 색상 변경
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          Drawing-Studio
        </Typography>
        
        {/* 오른쪽 버튼 영역 및 프로필 */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, ml: 'auto' }}>
          <TryAIDropdown isAuthenticated={isAuthenticated} />
          <Button
            className="header-nav-button"
            sx={{
              color: headerScrolled ? '#333333' : '#ffffff', // 스크롤 여부에 따라 색상 변경
              fontWeight: 500,
              '&:hover': { color: '#2196F3' }
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
                  borderColor: headerScrolled ? 'primary.main' : 'white',
                  p: 0.5,
                  color: headerScrolled ? 'primary.main' : 'white'
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
                <MenuItem onClick={() => {
                  navigate('/mypage');
                  handleProfileMenuClose();
                }}>마이페이지</MenuItem>
                <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined" // contained 대신 outlined 사용
              sx={{
                color: headerScrolled ? '#333333' : '#ffffff',
                borderColor: headerScrolled ? '#333333' : '#ffffff',
                background: 'transparent',
                fontWeight: 500,
                px: 4,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderColor: '#2196F3',
                  color: '#2196F3'
                }
              }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          )}
        </Box>
        
        {/* 모바일 메뉴 버튼 */}
        <IconButton
          sx={{ 
            display: { xs: 'flex', md: 'none' },
            color: headerScrolled ? '#333333' : '#ffffff' // 스크롤 여부에 따라 색상 변경
          }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* 모바일 메뉴 */}
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
          handlePaymentModalOpen();
          setMobileMenuOpen(false);
        }}>
          멤버십
        </MenuItem>
        <MenuItem onClick={() => {
          navigate('/service/chat');
          setMobileMenuOpen(false);
        }}>
          고객센터 상담
        </MenuItem>
        <MenuItem onClick={() => {
          if (!isAuthenticated) {
            alert('로그인을 해주세요.');
            navigate('/login');
          } else {
            navigate('/lookbook');
          }
          setMobileMenuOpen(false);
        }}>
          LOOKBOOK
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
            navigate('/face/FaceStan');
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
    </AppBar>
  );
};

export default HairHeader;