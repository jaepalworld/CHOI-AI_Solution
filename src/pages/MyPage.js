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
  CircularProgress
} from '@mui/material';
import { auth, db } from '../firebase/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const MyPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Update Firestore
        await updateDoc(doc(db, 'users', currentUser.uid), {
          name: formData.name
        });

        // Update Auth Profile
        await updateProfile(currentUser, {
          displayName: formData.name
        });

        setSuccess('프로필이 성공적으로 업데이트되었습니다.');
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{ width: 100, height: 100, margin: '0 auto', mb: 2 }}
            src={user?.photoURL}
          >
            {(user?.name || '?')[0].toUpperCase()}
          </Avatar>
          <Typography variant="h4" gutterBottom>
            마이페이지
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {editMode ? (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              margin="normal"
              variant="outlined"
              disabled
            />
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : '저장'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setEditMode(false)}
                disabled={loading}
                fullWidth
              >
                취소
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              <strong>이름:</strong> {user?.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>이메일:</strong> {user?.email}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>가입일:</strong> {new Date(user?.createdAt).toLocaleDateString()}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setEditMode(true)}
              sx={{ mt: 3 }}
              fullWidth
            >
              프로필 수정
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MyPage;