// 관리자 대시보드 메인 컴포넌트
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
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../../firebase/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';


const AdminDashboard = () => {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
    const [user, setUser] = useState(null);
    const [waitingChats, setWaitingChats] = useState([]);

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
        // 대기 중인 채팅 가져오기
        const fetchWaitingChats = async () => {
            try {
                const chatsQuery = query(
                    collection(db, 'personalChats'),
                    where('status', '==', 'active')
                );

                const querySnapshot = await getDocs(chatsQuery);

                // 사용자 ID별로 그룹화하여 가장 최근 메시지만 표시
                const chatsByUser = {};

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const userId = data.userId;

                    if (!chatsByUser[userId] ||
                        data.timestamp.toDate() > chatsByUser[userId].timestamp.toDate()) {
                        chatsByUser[userId] = {
                            id: doc.id,
                            ...data
                        };
                    }
                });

                const chats = Object.values(chatsByUser);
                setWaitingChats(chats);
            } catch (error) {
                console.error('채팅 목록 가져오기 오류:', error);
            }
        };

        fetchWaitingChats();
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
            navigate('/admin');
        } catch (error) {
            console.error('로그아웃 오류:', error);
        }
        handleProfileMenuClose();
    };

    const drawerItems = [
        { text: '대시보드', icon: <DashboardIcon />, path: '/admin' },
        { text: '상담 관리', icon: <ChatIcon />, path: '/admin/chat-management' }, // 경로 변경 1
        { text: '회원 관리', icon: <PeopleIcon />, path: '/admin/users' },
        { text: '설정', icon: <SettingsIcon />, path: '/admin/settings' }
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
                    Drawing-Studio Admin
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

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            {/* 앱바 */}
            <AppBar position="fixed" sx={{ bgcolor: '#fff', color: '#333', boxShadow: 1 }}>
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
                        관리자 대시보드
                    </Typography>
                    {user && (
                        <IconButton
                            onClick={handleProfileMenuOpen}
                            size="small"
                            sx={{ ml: 2 }}
                        >
                            <Avatar
                                alt={user.displayName || '관리자'}
                                src={user.photoURL}
                                sx={{ width: 32, height: 32 }}
                            >
                                {!user.photoURL && <PersonIcon />}
                            </Avatar>
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>

            {/* 사이드바 */}
            {renderDrawer}
            {profileMenu}

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
                        <Tab label="상담 관리" />
                        <Tab label="회원 관리" />
                    </Tabs>
                </Paper>

                {/* 탭 내용 */}
                <TabPanel value={activeTab} index={0}>
                    <DashboardContent waitingChats={waitingChats} />
                </TabPanel>
                <TabPanel value={activeTab} index={1}>
                    <ChatsContent waitingChats={waitingChats} />
                </TabPanel>
                <TabPanel value={activeTab} index={2}>
                    <UsersContent />
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

// 대시보드 콘텐츠
const DashboardContent = ({ waitingChats }) => {
    const navigate = useNavigate();
    return (
        <Grid container spacing={3}>
            {/* 요약 카드 */}
            <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title="대기 중인 상담" />
                    <CardContent>
                        <Typography variant="h3" align="center" sx={{ mb: 2 }}>
                            {waitingChats.length}
                        </Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<ChatIcon />}
                            sx={{
                                mt: 2,
                                bgcolor: '#2196F3',
                                '&:hover': { bgcolor: '#1976D2' }
                            }}
                            onClick={() => navigate('/admin/chat-management')}
                        >
                            상담 관리로 이동
                        </Button>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title="오늘의 방문자" />
                    <CardContent>
                        <Typography variant="h3" align="center" sx={{ mb: 2 }}>
                            152
                        </Typography>
                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            자세히 보기
                        </Button>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title="새로운 회원" />
                    <CardContent>
                        <Typography variant="h3" align="center" sx={{ mb: 2 }}>
                            24
                        </Typography>
                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            회원 목록
                        </Button>
                    </CardContent>
                </Card>
            </Grid>

            {/* 최근 상담 목록 */}
            <Grid item xs={12}>
                <Card>
                    <CardHeader
                        title="최근 상담 목록"
                        action={
                            <Button
                                variant="text"
                                size="small"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => navigate('/admin/chat-management')} // 추가
                            >
                                모두 보기
                            </Button>
                        }
                    />
                    <CardContent>
                        {waitingChats.length > 0 ? (
                            <List>
                                {waitingChats.slice(0, 5).map((chat, index) => (
                                    <React.Fragment key={chat.id}>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar src={chat.userPhoto}>
                                                    <PersonIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={chat.userName || '사용자'}
                                                secondary={
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 1,
                                                            WebkitBoxOrient: 'vertical'
                                                        }}
                                                    >
                                                        {chat.text}
                                                    </Typography>
                                                }
                                            />
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={{ ml: 2 }}
                                                onClick={() => navigate(`/admin/chat/${chat.id}`)}
                                            >
                                                답변하기
                                            </Button>
                                        </ListItem>
                                        {index < waitingChats.length - 1 && <Divider variant="inset" component="li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                                대기 중인 상담이 없습니다.
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

// 상담 관리 콘텐츠
const ChatsContent = ({ waitingChats }) => {
    const navigate = useNavigate();
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        대기 중인 상담 목록
                    </Typography>
                    {waitingChats.length > 0 ? (
                        <List>
                            {waitingChats.map((chat, index) => (
                                <React.Fragment key={chat.id}>
                                    <ListItem
                                        secondaryAction={
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    bgcolor: '#2196F3',
                                                    '&:hover': { bgcolor: '#1976D2' }
                                                }}
                                                onClick={() => navigate(`/admin/chat/${chat.id}`)}
                                            >
                                                상담 시작
                                            </Button>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar src={chat.userPhoto}>
                                                <PersonIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                                    {chat.userName || '사용자'}
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 1,
                                                            WebkitBoxOrient: 'vertical'
                                                        }}
                                                    >
                                                        {chat.text}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(chat.timestamp.toDate()).toLocaleString()}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {index < waitingChats.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                            대기 중인 상담이 없습니다.
                        </Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

// 회원 관리 콘텐츠
const UsersContent = () => {
    return (
        <Typography variant="h6" align="center" color="text.secondary" sx={{ py: 4 }}>
            회원 관리 섹션은 준비 중입니다.
        </Typography>
    );
};

export default AdminDashboard;