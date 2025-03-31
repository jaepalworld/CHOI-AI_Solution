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
  TextField,
  CircularProgress,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Fade,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ImageIcon from '@mui/icons-material/Image';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import axios from 'axios';

// 배경 카테고리 옵션
const CATEGORY_OPTIONS = [
  { value: "Beach", label: "해변" },
  { value: "Neon City", label: "네온 시티" },
  { value: "newyork City", label: "뉴욕 시티" },
  { value: "underwater", label: "수중 세계" }
];

// 시간대 옵션
const DAY_OPTIONS = [
  { value: "daylight", label: "주간" },
  { value: "nighttime", label: "야간" }
];

// 조명 방향 옵션
const LIGHT_OPTIONS = [
  { value: "Top", label: "위쪽" },
  { value: "Bottom", label: "아래쪽" },
  { value: "Left", label: "왼쪽" },
  { value: "Right", label: "오른쪽" },
  { value: "Center", label: "중앙" }
];

// 성별 옵션
const GENDER_OPTIONS = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" }
];

// 이미지 업로드 컴포넌트
const ImageUploadArea = ({ onFileSelect, processing, previewUrl }) => {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '250px' }}>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={processing}
      />
      
      <Paper
        elevation={3}
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
          borderColor: 'divider',
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
              : processing ? 'white' : 'rgba(33, 150, 243, 0.05)'
          }
        }}
      >
        {!previewUrl && (
          <Box sx={{ textAlign: 'center', p: 3, zIndex: 1 }}>
            <AddPhotoAlternateIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6">
              주체 이미지 업로드
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              배경을 교체할 이미지를 업로드하세요
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
              배경 생성 중...
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
    <Paper
      elevation={3}
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        height: '300px',
        width: '100%',
        position: 'relative'
      }}
    >
      <Box
        component="img"
        src={result}
        alt="Generated Background"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </Paper>
  );
};

