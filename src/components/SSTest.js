import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8000';

const SSTest = ({ open, onClose }) => {
    const [fastApiStatus, setFastApiStatus] = useState('확인 중...');
    const [comfyUiStatus, setComfyUiStatus] = useState('확인 중...');
    const [logs, setLogs] = useState([]);

    // 로그 추가 함수
    const addLog = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        setLogs(prevLogs => [logMessage, ...prevLogs.slice(0, 19)]); // 최대 20개 로그 유지
        console.log(logMessage);
    };

    // FastAPI 서버 연결 테스트
    const testFastApiConnection = async () => {
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
    };

    // ComfyUI 서버 연결 테스트 (FastAPI를 통해)
    const testComfyUiConnection = async () => {
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
            setComfyUiStatus('연결 실패 ❌');
            addLog(`ComfyUI 서버 연결 오류: ${error.message}`);
            return false;
        }
    };

    // 모든 테스트 실행
    const runAllTests = async () => {
        const fastApiConnected = await testFastApiConnection();

        // FastAPI 연결이 성공한 경우에만 ComfyUI 연결 테스트
        if (fastApiConnected) {
            await testComfyUiConnection();
        } else {
            setComfyUiStatus('확인 불가 ⚠️');
            addLog('FastAPI 서버 연결 실패로 ComfyUI 연결 확인 불가');
        }
    };

    // 컴포넌트 마운트 시 테스트 실행
    useEffect(() => {
        if (open) {
            addLog('연결 테스트가 시작되었습니다');
            runAllTests();
        }
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: '#f5f5f5',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ddd',
                pb: 2
            }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                    SSTest - 연결 테스트
                </Typography>
                <IconButton onClick={onClose} size="large">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Box sx={{ py: 2 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
                            FastAPI 서버 상태 (포트 8000):
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                p: 1,
                                borderRadius: '4px',
                                color: fastApiStatus.includes('연결됨') ? 'green' :
                                    fastApiStatus.includes('실패') ? 'red' : 'orange',
                                bgcolor: fastApiStatus.includes('연결됨') ? 'rgba(0, 255, 0, 0.1)' :
                                    fastApiStatus.includes('실패') ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                                display: 'inline-block'
                            }}
                        >
                            {fastApiStatus}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
                            ComfyUI 서버 상태 (포트 8188):
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                p: 1,
                                borderRadius: '4px',
                                color: comfyUiStatus.includes('연결됨') ? 'green' :
                                    comfyUiStatus.includes('실패') ? 'red' : 'orange',
                                bgcolor: comfyUiStatus.includes('연결됨') ? 'rgba(0, 255, 0, 0.1)' :
                                    comfyUiStatus.includes('실패') ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                                display: 'inline-block'
                            }}
                        >
                            {comfyUiStatus}
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        onClick={runAllTests}
                        sx={{
                            mb: 3,
                            backgroundColor: '#2196F3',
                            '&:hover': {
                                backgroundColor: '#1976D2'
                            }
                        }}
                    >
                        테스트 다시 실행
                    </Button>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
                            로그:
                        </Typography>
                        <Box
                            sx={{
                                maxHeight: '200px',
                                overflowY: 'auto',
                                p: 2,
                                borderRadius: '4px',
                                bgcolor: '#f0f0f0',
                                border: '1px solid #ddd',
                            }}
                        >
                            {logs.map((log, index) => (
                                <Typography
                                    key={index}
                                    variant="body2"
                                    sx={{
                                        mb: 0.5,
                                        fontFamily: 'monospace',
                                        fontSize: '0.9rem',
                                        color: log.includes('실패') || log.includes('오류') ? 'red' :
                                            log.includes('성공') ? 'green' : 'inherit'
                                    }}
                                >
                                    {log}
                                </Typography>
                            ))}
                            {logs.length === 0 && (
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#999' }}>
                                    로그가 없습니다.
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default SSTest;