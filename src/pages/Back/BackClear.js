import React, { useState, useEffect } from 'react';
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
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// 드래그 앤 드롭 영역 컴포넌트
const DropZone = ({ onFileSelect, processing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

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
      handleFile(file);
      onFileSelect(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
      onFileSelect(file);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
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
        id="file-upload"
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
          background: isDragging 
            ? 'rgba(33, 150, 243, 0.05)'
            : previewUrl 
              ? `url(${previewUrl}) no-repeat center/contain`
              : 'white',
          position: 'relative',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            background: previewUrl 
              ? `url(${previewUrl}) no-repeat center/contain` 
              : 'rgba(33, 150, 243, 0.05)'
          }
        }}
        onClick={() => !processing && document.getElementById('file-upload').click()}
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

// BackClear 메인 컴포넌트
const BackClear = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    // 여기서는 UI만 구현하므로 가상의 처리 시간을 설정
    setProcessing(true);
    
    // 가상의 처리 시간 (실제로는 ComfyUI API 호출 로직이 들어갈 부분)
    setTimeout(() => {
      setProcessing(false);
      // 결과 이미지는 임시로 원본 이미지를 사용 (실제로는 배경이 제거된 이미지)
      const reader = new FileReader();
      reader.onload = () => {
        setResult(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      
      // 성공 메시지 표시
      setSnackbar({
        open: true, 
        message: '배경이 성공적으로 제거되었습니다!', 
        severity: 'success'
      });
    }, 3000);
  };

  const handleReset = () => {
    setFile(null);
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

              <DropZone onFileSelect={handleFileSelect} processing={processing} />

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
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  disabled={!result || processing}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  }}
                >
                  결과 다운로드
                </Button>
              </Box>
            </Paper>
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
