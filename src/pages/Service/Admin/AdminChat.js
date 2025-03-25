import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Container,
    AppBar,
    Toolbar,
} from '@mui/material';
import {
    Send as SendIcon,
    ArrowBack as ArrowBackIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../../firebase/firebase';
import {
    collection,
    doc,
    getDoc,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';

// WebSocket URL 환경 변수
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

const AdminChat = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatInfo, setChatInfo] = useState(null);
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [ws, setWs] = useState(null);

    // WebSocket 연결 설정
    useEffect(() => {
        const websocket = new WebSocket(WS_URL);

        websocket.onopen = () => {
            console.log('WebSocket Connected');
            // 관리자 정보 전송 형식 수정
            const adminInfo = {
                type: 'admin_connect',
                adminId: chatId, // chatId를 adminId로 사용
                chatId: chatId,
                role: 'admin'
            };
            websocket.send(JSON.stringify(adminInfo));
        };

        websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received message:', data); // 디버깅용 로그

                // 새 메시지를 즉시 화면에 표시
                if (data.type === 'user' || data.type === 'admin') {
                    const newMessage = {
                        id: Date.now().toString(),
                        ...data,
                        timestamp: new Date(),
                        senderType: data.type
                    };

                    setMessages(prev => {
                        // 중복 메시지 방지
                        const isDuplicate = prev.some(msg =>
                            msg.text === newMessage.text &&
                            Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 1000
                        );
                        if (isDuplicate) return prev;
                        return [...prev, newMessage];
                    });
                }
            } catch (error) {
                console.error('메시지 처리 중 오류:', error);
            }
        };

        websocket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        websocket.onclose = () => {
            console.log('WebSocket Disconnected');
            // 재연결 로직 추가
            setTimeout(() => {
                console.log('Attempting to reconnect...');
                setWs(null);
            }, 3000);
        };

        setWs(websocket);

        return () => {
            if (websocket.readyState === WebSocket.OPEN) {
                websocket.close();
            }
        };
    }, [chatId, ws === null]); // ws가 null일 때 재연결 시도

    // 채팅방 정보 가져오기
    useEffect(() => {
        const fetchChatInfo = async () => {
            try {
                const chatDoc = await getDoc(doc(db, 'personalChats', chatId));
                if (chatDoc.exists()) {
                    const data = chatDoc.data();
                    setChatInfo(data);
                    console.log("Chat info loaded:", data); // 디버깅용 로그 추가
                    // 채팅방 상태 업데이트
                    await updateDoc(doc(db, 'personalChats', chatId), {
                        status: 'in_progress'
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error('채팅 정보 로딩 오류:', error);
                setLoading(false);
            }
        };

        fetchChatInfo();
    }, [chatId]);

    // 실시간 메시지 구독 (Firestore)
    useEffect(() => {
        const messagesRef = collection(db, 'personalChats', chatId, 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages = [];
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    newMessages.push({
                        id: change.doc.id,
                        ...data,
                        timestamp: data.timestamp?.toDate() || new Date()
                    });
                }
            });

            if (newMessages.length > 0) {
                setMessages(prev => {
                    const uniqueMessages = newMessages.filter(newMsg =>
                        !prev.some(existingMsg => existingMsg.id === newMsg.id)
                    );
                    return [...prev, ...uniqueMessages];
                });
            }
        }, (error) => {
            console.error("Messages subscription error:", error);
        });

        return () => unsubscribe();
    }, [chatId]);

    // 새 메시지가 추가될 때마다 스크롤 맨 아래로
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !ws) return;

        try {
            // 메시지 데이터에 명시적인 userId 필드 추가
            const messageData = {
                text: newMessage,
                timestamp: new Date().toISOString(), // 즉시 타임스탬프 생성
                senderId: auth.currentUser?.uid || 'admin',
                senderType: 'admin',
                type: 'admin',
                chatId: chatId,
                userId: chatInfo?.userId, // 사용자 ID 추가
                userName: '관리자',
                tabType: 'personal' // 명시적인 tabType 추가
            };
            console.log("Sending message data:", messageData);
            // 메시지 입력창 즉시 초기화
            setNewMessage('');

            // WebSocket을 통해 메시지 전송
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(messageData));
                console.log("Message sent via WebSocket");
            } else {
                console.error("WebSocket is not open");
            }

            // Firestore에 메시지 추가
            await addDoc(collection(db, 'personalChats', chatId, 'messages'), {
                ...messageData,
                timestamp: serverTimestamp() // Firestore 타임스탬프 사용
            });
            console.log("Message saved to Firestore");

        } catch (error) {
            console.error('메시지 전송 오류:', error);
            setNewMessage(newMessage); // 에러 시 메시지 복구
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography>로딩 중...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 헤더 */}
            <AppBar position="static" sx={{ bgcolor: 'white', color: 'black' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Avatar
                        src={chatInfo?.userPhoto}
                        sx={{ width: 40, height: 40, mx: 2 }}
                    />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {chatInfo?.userName || '사용자'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {chatInfo?.status === 'active' ? '온라인' : '오프라인'}
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* 메시지 목록 */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: '#f5f5f5', p: 2 }}>
                <Container maxWidth="md">
                    <List>
                        {messages.map((message) => (
                            <ListItem
                                key={message.id}
                                sx={{
                                    flexDirection: message.senderType === 'admin' ? 'row-reverse' : 'row',
                                    alignItems: 'flex-start',
                                    gap: 1,
                                    mb: 1
                                }}
                            >
                                <Paper
                                    sx={{
                                        p: 2,
                                        maxWidth: '70%',
                                        bgcolor: message.senderType === 'admin' ? '#1976d2' : 'white',
                                        color: message.senderType === 'admin' ? 'white' : 'inherit'
                                    }}
                                >
                                    <Typography>{message.text}</Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: 'block',
                                            textAlign: message.senderType === 'admin' ? 'left' : 'right',
                                            color: message.senderType === 'admin' ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                                        }}
                                    >
                                        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                                    </Typography>
                                </Paper>
                            </ListItem>
                        ))}
                        <div ref={messagesEndRef} />
                    </List>
                </Container>
            </Box>

            {/* 메시지 입력 */}
            <Paper
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider'
                }}
            >
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="메시지를 입력하세요..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        size="small"
                    />
                    <IconButton
                        type="submit"
                        color="primary"
                        disabled={!newMessage.trim()}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Paper>
        </Box>
    );
};


export default AdminChat;