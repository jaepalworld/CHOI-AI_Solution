import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    Button,
    Tabs,
    Tab,
    TextField,
    InputAdornment,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Chip,
    Badge,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Search as SearchIcon,
    Message as MessageIcon,
    Person as PersonIcon,
    Schedule as ScheduleIcon,
    Check as CheckIcon,
    Flag as FlagIcon,
    Assignment as AssignmentIcon,
    ChatBubble as ChatBubbleIcon,
    AccessTime as AccessTimeIcon,
    FilterList as FilterListIcon,
    PlayArrow as PlayArrowIcon,
    Stop as StopIcon,
    AssignmentInd as AssignmentIndIcon,
    Note as NoteIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

const ChatManagement = () => {
    // 상태 관리
    const [chats, setChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState('');
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [admins, setAdmins] = useState([
        { id: 'admin1', name: '김관리자' },
        { id: 'admin2', name: '이상담' },
        { id: 'admin3', name: '박지원' }
    ]);

    // 통계 데이터
    const [stats, setStats] = useState({
        waiting: 0,
        inProgress: 0,
        completed: 0
    });

    // 초기 데이터 로드
    useEffect(() => {
        fetchChats();
    }, []);

    // 채팅 데이터 가져오기
    const fetchChats = async () => {
        try {
            const chatsQuery = query(
                collection(db, 'personalChats')
            );

            const querySnapshot = await getDocs(chatsQuery);
            const chatsList = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();

                // 채팅 상태에 따라 적절한 값으로 설정 (예시)
                // 실제로는 DB에서 가져온 값 사용
                const chatItem = {
                    id: doc.id,
                    userName: data.userName || '익명 사용자',
                    userPhoto: data.userPhoto,
                    text: data.text || '새로운 상담 요청',
                    timestamp: data.timestamp,
                    status: data.status || 'waiting', // waiting, inProgress, completed
                    priority: data.priority || 'normal', // low, normal, high
                    assignedTo: data.assignedTo || null,
                    notes: data.notes || [],
                    waitingTime: calculateWaitingTime(data.timestamp)
                };

                chatsList.push(chatItem);
            });

            // 날짜 기준 내림차순 정렬
            chatsList.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

            setChats(chatsList);
            setFilteredChats(chatsList);
            updateStats(chatsList);
        } catch (error) {
            console.error('채팅 목록 가져오기 오류:', error);
        }
    };

    // 대기 시간 계산
    const calculateWaitingTime = (timestamp) => {
        if (!timestamp) return '알 수 없음';

        const now = new Date();
        const chatTime = timestamp.toDate();
        const diffInMs = now - chatTime;

        const minutes = Math.floor(diffInMs / (1000 * 60));
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}시간 ${minutes % 60}분`;
        } else {
            return `${minutes}분`;
        }
    };

    // 통계 업데이트
    const updateStats = (chatsList) => {
        const waiting = chatsList.filter(chat => chat.status === 'waiting').length;
        const inProgress = chatsList.filter(chat => chat.status === 'inProgress').length;
        const completed = chatsList.filter(chat => chat.status === 'completed').length;

        setStats({ waiting, inProgress, completed });
    };

    // 필터링 변경 처리
    useEffect(() => {
        let result = chats;

        // 상태별 필터링
        if (filterStatus !== 'all') {
            result = result.filter(chat => chat.status === filterStatus);
        }

        // 검색어 필터링
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(chat =>
                chat.userName.toLowerCase().includes(term) ||
                chat.text.toLowerCase().includes(term)
            );
        }

        setFilteredChats(result);
    }, [filterStatus, searchTerm, chats]);

    // 채팅 상태 변경 핸들러
    const handleStatusChange = async (chatId, newStatus) => {
        try {
            // Firestore 업데이트
            await updateDoc(doc(db, 'personalChats', chatId), {
                status: newStatus,
                lastUpdated: Timestamp.now()
            });

            // 로컬 상태 업데이트
            const updatedChats = chats.map(chat => {
                if (chat.id === chatId) {
                    return { ...chat, status: newStatus };
                }
                return chat;
            });

            setChats(updatedChats);
            updateStats(updatedChats);

            // 현재 선택된 채팅이면 선택된 채팅 정보도 업데이트
            if (selectedChat && selectedChat.id === chatId) {
                setSelectedChat({ ...selectedChat, status: newStatus });
            }
        } catch (error) {
            console.error('상태 변경 오류:', error);
        }
    };

    // 관리자 할당 다이얼로그 열기
    const handleOpenAssignDialog = (chat) => {
        setSelectedChat(chat);
        setSelectedAdmin(chat.assignedTo || '');
        setAssignDialogOpen(true);
    };

    // 관리자 할당 처리
    const handleAssign = async () => {
        try {
            if (!selectedChat) return;

            // Firestore 업데이트
            await updateDoc(doc(db, 'personalChats', selectedChat.id), {
                assignedTo: selectedAdmin,
                lastUpdated: Timestamp.now()
            });

            // 로컬 상태 업데이트
            const updatedChats = chats.map(chat => {
                if (chat.id === selectedChat.id) {
                    return { ...chat, assignedTo: selectedAdmin };
                }
                return chat;
            });

            setChats(updatedChats);
            setSelectedChat({ ...selectedChat, assignedTo: selectedAdmin });
            setAssignDialogOpen(false);
        } catch (error) {
            console.error('관리자 할당 오류:', error);
        }
    };

    // 메모 다이얼로그 열기
    const handleOpenNoteDialog = (chat) => {
        setSelectedChat(chat);
        setNoteText('');
        setNoteDialogOpen(true);
    };

    // 메모 추가 처리
    const handleAddNote = async () => {
        try {
            if (!selectedChat || !noteText.trim()) return;

            const newNote = {
                text: noteText,
                timestamp: Timestamp.now(),
                author: 'current_admin' // 실제로는 현재 로그인한 관리자 ID
            };

            const updatedNotes = [...(selectedChat.notes || []), newNote];

            // Firestore 업데이트
            await updateDoc(doc(db, 'personalChats', selectedChat.id), {
                notes: updatedNotes,
                lastUpdated: Timestamp.now()
            });

            // 로컬 상태 업데이트
            const updatedChats = chats.map(chat => {
                if (chat.id === selectedChat.id) {
                    return { ...chat, notes: updatedNotes };
                }
                return chat;
            });

            setChats(updatedChats);
            setSelectedChat({ ...selectedChat, notes: updatedNotes });
            setNoteDialogOpen(false);
        } catch (error) {
            console.error('메모 추가 오류:', error);
        }
    };

    // 채팅 선택 핸들러
    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
    };

    // 우선순위에 따른 칩 색상
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'error';
            case 'normal':
                return 'primary';
            case 'low':
                return 'success';
            default:
                return 'default';
        }
    };

    // 상태에 따른 칩 색상
    const getStatusColor = (status) => {
        switch (status) {
            case 'waiting':
                return 'warning';
            case 'inProgress':
                return 'info';
            case 'completed':
                return 'success';
            default:
                return 'default';
        }
    };

    // 상태 이름 변환
    const getStatusName = (status) => {
        switch (status) {
            case 'waiting':
                return '대기중';
            case 'inProgress':
                return '진행중';
            case 'completed':
                return '완료됨';
            default:
                return '알 수 없음';
        }
    };

    // 우선순위 이름 변환
    const getPriorityName = (priority) => {
        switch (priority) {
            case 'high':
                return '긴급';
            case 'normal':
                return '보통';
            case 'low':
                return '낮음';
            default:
                return '보통';
        }
    };

    // 담당자 이름 가져오기
    const getAdminName = (adminId) => {
        if (!adminId) return '미할당';
        const admin = admins.find(a => a.id === adminId);
        return admin ? admin.name : '미할당';
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 3, mb: 5 }}>
            <Typography variant="h4" gutterBottom fontWeight="medium">
                상담 관리
            </Typography>

            {/* 상담 통계 카드 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#FFF9C4' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Badge badgeContent={stats.waiting} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: 16, height: 26, minWidth: 26 } }}>
                                    <ScheduleIcon fontSize="large" color="warning" />
                                </Badge>
                                <Typography variant="h6" sx={{ ml: 2 }}>대기 중인 상담</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
                                {stats.waiting}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#E3F2FD' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Badge badgeContent={stats.inProgress} color="info" sx={{ '& .MuiBadge-badge': { fontSize: 16, height: 26, minWidth: 26 } }}>
                                    <MessageIcon fontSize="large" color="info" />
                                </Badge>
                                <Typography variant="h6" sx={{ ml: 2 }}>진행 중인 상담</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
                                {stats.inProgress}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#E8F5E9' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Badge badgeContent={stats.completed} color="success" sx={{ '& .MuiBadge-badge': { fontSize: 16, height: 26, minWidth: 26 } }}>
                                    <CheckIcon fontSize="large" color="success" />
                                </Badge>
                                <Typography variant="h6" sx={{ ml: 2 }}>완료된 상담</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
                                {stats.completed}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 필터 및 검색 */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4} md={3}>
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel id="filter-status-label">상태 필터</InputLabel>
                            <Select
                                labelId="filter-status-label"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                label="상태 필터"
                                startAdornment={
                                    <InputAdornment position="start">
                                        <FilterListIcon fontSize="small" />
                                    </InputAdornment>
                                }
                            >
                                <MenuItem value="all">모든 상담</MenuItem>
                                <MenuItem value="waiting">대기 중</MenuItem>
                                <MenuItem value="inProgress">진행 중</MenuItem>
                                <MenuItem value="completed">완료됨</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={7}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="사용자 이름 또는 내용으로 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2} md={2} textAlign="right">
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchChats}
                        >
                            새로고침
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* 상담 목록 테이블 */}
            <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell>사용자</TableCell>
                            <TableCell>내용</TableCell>
                            <TableCell>상태</TableCell>
                            <TableCell>우선순위</TableCell>
                            <TableCell>대기 시간</TableCell>
                            <TableCell>담당자</TableCell>
                            <TableCell align="center">관리</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredChats.length > 0 ? (
                            filteredChats.map((chat) => (
                                <TableRow
                                    key={chat.id}
                                    hover
                                    onClick={() => handleSelectChat(chat)}
                                    selected={selectedChat && selectedChat.id === chat.id}
                                    sx={{
                                        cursor: 'pointer',
                                        '&.Mui-selected': {
                                            bgcolor: 'rgba(25, 118, 210, 0.08)'
                                        }
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <PersonIcon color="action" sx={{ mr: 1 }} />
                                            <Typography variant="body2">{chat.userName}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                maxWidth: 250,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {chat.text}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={getStatusName(chat.status)}
                                            color={getStatusColor(chat.status)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            icon={<FlagIcon />}
                                            label={getPriorityName(chat.priority)}
                                            color={getPriorityColor(chat.priority)}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                            <Typography variant="body2">{chat.waitingTime}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{getAdminName(chat.assignedTo)}</TableCell>
                                    <TableCell align="center">
                                        <Box>
                                            {chat.status === 'waiting' && (
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    title="상담 시작"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(chat.id, 'inProgress');
                                                    }}
                                                >
                                                    <PlayArrowIcon />
                                                </IconButton>
                                            )}
                                            {chat.status === 'inProgress' && (
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    title="상담 완료"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(chat.id, 'completed');
                                                    }}
                                                >
                                                    <CheckIcon />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                size="small"
                                                color="info"
                                                title="관리자 할당"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenAssignDialog(chat);
                                                }}
                                            >
                                                <AssignmentIndIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="warning"
                                                title="메모 추가"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenNoteDialog(chat);
                                                }}
                                            >
                                                <NoteIcon />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">
                                        {searchTerm || filterStatus !== 'all'
                                            ? '검색 결과가 없습니다.'
                                            : '상담 내역이 없습니다.'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 할당 다이얼로그 */}
            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
                <DialogTitle>관리자 할당</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel id="assign-admin-label">담당 관리자</InputLabel>
                        <Select
                            labelId="assign-admin-label"
                            value={selectedAdmin}
                            onChange={(e) => setSelectedAdmin(e.target.value)}
                            label="담당 관리자"
                        >
                            <MenuItem value="">미할당</MenuItem>
                            {admins.map(admin => (
                                <MenuItem key={admin.id} value={admin.id}>{admin.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialogOpen(false)}>취소</Button>
                    <Button onClick={handleAssign} variant="contained">할당</Button>
                </DialogActions>
            </Dialog>

            {/* 메모 다이얼로그 */}
            <Dialog
                open={noteDialogOpen}
                onClose={() => setNoteDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>메모 추가</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="메모 내용"
                        fullWidth
                        multiline
                        rows={4}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNoteDialogOpen(false)}>취소</Button>
                    <Button
                        onClick={handleAddNote}
                        variant="contained"
                        disabled={!noteText.trim()}
                    >
                        추가
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ChatManagement;