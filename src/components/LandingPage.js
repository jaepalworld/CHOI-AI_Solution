import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const [activePanel, setActivePanel] = useState(null);

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
            }}
        >
            {panels.map((panel) => (
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
                            ? 'url(/assets/images/salon.jpg) center/cover no-repeat'
                            : panel.id === 'juno-academy'
                                ? 'url(/assets/images/academy.jpg) center/cover no-repeat'
                                : 'url(/assets/images/avenue.jpg) center/cover no-repeat',
                        '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 1,
                            transition: 'background-color 0.5s ease',
                        },
                        '&:hover:before': {
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        }
                    }}
                    onMouseEnter={() => setActivePanel(panel.id)}
                    onMouseLeave={() => setActivePanel(null)}
                    onClick={() => handlePanelClick(panel.id)} // 패널 ID 전달
                >
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
                                    fontStyle: 'italic'
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