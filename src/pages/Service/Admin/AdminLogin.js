import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    InputAdornment,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../../firebase/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [adminType, setAdminType] = useState('admin'); // 'admin' 또는 'super'
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('info');
    const [showAlert, setShowAlert] = useState(false);

    // 페이지 로드 시 일반 사용자 로그인 체크 및 로그아웃
    useEffect(() => {
        const checkAndLogoutRegularUser = async () => {
            if (auth.currentUser && !auth.currentUser.email.endsWith('@drawing-studio-admin.com')) {
                setAlertMessage('일반 사용자 계정으로 로그인되어 있어 로그아웃 처리되었습니다. 관리자 계정으로 로그인해주세요.');
                setAlertSeverity('warning');
                setShowAlert(true);

                try {
                    await signOut(auth);
                } catch (error) {
                    console.error('로그아웃 중 오류:', error);
                }
            }
        };

        checkAndLogoutRegularUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!adminId || !password) {
            setError('모든 필드를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 이미 로그인되어 있는 경우 로그아웃 먼저 실행
            if (auth.currentUser) {
                await signOut(auth);
            }

            // 관리자 계정 로그인 이메일 생성
            const email = `${adminId}@drawing-studio-admin.com`;

            // Firebase로 로그인
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 관리자 권한 확인 로직
            const adminRef = doc(db, 'admins', user.uid);
            const adminDoc = await getDoc(adminRef);

            if (adminDoc.exists()) {
                const adminData = adminDoc.data();

                // 관리자 타입별 권한 검증
                if (adminType === 'super' && !adminData.isSuper) {
                    setError('슈퍼 관리자 권한이 없습니다.');
                    await signOut(auth);
                    setLoading(false);
                    return;
                }

                if (adminType === 'admin' && !adminData.isAdmin) {
                    setError('관리자 권한이 없습니다.');
                    await signOut(auth);
                    setLoading(false);
                    return;
                }

                // 로그인 성공 시 관리자 대시보드로 이동
                navigate('/admin');
            } else {
                // 관리자 권한 없음
                setError('관리자 권한이 없는 계정입니다.');
                await signOut(auth);
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // 관리자 계정 생성 함수 (개발 및 테스트용)
    const createAdminAccounts = async () => {
        try {
            // 이미 로그인된 사용자가 있다면 로그아웃 먼저 실행
            if (auth.currentUser) {
                await signOut(auth);
            }

            // 일반 관리자 생성
            const adminUser = await createUserWithEmailAndPassword(auth, 'admin@drawing-studio-admin.com', 'admin1234');
            await setDoc(doc(db, 'admins', adminUser.user.uid), {
                adminId: 'admin',
                isAdmin: true,
                isSuper: false,
                createdAt: new Date()
            });

            // 슈퍼 관리자 생성
            await signOut(auth); // 일반 관리자 로그아웃 후 슈퍼 관리자 생성
            const superUser = await createUserWithEmailAndPassword(auth, 'sadmin@drawing-studio-admin.com', 'sadmin123');
            await setDoc(doc(db, 'admins', superUser.user.uid), {
                adminId: 'sadmin',
                isAdmin: true,
                isSuper: true,
                createdAt: new Date()
            });

            await signOut(auth); // 계정 생성 후 로그아웃

            setAlertMessage('관리자 계정이 생성되었습니다.');
            setAlertSeverity('success');
            setShowAlert(true);
        } catch (error) {
            console.error('관리자 계정 생성 오류:', error);
            setAlertMessage(`오류: ${error.message}`);
            setAlertSeverity('error');
            setShowAlert(true);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f5f5f5',
                py: 8
            }}
        >
            <Container maxWidth="sm">
                {showAlert && (
                    <Alert
                        severity={alertSeverity}
                        sx={{ mb: 2 }}
                        onClose={() => setShowAlert(false)}
                    >
                        {alertMessage}
                    </Alert>
                )}

                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            mb: 1,
                            fontWeight: 700,
                            textAlign: 'center'
                        }}
                    >
                        관리자 로그인
                    </Typography>

                    <Typography
                        variant="subtitle1"
                        sx={{
                            mb: 4,
                            color: 'text.secondary',
                            textAlign: 'center'
                        }}
                    >
                        웹 관리자모드 로그인하세요.
                    </Typography>

                    {error && (
                        <Typography
                            variant="body2"
                            color="error"
                            sx={{ mb: 2, width: '100%', textAlign: 'center' }}
                        >
                            {error}
                        </Typography>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="admin-type-label">관리자 유형</InputLabel>
                            <Select
                                labelId="admin-type-label"
                                id="admin-type"
                                value={adminType}
                                label="관리자 유형"
                                onChange={(e) => setAdminType(e.target.value)}
                            >
                                <MenuItem value="admin">일반 관리자</MenuItem>
                                <MenuItem value="super">슈퍼 관리자</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="관리자 ID"
                            variant="outlined"
                            margin="normal"
                            value={adminId}
                            onChange={(e) => setAdminId(e.target.value)}
                            InputProps={{
                                sx: { borderRadius: 1 }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="비밀번호"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                sx: { borderRadius: 1 },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleTogglePasswordVisibility}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                borderRadius: 1,
                                bgcolor: '#2196F3',
                                '&:hover': {
                                    bgcolor: '#1976D2'
                                }
                            }}
                            disabled={loading}
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </Button>

                        {/* 관리자 계정 생성 버튼 추가 (개발용) */}
                        <Button
                            variant="text"
                            size="small"
                            onClick={createAdminAccounts}
                            sx={{ mt: 2 }}
                        >
                            관리자 계정 생성 (개발용)
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default AdminLogin;