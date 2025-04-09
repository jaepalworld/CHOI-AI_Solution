import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';

// 티커 컨테이너 - 부드러운 회색 배경으로 변경
const TickerContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#222222',
    color: '#f5f5f5',
    height: '45px',
    display: 'flex',
    alignItems: 'center',
    position: 'fixed', // 'relative'에서 'fixed'로 변경
    top: 0, // 화면 최상단에 고정
    left: 0,
    zIndex: 1500, // 더 높은 z-index 설정 (헤더보다 위에 보이도록)
    borderBottom: '1px solid rgba(255,255,255,0.08)',
}));

// 티커 내용 컨테이너
const TickerContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0',
    height: '100%',
}));

// 티커 아이템 스타일 - 더 세련된 타이포그래피
const TickerItem = styled(Box)(({ isActive }) => ({
    padding: '0 16px',
    fontSize: '1rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    fontWeight: isActive ? '600' : '400',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    fontFamily: "'Montserrat', 'Pretendard', sans-serif",
    transition: 'all 0.8s ease-in-out',
    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
    textShadow: isActive ? '0 0 10px rgba(255,255,255,0.3)' : 'none',
    opacity: isActive ? '1' : '0.4',
}));

// 전체 아이템 래퍼
const TickerItemsWrapper = styled(Box)({
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    padding: '0 20px',
});

const TickerSlider = () => {
    const location = useLocation();
    const [isOddActive, setIsOddActive] = useState(true);

    console.log('Current path:', location.pathname);
    
    // 모든 페이지에서 표시되도록 수정 (테스트를 위해)
    // const isHomePage = location.pathname === '/';
    // 모든 페이지에서 표시
    const isHomePage = true;

    // 모든 항목들을 하나의 배열로 관리
    const allItems = [
        "COMFYUI", // 홀수 위치 1
        "FASTAPI", // 짝수 위치 2
        "FIREBASE", // 홀수 위치 3
        "REACT", // 짝수 위치 4
        "PYTHON", // 홀수 위치 5
        "SOLUTION" // 짝수 위치 6
    ];

    // Hook은 항상 컴포넌트 최상위 레벨에서 호출되어야 함
    useEffect(() => {
        // 타이머 설정하여 홀수/짝수 포지션 항목 간 전환
        const timer = setInterval(() => {
            setIsOddActive(prev => !prev);
        }, 4000); // 4초마다 전환

        return () => {
            // 컴포넌트 언마운트 시 타이머 정리
            clearInterval(timer);
        };
    }, []);

    // 메인 페이지가 아니면 null 반환 (현재는 항상 표시)
    if (!isHomePage) return null;

    return (
        <TickerContainer>
            <TickerContent>
                <TickerItemsWrapper>
                    {allItems.map((item, index) => {
                        // 홀수 인덱스(0, 2, 4...)는 첫 번째 그룹
                        // 짝수 인덱스(1, 3, 5...)는 두 번째 그룹
                        const isOddIndex = index % 2 === 0;
                        const isActive = isOddIndex ? isOddActive : !isOddActive;

                        return (
                            <TickerItem key={index} isActive={isActive}>
                                {item}
                            </TickerItem>
                        );
                    })}
                </TickerItemsWrapper>
            </TickerContent>
        </TickerContainer>
    );
};

export default TickerSlider;