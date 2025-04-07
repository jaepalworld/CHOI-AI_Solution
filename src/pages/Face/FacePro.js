import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    Tooltip,
    ToggleButtonGroup,
    ToggleButton,
    Fade,
    Backdrop,
    useTheme,
    useMediaQuery,
    Avatar,
    Chip
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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import TuneIcon from '@mui/icons-material/Tune';

// Styled components
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

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
    fontWeight: 600,
    borderRadius: '24px',
    padding: '8px 16px',
    '&.MuiToggleButton-root': {
        border: 'none',
        backgroundColor: 'transparent',
        color: theme.palette.text.secondary,
        '&.Mui-selected': {
            backgroundColor: 'rgba(33, 150, 243, 0.08)',
            color: '#2196F3',
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.25)',
        },
    },
}));

const ProGradientTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    background: 'linear-gradient(45deg, #2196F3 30%, #6A11CB 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.5px',
}));

const EnhancedPaper = styled(Paper)(({ theme }) => ({
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
    },
}));

const DropZone = styled(Box)(({ theme, isDragging, hasPreview }) => ({
    width: '100%',
    height: 400,
    border: isDragging ? '2px dashed #6A11CB' : '2px dashed rgba(33, 150, 243, 0.5)',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: hasPreview ? 'transparent' : 'rgba(33, 150, 243, 0.03)',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: '#6A11CB',
        backgroundColor: hasPreview ? 'transparent' : 'rgba(33, 150, 243, 0.05)',
    },
}));

