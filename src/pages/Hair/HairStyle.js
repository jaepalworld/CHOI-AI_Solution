// HairStyle.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Slider,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Snackbar,
    FormControl,
    InputLabel,
    Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { storage } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// 스타일이 적용된 컴포넌트
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    background: '#ffffff',
}));

const GradientHeader = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
    padding: theme.spacing(4),
    borderRadius: '16px 16px 0 0',
    marginBottom: theme.spacing(4),
}));

const ImageContainer = styled(Box)({
    position: 'relative',
    height: '400px',
    width: '100%',
    overflow: 'hidden',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
});

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: '8px',
    padding: '12px 24px',
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    '&:hover': {
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
    },
}));

// 성별에 따른 헤어스타일 옵션
const hairStyleOptions = {
    male: {
        short: ['크루 컷', '페이드', '언더컷', '포마드'],
        medium: ['퀴프', '슬릭백', '텍스처드 크롭', '사이드파트'],
        long: ['맨 번', '어깨 길이', '레이어드 컷']
    },
    female: {
        short: ['픽시 컷', '보브 컷', '비대칭 컷', '레이어드 숏'],
        medium: ['롭 컷', '레이어드 미디엄', '어깨 길이 웨이브'],
        long: ['롱 레이어', '비치 웨이브', '스트레이트 롱', 'V컷']
    }
};

