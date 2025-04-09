import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const [activePanel, setActivePanel] = useState(null);
    const [hoverPanel, setHoverPanel] = useState(null);

    // 패널 데이터 - 첫 번째 패널만 메인으로 연결
    const panels = [
        {
            id: 'juno-hair',
            title: 'HAIR AI',
            subtitle: 'dev 02 15',
            path: '/main' // 명확하게 /main으로 설정
        },
        {
            id: '준비중입니다.',
            title: '개발중',
            subtitle: '',
            path: null // null로 변경
        },
        {
            id: '개발중',
            title: '개발중',
            subtitle: '',
            path: null // null로 변경
        }
    ];

    // 패널 너비 계산 (마우스 오버 시 확장)
    const getPanelWidth = (panelId) => {
        if (activePanel) {
            return activePanel === panelId ? '70%' : '15%';
        }
        return '33.33%';
    };

    // 클릭 핸들러 수정
    const handlePanelClick = (panelId) => {
        console.log("Panel clicked:", panelId);
        // juno-hair 패널만 클릭 가능하도록 설정
        if (panelId === 'juno-hair') {
            console.log("Navigating to /main");
            navigate('/main');
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                position: 'relative',
            }}
        >
            {panels.map((panel, index) => (
                <Box
                    key={panel.id}
                    sx={{
                        position: 'relative',
                        width: getPanelWidth(panel.id),
                        height: '100%',
                        overflow: 'hidden',
                        transition: 'width 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
                        cursor: panel.id === 'juno-hair' ? 'pointer' : 'default',
                        // 패널별 배경 이미지 설정
                        background: panel.id === 'juno-hair'
                            ? 'url(/assets/images/salon-modern.jpg) center/cover no-repeat'
                            : panel.id === '준비중입니다.'
                                ? 'url(/assets/images/lan2.png) center/cover no-repeat'
                                : 'url(/assets/images/lan3.jpg) center/cover no-repeat',
                        '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: activePanel === panel.id 
                                ? 'rgba(0, 0, 0, 0.3)' 
                                : 'rgba(0, 0, 0, 0.9)', // 더 어두운 오버레이 (기본 상태)
                            zIndex: 1,
                            transition: 'background-color 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
                        },
                        '&:hover:before': {
                            backgroundColor: 'rgba(0, 0, 0, 0.3)', // 호버 시 더 밝게
                        }
                    }}
                    onMouseEnter={() => {
                        setActivePanel(panel.id);
                        setHoverPanel(panel.id);
                    }}
                    onMouseLeave={() => {
                        setActivePanel(null);
                        setHoverPanel(null);
                    }}
                    onClick={() => handlePanelClick(panel.id)} // 패널 ID 전달
                >
                    {/* 패널 사이의 구분선 */}
                    {index < panels.length - 1 && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                right: 0,
                                width: '2px',
                                background: 'rgba(255, 255, 255, 0.5)',
                                zIndex: 10,
                                boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                                opacity: hoverPanel ? 0.3 : 0.7,
                                transition: 'opacity 0.5s ease',
                                height: '100%'
                            }}
                        />
                    )}
                    {/* 수직 제목 (비활성 상태) */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '50%',
                            left: '50%',
                            transform: 'translate(-50%, 50%) rotate(-90deg)',
                            zIndex: 2,
                            textAlign: 'center',
                            width: '100vh',
                            transition: 'all 0.5s ease',
                            opacity: activePanel === panel.id ? 0 : 1,
                        }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                color: 'white',
                                fontWeight: 700,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                whiteSpace: 'nowrap',
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // 텍스트 가독성 향상
                            }}
                        >
                            {panel.title}
                        </Typography>
                    </Box>

                    {/* 활성화된 패널 제목 (중앙 표시) */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 2,
                            textAlign: 'center',
                            width: '100%',
                            opacity: activePanel === panel.id ? 1 : 0,
                            transition: 'opacity 0.5s ease',
                        }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                color: 'white',
                                fontWeight: 700,
                                mb: 2,
                                textTransform: 'uppercase',
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // 텍스트 가독성 향상
                            }}
                        >
                            {panel.title}
                        </Typography>
                        {panel.subtitle && (
                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'white',
                                    fontWeight: 300,
                                    fontStyle: 'italic',
                                    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)', // 텍스트 가독성 향상
                                }}
                            >
                                {panel.subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default LandingPage;