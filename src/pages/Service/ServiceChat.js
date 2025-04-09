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
import './ServiceChat.css';

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

    // WebSocket URL 동적 생성 함수
    const getWebSocketUrl = () => {
        const host = window.location.hostname;
        return `ws://${host === 'localhost' ? 'localhost' : host}:8000/ws`;
    };

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
                // 동적 WebSocket URL 사용
                const wsUrl = getWebSocketUrl();
                console.log(`WebSocket 연결 시도: ${wsUrl}`);
                
                websocket = new WebSocket(wsUrl);

                websocket.onopen = () => {
                    console.log('WebSocket Connected');
                    setNotification({
                        open: true,
                        message: '서버에 연결되었습니다.',
                        severity: 'success'
                    });
                    reconnectAttempts = 0;

                    // 사용자 정보 전송
                    const userType = {
                        userId: user.uid,
                        userName: user.displayName || '사용자',
                        userPhoto: user.photoURL,
                        type: 'user_connect',
                        tabType: activeTab === 0 ? 'ai' : 'personal'
                    };
                    console.log("Sending user connection info:", userType);
                    websocket.send(JSON.stringify(userType));
                };

                // WebSocket 메시지 수신 처리
                websocket.onmessage = (event) => {
                    try {
                        console.log(`메시지 수신: ${event.data.slice(0, 100)}...`);
                        const data = JSON.parse(event.data);
                        
                        // 연결 성공 메시지 처리
                        if (data.type === 'connection_established') {
                            console.log('Connection established:', data.message);
                            return;
                        }
                        
                        // 에러 메시지 처리
                        if (data.type === 'error') {
                            console.error('Server error:', data.message);
                            setNotification({
                                open: true,
                                message: `서버 오류: ${data.message}`,
                                severity: 'error'
                            });
                            return;
                        }
                        
                        // AI 타이핑 상태 처리
                        if (data.type === 'ai_typing') {
                            setIsAiTyping(true);
                            return;
                        }
                        
                        // 일반 메시지 처리
                        setIsAiTyping(false);
                        
                        // 스트리밍 응답 처리 개선
                        setMessages(prev => {
                            // 이미 동일한 chatId의 AI 메시지가 있는지 확인
                            const existingMsgIndex = prev.findIndex(msg => 
                                msg.chatId === data.chatId && msg.type === 'ai'
                            );
                            
                            // 신규 메시지 또는 업데이트할 메시지
                            const updatedMsg = {
                                id: existingMsgIndex >= 0 ? prev[existingMsgIndex].id : Date.now(),
                                ...data,
                                timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
                            };
                            
                            // 새 메시지 배열 생성
                            if (existingMsgIndex >= 0) {
                                // 기존 메시지 업데이트
                                const newMessages = [...prev];
                                newMessages[existingMsgIndex] = updatedMsg;
                                return newMessages;
                            } else {
                                // 새 메시지 추가
                                return [...prev, updatedMsg];
                            }
                        });
                    } catch (error) {
                        console.error('Message parsing error:', error);
                        console.error('Raw message:', event.data);
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

                websocket.onclose = (event) => {
                    console.log('WebSocket Disconnected', event);
                    if (reconnectAttempts < maxReconnectAttempts) {
                        reconnectAttempts++;
                        const delay = 1000 * Math.pow(2, reconnectAttempts); // 지수 백오프
                        console.log(`${delay}ms 후 재연결 시도 (${reconnectAttempts}/${maxReconnectAttempts})`);
                        
                        setTimeout(connectWebSocket, delay);
                        
                        setNotification({
                            open: true,
                            message: `서버 연결이 끊겼습니다. ${reconnectAttempts}/${maxReconnectAttempts} 재연결 시도 중...`,
                            severity: 'warning'
                        });
                    } else {
                        setNotification({
                            open: true,
                            message: '서버 연결이 종료되었습니다. 페이지를 새로고침해주세요.',
                            severity: 'error'
                        });
                    }
                };
            };

            connectWebSocket();
            setWs(websocket);

            return () => {
                if (websocket) {
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

    // 메시지 전송 처리 함수
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !ws) return;

        try {
            setLoading(true);
            setIsAiTyping(true);

            console.log("Current messages before sending:", messages);

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
            setNotification({
                open: true,
                message: `메시지 전송 실패: ${error.message}`,
                severity: 'error'
            });
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
                    className="agent-icon"
                    alt="AI 상담원"
                />
            );
        } catch (error) {
            console.error('AI 아이콘 렌더링 오류:', error);
            return <SupportAgentIcon />;
        }
    };

    return (
        <Box className="service-chat-container">
            <Container maxWidth="md">
                {/* 헤더 */}
                <Box className="service-chat-header">
                    <Typography
                        variant="h4"
                        className="service-chat-title"
                    >
                        고객센터 상담
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ExitToAppIcon />}
                        onClick={handleExit}
                        className="exit-button"
                    >
                        나가기
                    </Button>
                </Box>

                {/* 채팅창 */}
                <Paper
                    elevation={3}
                    className="chat-paper"
                >
                    {/* 탭 메뉴 */}
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        className="chat-tabs"
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
                                    className="tab-icon"
                                    alt="AI 상담"
                                />
                            }
                            label="AI 상담"
                            className={activeTab === 0 ? "chat-tab-selected" : ""}
                        />
                        <Tab
                            icon={<SupportAgentIcon />}
                            label="1:1 상담"
                            className={activeTab === 1 ? "chat-tab-selected" : ""}
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
                        className="message-input-container"
                    >
                        <Box className="message-form">
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="메시지를 입력하세요..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={loading || !user}
                                className="message-input"
                            />
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={loading || !user}
                                className="send-button"
                                endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                            >
                                전송
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                {/* 로그인 안내 */}
                {!user && (
                    <Paper className="login-notice">
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
                        className: "exit-dialog-paper"
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
                            className="exit-dialog-cancel"
                        >
                            취소
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleExitConfirm}
                            className="exit-dialog-confirm"
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
    <List className="chat-interface">
        {/* 환영 메시지 */}
        <ListItem>
            <ListItemAvatar>
                <Avatar className="agent-avatar">
                    {icon}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={agentName}
                secondary={welcomeMessage}
                primaryTypographyProps={{ className: "chat-list-item-text-primary" }}
            />
        </ListItem>
        <Divider variant="inset" />

        {/* 채팅 메시지 */}
        {messages.map((message) => (
            <ListItem
                key={message.id}
                className={message.type === 'user' ? "chat-list-item-user" : "chat-list-item"}
            >
                <ListItemAvatar>
                    <Avatar
                        src={message.userPhoto}
                        className={message.type === 'user' ? "chat-list-item-avatar-user" : "chat-list-item-avatar-agent"}
                    >
                        {message.type === 'user' ? null : icon}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={message.userName}
                    // 여기가 수정된 부분: secondaryTypographyProps를 사용하여 component를 "div"로 변경
                    secondaryTypographyProps={{ component: "div" }}
                    secondary={
                        <>
                            <Typography 
                                component="span" 
                                variant="body2"
                                className={`chat-message-bubble ${message.type === 'user' ? 'chat-message-bubble-user' : 'chat-message-bubble-agent'}`}
                                display="inline-block"
                            >
                                {message.text}
                            </Typography>
                            <Typography
                                component="span"
                                variant="caption"
                                className="chat-message-time"
                                display="inline-block"
                            >
                                {formatDate(message.timestamp)}
                            </Typography>
                        </>
                    }
                    primaryTypographyProps={{ className: "chat-list-item-text-primary" }}
                    className={message.type === 'user' ? "chat-list-item-text-user" : "chat-list-item-text-agent"}
                />
            </ListItem>
        ))}

        {/* 입력 중 표시 */}
        {isAiTyping && (
            <ListItem>
                <ListItemAvatar>
                    <Avatar className="agent-avatar">
                        {icon}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={agentName}
                    // 타이핑 인디케이터 부분도 동일하게 수정
                    secondaryTypographyProps={{ component: "div" }}
                    secondary={
                        <Typography component="div" className="typing-indicator">
                            답변 중
                            <CircularProgress size={16} style={{ marginLeft: '8px' }} />
                        </Typography>
                    }
                />
            </ListItem>
        )}
        <div ref={messagesEndRef} />
    </List>
);

export default ServiceChat;