// API 기본 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const FacePro = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    // 상태 관리
    const [version, setVersion] = useState('pro'); // 'stan' or 'pro'
    const [originalImage, setOriginalImage] = useState(null);
    const [roleModelImage, setRoleModelImage] = useState(null);
    const [originalPreview, setOriginalPreview] = useState(null);
    const [roleModelPreview, setRoleModelPreview] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("info");
    const [historyItems, setHistoryItems] = useState([]);
    const [savedCount, setSavedCount] = useState(0);
    const [isDraggingOriginal, setIsDraggingOriginal] = useState(false);
    const [isDraggingRoleModel, setIsDraggingRoleModel] = useState(false);
    const [advancedOptions, setAdvancedOptions] = useState({
        preserveColor: false,
        enhanceDetails: true,
        styleIntensity: 75,
    });

    // 버전 변경 핸들러
    const handleVersionChange = (event, newVersion) => {
        if (newVersion) {
            setVersion(newVersion);
            if (newVersion === 'stan') {
                navigate('/face/stan');
            }
        }
    };

    // 원본 이미지 업로드 처리
    const handleOriginalImageUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            // 파일 크기 제한 (10MB)
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
            // 파일 크기 제한 (10MB)
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

    // 이미지 삭제 처리
    const handleOriginalImageDelete = useCallback(() => {
        setOriginalImage(null);
        setOriginalPreview(null);
        if (resultImage) {
            setResultImage(null);
        }
    }, [resultImage]);

    const handleRoleModelImageDelete = useCallback(() => {
        setRoleModelImage(null);
        setRoleModelPreview(null);
        if (resultImage) {
            setResultImage(null);
        }
    }, [resultImage]);

    // 드래그 앤 드롭 처리
    const handleOriginalDragOver = useCallback((event) => {
        event.preventDefault();
        setIsDraggingOriginal(true);
    }, []);

    const handleOriginalDragLeave = useCallback((event) => {
        event.preventDefault();
        setIsDraggingOriginal(false);
    }, []);

    const handleOriginalDrop = useCallback((event) => {
        event.preventDefault();
        setIsDraggingOriginal(false);
        const file = event.dataTransfer.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                showAlert("파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.", "error");
                return;
            }
            
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

    const handleRoleModelDragOver = useCallback((event) => {
        event.preventDefault();
        setIsDraggingRoleModel(true);
    }, []);

    const handleRoleModelDragLeave = useCallback((event) => {
        event.preventDefault();
        setIsDraggingRoleModel(false);
    }, []);

    const handleRoleModelDrop = useCallback((event) => {
        event.preventDefault();
        setIsDraggingRoleModel(false);
        const file = event.dataTransfer.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                showAlert("파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.", "error");
                return;
            }
            
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
        const newItem = {
            id: Date.now().toString(),
            result_image: resultImg,
            timestamp: new Date().toISOString(),
            is_saved: false,
            options: { ...advancedOptions }, // 사용한 고급 옵션도 저장
        };

        setHistoryItems(prevItems => {
            const updatedItems = [newItem, ...prevItems].slice(0, 10);
            return updatedItems;
        });

        try {
            await axios.post(`${API_BASE_URL}/api/history`, newItem);
            console.log("히스토리가 서버에 저장되었습니다.");
        } catch (error) {
            console.error("히스토리 서버 저장 실패:", error);
        }
    }, [advancedOptions]);

    // 히스토리에서 이미지 불러오기
    const loadFromHistory = useCallback((resultImg) => {
        setResultImage(resultImg);
        setOriginalPreview(null);
        setRoleModelPreview(null);
        setOriginalImage(null);
        setRoleModelImage(null);

        showAlert("히스토리에서 이미지를 불러왔습니다.", "info");
    }, []);

    // 이미지 변환 처리 함수
    const handleTransform = useCallback(async () => {
        if (!originalImage || !roleModelImage) {
            showAlert("사용자 얼굴 이미지와 롤모델 이미지를 모두 업로드해주세요.", "warning");
            return;
        }

        try {
            setIsUploading(true);
            setIsProcessing(true);
            setUploadProgress(0);
            setResultImage(null);

            const formData = new FormData();
            formData.append('original_image', originalImage);
            formData.append('role_model_image', roleModelImage);
            
            // PRO 버전: 고급 옵션 추가
            formData.append('preserve_color', advancedOptions.preserveColor);
            formData.append('enhance_details', advancedOptions.enhanceDetails);
            formData.append('style_intensity', advancedOptions.styleIntensity);

            const response = await axios.post(`${API_BASE_URL}/api/transform`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 50) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            setIsUploading(false);
            
            let progress = 50;
            const processingInterval = setInterval(() => {
                progress += 5;
                setUploadProgress(progress);
                
                if (progress >= 90) {
                    clearInterval(processingInterval);
                }
            }, 500);

            if (response.data && response.data.result_image_url) {
                setUploadProgress(100);
                clearInterval(processingInterval);
                
                const resultImageUrl = response.data.result_image_url;
                setResultImage(resultImageUrl);
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
    }, [originalImage, roleModelImage, advancedOptions, addToHistory]);

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
            const currentItem = prevItems.find(item => item.id === id);
            const isCurrentlySaved = currentItem?.is_saved || false;
            targetItem = currentItem;

            if (isCurrentlySaved) {
                updatedSavedCount = savedCount - 1;
                setSavedCount(updatedSavedCount);
                updatedItems = prevItems.map(item =>
                    item.id === id ? { ...item, is_saved: false } : item
                );
                return updatedItems;
            }

            if (savedCount >= 2) {
                showAlert("최대 2개까지만 저장할 수 있습니다. 먼저 다른 항목의 저장을 취소해주세요.", "warning");
                updatedItems = [...prevItems];
                return updatedItems;
            }

            updatedSavedCount = savedCount + 1;
            setSavedCount(updatedSavedCount);
            updatedItems = prevItems.map(item =>
                item.id === id ? { ...item, is_saved: true } : item
            );
            return updatedItems;
        });

        if (targetItem) {
            try {
                const updatedItem = {
                    ...targetItem,
                    is_saved: !targetItem.is_saved
                };

                await axios.post(`${API_BASE_URL}/api/history`, updatedItem);
                console.log("히스토리 항목 저장 상태가 서버에 업데이트되었습니다.");
            } catch (error) {
                console.error("히스토리 저장 상태 업데이트 실패:", error);
            }
        }
    }, [savedCount]);

    // 히스토리 항목 삭제
    const deleteHistoryItem = useCallback(async (id) => {
        setHistoryItems(prevItems => {
            const itemToDelete = prevItems.find(item => item.id === id);
            if (itemToDelete?.is_saved) {
                setSavedCount(prev => prev - 1);
            }
            return prevItems.filter(item => item.id !== id);
        });

        try {
            await axios.delete(`${API_BASE_URL}/api/history/${id}`);
            console.log("히스토리 항목이 서버에서 삭제되었습니다.");
        } catch (error) {
            console.error("히스토리 항목 서버 삭제 실패:", error);
        }
    }, []);

    // 고급 옵션 변경 처리
    const handleOptionChange = (option, value) => {
        setAdvancedOptions(prev => ({
            ...prev,
            [option]: value
        }));
    };

    return (
        <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', pt: 4 }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* 버전 선택 토글 버튼 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                    <ToggleButtonGroup
                        value={version}
                        exclusive
                        onChange={handleVersionChange}
                        aria-label="version selector"
                        sx={{
                            background: '#ffffff',
                            p: 0.5,
                            borderRadius: '28px',
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
                        }}
                    >
                        <StyledToggleButton value="stan">
                            Standard
                        </StyledToggleButton>
                        <StyledToggleButton value="pro">
                            <AutoAwesomeIcon sx={{ mr: 1, fontSize: 16 }} />
                            Pro
                        </StyledToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* 헤더 섹션 */}
                <Box sx={{ mb: 6, textAlign: 'center' }}>
                    <ProGradientTypography variant="h3" sx={{ mb: 2, fontWeight: 800 }}>
                        AI 얼굴 변환 PRO
                    </ProGradientTypography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
                        고급 AI 알고리즘으로 더 정교하고 자연스러운 얼굴 변환을 경험해보세요. 다양한 스타일 옵션과 향상된 디테일로 완벽한 결과물을 만들 수 있습니다.
                    </Typography>
                </Box>

                {/* 진행 상태 표시줄 */}
                {isProcessing && (
                    <Box sx={{ width: '100%', mb: 4 }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={uploadProgress} 
                            sx={{ 
                                height: 8, 
                                borderRadius: 8,
                                background: 'rgba(106, 17, 203, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                    background: 'linear-gradient(45deg, #2196F3 30%, #6A11CB 90%)',
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
                        <EnhancedPaper
                            elevation={0}
                            sx={{
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 3
                            }}
                        >
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ 
                                    bgcolor: 'rgba(33, 150, 243, 0.1)', 
                                    color: '#2196F3',
                                    mr: 2,
                                }}>
                                    1
                                </Avatar>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>사용자 얼굴 이미지</Typography>
                            </Box>
                            
                            <DropZone
                                isDragging={isDraggingOriginal}
                                hasPreview={!!originalPreview}
                                onDragOver={handleOriginalDragOver}
                                onDragLeave={handleOriginalDragLeave}
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
                                        <Backdrop
                                            open={true}
                                            sx={{
                                                position: 'absolute',
                                                zIndex: 1,
                                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                transition: 'opacity 0.3s ease'
                                            }}
                                        >
                                            <IconButton
                                                onClick={handleOriginalImageDelete}
                                                sx={{
                                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(255, 255, 255, 1)',
                                                    }
                                                }}
                                                size="large"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Backdrop>
                                    </>
                                ) : (
                                    <Box sx={{ textAlign: 'center', p: 2 }}>
                                        <CloudUploadIcon sx={{ fontSize: 60, color: '#2196F3', mb: 2, opacity: 0.8 }} />
                                        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                                            이미지를 여기에 드래그하거나
                                        </Typography>
                                        <Button
                                            component="label"
                                            variant="contained"
                                            startIcon={<CloudUploadIcon />}
                                            sx={{
                                                background: 'linear-gradient(45deg, #2196F3 30%, #6A11CB 90%)',
                                                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                                borderRadius: '28px',
                                                px: 3,
                                                py: 1,
                                            }}
                                        >
                                            이미지 선택하기
                                            <VisuallyHiddenInput type="file" onChange={handleOriginalImageUpload} accept="image/*" />
                                        </Button>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                            JPG, PNG 또는 WEBP 파일 (최대 10MB)
                                        </Typography>
                                    </Box>
                                )}
                            </DropZone>
                        </EnhancedPaper>
                    </Grid>

                    {/* 롤모델 이미지 업로드 섹션 */}
                    <Grid item xs={12} md={4}>
                        <EnhancedPaper
                            elevation={0}
                            sx={{
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 3
                            }}
                        >
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ 
                                    bgcolor: 'rgba(33, 150, 243, 0.1)', 
                                    color: '#2196F3',
                                    mr: 2,
                                }}>
                                    2
                                </Avatar>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>롤모델 이미지</Typography>
                            </Box>
                            
                            <DropZone
                                isDragging={isDraggingRoleModel}
                                hasPreview={!!roleModelPreview}
                                onDragOver={handleRoleModelDragOver}
                                onDragLeave={handleRoleModelDragLeave}
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
                                        <Backdrop
                                            open={true}
                                            sx={{
                                                position: 'absolute',
                                                zIndex: 1,
                                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                transition: 'opacity 0.3s ease'
                                            }}
                                        >
                                            <IconButton
                                                onClick={handleRoleModelImageDelete}
                                                sx={{
                                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(255, 255, 255, 1)',
                                                    }
                                                }}
                                                size="large"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Backdrop>
                                    </>
                                ) : (
                                    <Box sx={{ textAlign: 'center', p: 2 }}>
                                        <CloudUploadIcon sx={{ fontSize: 60, color: '#2196F3', mb: 2, opacity: 0.8 }} />
                                        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                                            이미지를 여기에 드래그하거나
                                        </Typography>
                                        <Button
                                            component="label"
                                            variant="contained"
                                            startIcon={<CloudUploadIcon />}
                                            sx={{
                                                background: 'linear-gradient(45deg, #2196F3 30%, #6A11CB 90%)',
                                                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                                borderRadius: '28px',
                                                px: 3,
                                                py: 1,
                                            }}
                                        >
                                            이미지 선택하기
                                            <VisuallyHiddenInput type="file" onChange={handleRoleModelImageUpload} accept="image/*" />
                                        </Button>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                            JPG, PNG 또는 WEBP 파일 (최대 10MB)
                                        </Typography>
                                    </Box>
                                )}
                            </DropZone>
                        </EnhancedPaper>
                    </Grid>

                    {/* 결과 섹션 */}
                    <Grid item xs={12} md={4}>
                        <EnhancedPaper
                            elevation={0}
                            sx={{
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 3
                            }}
                        >
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ 
                                    bgcolor: 'rgba(33, 150, 243, 0.1)', 
                                    color: '#2196F3',
                                    mr: 2,
                                }}>
                                    3
                                </Avatar>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>변환된 이미지</Typography>
                            </Box>
                            
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 400,
                                    borderRadius: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    backgroundColor: resultImage ? 'transparent' : 'rgba(33, 150, 243, 0.03)',
                                    border: '2px dashed rgba(33, 150, 243, 0.2)',
                                }}
                            >
                                {isProcessing ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <CircularProgress 
                                            sx={{ 
                                                mb: 2,
                                                '& .MuiCircularProgress-circle': {
                                                    color: '#6A11CB',
                                                }
                                            }} 
                                        />
                                        <Typography color="text.secondary" variant="body1">
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
                                    <Box sx={{ textAlign: 'center', p: 2 }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 60, color: '#6A11CB', mb: 2, opacity: 0.7 }} />
                                        <Typography color="text.secondary" variant="body1" sx={{ fontWeight: 500 }}>
                                            이미지를 변환하면 여기에 결과가 표시됩니다
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            
                            {resultImage && (
                                <Button
                                    variant="outlined"
                                    href={resultImage}
                                    download="transformed_image.jpg"
                                    startIcon={<DownloadIcon />}
                                    sx={{ 
                                        borderRadius: '28px',
                                        color: '#2196F3',
                                        borderColor: '#2196F3',
                                        '&:hover': {
                                            borderColor: '#6A11CB',
                                            color: '#6A11CB',
                                            bgcolor: 'rgba(106, 17, 203, 0.04)',
                                        }
                                    }}
                                >
                                    이미지 다운로드
                                </Button>
                            )}
                        </EnhancedPaper>
                    </Grid>
                </Grid>

                {/* Pro 버전: 고급 옵션 섹션 */}
                <EnhancedPaper
                    elevation={0}
                    sx={{
                        p: 3,
                        mt: 4,
                        borderRadius: 3,
                        background: 'linear-gradient(to right, rgba(33, 150, 243, 0.03), rgba(106, 17, 203, 0.03))'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SettingsSuggestIcon sx={{ mr: 1, color: '#6A11CB' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            고급 옵션
                        </Typography>
                    </Box>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    원본 색상 보존
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip 
                                        label="끄기" 
                                        variant={!advancedOptions.preserveColor ? "filled" : "outlined"}
                                        color={!advancedOptions.preserveColor ? "primary" : "default"}
                                        onClick={() => handleOptionChange('preserveColor', false)}
                                        sx={{ borderRadius: '16px' }}
                                    />
                                    <Chip 
                                        label="켜기" 
                                        variant={advancedOptions.preserveColor ? "filled" : "outlined"}
                                        color={advancedOptions.preserveColor ? "primary" : "default"}
                                        onClick={() => handleOptionChange('preserveColor', true)}
                                        sx={{ borderRadius: '16px' }}
                                    />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    원본 이미지의 색상을 유지하면서 스타일만 적용합니다.
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    디테일 향상
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip 
                                        label="끄기" 
                                        variant={!advancedOptions.enhanceDetails ? "filled" : "outlined"}
                                        color={!advancedOptions.enhanceDetails ? "primary" : "default"}
                                        onClick={() => handleOptionChange('enhanceDetails', false)}
                                        sx={{ borderRadius: '16px' }}
                                    />
                                    <Chip 
                                        label="켜기" 
                                        variant={advancedOptions.enhanceDetails ? "filled" : "outlined"}
                                        color={advancedOptions.enhanceDetails ? "primary" : "default"}
                                        onClick={() => handleOptionChange('enhanceDetails', true)}
                                        sx={{ borderRadius: '16px' }}
                                    />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    결과 이미지의 디테일과 선명도를 향상시킵니다.
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    스타일 강도: {advancedOptions.styleIntensity}%
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip 
                                        label="약하게" 
                                        variant={advancedOptions.styleIntensity <= 33 ? "filled" : "outlined"}
                                        color={advancedOptions.styleIntensity <= 33 ? "primary" : "default"}
                                        onClick={() => handleOptionChange('styleIntensity', 25)}
                                        sx={{ borderRadius: '16px' }}
                                    />
                                    <Chip 
                                        label="중간" 
                                        variant={advancedOptions.styleIntensity > 33 && advancedOptions.styleIntensity <= 66 ? "filled" : "outlined"}
                                        color={advancedOptions.styleIntensity > 33 && advancedOptions.styleIntensity <= 66 ? "primary" : "default"}
                                        onClick={() => handleOptionChange('styleIntensity', 50)}
                                        sx={{ borderRadius: '16px' }}
                                    />
                                    <Chip 
                                        label="강하게" 
                                        variant={advancedOptions.styleIntensity > 66 ? "filled" : "outlined"}
                                        color={advancedOptions.styleIntensity > 66 ? "primary" : "default"}
                                        onClick={() => handleOptionChange('styleIntensity', 75)}
                                        sx={{ borderRadius: '16px' }}
                                    />
                                    <Chip 
                                        label="최대" 
                                        variant={advancedOptions.styleIntensity >= 95 ? "filled" : "outlined"}
                                        color={advancedOptions.styleIntensity >= 95 ? "primary" : "default"}
                                        onClick={() => handleOptionChange('styleIntensity', 100)}
                                        sx={{ borderRadius: '16px' }}
                                    />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    롤모델의 스타일이 얼마나 강하게 적용될지 결정합니다.
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </EnhancedPaper>

                {/* 액션 버튼 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<CompareIcon />}
                        disabled={isProcessing || !originalImage || !roleModelImage}
                        onClick={handleTransform}
                        sx={{
                            background: 'linear-gradient(45deg, #2196F3 30%, #6A11CB 90%)',
                            boxShadow: '0 4px 20px rgba(106, 17, 203, 0.25)',
                            px: 6,
                            py: 1.5,
                            borderRadius: '28px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            '&.Mui-disabled': {
                                background: '#e0e0e0',
                                color: '#9e9e9e'
                            },
                            '&:hover': {
                                boxShadow: '0 6px 25px rgba(106, 17, 203, 0.35)',
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
                    <Alert 
                        onClose={handleAlertClose} 
                        severity={alertSeverity} 
                        sx={{ 
                            width: '100%',
                            borderRadius: 2,
                            alignItems: 'center',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                        }}
                        variant="filled"
                    >
                        {alertMessage}
                    </Alert>
                </Snackbar>

                {/* 저장된 항목 섹션 */}
                {savedCount > 0 && (
                    <Box sx={{ mt: 6, mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            <BookmarkIcon sx={{ mr: 1, color: '#2196F3' }} />
                            저장된 항목
                        </Typography>
                        <Grid container spacing={3}>
                            {historyItems.filter(item => item.is_saved).map(item => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={`saved-${item.id}`}>
                                    <Card 
                                        elevation={0} 
                                        sx={{ 
                                            position: 'relative', 
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                            }
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="180"
                                            image={item.result_image}
                                            alt="저장된 결과"
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <CardContent sx={{ pt: 2, pb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(item.timestamp)}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ p: 1 }}>
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
                                                    sx={{ ml: 'auto' }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        <Divider sx={{ mt: 4, mb: 4 }} />
                    </Box>
                )}

                {/* 모든 히스토리 항목 */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        <HistoryIcon sx={{ mr: 1, color: '#2196F3' }} />
                        최근 변환 기록
                    </Typography>
                    {historyItems.length > 0 ? (
                        <Grid container spacing={3}>
                            {historyItems.map(item => (
                                <Grid item xs={12} sm={6} md={3} key={item.id}>
                                    <Card 
                                        elevation={0} 
                                        sx={{ 
                                            position: 'relative', 
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                            }
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="180"
                                            image={item.result_image}
                                            alt="변환 결과"
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <CardContent sx={{ pt: 2, pb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(item.timestamp)}
                                            </Typography>
                                            {item.options && (
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                                                    {item.options.preserveColor && (
                                                        <Chip 
                                                            label="색상 보존" 
                                                            size="small" 
                                                            variant="outlined"
                                                            sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.625rem', px: 1 } }}
                                                        />
                                                    )}
                                                    {item.options.enhanceDetails && (
                                                        <Chip 
                                                            label="디테일 향상" 
                                                            size="small" 
                                                            variant="outlined"
                                                            sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.625rem', px: 1 } }}
                                                        />
                                                    )}
                                                    <Chip 
                                                        label={`강도 ${item.options.styleIntensity}%`} 
                                                        size="small" 
                                                        variant="outlined"
                                                        sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.625rem', px: 1 } }}
                                                    />
                                                </Box>
                                            )}
                                        </CardContent>
                                        <CardActions sx={{ p: 1 }}>
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
                                                    sx={{ ml: 'auto' }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box 
                            sx={{ 
                                p: 4, 
                                textAlign: 'center', 
                                bgcolor: 'rgba(33, 150, 243, 0.03)', 
                                borderRadius: 3 
                            }}
                        >
                            <HistoryIcon sx={{ fontSize: 48, color: '#2196F3', opacity: 0.5, mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                                아직 변환 기록이 없습니다. 이미지를 변환하면 여기에 기록됩니다.
                            </Typography>
                        </Box>
                    )}
                </Box>
                
                {/* PRO 버전 특별 기능 배지 */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mt: 6, 
                        mb: 2 
                    }}
                >
                    <Chip
                        icon={<EnhancedEncryptionIcon />}
                        label="PRO 버전 활성화"
                        sx={{
                            bgcolor: 'rgba(106, 17, 203, 0.08)',
                            color: '#6A11CB',
                            fontWeight: 600,
                            borderRadius: '16px',
                            px: 1,
                        }}
                    />
                </Box>
                
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    align="center"
                    sx={{ mb: 4 }}
                >
                    고급 AI 알고리즘, 추가 옵션 및 향상된 품질로 최상의 결과물을 만드세요.
                </Typography>
            </Container>
        </Box>
    );
};

export default FacePro;