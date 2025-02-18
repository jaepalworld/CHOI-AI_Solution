import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    Container,
    Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

// 스타일된 컴포넌트
const ImageUploadBox = styled(Box)({
    width: '100%',
    height: '300px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    marginBottom: '16px',
    overflow: 'hidden'
});

const UploadPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    height: '100%',
}));

const AIAdvertising = () => {
    const [faceImage, setFaceImage] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [error, setError] = useState('');

    const handleImageUpload = (e, setImage) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setImage(URL.createObjectURL(file));
                setError('');
            } else {
                setError('이미지 파일만 업로드 가능합니다.');
            }
        }
    };

    const handleTransform = () => {
        if (!faceImage || !productImage) {
            setError('얼굴 사진과 제품 사진을 모두 업로드해주세요.');
            return;
        }
        // 실제 구현에서는 여기에 이미지 변환 로직이 들어갑니다
        setResultImage(faceImage); // 임시로 얼굴 이미지를 결과로 표시
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ overflow: 'hidden' }}>
                {/* 헤더 */}
                <Box sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 3,
                    textAlign: 'center'
                }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        HAIR AI
                    </Typography>
                    <Typography variant="subtitle1">
                        AI로 이미지를 변환해보세요
                    </Typography>
                </Box>

                <Box sx={{ p: 4 }}>
                    <Grid container spacing={4}>
                        {/* 왼쪽 패널: 이미지 업로드 */}
                        <Grid item xs={12} md={6}>
                            <Grid container spacing={3}>
                                {/* 얼굴 이미지 업로드 */}
                                <Grid item xs={12}>
                                    <UploadPaper elevation={2}>
                                        <Typography variant="h6" gutterBottom>
                                            얼굴 사진 업로드
                                        </Typography>
                                        <ImageUploadBox>
                                            {faceImage ? (
                                                <img
                                                    src={faceImage}
                                                    alt="얼굴 사진"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            ) : (
                                                <Typography color="text.secondary">
                                                    얼굴 사진을 업로드해주세요
                                                </Typography>
                                            )}
                                        </ImageUploadBox>
                                        <input
                                            type="file"
                                            id="face-image"
                                            hidden
                                            onChange={(e) => handleImageUpload(e, setFaceImage)}
                                            accept="image/*"
                                        />
                                        <label htmlFor="face-image">
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                fullWidth
                                            >
                                                얼굴 사진 선택
                                            </Button>
                                        </label>
                                    </UploadPaper>
                                </Grid>

                                {/* 제품 이미지 업로드 */}
                                <Grid item xs={12}>
                                    <UploadPaper elevation={2}>
                                        <Typography variant="h6" gutterBottom>
                                            제품 사진 업로드
                                        </Typography>
                                        <ImageUploadBox>
                                            {productImage ? (
                                                <img
                                                    src={productImage}
                                                    alt="제품 사진"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            ) : (
                                                <Typography color="text.secondary">
                                                    제품 사진을 업로드해주세요
                                                </Typography>
                                            )}
                                        </ImageUploadBox>
                                        <input
                                            type="file"
                                            id="product-image"
                                            hidden
                                            onChange={(e) => handleImageUpload(e, setProductImage)}
                                            accept="image/*"
                                        />
                                        <label htmlFor="product-image">
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                fullWidth
                                            >
                                                제품 사진 선택
                                            </Button>
                                        </label>
                                    </UploadPaper>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* 오른쪽 패널: 결과 이미지 */}
                        <Grid item xs={12} md={6}>
                            <UploadPaper elevation={2} sx={{ height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    변환 결과
                                </Typography>
                                <Box sx={{
                                    height: 'calc(100% - 80px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: '#f5f5f5',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}>
                                    {resultImage ? (
                                        <img
                                            src={resultImage}
                                            alt="변환 결과"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    ) : (
                                        <Typography color="text.secondary">
                                            이미지를 업로드하고 변환 버튼을 눌러주세요
                                        </Typography>
                                    )}
                                </Box>
                            </UploadPaper>
                        </Grid>
                    </Grid>

                    {/* 변환 버튼 */}
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleTransform}
                            disabled={!faceImage || !productImage}
                            sx={{ px: 6, py: 1.5 }}
                        >
                            이미지 변환하기
                        </Button>
                    </Box>

                    {/* 에러 메시지 */}
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default AIAdvertising;