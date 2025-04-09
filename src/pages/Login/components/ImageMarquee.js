import React from 'react';
import { Box } from '@mui/material';
import '../styles/ImageMarquee.css';

/**
 * 로그인/회원가입 페이지에서 사용되는 이미지 마퀴 컴포넌트
 * @param {Object} props
 * @param {Array} props.images - 표시할 이미지 파일명 배열
 * @param {string} props.direction - 'up' 또는 'down' 스크롤 방향
 */
const ImageMarquee = ({ images, direction }) => {
  return (
    <Box
      className="image-marquee-container"
    >
      <Box
        className={`image-marquee-content ${direction === 'up' ? 'scroll-up' : 'scroll-down'}`}
      >
        {[...images, ...images].map((img, index) => (
          <Box
            key={index}
            className="image-marquee-item"
          >
            <img
              src={`/assets/login/${direction === 'up' ? 'girl' : 'man'}/${img}`}
              alt=""
              className="image-marquee-img"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ImageMarquee;