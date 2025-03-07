// src/pages/Payment/PaymentSuccessPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { auth } from '../../firebase/firebase';
import { approveKakaoPayment } from './KakaoPayService';
import { setUserMembership } from './membership';

const PaymentSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);

    useEffect(() => {
        const finalizePurchase = async () => {
            try {
                setLoading(true);
                // 현재 URL에서 pg_token 추출
                const queryParams = new URLSearchParams(location.search);
                const pgToken = queryParams.get('pg_token');

                if (!pgToken) {
                    throw new Error('결제 정보를 찾을 수 없습니다.');
                }

                // 현재 로그인한 사용자 ID 확인
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    throw new Error('사용자가 로그인되어 있지 않습니다.');
                }

                // 카카오페이 결제 승인 요청
                const approvalResult = await approveKakaoPayment(pgToken);

                if (!approvalResult.success) {
                    throw new Error('결제 승인에 실패했습니다.');
                }

                // 결제 정보를 Firebase에 저장
                const paymentInfo = {
                    tid: approvalResult.payment_info.tid,
                    payment_method_type: approvalResult.payment_info.payment_method_type,
                    approved_at: approvalResult.payment_info.approved_at,
                    kakao_payment_data: approvalResult.payment_info,
                };

                await setUserMembership(userId, approvalResult.plan_type, paymentInfo);

                setPaymentResult({
                    planType: approvalResult.plan_type,
                    amount: approvalResult.amount,
                    paymentDate: new Date().toLocaleString(),
                });
            } catch (error) {
                console.error('Payment completion error:', error);
                setError(error.message || '결제 처리 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        finalizePurchase();
    }, [location.search, navigate]);

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    borderRadius: 2,
                    textAlign: 'center',
                }}
            >
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                        <CircularProgress size={60} sx={{ mb: 3 }} />
                        <Typography variant="h6">결제를 완료하는 중입니다...</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            잠시만 기다려주세요. 이 페이지를 닫지 마세요.
                        </Typography>
                    </Box>
                ) : error ? (
                    <Box>
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => navigate('/')}
                            sx={{ mt: 3 }}
                        >
                            메인으로 돌아가기
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        <CheckCircle
                            color="primary"
                            sx={{ fontSize: 80, mb: 3 }}
                        />
                        <Typography variant="h4" gutterBottom fontWeight={600}>
                            결제가 완료되었습니다!
                        </Typography>
                        <Typography variant="body1" paragraph>
                            카카오페이 결제가 성공적으로 처리되었습니다.
                        </Typography>

                        <Box
                            sx={{
                                background: 'rgba(33, 150, 243, 0.1)',
                                p: 3,
                                borderRadius: 2,
                                my: 3,
                            }}
                        >
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                구매 정보
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">멤버십 유형:</Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {paymentResult.planType === 'standard' ? '스탠다드 플랜' : '프로 플랜'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">결제 금액:</Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {parseInt(paymentResult.amount).toLocaleString()}원
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">결제 일시:</Typography>
                                <Typography variant="body2" fontWeight={500}>{paymentResult.paymentDate}</Typography>
                            </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" paragraph>
                            멤버십이 활성화되었습니다. 이제 모든 기능을 이용하실 수 있습니다.
                        </Typography>

                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                py: 1.5,
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                borderRadius: 2,
                                fontWeight: 600,
                            }}
                            onClick={() => navigate('/mypage')}
                        >
                            마이페이지로 이동
                        </Button>

                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
                            onClick={() => navigate('/')}
                        >
                            메인으로 돌아가기
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default PaymentSuccessPage;