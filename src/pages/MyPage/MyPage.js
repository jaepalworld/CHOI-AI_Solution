import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

import { auth, db, storage } from '../../firebase/firebase';
import { updateProfile, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const MyPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settings, setSettings] = useState({
    darkMode: false,
    language: 'ko',
    notifications: true,
    twoFactorAuth: false
  });
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);
            setFormData({
              name: userData.name || '',
              email: userData.email || ''
            });
            setSettings(userData.settings || {
              darkMode: false,
              language: 'ko',
              notifications: true,
              twoFactorAuth: false
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          name: formData.name
        });

        await updateProfile(currentUser, {
          displayName: formData.name
        });

        setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(currentUser, {
        photoURL: downloadURL
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoURL: downloadURL
      });

      setSuccess('프로필 이미지가 업데이트되었습니다.');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setError('프로필 이미지 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        formData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, formData.newPassword);

      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error changing password:', error);
      setError('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (setting, value) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const newSettings = {
          ...settings,
          [setting]: value
        };

        setSettings(newSettings);

        await updateDoc(doc(db, 'users', currentUser.uid), {
          settings: newSettings
        });

        setSuccess('설정이 업데이트되었습니다.');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('설정 업데이트에 실패했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        deleteConfirmPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      await deleteDoc(doc(db, 'users', currentUser.uid));
      await deleteUser(currentUser);

      setDeleteAccountDialog(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('계정 삭제에 실패했습니다. 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <Box position="relative">
            <Avatar
              src={user?.photoURL || '/api/placeholder/96/96'}
              sx={{ width: 96, height: 96 }}
            />
            <label htmlFor="profile-image-upload">
              <input
                type="file"
                id="profile-image-upload"
                accept="image/*"
                onChange={handleProfileImageUpload}
                style={{ display: 'none' }}
              />
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  }
                }}
              >
                <PhotoCamera />
              </IconButton>
            </label>
          </Box>
          <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
            마이페이지
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="프로필 정보" />
          <Tab label="보안 설정" />
          <Tab label="사용자 설정" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="이름"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="이메일"
                value={formData.email}
                margin="normal"
                disabled
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                저장
              </Button>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Box component="form" onSubmit={handlePasswordChange} sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  비밀번호 변경
                </Typography>
                <TextField
                  fullWidth
                  label="현재 비밀번호"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="새 비밀번호"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="새 비밀번호 확인"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  margin="normal"
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  비밀번호 변경
                </Button>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  2단계 인증
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    />
                  }
                  label="2단계 인증 사용"
                />
              </Box>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  테마 설정
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.darkMode}
                      onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                    />
                  }
                  label="다크 모드"
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  언어 설정
                </Typography>
                <Select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  fullWidth
                >
                  <MenuItem value="ko">한국어</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="ja">日本語</MenuItem>
                </Select>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  알림 설정
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    />
                  }
                  label="알림 받기"
                />
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" color="error" gutterBottom>
                  계정 삭제
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setDeleteAccountDialog(true)}
                >
                  계정 삭제
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog open={deleteAccountDialog} onClose={() => setDeleteAccountDialog(false)}>
        <DialogTitle>계정 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?
          </Typography>
          <TextField
            fullWidth
            label="비밀번호 확인"
            type="password"
            value={deleteConfirmPassword}
            onChange={(e) => setDeleteConfirmPassword(e.target.value)}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountDialog(false)}>
            취소
          </Button>
          <Button onClick={handleDeleteAccount} color="error" disabled={loading}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyPage;