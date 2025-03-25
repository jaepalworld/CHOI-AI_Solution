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
    DialogTitle,
    Snackbar,
    Alert
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

// WebSocket URL 환경 변수
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

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
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

    // 메시지 목록 자동 스크롤
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // WebSocket 연결 설정 - 개선된 버전
    useEffect(() => {
        if (user) {  // 사용자가 로그인했을 때만 연결
            let websocket;
            let reconnectAttempts = 0;
            const maxReconnectAttempts = 5;

            const connectWebSocket = () => {
                websocket = new WebSocket(WS_URL);

                websocket.onopen = () => {
                    console.log('WebSocket Connected');
                    reconnectAttempts = 0;

                    // 사용자 정보 전송 - 중요: 서버에게 사용자 유형을 알림
                    const userType = {
                        userId: user.uid,
                        userName: user.displayName || '사용자',
                        userPhoto: user.photoURL,
                        type: 'user_connect', // 사용자 연결 식별자 추가
                        tabType: activeTab === 0 ? 'ai' : 'personal'
                    };
                    console.log("Sending user connection info:", userType); // 로그 추가
                    websocket.send(JSON.stringify(userType));
                };

                // WebSocket 메시지 수신 처리
                websocket.onmessage = (event) => {
                    try {
                        console.log("Raw WebSocket message received:", event.data);
                        const data = JSON.parse(event.data);
                        console.log("Parsed WebSocket message:", data);

                        // 이 부분이 중요: 기존 메시지를 유지하면서 새 메시지 추가
                        setMessages(prev => {
                            // 이전 메시지와 중복 여부 확인하고 새 메시지만 추가
                            const isDuplicate = prev.some(msg =>
                                msg.text === data.text &&
                                msg.type === data.type &&
                                Math.abs(new Date(msg.timestamp) - new Date(data.timestamp)) < 1000
                            );

                            if (isDuplicate) {
                                console.log("Duplicate message detected, not adding to state");
                                return prev;
                            }

                            console.log("Previous messages:", prev);
                            const newMessage = {
                                id: Date.now(),
                                ...data,
                                timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
                            };

                            console.log("Adding new message to state:", newMessage);
                            // 기존 메시지 배열을 유지하면서 새 메시지 추가
                            return [...prev, newMessage];
                        });
                    } catch (error) {
                        console.error('메시지 처리 중 오류:', error);
                    }
                };

                websocket.onerror = (error) => {
                    console.error('WebSocket Error:', error);
                    setNotification({
                        open: true,
                        message: '서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
                        severity: 'error'
                    });
                };

                websocket.onclose = () => {
                    console.log('WebSocket Disconnected');
                    if (reconnectAttempts < maxReconnectAttempts) {
                        reconnectAttempts++;
                        setTimeout(connectWebSocket, 1000 * reconnectAttempts);
                    } else {
                        setNotification({
                            open: true,
                            message: '서버 연결이 종료되었습니다. 페이지를 새로고침해주세요.',
                            severity: 'warning'
                        });
                    }
                };
            };

            connectWebSocket();
            setWs(websocket);

            return () => {
                if (websocket && websocket.readyState === WebSocket.OPEN) {
                    websocket.close();
                }
            };
        }
    }, [user, activeTab]);

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

    // 메시지 전송 처리 함수에서
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !ws) return;

        try {
            setLoading(true);

            // 중요: 메시지 상태를 덮어쓰지 않도록 콘솔 로그 추가
            console.log("Current messages before sending:", messages);

            // 여기서 문제가 발생할 수 있음: 새 메시지를 전송하기 전에 messages 상태를 초기화하는 코드가 있는지 확인

            // WebSocket을 통해 메시지 전송
            const messageData = {
                text: newMessage,
                userId: user.uid,
                userName: user.displayName || '사용자',
                userPhoto: user.photoURL,
                timestamp: new Date().toISOString(),
                type: 'user',
                tabType: activeTab === 0 ? 'ai' : 'personal',
                chatId: `chat_${user.uid}_${Date.now()}`  // 고유한 chatId 추가
            };

            if (ws.readyState === WebSocket.OPEN) {
                console.log("Sending message:", messageData);
                ws.send(JSON.stringify(messageData));
                setNewMessage('');
            } else {
                throw new Error('WebSocket 연결이 끊겼습니다.');
            }

            // Firebase에 메시지 저장
            await addDoc(collection(db, activeTab === 0 ? 'aiChats' : 'personalChats'), {
                ...messageData,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error('메시지 전송 중 오류 발생:', error);
            // 오류 처리...
        } finally {
            setLoading(false);
        }
    };
    // 날짜 포맷팅
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp instanceof Date
            ? timestamp
            : typeof timestamp === 'string'
                ? new Date(timestamp)
                : timestamp.toDate?.() || new Date();

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

    // AI 이미지 아이콘 렌더링 - 오류 처리 추가
    const renderAiIcon = () => {
        try {
            return (
                <Box
                    component="img"
                    src="/assets/images/chatai.png"
                    onError={(e) => {
                        console.error('이미지 로드 실패:', e);
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJvdCI+PHBhdGggZD0iTTEyIDhWNEg4Ij48L3BhdGg+PHBhdGggZD0iTTEyIDRoNCI+PC9wYXRoPjxwYXRoIGQ9Ik0yMiAxMi45MVYxN2EyIDIgMCAwIDEtMiAyaC00di00aDRWOWE2IDYgMCAwIDAtMTIgMHY2aDR2NGgtNGEyIDIgMCAwIDEtMi0ydi00LjA5QTYgNiAwIDEgMSAyMiAxMi45MXoiPjwvcGF0aD48cGF0aCBkPSJNMTYgMTZoLjAxIj48L3BhdGg+PHBhdGggZD0iTTggMTZoLjAxIj48L3BhdGg+PHBhdGggZD0iTTEyIDIwdjIiPjwvcGF0aD48L3N2Zz4=';
                    }}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                    alt="AI 상담원"
                />
            );
        } catch (error) {
            console.error('AI 아이콘 렌더링 오류:', error);
            return <SupportAgentIcon />;
        }
    };

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
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJvdCI+PHBhdGggZD0iTTEyIDhWNEg4Ij48L3BhdGg+PHBhdGggZD0iTTEyIDRoNCI+PC9wYXRoPjxwYXRoIGQ9Ik0yMiAxMi45MVYxN2EyIDIgMCAwIDEtMiAyaC00di00aDRWOWE2IDYgMCAwIDAtMTIgMHY2aDR2NGgtNGEyIDIgMCAwIDEtMi0ydi00LjA5QTYgNiAwIDEgMSAyMiAxMi45MXoiPjwvcGF0aD48cGF0aCBkPSJNMTYgMTZoLjAxIj48L3BhdGg+PHBhdGggZD0iTTggMTZoLjAxIj48L3BhdGg+PHBhdGggZD0iTTEyIDIwdjIiPjwvcGF0aD48L3N2Zz4=';
                                    }}
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        objectFit: 'cover',
                                        borderRadius: '50%',
                                        marginBottom: '8px'
                                    }}
                                    alt="AI 상담"
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
                                    minWidth: '100px',
                                    width: 'auto'  // width 속성 수정
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

                {/* 알림 Snackbar */}
                <Snackbar
                    open={notification.open}
                    autoHideDuration={5000}
                    onClose={() => setNotification({ ...notification, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setNotification({ ...notification, open: false })}
                        severity={notification.severity}
                        sx={{ width: '100%' }}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
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
                                    objectFit: 'cover',
                                    borderRadius: '50%'
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
                            maxWidth: '80%',
                            wordBreak: 'break-word'  // 텍스트 줄바꿈 개선
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