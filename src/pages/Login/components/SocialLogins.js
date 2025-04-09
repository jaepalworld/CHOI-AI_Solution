import React from 'react';
import { Grid, Button } from '@mui/material';
import KakaoLogin from 'react-kakao-login';
import { GoogleLogin } from '@react-oauth/google';

/**
 * 소셜 로그인 버튼 컴포넌트
 * @param {Object} props
 * @param {string} props.kakaoClientId - 카카오 로그인 API 클라이언트 ID
 * @param {Function} props.onKakaoSuccess - 카카오 로그인 성공 핸들러
 * @param {Function} props.onKakaoFailure - 카카오 로그인 실패 핸들러
 * @param {Function} props.onGoogleSuccess - 구글 로그인 성공 핸들러
 * @param {Function} props.onGoogleError - 구글 로그인 실패 핸들러
 */
const SocialLogins = ({ 
  kakaoClientId, 
  onKakaoSuccess, 
  onKakaoFailure, 
  onGoogleSuccess, 
  onGoogleError 
}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <KakaoLogin
          token={kakaoClientId}
          onSuccess={onKakaoSuccess}
          onFail={onKakaoFailure}
          render={({ onClick }) => (
            <Button
              fullWidth
              variant="outlined"
              onClick={(e) => {
                // 예방 조치: 원치 않는 리디렉션 방지
                e.preventDefault();
                // 원래 onClick 함수 호출
                onClick(e);
              }}
              sx={{
                py: 1.5,
                bgcolor: '#FEE500',
                color: '#000000',
                borderColor: '#FEE500',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: '#FDD800',
                  borderColor: '#FDD800',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                },
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Continue with Kakao
            </Button>
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={onGoogleError}
          width="100%"
          size="large"
          text="continue_with"
          shape="rectangular"
        />
      </Grid>
    </Grid>
  );
};

export default SocialLogins;