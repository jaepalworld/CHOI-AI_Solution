import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareIcon from '@mui/icons-material/Compare';
import { styled } from '@mui/material/styles';

// Firebase 관련 임포트
import { auth, storage } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

const FaceStyle = () => {
    const navigate = useNavigate();

    // 상태 관리
    const [originalImage, setOriginalImage] = useState(null);           // 원본 이미지 파일
    const [previewImage, setPreviewImage] = useState(null);            // 미리보기 이미지 URL
    const [transformedImage, setTransformedImage] = useState(null);    // 변환된 이미지 URL
    const [loading, setLoading] = useState(false);                     // 로딩 상태
    const [error, setError] = useState('');                            // 에러 메시지
    const [success, setSuccess] = useState('');                        // 성공 메시지

    // 이미지 업로드 처리
    const handleImageUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            // 파일 크기 제한 체크 (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('파일 크기는 5MB 이하여야 합니다');
                return;
            }

            // 파일 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(file);
                setPreviewImage(reader.result);
                setTransformedImage(null); // 변환된 이미지 초기화
            };
            reader.readAsDataURL(file);
        }
    }, []);

    // 이미지 삭제 처리
    const handleImageDelete = useCallback(() => {
        setOriginalImage(null);
        setPreviewImage(null);
        setTransformedImage(null);
    }, []);

    // 이미지 변환 처리
    const handleTransform = async () => {
        if (!originalImage) {
            setError('먼저 이미지를 업로드해 주세요');
            return;
        }

        setLoading(true);
        try {
            // Firebase Storage에 이미지 업로드
            const storageRef = ref(storage, `face-transformations/${auth.currentUser.uid}/${Date.now()}_${originalImage.name}`);
            await uploadBytes(storageRef, originalImage);
            const downloadURL = await getDownloadURL(storageRef);

            // AI 서비스 호출 (현재는 시뮬레이션)
            // 실제 구현시 여기에 AI API 호출 코드가 들어갑니다
            setTimeout(() => {
                setTransformedImage(previewImage);
                setSuccess('이미지 변환이 완료되었습니다!');
                setLoading(false);
            }, 2000);

        } catch (error) {
            console.error('이미지 변환 중 오류 발생:', error);
            setError('이미지 변환에 실패했습니다. 다시 시도해 주세요.');
            setLoading(false);
        }
    };

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

                {/* 메인 컨텐츠 */}
                <Grid container spacing={4}>
                    {/* 업로드 섹션 */}
                    <Grid item xs={12} md={6}>
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
                            <Typography variant="h5" sx={{ mb: 4 }}>원본 이미지</Typography>
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
                                    overflow: 'hidden'
                                }}
                            >
                                {previewImage ? (
                                    <>
                                        <Box
                                            component="img"
                                            src={previewImage}
                                            alt="미리보기"
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                        <IconButton
                                            onClick={handleImageDelete}
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
                                    <Button
                                        component="label"
                                        variant="contained"
                                        startIcon={<CloudUploadIcon />}
                                        sx={{
                                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                        }}
                                    >
                                        이미지 업로드
                                        <VisuallyHiddenInput type="file" onChange={handleImageUpload} accept="image/*" />
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* 결과 섹션 */}
                    <Grid item xs={12} md={6}>
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
                                    overflow: 'hidden'
                                }}
                            >
                                {loading ? (
                                    <CircularProgress />
                                ) : transformedImage ? (
                                    <Box
                                        component="img"
                                        src={transformedImage}
                                        alt="변환됨"
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
                        </Paper>
                    </Grid>
                </Grid>

                {/* 액션 버튼 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<CompareIcon />}
                        onClick={handleTransform}
                        disabled={!originalImage || loading}
                        sx={{
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                            px: 4,
                            py: 1.5
                        }}
                    >
                        이미지 변환하기
                    </Button>
                </Box>

                {/* 알림 메시지 */}
                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={() => setError('')}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={!!success}
                    autoHideDuration={6000}
                    onClose={() => setSuccess('')}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
                        {success}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default FaceStyle;