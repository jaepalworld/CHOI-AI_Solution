import React, { useState, useEffect, useRef } from 'react';
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
    Switch,
    FormControlLabel,
    Badge,
    Card,
    CardContent,
    Grid,
    Snackbar,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { auth, db } from '../../firebase/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    getDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ServiceAdmin = () => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [onlineStatus, setOnlineStatus] = useState(false);
    const [activeChats, setActiveChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
    const [ws, setWs] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [chatToClose, setChatToClose] = useState(null);

    const messagesEndRef = useRef(null);

    // 메시지 목록 자동 스크롤
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Firebase Auth 상태 감지 및 관리자 확인
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    // 관리자 권한 확인
                    const adminRef = doc(db, 'admins', currentUser.uid);
                    const adminDoc = await getDoc(adminRef);

                    if (adminDoc.exists() && adminDoc.data().isAdmin) {
                        setIsAdmin(true);

                        // WebSocket 연결
                        const websocket = new WebSocket('ws://localhost:8000/ws');

                        websocket.onopen = () => {
                            console.log('WebSocket Connected (Admin)');
                            // 관리자 로그인 알림
                            websocket.send(JSON.stringify({
                                type: 'admin_connect',
                                adminId: currentUser.uid,
                                adminName: currentUser.displayName || '관리자'
                            }));
                        };

                        websocket.onmessage = (event) => {
                            const data = JSON.parse(event.data);
                            // 클라이언트 메시지 처리
                            if (data.tabType === 'personal' && data.type === 'user') {
                                // 새 채팅 알림
                                const notification = new Audio('/assets/sounds/notification.mp3');
                                notification.play();
                            }
                        };

                        setWs(websocket);

                        // 관리자 온라인 상태 확인
                        const adminStatusRef = collection(db, 'adminStatus');
                        const statusSnapshot = await getDocs(adminStatusRef);

                        if (!statusSnapshot.empty) {
                            const statusDoc = statusSnapshot.docs[0];
                            setOnlineStatus(statusDoc.data().online || false);
                        } else {
                            // 관리자 상태 문서가 없으면 생성
                            await addDoc(collection(db, 'adminStatus'), {
                                online: false,
                                updatedAt: serverTimestamp()
                            });
                        }
                    } else {
                        setIsAdmin(false);
                        setNotification({
                            open: true,
                            message: '관리자 권한이 없습니다.',
                            severity: 'error'
                        });
                    }
                } catch (error) {
                    console.error('관리자 확인 중 오류:', error);
                    setNotification({
                        open: true,
                        message: '관리자 확인 중 오류가 발생했습니다.',
                        severity: 'error'
                    });
                }
            } else {
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => {
            unsubscribe();
            // WebSocket 연결 종료
            if (ws) {
                ws.close();
            }
        };
    }, []);

    // 관리자 상태 변경 시 Firebase 업데이트
    useEffect(() => {
        const updateAdminStatus = async () => {
            if (isAdmin && user) {
                try {
                    const statusQuery = query(collection(db, 'adminStatus'));
                    const statusSnapshot = await getDocs(statusQuery);

                    if (!statusSnapshot.empty) {
                        const statusDoc = statusSnapshot.docs[0];
                        await updateDoc(doc(db, 'adminStatus', statusDoc.id), {
                            online: onlineStatus,
                            updatedAt: serverTimestamp()
                        });

                        setNotification({
                            open: true,
                            message: onlineStatus ? '상담사 상태가 온라인으로 변경되었습니다.' : '상담사 상태가 오프라인으로 변경되었습니다.',
                            severity: 'info'
                        });
                    }
                } catch (error) {
                    console.error('관리자 상태 업데이트 중 오류:', error);
                }
            }
        };

        updateAdminStatus();
    }, [onlineStatus, isAdmin, user]);

    // 활성 채팅 목록 가져오기
    useEffect(() => {
        if (!isAdmin) return;

        const q = query(
            collection(db, 'personalChats'),
            where('status', '==', 'active'),
            orderBy('lastMessageTime', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            // userId 별로 그룹화하여 가장 최근 메시지만 표시
            const chatsByUser = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const userId = data.userId;

                if (!chatsByUser[userId] ||
                    data.lastMessageTime.toDate() > chatsByUser[userId].lastMessageTime.toDate()) {
                    chatsByUser[userId] = {
                        id: doc.id,
                        ...data
                    };
                }
            });

            const chats = Object.values(chatsByUser);
            setActiveChats(chats);

            // 선택된 채팅이 없고 채팅이 있으면 첫 번째 채팅 선택
            if (chats.length > 0 && !selectedChat) {
                setSelectedChat(chats[0]);
                loadMessages(chats[0].userId);
            }
        });

        return () => unsubscribe();
    }, [isAdmin, selectedChat]);

    // 선택된 사용자의 메시지 로드
    const loadMessages = (userId) => {
        if (!userId) return;

        const q = query(
            collection(db, 'personalChats'),
            where('userId', '==', userId),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setMessages(loadedMessages);
        });

        return unsubscribe;
    };

    // 채팅 선택 핸들러
    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        loadMessages(chat.userId);
    };

    // 메시지 전송 핸들러
    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedChat || !isAdmin || !ws) return;

        try {
            setSendingMessage(true);

            // WebSocket을 통해 메시지 전송
            const messageData = {
                text: newMessage,
                userId: selectedChat.userId,  // 메시지를 받을 사용자 ID
                userName: user.displayName || '관리자',
                userPhoto: user.photoURL,
                timestamp: new Date().toISOString(),
                type: 'agent',  // 이 부분이 중요: 'agent'로 설정되어야 함
                tabType: 'personal'  // 개인 채팅임을 표시
            };

            ws.send(JSON.stringify(messageData));

            // Firebase에도 메시지 저장
            await addDoc(collection(db, 'personalChats'), {
                text: newMessage,
                userId: selectedChat.userId,
                userName: user.displayName || '관리자',
                userPhoto: user.photoURL,
                timestamp: serverTimestamp(),
                type: 'agent',
                status: 'active',
                lastMessageTime: serverTimestamp(),
                tabType: 'personal'
            });

            setNewMessage('');
        } catch (error) {
            console.error('메시지 전송 중 오류:', error);
            setNotification({
                open: true,
                message: '메시지 전송 중 오류가 발생했습니다.',
                severity: 'error'
            });
        } finally {
            setSendingMessage(false);
        }
    };

    // 채팅 종료 핸들러
    const handleCloseChat = (chat) => {
        setChatToClose(chat);
        setConfirmDialogOpen(true);
    };

    // 채팅 종료 확인
    const confirmCloseChat = async () => {
        if (!chatToClose) return;

        try {
            // 해당 사용자의 모든 채팅 메시지 상태 업데이트
            const chatQuery = query(
                collection(db, 'personalChats'),
                where('userId', '==', chatToClose.userId)
            );

            const chatSnapshot = await getDocs(chatQuery);

            const updatePromises = chatSnapshot.docs.map(doc =>
                updateDoc(doc.ref, { status: 'closed' })
            );

            await Promise.all(updatePromises);

            // 종료 메시지 전송
            await addDoc(collection(db, 'personalChats'), {
                text: '상담이 종료되었습니다. 추가 문의가 있으시면 새로운 상담을 시작해주세요.',
                userId: chatToClose.userId,
                userName: '시스템',
                timestamp: serverTimestamp(),
                type: 'system',
                status: 'closed',
                lastMessageTime: serverTimestamp(),
                tabType: 'personal'
            });

            setNotification({
                open: true,
                message: '상담이 종료되었습니다.',
                severity: 'success'
            });

            // 채팅 선택 초기화
            if (selectedChat && selectedChat.userId === chatToClose.userId) {
                setSelectedChat(null);
                setMessages([]);
            }
        } catch (error) {
            console.error('채팅 종료 중 오류:', error);
            setNotification({
                open: true,
                message: '채팅 종료 중 오류가 발생했습니다.',
                severity: 'error'
            });
        } finally {
            setConfirmDialogOpen(false);
            setChatToClose(null);
        }
    };

    // 날짜 포맷팅
    const formatDate = (timestamp) => {
        if (!timestamp) return '';

        const date = timestamp instanceof Date
            ? timestamp
            : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

        return new Intl.DateTimeFormat('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // 로딩 중이면 로딩 표시
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // 관리자가 아니면 접근 거부 메시지
    if (!isAdmin) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    textAlign: 'center',
                    p: 3
                }}
            >
                <Typography variant="h4" color="error" gutterBottom>
                    접근 권한이 없습니다
                </Typography>
                <Typography variant="body1" mb={3}>
                    이 페이지는 관리자만 접근할 수 있습니다.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => window.location.href = '/'}
                    sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: 'white'
                    }}
                >
                    홈으로 돌아가기
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 600,
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        관리자 상담 페이지
                    </Typography>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={onlineStatus}
                                onChange={(e) => setOnlineStatus(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={onlineStatus ? "온라인" : "오프라인"}
                        sx={{
                            border: '1px solid',
                            borderColor: onlineStatus ? 'success.main' : 'grey.400',
                            borderRadius: 2,
                            px: 2,
                            backgroundColor: onlineStatus ? 'rgba(46, 125, 50, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        }}
                    />
                </Box>

                <Grid container spacing={2}>
                    {/* 채팅 목록 패널 */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper
                            elevation={3}
                            sx={{
                                height: '75vh',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 2,
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
                                <Typography variant="h6">대기 중인 상담 ({activeChats.length})</Typography>
                            </Box>

                            <List sx={{ overflow: 'auto', flex: 1, p: 0 }}>
                                {activeChats.length > 0 ? (
                                    activeChats.map((chat) => (
                                        <ListItem
                                            key={chat.id}
                                            button
                                            selected={selectedChat && selectedChat.userId === chat.userId}
                                            onClick={() => handleSelectChat(chat)}
                                            sx={{
                                                borderBottom: '1px solid',
                                                borderColor: 'divider',
                                                '&.Mui-selected': {
                                                    bgcolor: 'rgba(33, 150, 243, 0.1)',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(33, 150, 243, 0.2)',
                                                    }
                                                }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Badge
                                                    color="secondary"
                                                    variant="dot"
                                                    invisible={selectedChat && selectedChat.userId === chat.userId}
                                                >
                                                    <Avatar src={chat.userPhoto}>
                                                        <PersonIcon />
                                                    </Avatar>
                                                </Badge>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={chat.userName || '사용자'}
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <AccessTimeIcon fontSize="small" />
                                                        {formatDate(chat.lastMessageTime)}
                                                    </Box>
                                                }
                                                sx={{
                                                    '& .MuiListItemText-primary': { fontWeight: 500 }
                                                }}
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <Box sx={{ p: 3, textAlign: 'center' }}>
                                        <Typography color="text.secondary">
                                            대기 중인 상담이 없습니다.
                                        </Typography>
                                    </Box>
                                )}
                            </List>
                        </Paper>
                    </Grid>

                    {/* 채팅 영역 */}
                    <Grid item xs={12} md={8} lg={9}>
                        <Paper
                            elevation={3}
                            sx={{
                                height: '75vh',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 2,
                                overflow: 'hidden'
                            }}
                        >
                            {selectedChat ? (
                                <>
                                    {/* 채팅 헤더 */}
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderBottom: 1,
                                            borderColor: 'divider',
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar src={selectedChat.userPhoto}>
                                                <PersonIcon />
                                            </Avatar>
                                            <Typography variant="h6">
                                                {selectedChat.userName || '사용자'}
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            onClick={() => handleCloseChat(selectedChat)}
                                            sx={{ borderRadius: 4 }}
                                        >
                                            상담 종료
                                        </Button>
                                    </Box>

                                    {/* 메시지 영역 */}
                                    <List
                                        sx={{
                                            flex: 1,
                                            overflow: 'auto',
                                            p: 2,
                                            bgcolor: 'rgba(255, 255, 255, 0.8)'
                                        }}
                                    >
                                        {messages.map((message) => (
                                            <ListItem
                                                key={message.id}
                                                sx={{
                                                    flexDirection: message.type === 'agent' ? 'row-reverse' : 'row',
                                                    alignItems: 'flex-start',
                                                    py: 1
                                                }}
                                            >
                                                {message.type !== 'system' && (
                                                    <ListItemAvatar sx={{ minWidth: 40 }}>
                                                        <Avatar
                                                            src={message.userPhoto}
                                                            sx={{
                                                                width: 36,
                                                                height: 36,
                                                                mx: message.type === 'agent' ? 1 : 0
                                                            }}
                                                        >
                                                            {message.type === 'user' ? <PersonIcon /> : null}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                )}

                                                <ListItemText
                                                    primary={message.type !== 'system' ? message.userName : null}
                                                    secondary={
                                                        <Box>
                                                            <Paper
                                                                elevation={0}
                                                                sx={{
                                                                    p: 1.5,
                                                                    display: 'inline-block',
                                                                    backgroundColor:
                                                                        message.type === 'agent' ? '#2196F3' :
                                                                            message.type === 'system' ? '#f5f5f5' :
                                                                                '#e0e0e0',
                                                                    color: message.type === 'agent' ? 'white' : 'text.primary',
                                                                    borderRadius: 2,
                                                                    maxWidth: '70%'
                                                                }}
                                                            >
                                                                <Typography variant="body1">
                                                                    {message.text}
                                                                </Typography>
                                                            </Paper>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    display: 'block',
                                                                    mt: 0.5,
                                                                    color: 'text.secondary',
                                                                    textAlign: message.type === 'agent' ? 'right' : 'left'
                                                                }}
                                                            >
                                                                {formatDate(message.timestamp)}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{
                                                        '& .MuiListItemText-primary': {
                                                            fontWeight: 600,
                                                            mb: 0.5,
                                                            color: message.type === 'agent' ? 'primary.main' : 'text.primary'
                                                        },
                                                        textAlign: message.type === 'agent' ? 'right' : 'left',
                                                        m: message.type === 'system' ? '0 auto' : 0
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </List>

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
                                                disabled={sendingMessage || !onlineStatus}
                                                sx={{ bgcolor: 'white' }}
                                            />
                                            <Button
                                                variant="contained"
                                                type="submit"
                                                disabled={sendingMessage || !onlineStatus}
                                                sx={{
                                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                                    color: 'white',
                                                    minWidth: '100px'
                                                }}
                                                endIcon={sendingMessage ? <CircularProgress size={20} /> : <SendIcon />}
                                            >
                                                전송
                                            </Button>
                                        </Box>
                                    </Box>
                                </>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '100%',
                                        p: 3,
                                        textAlign: 'center'
                                    }}
                                >
                                    <img
                                        src="/assets/images/chatai.png"
                                        alt="Chat Illustration"
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            marginBottom: '24px',
                                            opacity: 0.7
                                        }}
                                    />
                                    <Typography variant="h5" color="text.secondary" gutterBottom>
                                        채팅을 선택해주세요
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        왼쪽 패널에서 상담할 사용자를 선택하세요.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* 알림 Snackbar */}
                <Snackbar
                    open={notification.open}
                    autoHideDuration={5000}
                    onClose={() => setNotification({ ...notification, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setNotification({ ...notification, open: false })}
                        severity={notification.severity}
                        sx={{ width: '100%' }}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>

                {/* 상담 종료 확인 다이얼로그 */}
                <Dialog
                    open={confirmDialogOpen}
                    onClose={() => setConfirmDialogOpen(false)}
                >
                    <DialogTitle>상담 종료 확인</DialogTitle>
                    <DialogContent>
                        <Typography>
                            {chatToClose?.userName || '사용자'}님과의 상담을 종료하시겠습니까?
                            종료된 상담은 다시 열 수 없습니다.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmDialogOpen(false)}>
                            취소
                        </Button>
                        <Button
                            onClick={confirmCloseChat}
                            color="error"
                            variant="contained"
                        >
                            종료
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default ServiceAdmin;