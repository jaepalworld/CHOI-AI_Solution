import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // axios 추가
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Grid,
    IconButton,
    CircularProgress,
    Snackbar,
    Alert,
    LinearProgress,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Divider,
    Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareIcon from '@mui/icons-material/Compare';
import { styled } from '@mui/material/styles';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ReplayIcon from '@mui/icons-material/Replay';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';

// 숨겨진 파일 입력 컴포넌트 스타일링
const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

// API 기본 URL 설정 (환경에 맞게 수정)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const FaceStyle = () => {
    const navigate = useNavigate();
    
    // 상태 관리
    const [originalImage, setOriginalImage] = useState(null);           // 원본 이미지 파일 (사용자 얼굴 이미지)
    const [roleModelImage, setRoleModelImage] = useState(null);         // 롤모델 이미지 파일
    const [originalPreview, setOriginalPreview] = useState(null);       // 원본 이미지 미리보기 URL
    const [roleModelPreview, setRoleModelPreview] = useState(null);     // 롤모델 이미지 미리보기 URL
    const [resultImage, setResultImage] = useState(null);               // 결과 이미지 URL
    const [isUploading, setIsUploading] = useState(false);              // 업로드 상태
    const [isProcessing, setIsProcessing] = useState(false);            // 처리 상태
    const [uploadProgress, setUploadProgress] = useState(0);            // 업로드 진행도
    const [alertOpen, setAlertOpen] = useState(false);                  // 알림 표시 여부
    const [alertMessage, setAlertMessage] = useState("");               // 알림 메시지
    const [alertSeverity, setAlertSeverity] = useState("info");         // 알림 유형 (success, error, warning, info)
    const [historyItems, setHistoryItems] = useState([]);                 // 히스토리 항목 배열
    const [savedCount, setSavedCount] = useState(0);                      // 저장된 항목 개수

    // 원본 이미지 업로드 처리
    const handleOriginalImageUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            // 파일 크기 제한 (예: 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showAlert("파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.", "error");
                return;
            }
            
            // 파일 타입 검증
            if (!file.type.startsWith('image/')) {
                showAlert("이미지 파일만 업로드할 수 있습니다.", "error");
                return;
            }
            
            // 파일 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(file);
                setOriginalPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    // 롤모델 이미지 업로드 처리
    const handleRoleModelImageUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            // 파일 크기 제한 (예: 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showAlert("파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.", "error");
                return;
            }
            
            // 파일 타입 검증
            if (!file.type.startsWith('image/')) {
                showAlert("이미지 파일만 업로드할 수 있습니다.", "error");
                return;
            }
            
            // 파일 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                setRoleModelImage(file);
                setRoleModelPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    // 원본 이미지 삭제 처리
    const handleOriginalImageDelete = useCallback(() => {
        setOriginalImage(null);
        setOriginalPreview(null);
        // 결과 이미지가 있으면 함께 삭제
        if (resultImage) {
            setResultImage(null);
        }
    }, [resultImage]);

    // 롤모델 이미지 삭제 처리
    const handleRoleModelImageDelete = useCallback(() => {
        setRoleModelImage(null);
        setRoleModelPreview(null);
        // 결과 이미지가 있으면 함께 삭제
        if (resultImage) {
            setResultImage(null);
        }
    }, [resultImage]);

    // 드래그 앤 드롭 처리 - 원본 이미지
    const handleOriginalDragOver = useCallback((event) => {
        event.preventDefault();
    }, []);

    const handleOriginalDrop = useCallback((event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            // 파일 크기 제한 (예: 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showAlert("파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.", "error");
                return;
            }
            
            // 파일 타입 검증
            if (!file.type.startsWith('image/')) {
                showAlert("이미지 파일만 업로드할 수 있습니다.", "error");
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(file);
                setOriginalPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    // 드래그 앤 드롭 처리 - 롤모델 이미지
    const handleRoleModelDragOver = useCallback((event) => {
        event.preventDefault();
    }, []);

    const handleRoleModelDrop = useCallback((event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            // 파일 크기 제한 (예: 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showAlert("파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.", "error");
                return;
            }
            
            // 파일 타입 검증
            if (!file.type.startsWith('image/')) {
                showAlert("이미지 파일만 업로드할 수 있습니다.", "error");
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setRoleModelImage(file);
                setRoleModelPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    // 알림 표시 함수
    const showAlert = (message, severity = "info") => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
    };

    // 알림 닫기 함수
    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    // 히스토리에 새 항목 추가
    const addToHistory = useCallback(async (resultImg) => {
        // 결과 이미지만 저장하는 새 항목 생성
        const newItem = {
            id: Date.now().toString(),
            result_image: resultImg,
            timestamp: new Date().toISOString(),
            is_saved: false
        };

        // 로컬 스토리지에 추가
        setHistoryItems(prevItems => {
            // 새 항목을 맨 앞에 추가하고 최대 10개만 유지
            const updatedItems = [newItem, ...prevItems].slice(0, 10);
            return updatedItems;
        });

        // 백엔드에도 히스토리 저장 (선택적)
        try {
            await axios.post(`${API_BASE_URL}/api/history`, newItem);
            console.log("히스토리가 서버에 저장되었습니다.");
        } catch (error) {
            console.error("히스토리 서버 저장 실패:", error);
        }
    }, []);

    // 히스토리에서 이미지 불러오기
    const loadFromHistory = useCallback((resultImg) => {
        // 결과 이미지만 설정
        setResultImage(resultImg);
        // 원본 및 롤모델 이미지는 초기화
        setOriginalPreview(null);
        setRoleModelPreview(null);
        setOriginalImage(null);
        setRoleModelImage(null);

        showAlert("히스토리에서 이미지를 불러왔습니다.", "info");
    }, []);

    // 이미지 변환 처리 함수
    const handleTransform = useCallback(async () => {
        // 필수 이미지 검사
        if (!originalImage || !roleModelImage) {
            showAlert("사용자 얼굴 이미지와 롤모델 이미지를 모두 업로드해주세요.", "warning");
            return;
        }

        try {
            setIsUploading(true);
            setIsProcessing(true);
            setUploadProgress(0);
            setResultImage(null);

            // FormData 객체 생성
            const formData = new FormData();
            formData.append('original_image', originalImage);
            formData.append('role_model_image', roleModelImage);

            // axios로 API 요청
            const response = await axios.post(`${API_BASE_URL}/api/transform`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    // 업로드 진행률 계산 (0-50%)
                    const percentCompleted = Math.round((progressEvent.loaded * 50) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            // 업로드 완료, 처리 중 표시 (50-90%)
            setIsUploading(false);
            
            // 처리 상태 시뮬레이션 (실제로는 백엔드에서 처리 상태를 받아와야 합니다)
            let progress = 50;
            const processingInterval = setInterval(() => {
                progress += 5;
                setUploadProgress(progress);
                
                if (progress >= 90) {
                    clearInterval(processingInterval);
                }
            }, 500);

            // 응답 처리
            if (response.data && response.data.result_image_url) {
                // 처리 완료 (100%)
                setUploadProgress(100);
                clearInterval(processingInterval);
                
                // 결과 이미지 설정
                const resultImageUrl = response.data.result_image_url;
                setResultImage(resultImageUrl);

                // 히스토리에 추가 (결과 이미지만)
                addToHistory(resultImageUrl);

                showAlert("이미지 변환이 완료되었습니다.", "success");
            } else {
                throw new Error("변환된 이미지 URL이 없습니다.");
            }
        } catch (error) {
            console.error("이미지 변환 오류:", error);
            showAlert(`오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`, "error");
        } finally {
            setIsProcessing(false);
        }
    }, [originalImage, roleModelImage, addToHistory]);

    // 타임스탬프를 형식화된 날짜 문자열로 변환
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 히스토리 항목 저장/저장 취소
    const toggleSaveHistoryItem = useCallback(async (id) => {
        let updatedItems = [];
        let updatedSavedCount = savedCount;
        let targetItem = null;

        setHistoryItems(prevItems => {
            // 현재 항목의 저장 상태 확인
            const currentItem = prevItems.find(item => item.id === id);
            const isCurrentlySaved = currentItem?.is_saved || false;
            targetItem = currentItem; // 업데이트된 항목 참조 저장

            // 이미 저장된 상태에서 저장 취소하는 경우
            if (isCurrentlySaved) {
                updatedSavedCount = savedCount - 1;
                setSavedCount(updatedSavedCount);
                updatedItems = prevItems.map(item =>
                    item.id === id ? { ...item, is_saved: false } : item
                );
                return updatedItems;
            }

            // 새로 저장하는 경우, 저장 한도(2개) 체크
            if (savedCount >= 2) {
                showAlert("최대 2개까지만 저장할 수 있습니다. 먼저 다른 항목의 저장을 취소해주세요.", "warning");
                updatedItems = [...prevItems]; // 변경 없음
                return updatedItems;
            }

            // 저장 처리
            updatedSavedCount = savedCount + 1;
            setSavedCount(updatedSavedCount);
            updatedItems = prevItems.map(item =>
                item.id === id ? { ...item, is_saved: true } : item
            );
            return updatedItems;
        });

        // 백엔드에 저장 상태 업데이트 (선택적)
        if (targetItem) {
            try {
                // 저장 상태 반전
                const updatedItem = {
                    ...targetItem,
                    is_saved: !targetItem.is_saved
                };

                // API 호출하여 서버에 상태 업데이트
                await axios.post(`${API_BASE_URL}/api/history`, updatedItem);
                console.log("히스토리 항목 저장 상태가 서버에 업데이트되었습니다.");
            } catch (error) {
                console.error("히스토리 저장 상태 업데이트 실패:", error);
                // 오류가 발생해도 로컬 상태는 유지
            }
        }
    }, [savedCount]);

    // 히스토리 항목 삭제
    const deleteHistoryItem = useCallback(async (id) => {
        setHistoryItems(prevItems => {
            // 삭제할 항목이 저장된 상태인지 확인
            const itemToDelete = prevItems.find(item => item.id === id);
            if (itemToDelete?.is_saved) {
                setSavedCount(prev => prev - 1);
            }

            // 항목 삭제
            return prevItems.filter(item => item.id !== id);
        });

        // 백엔드에서도 항목 삭제 (선택적)
        try {
            await axios.delete(`${API_BASE_URL}/api/history/${id}`);
            console.log("히스토리 항목이 서버에서 삭제되었습니다.");
        } catch (error) {
            console.error("히스토리 항목 서버 삭제 실패:", error);
            // 오류가 발생해도 로컬 상태는 유지
        }
    }, []);

    return (
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pt: 8 }}>
            <Container maxWidth="lg" sx={{ py: 8 }}>
                {/* 헤더 섹션 */}
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
                    AI 얼굴 변환
                </Typography>

                {/* 진행 상태 표시줄 */}
                {isProcessing && (
                    <Box sx={{ width: '100%', mb: 4 }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={uploadProgress} 
                            sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                '& .MuiLinearProgress-bar': {
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                }
                            }} 
                        />
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                            {isUploading ? `업로드 중... ${uploadProgress}%` : `처리 중... ${uploadProgress}%`}
                        </Typography>
                    </Box>
                )}

                {/* 메인 컨텐츠 */}
                <Grid container spacing={4}>
                    {/* 원본 이미지 업로드 섹션 */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="h5" sx={{ mb: 4 }}>사용자 얼굴 이미지</Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 400,
                                    border: '2px dashed #2196F3',
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    backgroundColor: originalPreview ? 'transparent' : 'rgba(33, 150, 243, 0.1)',
                                    transition: 'all 0.3s ease'
                                }}
                                onDragOver={handleOriginalDragOver}
                                onDrop={handleOriginalDrop}
                            >
                                {originalPreview ? (
                                    <>
                                        <Box
                                            component="img"
                                            src={originalPreview}
                                            alt="원본 미리보기"
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                        <IconButton
                                            onClick={handleOriginalImageDelete}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                bgcolor: 'rgba(255, 255, 255, 0.8)'
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                ) : (
                                    <Box sx={{ textAlign: 'center', p: 2 }}>
                                        <CloudUploadIcon sx={{ fontSize: 60, color: '#2196F3', mb: 2 }} />
                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            이미지를 여기에 드래그하거나
                                        </Typography>
                                        <Button
                                            component="label"
                                            variant="contained"
                                            startIcon={<CloudUploadIcon />}
                                            sx={{
                                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                            }}
                                        >
                                            이미지 선택하기
                                            <VisuallyHiddenInput type="file" onChange={handleOriginalImageUpload} accept="image/*" />
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* 롤모델 이미지 업로드 섹션 */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="h5" sx={{ mb: 4 }}>롤모델 이미지</Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 400,
                                    border: '2px dashed #2196F3',
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    backgroundColor: roleModelPreview ? 'transparent' : 'rgba(33, 150, 243, 0.1)',
                                    transition: 'all 0.3s ease'
                                }}
                                onDragOver={handleRoleModelDragOver}
                                onDrop={handleRoleModelDrop}
                            >
                                {roleModelPreview ? (
                                    <>
                                        <Box
                                            component="img"
                                            src={roleModelPreview}
                                            alt="롤모델 미리보기"
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                        <IconButton
                                            onClick={handleRoleModelImageDelete}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                bgcolor: 'rgba(255, 255, 255, 0.8)'
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                ) : (
                                    <Box sx={{ textAlign: 'center', p: 2 }}>
                                        <CloudUploadIcon sx={{ fontSize: 60, color: '#2196F3', mb: 2 }} />
                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            이미지를 여기에 드래그하거나
                                        </Typography>
                                        <Button
                                            component="label"
                                            variant="contained"
                                            startIcon={<CloudUploadIcon />}
                                            sx={{
                                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                            }}
                                        >
                                            이미지 선택하기
                                            <VisuallyHiddenInput type="file" onChange={handleRoleModelImageUpload} accept="image/*" />
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* 결과 섹션 */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="h5" sx={{ mb: 4 }}>변환된 이미지</Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 400,
                                    border: '2px dashed #2196F3',
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    backgroundColor: resultImage ? 'transparent' : 'rgba(33, 150, 243, 0.1)'
                                }}
                            >
                                {isProcessing ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <CircularProgress sx={{ mb: 2 }} />
                                        <Typography color="text.secondary">
                                            이미지 처리 중...
                                        </Typography>
                                    </Box>
                                ) : resultImage ? (
                                    <Box
                                        component="img"
                                        src={resultImage}
                                        alt="변환된 이미지"
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain'
                                        }}
                                    />
                                ) : (
                                    <Typography color="text.secondary">
                                        이미지를 변환하면 여기에 결과가 표시됩니다
                                    </Typography>
                                )}
                            </Box>
                            
                            {resultImage && (
                                <Button
                                    variant="outlined"
                                    href={resultImage}
                                    download="transformed_image.jpg"
                                    sx={{ mt: 1 }}
                                >
                                    이미지 다운로드
                                </Button>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* 액션 버튼 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<CompareIcon />}
                        disabled={isProcessing || !originalImage || !roleModelImage}
                        onClick={handleTransform}
                        sx={{
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                            px: 4,
                            py: 1.5,
                            '&.Mui-disabled': {
                                background: '#cccccc',
                                color: '#666666'
                            }
                        }}
                    >
                        {isProcessing ? '처리 중...' : '이미지 변환하기'}
                    </Button>
                </Box>

                {/* 알림 메시지 */}
                <Snackbar
                    open={alertOpen}
                    autoHideDuration={6000}
                    onClose={handleAlertClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
                        {alertMessage}
                    </Alert>
                </Snackbar>

                {/* 저장된 항목 섹션 */}
                {savedCount > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#1976D2' }}>
                            <BookmarkIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                            저장된 항목
                        </Typography>
                        <Grid container spacing={2}>
                            {historyItems.filter(item => item.is_saved).map(item => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={`saved-${item.id}`}>
                                    <Card elevation={2} sx={{ position: 'relative', borderRadius: 2 }}>
                                        <CardMedia
                                            component="img"
                                            height="160"
                                            image={item.result_image}
                                            alt="저장된 결과"
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <CardContent sx={{ pt: 1, pb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(item.timestamp)}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ p: 1, pt: 0 }}>
                                            <Tooltip title="불러오기">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => loadFromHistory(item.result_image)}
                                                >
                                                    <ReplayIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="저장 취소">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => toggleSaveHistoryItem(item.id)}
                                                >
                                                    <BookmarkIcon fontSize="small" color="primary" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="다운로드">
                                                <IconButton
                                                    size="small"
                                                    component="a"
                                                    href={item.result_image}
                                                    download={`transform-${item.id}.jpg`}
                                                >
                                                    <DownloadIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="삭제">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => deleteHistoryItem(item.id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        <Divider sx={{ mt: 3, mb: 3 }} />
                    </Box>
                )}

                {/* 모든 히스토리 항목 */}
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#1976D2' }}>
                    <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                    최근 변환 기록
                </Typography>
                <Grid container spacing={2}>
                    {historyItems.map(item => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                            <Card elevation={2} sx={{ position: 'relative', borderRadius: 2 }}>
                                <CardMedia
                                    component="img"
                                    height="160"
                                    image={item.result_image}
                                    alt="변환 결과"
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent sx={{ pt: 1, pb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatDate(item.timestamp)}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ p: 1, pt: 0 }}>
                                    <Tooltip title="불러오기">
                                        <IconButton
                                            size="small"
                                            onClick={() => loadFromHistory(item.result_image)}
                                        >
                                            <ReplayIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={item.is_saved ? "저장 취소" : "저장하기"}>
                                        <IconButton
                                            size="small"
                                            onClick={() => toggleSaveHistoryItem(item.id)}
                                        >
                                            {item.is_saved ?
                                                <BookmarkIcon fontSize="small" color="primary" /> :
                                                <BookmarkBorderIcon fontSize="small" />
                                            }
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="다운로드">
                                        <IconButton
                                            size="small"
                                            component="a"
                                            href={item.result_image}
                                            download={`transform-${item.id}.jpg`}
                                        >
                                            <DownloadIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="삭제">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => deleteHistoryItem(item.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default FaceStyle;