// BackCreate 메인 컴포넌트
const BackCreate = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [info, setInfo] = useState('');
  const [day, setDay] = useState('');
  const [gender, setGender] = useState('');
  const [category, setCategory] = useState('');
  const [light, setLight] = useState('');
  const [processing, setProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleFileSelect = (selectedFile) => {
    setImage(selectedFile);
    
    // 파일 미리보기 생성
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleGenerateBackground = async () => {
    if (!info.trim()) {
      setSnackbar({
        open: true, 
        message: '배경 설명을 입력해주세요.', 
        severity: 'error'
      });
      return;
    }

    if (!day) {
      setSnackbar({
        open: true, 
        message: '시간대를 선택해주세요.', 
        severity: 'error'
      });
      return;
    }

    if (!gender) {
      setSnackbar({
        open: true, 
        message: '성별을 선택해주세요.', 
        severity: 'error'
      });
      return;
    }

    if (!category) {
      setSnackbar({
        open: true, 
        message: '배경 유형을 선택해주세요.', 
        severity: 'error'
      });
      return;
    }

    if (!light) {
      setSnackbar({
        open: true, 
        message: '조명 방향을 선택해주세요.', 
        severity: 'error'
      });
      return;
    }

    if (!image) {
      setSnackbar({
        open: true, 
        message: '이미지를 업로드해주세요.', 
        severity: 'error'
      });
      return;
    }

    setGeneratedImage(null);
    setProcessing(true);
    
    try {
      const promptData = {
        day,
        gender,
        category,
        light,
        info
      };

      const formData = new FormData();
      formData.append('image', image);
      formData.append('prompt', JSON.stringify(promptData));

      const response = await axios.post('http://localhost:8002/background', formData, {
        withCredentials: true,
        timeout: 120000
      });

      if (response.data && response.data.image_url) {
        setGeneratedImage(response.data.image_url);
        setSnackbar({
          open: true, 
          message: '배경이 성공적으로 생성되었습니다!', 
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
      console.error('이미지 생성중 오류 발생:', error);
      setSnackbar({
        open: true, 
        message: `오류 발생: ${error.message || '알 수 없는 오류'}`, 
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreviewUrl('');
    setInfo('');
    setDay('');
    setGender('');
    setCategory('');
    setLight('');
    setGeneratedImage(null);
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `backcreate_${new Date().getTime()}.png`;
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
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pt: 8, pb: 6 }}>
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
              background: 'linear-gradient(45deg, #FF9800 30%, #FFCA28 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            BackCreate - 배경 생성
          </Typography>
          <IconButton color="inherit" onClick={() => setHelpOpen(true)}>
            <HelpOutlineIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
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
                  AI로 배경 생성하기
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  텍스트 설명과 이미지를 입력하면 AI가 배경을 생성하고 이미지와 합성합니다.
                </Typography>

                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="배경 프롬프트"
                        variant="outlined"
                        placeholder="원하는 배경에 대한 프롬프트를 입력해주세요"
                        value={info}
                        onChange={(e) => setInfo(e.target.value)}
                        disabled={processing}
                        sx={{ mb: 2 }}
                      />
                      


                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                          <FormControl fullWidth>
                            <InputLabel id="day-select-label">시간대</InputLabel>
                            <Select
                              labelId="day-select-label"
                              value={day}
                              label="시간대"
                              onChange={(e) => setDay(e.target.value)}
                              disabled={processing}
                            >
                              {DAY_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                          <FormControl fullWidth>
                            <InputLabel id="gender-select-label">성별</InputLabel>
                            <Select
                              labelId="gender-select-label"
                              value={gender}
                              label="성별"
                              onChange={(e) => setGender(e.target.value)}
                              disabled={processing}
                            >
                              {GENDER_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>

                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                          <FormControl fullWidth>
                            <InputLabel id="category-select-label">배경 유형</InputLabel>
                            <Select
                              labelId="category-select-label"
                              value={category}
                              label="배경 유형"
                              onChange={(e) => setCategory(e.target.value)}
                              disabled={processing}
                            >
                              {CATEGORY_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                          <FormControl fullWidth>
                            <InputLabel id="light-select-label">조명 방향</InputLabel>
                            <Select
                              labelId="light-select-label"
                              value={light}
                              label="조명 방향"
                              onChange={(e) => setLight(e.target.value)}
                              disabled={processing}
                            >
                              {LIGHT_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        주체 이미지 (필수)
                      </Typography>
                      <ImageUploadArea 
                        onFileSelect={handleFileSelect} 
                        processing={processing} 
                        previewUrl={previewUrl}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      생성된 배경 이미지
                    </Typography>
                    <Box
                      sx={{
                        height: '300px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '16px',
                        bgcolor: '#f5f5f5',
                        mb: 3
                      }}
                    >
                      {generatedImage ? (
                        <ResultPreview result={generatedImage} />
                      ) : (
                        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                          <ImageIcon sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
                          <Typography>
                            생성된 이미지가 여기에 표시됩니다
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    onClick={handleReset}
                    disabled={processing}
                  >
                    초기화
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AutoFixHighIcon />}
                    onClick={handleGenerateBackground}
                    disabled={processing}
                    sx={{
                      background: 'linear-gradient(45deg, #FF9800 30%, #FFCA28 90%)',
                      boxShadow: '0 3px 5px 2px rgba(255, 152, 0, 0.3)',
                    }}
                  >
                    배경 생성하기
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    disabled={!generatedImage || processing}
                    color="success"
                  >
                    다운로드
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
        <DialogTitle sx={{ fontWeight: 600 }}>BackCreate 사용 가이드</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            BackCreate는 텍스트 설명과 이미지를 기반으로 AI가 배경을 생성하고 이미지와 합성해주는 도구입니다.
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
            사용 방법:
          </Typography>
          <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
            <li>원하는 배경에 대한 설명을 입력합니다.</li>
            <li>시간대, 성별, 배경 유형, 조명 방향을 선택합니다.</li>
            <li>배경과 합성할 주체 이미지를 업로드합니다.</li>
            <li>'배경 생성하기' 버튼을 클릭하여 AI가 배경을 생성하는 것을 기다립니다.</li>
            <li>결과를 확인하고 마음에 들면 다운로드합니다.</li>
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
            프롬프트 작성 팁:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>구체적인 장소, 시간, 날씨, 분위기를 명시하세요.</li>
            <li>색상, 조명, 구도 등 시각적 요소를 언급하면 더 정확한 결과를 얻을 수 있습니다.</li>
            <li>추천 프롬프트를 참고하여 작성해보세요.</li>
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

export default BackCreate;