import React, { useState } from 'react';
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
  Fade
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import axios from 'axios';

// 드래그 앤 드롭 영역 컴포넌트 - 수정버전
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
              배경 제거 중...
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

// 결과 미리보기 컴포넌트
const ResultPreview = ({ result }) => {
  if (!result) return null;
  
  return (
    <Box
      sx={{
        mt: 3,
        width: '100%',
        height: '400px',
        position: 'relative',
        border: '2px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#f1f1f1', // 체커보드 패턴을 위한 배경색
        backgroundImage: `repeating-conic-gradient(#f9f9f9 0% 25%, #e1e1e1 0% 50%)`,
        backgroundSize: '20px 20px', // 체커보드 패턴 크기
      }}
    >
      <Box
        component="img"
        src={result}
        alt="Transparent Background"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </Box>
  );
};

// BackClear 메인 컴포넌트
const BackClear = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
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
    setResult(null);
  };

  const handleRemoveBackground = async () => {
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

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const response = await axios.post(`${API_URL}/api/backclear`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000, // 적절한 타임아웃으로 조정
    onUploadProgress: (progressEvent) => {
      // 업로드 진행 상태 표시
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      // 진행률 상태 업데이트 코드
    }
});

      if (response.data && (response.data.firebase_url || response.data.result_image_url)) {
        // firebase_url이 있으면 우선 사용, 없으면 result_image_url 사용
        setResult(response.data.firebase_url || response.data.result_image_url);
        setSnackbar({
          open: true, 
          message: response.data.message || '배경이 성공적으로 제거되었습니다!', 
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
      console.error('배경 제거 중 오류 발생:', error);
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
    setResult(null);
  };

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result;
      link.download = `backclear_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({
        open: true, 
        message: '이미지가 다운로드되었습니다!', 
        severity: 'success'
      });
    }
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
            onClick={() => navigate('/back')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            BackClear - 배경 제거
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
                  배경 제거하기
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  이미지를 업로드하면 AI가 자동으로 배경을 제거합니다. 사람, 물체, 제품 등 다양한 대상의 배경을 깔끔하게 제거해보세요.
                </Typography>

                <DropZone 
                  onFileSelect={handleFileSelect}
                  processing={processing}
                  previewUrl={previewUrl}
                />

                {result && <ResultPreview result={result} />}

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
                    startIcon={<CloudUploadIcon />}
                    onClick={handleRemoveBackground}
                    disabled={!file || processing}
                    sx={{
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    }}
                  >
                    배경 제거하기
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    disabled={!result || processing}
                    color="success"
                  >
                    결과 다운로드
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
        <DialogTitle sx={{ fontWeight: 600 }}>BackClear 사용 가이드</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            BackClear는 쉽고 빠르게 이미지의 배경을 제거해주는 AI 기반 도구입니다.
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
            사용 방법:
          </Typography>
          <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
            <li>이미지를 드래그 앤 드롭하거나 클릭하여 업로드합니다.</li>
            <li>배경 제거하기 버튼을 클릭합니다.</li>
            <li>AI가 자동으로 배경을 제거하는 것을 기다립니다.</li>
            <li>배경이 제거된 이미지를 확인하고 다운로드합니다.</li>
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
            유의사항:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>최대 10MB 크기의 PNG, JPG, WEBP 파일을 지원합니다.</li>
            <li>복잡한 배경의 경우 결과가 완벽하지 않을 수 있습니다.</li>
            <li>삭제된 배경은 투명한 배경(알파 채널)으로 대체됩니다.</li>
            <li>처리 시간은 이미지 크기와 복잡도에 따라 달라질 수 있습니다.</li>
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

export default BackClear;