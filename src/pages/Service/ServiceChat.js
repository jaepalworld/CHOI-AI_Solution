import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider,
    Button,
    CircularProgress,
    Tabs,
    Tab,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { auth, db } from '../../firebase/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    getDocs
} from 'firebase/firestore';

// 탭 패널 컴포넌트
const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`chat-tabpanel-${index}`}
            aria-labelledby={`chat-tab-${index}`}
            {...other}
            style={{ height: '100%' }}
        >
            {value === index && (
                <Box sx={{ height: '100%' }}>{children}</Box>
            )}
        </div>
    );
};

const ServiceChat = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [adminOnline, setAdminOnline] = useState(false);
    const [exitDialogOpen, setExitDialogOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const [ws, setWs] = useState(null);
    const [isAiTyping, setIsAiTyping] = useState(false);

    // 메시지 목록 자동 스크롤
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // WebSocket 연결 설정
    useEffect(() => {
        if (user) {  // 사용자가 로그인했을 때만 연결
            const websocket = new WebSocket('ws://localhost:8000/ws');

            websocket.onopen = () => {
                console.log('WebSocket Connected');
            };

            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    ...data,
                    timestamp: new Date()
                }]);
                if (data.type === 'agent' && data.tabType === 'ai') {
                    setIsAiTyping(false);
                }
            };

            websocket.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

            websocket.onclose = () => {
                console.log('WebSocket Disconnected');
            };

            setWs(websocket);

            return () => {
                websocket.close();
            };
        }
    }, [user]);

    // Firebase Auth 상태 감지
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const chatCollection = activeTab === 0 ? 'aiChats' : 'personalChats';
                const q = query(
                    collection(db, chatCollection),
                    where('userId', '==', currentUser.uid),
                    orderBy('timestamp', 'asc')
                );

                const unsubscribeMessages = onSnapshot(q, (snapshot) => {
                    const newMessages = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setMessages(newMessages);
                });

                if (activeTab === 1) {
                    checkAdminStatus();
                }

                return () => unsubscribeMessages();
            }
        });

        return () => unsubscribe();
    }, [activeTab]);

    // 관리자 상태 체크
    const checkAdminStatus = async () => {
        try {
            const adminStatusRef = collection(db, 'adminStatus');
            const snapshot = await getDocs(adminStatusRef);
            if (!snapshot.empty) {
                const adminData = snapshot.docs[0].data();
                setAdminOnline(adminData.online || false);
            }
        } catch (error) {
            console.error('관리자 상태 확인 중 오류:', error);
        }
    };

    // 메시지 전송 처리
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !ws) return;

        try {
            setLoading(true);

            if (activeTab === 0) {
                setIsAiTyping(true);
            }
            const messageData = {
                text: newMessage,
                userId: user.uid,
                userName: user.displayName || '사용자',
                userPhoto: user.photoURL,
                timestamp: new Date().toISOString(),
                type: 'user',
                tabType: activeTab === 0 ? 'ai' : 'personal'
            };
            ws.send(JSON.stringify(messageData));
            setNewMessage('');
        } catch (error) {
            console.error('메시지 전송 중 오류 발생:', error);
        } finally {
            setLoading(false);
        }
    };

    // 날짜 포맷팅
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setMessages([]);
    };

    const handleExit = () => {
        setExitDialogOpen(true);
    };

    const handleExitConfirm = () => {
        setExitDialogOpen(false);
        navigate('/');
    };

    // AI 이미지 아이콘 렌더링
    const renderAiIcon = () => (
        <Box
            component="img"
            src="/assets/images/chatai.png"
            sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
            }}
        />
    );

    return (
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pt: 8 }}>
            <Container maxWidth="md">
                {/* 헤더 */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                }}>
                    <Typography
                        variant="h4"
                        sx={{
                            py: 4,
                            fontWeight: 600,
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        고객센터 상담
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ExitToAppIcon />}
                        onClick={handleExit}
                        sx={{
                            borderRadius: '20px',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                color: 'white',
                                borderColor: 'transparent'
                            }
                        }}
                    >
                        나가기
                    </Button>
                </Box>

                {/* 채팅창 */}
                <Paper
                    elevation={3}
                    sx={{
                        height: '70vh',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    {/* 탭 메뉴 */}
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            bgcolor: 'white',
                            '& .MuiTab-root': {           // Tab 컴포넌트의 스타일
                                paddingTop: '16px',        // 상단 여백 추가
                                paddingBottom: '16px',     // 하단 여백 추가
                                minHeight: '72px'          // 최소 높이 설정
                            }

                        }}
                    >
                        <Tab
                            icon={
                                <Box
                                    component="img"
                                    src="/assets/images/chatai.png"
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        objectFit: 'cover',
                                        borderRadius: '50%',
                                        marginBottom: '8px'
                                    }}
                                />
                            }
                            label="AI 상담"
                            sx={{
                                '&.Mui-selected': {
                                    color: '#2196F3'
                                }
                            }}
                        />
                        <Tab
                            icon={<SupportAgentIcon />}
                            label="1:1 상담"
                            sx={{
                                '&.Mui-selected': {
                                    color: '#2196F3'
                                }
                            }}
                        />
                    </Tabs>

                    {/* AI 상담 탭 */}
                    <TabPanel value={activeTab} index={0}>
                        <ChatInterface
                            messages={messages}
                            messagesEndRef={messagesEndRef}
                            formatDate={formatDate}
                            icon={renderAiIcon()}
                            agentName="AI 상담원"
                            welcomeMessage="안녕하세요! AI 상담원입니다. 무엇을 도와드릴까요?"
                            isAiTyping={isAiTyping}
                        />
                    </TabPanel>

                    {/* 1:1 상담 탭 */}
                    <TabPanel value={activeTab} index={1}>
                        <ChatInterface
                            messages={messages}
                            messagesEndRef={messagesEndRef}
                            formatDate={formatDate}
                            icon={<SupportAgentIcon />}
                            agentName="상담원"
                            welcomeMessage={`안녕하세요! 1:1 상담원입니다. 무엇을 도와드릴까요?\n${adminOnline ? '(상담원 연결 대기 중...)' : '(상담원 부재중)'}`}
                            isAiTyping={isAiTyping}
                        />
                    </TabPanel>

                    {/* 메시지 입력 */}
                    <Box
                        component="form"
                        onSubmit={handleSendMessage}
                        sx={{
                            p: 2,
                            bgcolor: 'white',
                            borderTop: 1,
                            borderColor: 'divider'
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="메시지를 입력하세요..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={loading || !user}
                                sx={{ bgcolor: 'white' }}
                            />
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={loading || !user}
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    color: 'white',
                                    minWidth: '100px'
                                }}
                                endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                            >
                                전송
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                {/* 로그인 안내 */}
                {!user && (
                    <Paper
                        sx={{
                            mt: 2,
                            p: 2,
                            textAlign: 'center',
                            bgcolor: 'rgba(255, 255, 255, 0.9)'
                        }}
                    >
                        <Typography color="text.secondary">
                            채팅을 시작하려면 로그인이 필요합니다.
                        </Typography>
                    </Paper>
                )}

                {/* 나가기 확인 다이얼로그 */}
                <Dialog
                    open={exitDialogOpen}
                    onClose={() => setExitDialogOpen(false)}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            width: '100%',
                            maxWidth: '400px'
                        }
                    }}
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        채팅방 나가기
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            채팅방을 나가시겠습니까?
                            {activeTab === 1 && " 상담 내용은 저장됩니다."}
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setExitDialogOpen(false)}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' }
                            }}
                        >
                            취소
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleExitConfirm}
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976D2 30%, #1E9FD1 90%)'
                                }
                            }}
                        >
                            나가기
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

