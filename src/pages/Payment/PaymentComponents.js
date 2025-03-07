import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    Box,
    Card,
    CardContent,
    CardActions,
    Grid,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { auth } from '../../firebase/firebase';
import { setUserMembership, checkMembershipStatus, membershipTypes } from './membership';
import { initiateKakaoPayment } from './KakaoPayService';
import { useNavigate } from 'react-router-dom';

// 결제 옵션 컴포넌트
export const PaymentModal = ({ open, handleClose }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const plans = [
        {
            id: 'standard',
            name: '스탠다드 플랜',
            price: 9900,
            priceDisplay: '9,900원',
            period: '월간',
            features: [
                '일 10회 스타일 변경',
                '표준 해상도 이미지',
                '기본 AI 필터',
                'SNS 공유 기능'
            ]
        },
        {
            id: 'pro',
            name: '프로 플랜',
            price: 19900,
            priceDisplay: '19,900원',
            period: '월간',
            features: [
                '일 무제한 스타일 변경',
                '고해상도 이미지',
                '프리미엄 AI 필터',
                'SNS 공유 기능',
                '워터마크 제거',
                '우선순위 고객 지원'
            ]
        }
    ];

    const handlePlanSelect = async (plan) => {
        try {
            setSelectedPlan(plan);
            setLoading(true);
            setError(null);

            // 현재 로그인한 사용자 ID 가져오기
            const userId = auth.currentUser?.uid;

            if (!userId) {
                throw new Error('사용자가 로그인되어 있지 않습니다.');
            }

            // 카카오페이 결제 시작
            const kakaoPayResponse = await initiateKakaoPayment(userId, {
                id: plan.id,
                name: plan.name,
                price: plan.price
            });

            if (!kakaoPayResponse.success) {
                throw new Error('카카오페이 결제 초기화에 실패했습니다.');
            }

            // 카카오페이 결제 페이지로 리디렉션
            window.location.href = kakaoPayResponse.next_redirect_pc_url;
        } catch (error) {
            console.error('Payment initialization error:', error);
            setError(error.message || '결제 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        멤버십 플랜 선택
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        sx={{ color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ py: 3 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                            <CircularProgress />
                            <Typography sx={{ ml: 2 }}>결제를 준비하는 중입니다...</Typography>
                        </Box>
                    ) : (
                        <>
                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {error}
                                </Alert>
                            )}
                            <Grid container spacing={3}>
                                {plans.map((plan) => (
                                    <Grid item xs={12} md={6} key={plan.id}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: 2,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                border: '1px solid',
                                                borderColor: plan.id === 'pro' ? 'primary.main' : 'divider',
                                                position: 'relative',
                                                overflow: 'visible',
                                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                                                }
                                            }}
                                        >
                                            {plan.id === 'pro' && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -12,
                                                        right: 24,
                                                        backgroundColor: 'primary.main',
                                                        color: 'white',
                                                        px: 2,
                                                        py: 0.5,
                                                        borderRadius: 1,
                                                        fontWeight: 'bold',
                                                        fontSize: '0.875rem',
                                                        boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)'
                                                    }}
                                                >
                                                    추천
                                                </Box>
                                            )}

                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h5" gutterBottom fontWeight={600}>
                                                    {plan.name}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                                                    <Typography variant="h4" component="span" fontWeight={700} color="primary">
                                                        {plan.priceDisplay}
                                                    </Typography>
                                                    <Typography variant="subtitle1" component="span" color="text.secondary" sx={{ ml: 1 }}>
                                                        / {plan.period}
                                                    </Typography>
                                                </Box>

                                                <Divider sx={{ my: 2 }} />

                                                <List disablePadding>
                                                    {plan.features.map((feature, index) => (
                                                        <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                                <CheckCircleIcon color="primary" fontSize="small" />
                                                            </ListItemIcon>
                                                            <ListItemText primary={feature} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </CardContent>

                                            <CardActions sx={{ p: 2, pt: 0 }}>
                                                <Button
                                                    fullWidth
                                                    variant={plan.id === 'pro' ? "contained" : "outlined"}
                                                    size="large"
                                                    onClick={() => handlePlanSelect(plan)}
                                                    sx={{
                                                        py: 1.5,
                                                        borderRadius: 2,
                                                        fontWeight: 600,
                                                        ...(plan.id === 'pro' && {
                                                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                                        })
                                                    }}
                                                >
                                                    카카오페이로 결제하기
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleClose} color="primary">
                        취소
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

// 결제 버튼 컴포넌트 - AppBar에 추가될 버튼
export const PaymentButton = ({ onClick }) => {
    return (
        <Button
            sx={{
                color: 'text.primary',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' }
            }}
            onClick={onClick}
            startIcon={<CreditCardIcon />}
        >
            멤버십 결제
        </Button>
    );
};