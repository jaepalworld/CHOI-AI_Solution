import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    AppBar,
    Toolbar,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Card,
    CardContent,
    CardHeader,
    Button,
    Avatar,
    Menu,
    MenuItem,
    Tab,
    Tabs,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    Switch,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ListItemAvatar
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Chat as ChatIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    AdminPanelSettings as AdminIcon,
    ContentPaste as LogsIcon,
    Storage as DatabaseIcon,
    CloudUpload,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../../firebase/firebase';
import { signOut } from 'firebase/auth';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';

// 슈퍼 관리자 대시보드 메인 컴포넌트
const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
    const [user, setUser] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [addAdminDialogOpen, setAddAdminDialogOpen] = useState(false);
    const [newAdminData, setNewAdminData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'admin'
    });

    const drawerWidth = 240;

    useEffect(() => {
        // 현재 로그인한 사용자 정보 가져오기
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                // 로그인되지 않은 경우 로그인 페이지로 리디렉션
                navigate('/admin/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        // 관리자 목록 가져오기
        const fetchAdmins = async () => {
            try {
                const adminQuery = query(collection(db, 'admins'));
                const querySnapshot = await getDocs(adminQuery);

                const adminsList = [];
                querySnapshot.forEach((doc) => {
                    adminsList.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                setAdmins(adminsList);
            } catch (error) {
                console.error('관리자 목록 가져오기 오류:', error);
            }
        };

        fetchAdmins();
    }, []);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleProfileMenuOpen = (event) => {
        setProfileMenuAnchor(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setProfileMenuAnchor(null);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/admin/login');
        } catch (error) {
            console.error('로그아웃 오류:', error);
        }
        handleProfileMenuClose();
    };

    const handleAddAdminDialogOpen = () => {
        setAddAdminDialogOpen(true);
    };

    const handleAddAdminDialogClose = () => {
        setAddAdminDialogOpen(false);
        setNewAdminData({
            email: '',
            password: '',
            name: '',
            role: 'admin'
        });
    };

    const handleNewAdminInputChange = (e) => {
        const { name, value } = e.target;
        setNewAdminData({
            ...newAdminData,
            [name]: value
        });
    };

    const handleAddAdmin = async () => {
        // 여기서는 데모 목적으로 간단히 구현
        // 실제로는 백엔드 API를 통해 새 관리자를 추가해야 함
        try {
            // 새 관리자 문서 추가
            await addDoc(collection(db, 'admins'), {
                email: newAdminData.email,
                name: newAdminData.name,
                role: newAdminData.role,
                isAdmin: true,
                isSuper: newAdminData.role === 'super',
                createdAt: serverTimestamp()
            });

            // 관리자 목록 갱신
            const adminQuery = query(collection(db, 'admins'));
            const querySnapshot = await getDocs(adminQuery);

            const adminsList = [];
            querySnapshot.forEach((doc) => {
                adminsList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            setAdmins(adminsList);
            handleAddAdminDialogClose();
        } catch (error) {
            console.error('관리자 추가 오류:', error);
            alert('관리자 추가 중 오류가 발생했습니다.');
        }
    };

    const drawerItems = [
        { text: '슈퍼 대시보드', icon: <DashboardIcon />, path: '/super-admin/dashboard' },
        { text: '관리자 관리', icon: <AdminIcon />, path: '/super-admin/admins' },
        { text: '서버 로그', icon: <LogsIcon />, path: '/super-admin/logs' },
        { text: '데이터베이스', icon: <DatabaseIcon />, path: '/super-admin/database' },
        { text: '시스템 설정', icon: <SettingsIcon />, path: '/super-admin/settings' }
    ];

    // 사이드바 렌더링
    const renderDrawer = (
        <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
                display: { xs: 'block' },
                '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
            }}
        >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    Drawing-Studio Super
                </Typography>
            </Box>
            <Divider />
            <List>
                {drawerItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => navigate(item.path)}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem button onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="로그아웃" />
                </ListItem>
            </List>
        </Drawer>
    );

    // 프로필 메뉴 렌더링
    const profileMenu = (
        <Menu
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
            PaperProps={{
                elevation: 0,
                sx: {
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                    mt: 1.5
                }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <MenuItem onClick={handleProfileMenuClose}>내 정보</MenuItem>
            <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
        </Menu>
    );

    // 관리자 추가 다이얼로그
    const renderAddAdminDialog = (
        <Dialog
            open={addAdminDialogOpen}
            onClose={handleAddAdminDialogClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>새 관리자 추가</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    새로운 관리자 계정 정보를 입력하세요.
                </DialogContentText>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            name="email"
                            label="이메일"
                            type="email"
                            fullWidth
                            variant="outlined"
                            margin="normal"
                            value={newAdminData.email}
                            onChange={handleNewAdminInputChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="password"
                            label="비밀번호"
                            type="password"
                            fullWidth
                            variant="outlined"
                            margin="normal"
                            value={newAdminData.password}
                            onChange={handleNewAdminInputChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="name"
                            label="이름"
                            fullWidth
                            variant="outlined"
                            margin="normal"
                            value={newAdminData.name}
                            onChange={handleNewAdminInputChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>관리자 유형</InputLabel>
                            <Select
                                name="role"
                                value={newAdminData.role}
                                label="관리자 유형"
                                onChange={handleNewAdminInputChange}
                            >
                                <MenuItem value="admin">일반 관리자</MenuItem>
                                <MenuItem value="super">슈퍼 관리자</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleAddAdminDialogClose}>취소</Button>
                <Button
                    onClick={handleAddAdmin}
                    variant="contained"
                    sx={{
                        bgcolor: '#2196F3',
                        '&:hover': { bgcolor: '#1976D2' }
                    }}
                >
                    추가
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            {/* 앱바 */}
            <AppBar
                position="fixed"
                sx={{
                    bgcolor: '#1a237e', // 슈퍼 관리자는 더 진한 색상
                    color: '#fff',
                    boxShadow: 1
                }}
            >
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        슈퍼 관리자 대시보드
                    </Typography>
                    {user && (
                        <IconButton
                            onClick={handleProfileMenuOpen}
                            size="small"
                            sx={{ ml: 2 }}
                        >
                            <Avatar
                                alt={user.displayName || '슈퍼 관리자'}
                                src={user.photoURL}
                                sx={{ width: 32, height: 32, bgcolor: '#ff9800' }}
                            >
                                {!user.photoURL && <AdminIcon />}
                            </Avatar>
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>

            {/* 사이드바 */}
            {renderDrawer}
            {profileMenu}
            {renderAddAdminDialog}

            {/* 메인 콘텐츠 */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    mt: 8
                }}
            >
                {/* 탭 메뉴 */}
                <Paper sx={{ mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="대시보드" />
                        <Tab label="관리자 관리" />
                        <Tab label="시스템 관리" />
                    </Tabs>
                </Paper>

                {/* 탭 내용 */}
                <TabPanel value={activeTab} index={0}>
                    <SuperDashboardContent />
                </TabPanel>
                <TabPanel value={activeTab} index={1}>
                    <AdminManagementContent
                        admins={admins}
                        onAddAdminClick={handleAddAdminDialogOpen}
                    />
                </TabPanel>
                <TabPanel value={activeTab} index={2}>
                    <SystemManagementContent />
                </TabPanel>
            </Box>
        </Box>
    );
};

// 탭 패널 컴포넌트
const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
};

// 슈퍼 대시보드 콘텐츠
const SuperDashboardContent = () => {
    const systemStats = [
        { title: '전체 사용자', value: '3,752', change: '+24', color: '#2196F3' },
        { title: '전체 관리자', value: '8', change: '+1', color: '#FF9800' },
        { title: '서버 업타임', value: '99.8%', change: '-0.1%', color: '#4CAF50' },
        { title: '시스템 경고', value: '2', change: '+1', color: '#F44336' }
    ];

    return (
        <Grid container spacing={3}>
            {/* 시스템 통계 카드 */}
            {systemStats.map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.title}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                            >
                                {stat.title}
                            </Typography>
                            <Typography
                                variant="h4"
                                sx={{ mb: 1, fontWeight: 600, color: stat.color }}
                            >
                                {stat.value}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: stat.change.startsWith('+') ? 'success.main' : 'error.main'
                                }}
                            >
                                {stat.change} 오늘
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}

            {/* 시스템 상태 */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardHeader title="시스템 상태" />
                    <CardContent>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="웹 서버"
                                    secondary="정상 작동 중"
                                />
                                <Box sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                    온라인
                                </Box>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="데이터베이스 서버"
                                    secondary="정상 작동 중"
                                />
                                <Box sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                    온라인
                                </Box>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="AI 서버"
                                    secondary="일부 기능 제한됨"
                                />
                                <Box sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                                    주의
                                </Box>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="백업 시스템"
                                    secondary="마지막 백업: 오늘 03:00"
                                />
                                <Box sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                    정상
                                </Box>
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Grid>

            {/* 최근 활동 로그 */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardHeader title="최근 활동 로그" />
                    <CardContent>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="시스템 업데이트"
                                    secondary="웹 서버가 새 버전으로 업데이트됨"
                                    secondaryTypographyProps={{
                                        sx: { display: 'block' }
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    5분 전
                                </Typography>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="관리자 추가"
                                    secondary="새 관리자 계정이 생성됨: hong.gildong@example.com"
                                    secondaryTypographyProps={{
                                        sx: { display: 'block' }
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    1시간 전
                                </Typography>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="보안 경고"
                                    secondary="여러 번의 로그인 실패 감지: IP 123.456.789.012"
                                    secondaryTypographyProps={{
                                        sx: { display: 'block' }
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    3시간 전
                                </Typography>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="데이터베이스 백업"
                                    secondary="자동 백업이 성공적으로 완료됨"
                                    secondaryTypographyProps={{
                                        sx: { display: 'block' }
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    8시간 전
                                </Typography>
                            </ListItem>
                        </List>
                        <Button
                            variant="text"
                            size="small"
                            endIcon={<ArrowForwardIcon />}
                            sx={{ mt: 1, float: 'right' }}
                        >
                            모든 로그 보기
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

// 관리자 관리 콘텐츠
const AdminManagementContent = ({ admins, onAddAdminClick }) => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">관리자 목록</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onAddAdminClick}
                        sx={{
                            bgcolor: '#2196F3',
                            '&:hover': { bgcolor: '#1976D2' }
                        }}
                    >
                        새 관리자 추가
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell>이름</TableCell>
                                <TableCell>이메일</TableCell>
                                <TableCell>권한</TableCell>
                                <TableCell>상태</TableCell>
                                <TableCell align="right">작업</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {admins.length > 0 ? (
                                admins.map((admin) => (
                                    <TableRow key={admin.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar
                                                    sx={{
                                                        mr: 2,
                                                        bgcolor: admin.isSuper ? '#ff9800' : '#2196F3'
                                                    }}
                                                >
                                                    {admin.name?.charAt(0) || 'A'}
                                                </Avatar>
                                                {admin.name || '이름 없음'}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{admin.email || '-'}</TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    px: 1,
                                                    py: 0.5,
                                                    bgcolor: admin.isSuper ? 'warning.light' : 'info.light',
                                                    borderRadius: 1,
                                                    display: 'inline-block'
                                                }}
                                            >
                                                {admin.isSuper ? '슈퍼 관리자' : '일반 관리자'}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={admin.active !== false}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={admin.active !== false ? '활성' : '비활성'}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton color="primary" size="small">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" size="small" sx={{ ml: 1 }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                        관리자 계정이 없습니다. 새 관리자를 추가하세요.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
};

// 시스템 관리 콘텐츠
const SystemManagementContent = () => {
    return (
        <Grid container spacing={3}>
            {/* 백업 및 복원 */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardHeader title="백업 및 복원" />
                    <CardContent>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                마지막 백업: 2023-03-03 03:00:00
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<CloudUpload />}
                                sx={{
                                    mt: 1,
                                    bgcolor: '#2196F3',
                                    '&:hover': { bgcolor: '#1976D2' }
                                }}
                            >
                                지금 백업
                            </Button>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle1" gutterBottom>
                            백업 파일 선택
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                            <TextField
                                fullWidth
                                placeholder="백업 파일 선택"
                                disabled
                                sx={{ mr: 2 }}
                            />
                            <Button variant="outlined">찾아보기</Button>
                        </Box>
                        <Button
                            variant="outlined"
                            color="error"
                            sx={{ mt: 2 }}
                        >
                            선택한 백업에서 복원
                        </Button>
                    </CardContent>
                </Card>
            </Grid>

            {/* 시스템 설정 */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardHeader title="시스템 설정" />
                    <CardContent>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="유지보수 모드"
                                    secondary="웹사이트를 유지보수 모드로 전환합니다."
                                />
                                <Switch color="primary" />
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="사용자 등록"
                                    secondary="새 사용자 등록을 허용합니다."
                                />
                                <Switch defaultChecked color="primary" />
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="로그인 제한"
                                    secondary="일정 횟수 이상 실패 시 로그인을 제한합니다."
                                />
                                <Switch defaultChecked color="primary" />
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="AI 기능"
                                    secondary="AI 관련 기능을 활성화합니다."
                                />
                                <Switch defaultChecked color="primary" />
                            </ListItem>
                        </List>

                        <Button
                            variant="contained"
                            sx={{
                                mt: 2,
                                bgcolor: '#2196F3',
                                '&:hover': { bgcolor: '#1976D2' }
                            }}
                        >
                            설정 저장
                        </Button>
                    </CardContent>
                </Card>
            </Grid>

            {/* 서버 정보 */}
            <Grid item xs={12}>
                <Card>
                    <CardHeader title="서버 정보" />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    서버 버전
                                </Typography>
                                <Typography variant="body1">Drawing-Studio v1.2.3</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    서버 IP
                                </Typography>
                                <Typography variant="body1">123.456.789.012</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    운영체제
                                </Typography>
                                <Typography variant="body1">Ubuntu 20.04 LTS</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    CPU 사용량
                                </Typography>
                                <Typography variant="body1">32% (4/12 코어)</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    메모리 사용량
                                </Typography>
                                <Typography variant="body1">4.2GB / 16GB (26%)</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    디스크 사용량
                                </Typography>
                                <Typography variant="body1">128GB / 512GB (25%)</Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default SuperAdminDashboard;