// 채팅 인터페이스 컴포넌트
const ChatInterface = ({ messages, messagesEndRef, formatDate, icon, agentName, welcomeMessage, isAiTyping }) => (
    <List
        sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            height: '100%'
        }}
    >
        {/* 환영 메시지 */}
        <ListItem>
            <ListItemAvatar>
                <Avatar
                    sx={{
                        bgcolor: '#2196F3',
                        width: 40,
                        height: 40,
                        '& img': {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '50%'
                        }
                    }}
                >
                    {icon}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={agentName}
                secondary={welcomeMessage}
                sx={{
                    '& .MuiListItemText-primary': { fontWeight: 600 }
                }}
            />
        </ListItem>
        <Divider variant="inset" />

        {/* 채팅 메시지 */}
        {messages.map((message) => (
            <ListItem
                key={message.id}
                sx={{
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                }}
            >
                <ListItemAvatar>
                    <Avatar
                        src={message.userPhoto}
                        sx={message.type === 'user' ?
                            { ml: 2 } :
                            {
                                mr: 2,
                                bgcolor: '#2196F3',
                                width: 40,
                                height: 40,
                                '& img': {
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',    // 이미지가 영역을 꽉 채우도록 변경
                                    borderRadius: '50%'    // 이미지를 동그랗게 변경
                                }
                            }
                        }
                    >
                        {message.type === 'user' ? null : icon}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={message.userName}
                    secondary={
                        <Box>
                            <Typography component="span" variant="body2">
                                {message.text}
                            </Typography>
                            <Typography
                                component="span"
                                variant="caption"
                                sx={{ ml: 1, color: 'text.secondary' }}
                            >
                                {formatDate(message.timestamp)}
                            </Typography>
                        </Box>
                    }
                    sx={{
                        '& .MuiListItemText-primary': { fontWeight: 600 },
                        textAlign: message.type === 'user' ? 'right' : 'left',
                        '& .MuiTypography-body2': {
                            backgroundColor: message.type === 'user' ? '#2196F3' : '#f5f5f5',
                            color: message.type === 'user' ? 'white' : 'black',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            display: 'inline-block',
                            maxWidth: '80%'
                        }
                    }}
                />
            </ListItem>
        ))}

        {/* 입력 중 표시 */}
        {isAiTyping && (
            <ListItem>
                <ListItemAvatar>
                    <Avatar
                        sx={{
                            bgcolor: '#2196F3',
                            width: 40,
                            height: 40,
                            '& img': {
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '50%'
                            }
                        }}
                    >
                        {icon}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={agentName}
                    secondary={
                        <Box sx={{
                            backgroundColor: '#f5f5f5',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            display: 'inline-block'
                        }}>
                            <Typography component="span" variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                답변 중
                                <CircularProgress size={16} />
                            </Typography>
                        </Box>
                    }
                />
            </ListItem>
        )}
        <div ref={messagesEndRef} />
    </List>
);

export default ServiceChat;