const HairStyle = () => {
    // 상태 관리
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageTwo, setSelectedImageTwo] = useState(null);
    const [resultImage, setResultImage] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedLength, setSelectedLength] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('');
    const [resultHistory, setResultHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // localStorage에서 기록 불러오기
    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('resultHistory');
            if (storedHistory) {
                setResultHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error('기록 불러오기 오류:', error);
        }
    }, []);

    // 이미지 업로드 핸들러
    const handleImageUpload = useCallback((event, setImage) => {
        try {
            const file = event.target.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) {
                    setError('파일 크기는 10MB 미만이어야 합니다');
                    return;
                }
                if (!file.type.startsWith('image/')) {
                    setError('이미지 파일을 업로드해주세요');
                    return;
                }
                setImage(file);
                setError('');
            }
        } catch (error) {
            console.error('이미지 업로드 오류:', error);
            setError('이미지 업로드 중 오류가 발생했습니다');
        }
    }, []);

    // 스타일 선택 핸들러
    const handleGenderChange = useCallback((event) => {
        setSelectedGender(event.target.value);
        setSelectedLength('');
        setSelectedStyle('');
    }, []);

    const handleLengthChange = useCallback((event) => {
        setSelectedLength(event.target.value);
        setSelectedStyle('');
    }, []);

    const handleStyleChange = useCallback((event) => {
        setSelectedStyle(event.target.value);
    }, []);

    // 업로드 핸들러
    const handleUploadClick = async () => {
        try {
            setLoading(true);
            setError('');

            if (!selectedImage || !selectedImageTwo) {
                setError('두 이미지를 모두 선택해주세요');
                return;
            }

            if (!selectedGender || !selectedLength || !selectedStyle) {
                setError('스타일 선택을 완료해주세요');
                return;
            }

            const storageRefOne = ref(storage, `images/${Date.now()}-original.jpg`);
            const storageRefTwo = ref(storage, `images/${Date.now()}-reference.jpg`);

            await Promise.all([
                uploadBytes(storageRefOne, selectedImage),
                uploadBytes(storageRefTwo, selectedImageTwo)
            ]);

            const [downloadUrlOne, downloadUrlTwo] = await Promise.all([
                getDownloadURL(storageRefOne),
                getDownloadURL(storageRefTwo)
            ]);

            // AI 처리 로직 추가 예정
            setResultImage(downloadUrlOne);

            const updatedHistory = [...resultHistory, downloadUrlOne];
            setResultHistory(updatedHistory);
            localStorage.setItem('resultHistory', JSON.stringify(updatedHistory));

        } catch (error) {
            console.error('이미지 처리 오류:', error);
            setError('이미지 처리 중 오류가 발생했습니다');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseError = () => {
        setError('');
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', py: 4, bgcolor: '#f5f5f5' }}>
            <StyledPaper>
                <GradientHeader>
                    <Typography variant="h3" align="center" sx={{ color: '#ffffff', fontWeight: 700, mb: 1 }}>
                        HAIR AI
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ color: '#ffffff', opacity: 0.9 }}>
                        AI로 당신의 헤어스타일을 변화시켜보세요
                    </Typography>
                </GradientHeader>

                <Grid container spacing={4}>
                    {/* 왼쪽 패널: 소스 이미지 */}
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <StyledPaper variant="outlined">
                                    <ImageContainer>
                                        {selectedImage ? (
                                            <img
                                                src={URL.createObjectURL(selectedImage)}
                                                alt="선택된 이미지"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        ) : (
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100%',
                                                bgcolor: '#f8f9fa',
                                                borderRadius: '12px'
                                            }}>
                                                <Typography variant="h6" color="text.secondary">
                                                    사진을 업로드해주세요
                                                </Typography>
                                            </Box>
                                        )}
                                    </ImageContainer>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="source-image-upload"
                                            type="file"
                                            onChange={(e) => handleImageUpload(e, setSelectedImage)}
                                        />
                                        <label htmlFor="source-image-upload">
                                            <StyledButton variant="contained" component="span">
                                                얼굴 사진을 올려주세요
                                            </StyledButton>
                                        </label>
                                    </Box>
                                </StyledPaper>
                            </Grid>

                            {/* 스타일 선택 섹션 */}
                            <Grid item xs={12}>
                                <StyledPaper variant="outlined">
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            스타일 선택
                                        </Typography>

                                        <StyledFormControl fullWidth>
                                            <InputLabel>성별</InputLabel>
                                            <Select
                                                value={selectedGender}
                                                onChange={handleGenderChange}
                                                label="성별"
                                            >
                                                <MenuItem value="">성별 선택</MenuItem>
                                                <MenuItem value="male">남성</MenuItem>
                                                <MenuItem value="female">여성</MenuItem>
                                            </Select>
                                        </StyledFormControl>

                                        <Collapse in={!!selectedGender}>
                                            <StyledFormControl fullWidth>
                                                <InputLabel>머리 길이</InputLabel>
                                                <Select
                                                    value={selectedLength}
                                                    onChange={handleLengthChange}
                                                    label="머리 길이"
                                                >
                                                    <MenuItem value="">길이 선택</MenuItem>
                                                    <MenuItem value="short">짧은 머리</MenuItem>
                                                    <MenuItem value="medium">중간 머리</MenuItem>
                                                    <MenuItem value="long">긴 머리</MenuItem>
                                                </Select>
                                            </StyledFormControl>
                                        </Collapse>

                                        <Collapse in={!!selectedLength}>
                                            <StyledFormControl fullWidth>
                                                <InputLabel>헤어스타일</InputLabel>
                                                <Select
                                                    value={selectedStyle}
                                                    onChange={handleStyleChange}
                                                    label="헤어스타일"
                                                >
                                                    <MenuItem value="">스타일 선택</MenuItem>
                                                    {selectedGender && selectedLength &&
                                                        hairStyleOptions[selectedGender][selectedLength].map((style) => (
                                                            <MenuItem key={style} value={style}>
                                                                {style}
                                                            </MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </StyledFormControl>
                                        </Collapse>
                                    </Box>

                                    {/* 참조 이미지 업로드 */}
                                    <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                                        {selectedImageTwo ? (
                                            <img
                                                src={URL.createObjectURL(selectedImageTwo)}
                                                alt="참조"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        ) : (
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100%',
                                                bgcolor: '#f8f9fa',
                                                borderRadius: '12px'
                                            }}>
                                                <Typography variant="h6" color="text.secondary">
                                                    참조할 헤어스타일 이미지를 업로드해주세요
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="reference-image-upload"
                                            type="file"
                                            onChange={(e) => handleImageUpload(e, setSelectedImageTwo)}
                                        />
                                        <label htmlFor="reference-image-upload">
                                            <StyledButton variant="contained" component="span">
                                                스타일 사진을 올려주세요
                                            </StyledButton>
                                        </label>
                                    </Box>
                                </StyledPaper>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* 오른쪽 패널: 결과 이미지 */}
                    <Grid item xs={12} md={6}>
                        <StyledPaper variant="outlined">
                            <Box sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: '600px'
                            }}>
                                {loading ? (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <CircularProgress size={60} />
                                        <Typography variant="h6" sx={{ mt: 2 }}>
                                            이미지 처리 중...
                                        </Typography>
                                    </Box>
                                ) : resultImage ? (
                                    <img
                                        src={resultImage}
                                        alt="결과"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '100%',
                                            objectFit: 'contain',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                ) : (
                                    <Box sx={{
                                        textAlign: 'center',
                                        p: 4,
                                        bgcolor: '#f8f9fa',
                                        borderRadius: '12px',
                                        width: '100%'
                                    }}>
                                        <Typography variant="h6" color="text.secondary">
                                            변환된 헤어스타일이 여기에 표시됩니다
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            사진을 업로드하고 스타일을 선택해주세요
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </StyledPaper>
                    </Grid>
                </Grid>

                {/* 변환 버튼 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <StyledButton
                        variant="contained"
                        size="large"
                        onClick={handleUploadClick}
                        disabled={loading || !selectedImage || !selectedImageTwo || !selectedStyle}
                        sx={{
                            minWidth: '200px',
                            background: loading ?
                                'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)' :
                                'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
                        }}
                    >
                        {loading ? '처리 중...' : '헤어스타일 변환하기'}
                    </StyledButton>
                </Box>

                {/* 히스토리 섹션 */}
                {resultHistory.length > 0 && (
                    <Box sx={{ mt: 6 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            스타일 히스토리
                        </Typography>
                        <Grid container spacing={2}>
                            {resultHistory.map((image, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            paddingTop: '100%',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        }}
                                    >
                                        <img
                                            src={image}
                                            alt={`결과 ${index + 1}`}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* 에러 메시지 */}
                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={handleCloseError}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseError}
                        severity="error"
                        sx={{
                            width: '100%',
                            borderRadius: '8px'
                        }}
                    >
                        {error}
                    </Alert>
                </Snackbar>
            </StyledPaper>
        </Box>
    );
};

export default HairStyle;