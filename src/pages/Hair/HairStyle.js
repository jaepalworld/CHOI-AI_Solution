import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Paper,
  Grid,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Fade,
  TextField,
  Card,
  CardMedia,
  CardActions,
  CardContent,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import axios from 'axios';

// 드래그 앤 드롭 영역 컴포넌트
const DropZone = ({ onFileSelect, processing, previewUrl }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelect(file);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileInput}
        disabled={processing}
      />
      
      <Paper
        elevation={3}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !processing && fileInputRef.current.click()}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          borderRadius: '16px',
          transition: 'all 0.3s ease',
          background: previewUrl 
            ? `url(${previewUrl}) no-repeat center/contain`
            : 'white',
          position: 'relative',
          cursor: processing ? 'default' : 'pointer',
          '&:hover': {
            borderColor: processing ? 'divider' : 'primary.main',
            background: previewUrl 
              ? `url(${previewUrl}) no-repeat center/contain` 
              : isDragging ? 'rgba(33, 150, 243, 0.05)' : 'white'
          }
        }}
      >
        {!previewUrl && (
          <Box sx={{ textAlign: 'center', p: 3, zIndex: 1 }}>
            <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6">
              이미지를 드래그하거나 클릭하여 업로드
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              PNG, JPG, WEBP 파일 지원 (최대 10MB)
            </Typography>
          </Box>
        )}
        
        {processing && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.8)',
              zIndex: 2
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              헤어스타일 생성 중...
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

// 결과 미리보기 카드 컴포넌트
const ResultCard = ({ image, index, onDownload }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        image={image.url || image.firebase_url}
        alt={`헤어스타일 ${index + 1}`}
        sx={{ 
          height: 280, 
          objectFit: 'cover',
          backgroundPosition: 'center top'
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6">
          헤어스타일 {index + 1}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          startIcon={<DownloadIcon />}
          onClick={() => onDownload(image.url || image.firebase_url, `hairstyle_${index + 1}.png`)}
          fullWidth
        >
          다운로드
        </Button>
      </CardActions>
    </Card>
  );
};

// 결과 그리드 컴포넌트
const ResultsGrid = ({ results, onDownload }) => {
  if (!results || results.length === 0) return null;
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        생성된 헤어스타일
      </Typography>
      <Grid container spacing={3}>
        {results.map((result, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <ResultCard 
              image={result} 
              index={index} 
              onDownload={onDownload}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// HairStyle 메인 컴포넌트
const HairStyle = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    // 파일 미리보기 생성
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(selectedFile);
    
    // 결과 초기화
    setResults([]);
  };

  const handleGenerateHairStyles = async () => {
    if (!file) {
      setSnackbar({
        open: true, 
        message: '이미지를 먼저 업로드해주세요.', 
        severity: 'warning'
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // 파라미터 JSON 생성
      const params = {
        hair_dir: 'D:\\StabilityMatrix-win-x64\\HairImage',
        hair_count: 4,
        face_restoration: 0.5,
        batch_size: 4
      };
      
      formData.append('params', JSON.stringify(params));

      const API_URL = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${API_URL}/api/hairstyle`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 1800000, // 30분 타임아웃
      });

      console.log("API 응답:", response.data);

      if (response.data && response.data.results) {
        setResults(response.data.results);
        setSnackbar({
          open: true, 
          message: response.data.message || '헤어스타일이 성공적으로 생성되었습니다!', 
          severity: 'success'
        });
      } else {
        console.error("Unexpected response format", response.data);
        setSnackbar({
          open: true, 
          message: '예상치 못한 응답 형식입니다.', 
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('헤어스타일 생성 중 오류 발생:', error);
      setSnackbar({
        open: true, 
        message: `오류 발생: ${error.response?.data?.detail || error.message || '알 수 없는 오류'}`, 
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl('');
    setResults([]);
  };

  const handleDownload = (url, filename) => {
    // 다운로드 URL에서 API_URL 부분이 있으면 대체
    let downloadUrl = url;
    if (url && url.includes('/view?filename=')) {
      // ComfyUI URL을 직접 사용
      downloadUrl = url;
    }

    // 다운로드 링크 생성
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || `hairstyle_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({
      open: true, 
      message: '이미지가 다운로드되었습니다!', 
      severity: 'success'
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pt: 8 }}>
      {/* 헤더 */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            sx={{ mr: 2 }}
            onClick={() => navigate('/hair')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            HairStyle - 헤어스타일 변경
          </Typography>
          <IconButton color="inherit" onClick={() => setHelpOpen(true)}>
            <HelpOutlineIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Fade in timeout={800}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  bgcolor: 'white',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
                }}
              >
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                  새로운 헤어스타일 체험하기
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  이미지를 업로드하면 AI가 다양한 헤어스타일을 시뮬레이션합니다. 원하는 헤어스타일 유형을 선택해보세요.
                </Typography>

                <Grid container spacing={4}>
                  {/* 이미지 업로드 영역 */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      1. 이미지 업로드
                    </Typography>
                    <DropZone 
                      onFileSelect={handleFileSelect}
                      processing={processing}
                      previewUrl={previewUrl}
                    />
                  </Grid>

                  {/* 설정 영역 */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      2. 헤어스타일 설정
                    </Typography>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body1" paragraph>
                        HairImage 폴더에서 4가지 헤어스타일을 자동으로 생성합니다.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        기본 설정: 4개 스타일, 얼굴 복원 강도 0.5
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        사용 방법
                      </Typography>
                      <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
                        <li>얼굴이 잘 보이는 정면 이미지를 업로드해주세요.</li>
                        <li>'헤어스타일 변경하기' 버튼을 클릭하세요.</li>
                        <li>AI가 4가지 헤어스타일을 생성합니다.</li>
                        <li>마음에 드는 스타일을 다운로드하세요.</li>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* 결과 이미지 영역 */}
                <ResultsGrid 
                  results={results}
                  onDownload={handleDownload}
                />

                <Box
                  sx={{ 
                    mt: 3, 
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: 2
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    onClick={handleReset}
                    disabled={!file || processing}
                  >
                    초기화
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<ContentCutIcon />}
                    onClick={handleGenerateHairStyles}
                    disabled={!file || processing}
                    sx={{
                      background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                    }}
                  >
                    헤어스타일 변경하기
                  </Button>
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      {/* 도움말 대화상자 */}
      <Dialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>HairStyle 사용 가이드</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            HairStyle은 AI를 이용해 다양한 헤어스타일을 시뮬레이션하는 도구입니다.
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
            사용 방법:
          </Typography>
          <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
            <li>얼굴이 잘 보이는 정면 이미지를 업로드합니다.</li>
            <li>원하는 헤어스타일 유형을 선택합니다.</li>
            <li>생성할 헤어스타일 수와 얼굴 복원 강도를 조정합니다.</li>
            <li>'헤어스타일 변경하기' 버튼을 클릭합니다.</li>
            <li>생성된 결과를 확인하고 마음에 드는 스타일을 다운로드합니다.</li>
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
            유의사항:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>얼굴이 정면으로 보이는 사진에서 가장 좋은 결과를 얻을 수 있습니다.</li>
            <li>헤어스타일 생성에는 약 1~3분 정도 소요될 수 있습니다.</li>
            <li>얼굴 복원 강도를 높이면 원본 얼굴과 유사하게 유지되지만, 낮추면 헤어스타일 모델의 얼굴 특성이 더 반영됩니다.</li>
            <li>결과는 시뮬레이션일 뿐이며, 실제 헤어스타일과 차이가 있을 수 있습니다.</li>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 알림 메시지 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HairStyle;