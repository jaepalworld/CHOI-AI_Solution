import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Grid,
    CircularProgress,
    Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import RefreshIcon from '@mui/icons-material/Refresh';

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8000';
const COMFYUI_API_URL = 'http://localhost:8188';

const ConnectionStatus = () => {
    const navigate = useNavigate();
    
    // 상태 관리
    const [fastApiStatus, setFastApiStatus] = useState('확인 중...');
    const [comfyUiStatus, setComfyUiStatus] = useState('확인 중...');
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 로그 추가 함수
    const addLog = useCallback((message) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        setLogs(prevLogs => [logMessage, ...prevLogs.slice(0, 19)]); // 최대 20개 로그 유지
    }, []);

    // FastAPI 서버 연결 테스트
    const testFastApiConnection = useCallback(async () => {
        try {
            addLog('FastAPI 서버 연결 테스트 중...');
            setFastApiStatus('확인 중...');
            
            const response = await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
            
            if (response.status === 200) {
                setFastApiStatus('연결됨 ✅');
                addLog('FastAPI 서버 연결 성공!');
                return true;
            } else {
                setFastApiStatus(`연결 실패 ❌ (상태 코드: ${response.status})`);
                addLog(`FastAPI 서버 연결 실패: 상태 코드 ${response.status}`);
                return false;
            }
        } catch (error) {
            setFastApiStatus('연결 실패 ❌');
            addLog(`FastAPI 서버 연결 오류: ${error.message}`);
            return false;
        }
    }, [addLog]);

    // ComfyUI 서버 연결 테스트 (FastAPI를 통해)
    const testComfyUiConnection = useCallback(async () => {
        try {
            addLog('FastAPI를 통해 ComfyUI 연결 테스트 중...');
            setComfyUiStatus('확인 중...');
            
            const response = await axios.get(`${API_BASE_URL}/test-comfyui`, { timeout: 8000 });
            
            if (response.data && response.data.status === 'success') {
                setComfyUiStatus('연결됨 ✅');
                addLog('ComfyUI 서버 연결 성공!');
                return true;
            } else {
                setComfyUiStatus('연결 실패 ❌');
                addLog(`ComfyUI 서버 연결 실패: ${response.data?.message || '알 수 없는 오류'}`);
                return false;
            }
        } catch (error) {
            // FastAPI 서버와 연결이 되어 있지만 ComfyUI 연결은 실패한 경우
            setComfyUiStatus('연결 실패 ❌');
            addLog(`ComfyUI 서버 연결 오류: ${error.message}`);
            return false;
        }
    }, [addLog]);

    // 모든 테스트 실행
    const runAllTests = useCallback(async () => {
        setIsLoading(true);
        
        try {
            const fastApiConnected = await testFastApiConnection();
            
            // FastAPI 연결이 성공한 경우에만 ComfyUI 연결 테스트
            if (fastApiConnected) {
                await testComfyUiConnection();
            } else {
                setComfyUiStatus('확인 불가 ⚠️');
                addLog('FastAPI 서버 연결 실패로 ComfyUI 연결 확인 불가');
            }
        } finally {
            setIsLoading(false);
        }
    }, [testFastApiConnection, testComfyUiConnection, addLog]);

    // 컴포넌트 마운트 시 자동으로 테스트 실행
    useEffect(() => {
        runAllTests();
        
        // 30초마다 자동으로 연결 상태 확인 (선택적)
        const intervalId = setInterval(runAllTests, 30000);
        
        return () => {
            clearInterval(intervalId);
        };
    }, [runAllTests]);

    // 뒤로 가기 핸들러
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pt: 4 }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography
                        variant="h4"
                        align="center"
                        sx={{
                            mb: 4,
                            fontWeight: 700,
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        서버 연결 상태 확인
                    </Typography>

                    <Grid container spacing={3}>
                        {/* FastAPI 상태 */}
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    p: 3,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 2,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    FastAPI 서버 상태 (포트 8000):
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mt: 1,
                                        color: fastApiStatus.includes('연결됨') ? 'success.main' :
                                               fastApiStatus.includes('실패') ? 'error.main' : 'warning.main'
                                    }}
                                >
                                    {fastApiStatus.includes('연결됨') ? (
                                        <CheckCircleIcon sx={{ mr: 1 }} />
                                    ) : fastApiStatus.includes('실패') ? (
                                        <ErrorIcon sx={{ mr: 1 }} />
                                    ) : (
                                        <PendingIcon sx={{ mr: 1 }} />
                                    )}
                                    <Typography variant="h5">
                                        {fastApiStatus}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* ComfyUI 상태 */}
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    p: 3,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 2,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    ComfyUI 서버 상태 (포트 8188):
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mt: 1,
                                        color: comfyUiStatus.includes('연결됨') ? 'success.main' :
                                               comfyUiStatus.includes('실패') ? 'error.main' : 'warning.main'
                                    }}
                                >
                                    {comfyUiStatus.includes('연결됨') ? (
                                        <CheckCircleIcon sx={{ mr: 1 }} />
                                    ) : comfyUiStatus.includes('실패') ? (
                                        <ErrorIcon sx={{ mr: 1 }} />
                                    ) : (
                                        <PendingIcon sx={{ mr: 1 }} />
                                    )}
                                    <Typography variant="h5">
                                        {comfyUiStatus}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={runAllTests}
                            disabled={isLoading}
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                px: 4,
                                py: 1.5
                            }}
                        >
                            {isLoading ? '테스트 중...' : '연결 상태 다시 확인'}
                        </Button>
                        
                        <Button
                            variant="outlined"
                            onClick={handleBack}
                            sx={{ px: 4, py: 1.5 }}
                        >
                            뒤로 가기
                        </Button>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* 로그 섹션 */}
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            로그:
                        </Typography>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                maxHeight: '300px',
                                overflow: 'auto',
                                bgcolor: '#f5f5f5'
                            }}
                        >
                            {logs.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    로그가 없습니다.
                                </Typography>
                            ) : (
                                logs.map((log, index) => (
                                    <Typography
                                        key={index}
                                        variant="body2"
                                        sx={{
                                            fontFamily: 'monospace',
                                            mb: 0.5,
                                            color: log.includes('성공') ? 'success.main' :
                                                   log.includes('실패') || log.includes('오류') ? 'error.main' : 'text.primary'
                                        }}
                                    >
                                        {log}
                                    </Typography>
                                ))
                            )}
                        </Paper>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ConnectionStatus;