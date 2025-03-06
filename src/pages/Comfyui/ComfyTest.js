import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    PhotoCamera,
    AddPhotoAlternate,
    CloudUpload
} from '@mui/icons-material';

const styleOptions = [
    { id: 'natural', name: '자연스러운 합성' },
    { id: 'artistic', name: '예술적 변환' },
    { id: 'cartoon', name: '카툰 스타일' },
    { id: 'realistic', name: '사실적 합성' }
];

const ComfyTest = () => {
    const [faceImage, setFaceImage] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [faceFile, setFaceFile] = useState(null);
    const [productFile, setProductFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState('natural');
    const [tabValue, setTabValue] = useState(0);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch('http://localhost:8001/history');
            const data = await response.json();
            setHistory(data);
        } catch (error) {
            console.error('History fetch failed:', error);
        }
    };

    const handleImagePreview = (file, setImage, setFile) => {
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!faceFile || !productFile) {
            alert('두 이미지를 모두 선택해주세요.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('face_image', faceFile);
        formData.append('product_image', productFile);
        formData.append('style_option', selectedStyle);

        try {
            const response = await fetch('http://localhost:8001/upload-images', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            setResult(data);
            if (data.status === 'success') {
                fetchHistory();
            }
        } catch (error) {
            alert('오류가 발생했습니다: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const ImageUploadCard = ({ title, image, onChange }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Box
                    sx={{
                        position: 'relative',
                        height: 200,
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        '&:hover': {
                            borderColor: 'primary.main',
                        },
                    }}
                    component="label"
                >
                    <input
                        type="file"
                        hidden
                        onChange={onChange}
                        accept="image/*"
                    />
                    {image ? (
                        <CardMedia
                            component="img"
                            image={image}
                            alt={title}
                            sx={{
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <AddPhotoAlternate sx={{ fontSize: 40, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                클릭하여 이미지 업로드
                            </Typography>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    ComfyUI 테스트 화면
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} centered>
                        <Tab label="이미지 업로드" />
                        <Tab label="처리 히스토리" />
                    </Tabs>
                </Box>

                {tabValue === 0 && (
                    <>
                        <Typography variant="body1" gutterBottom align="center" color="text.secondary">
                            얼굴 이미지와 제품 이미지를 업로드하여 변환을 시작하세요
                        </Typography>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>스타일 선택</InputLabel>
                            <Select
                                value={selectedStyle}
                                onChange={(e) => setSelectedStyle(e.target.value)}
                                label="스타일 선택"
                            >
                                {styleOptions.map(style => (
                                    <MenuItem key={style.id} value={style.id}>
                                        {style.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={6}>
                                <ImageUploadCard
                                    title="얼굴 이미지"
                                    image={faceImage}
                                    onChange={(e) => handleImagePreview(e.target.files[0], setFaceImage, setFaceFile)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <ImageUploadCard
                                    title="제품 이미지"
                                    image={productImage}
                                    onChange={(e) => handleImagePreview(e.target.files[0], setProductImage, setProductFile)}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={handleSubmit}
                                disabled={loading || !faceFile || !productFile}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                            >
                                {loading ? '처리중...' : '이미지 변환하기'}
                            </Button>
                        </Box>

                        {result && (
                            <Paper sx={{ mt: 4, p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="h6" gutterBottom>
                                    처리 결과
                                </Typography>
                                <pre style={{
                                    overflow: 'auto',
                                    backgroundColor: '#f5f5f5',
                                    padding: '1rem',
                                    borderRadius: '4px'
                                }}>
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </Paper>
                        )}
                    </>
                )}

                {tabValue === 1 && (
                    <Grid container spacing={3}>
                        {Array.isArray(history) && history.map((item) => (  // 배열인지 확인
                            <Grid item xs={12} md={6} lg={4} key={item.session_id}>
                                <Card>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={item.result_url}
                                        alt="처리 결과"
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary">
                                            스타일: {item.style_option}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            처리일시: {new Date(item.timestamp).toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {(!history || history.length === 0) && (
                            <Grid item xs={12}>
                                <Typography variant="body1" align="center" color="text.secondary">
                                    처리 히스토리가 없습니다.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Paper>
        </Container>
    );
};

export default ComfyTest;