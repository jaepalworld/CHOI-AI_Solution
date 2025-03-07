// src/pages/Payment/PaymentFailPage.js
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Alert
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

const PaymentFailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // 결제 실패 시 로컬 스토리지에 저장된 결제 정보 삭제
        localStorage.removeItem('kakaoPayTid');
        localStorage.removeItem('kakaoPayOrderId');
        localStorage.removeItem('kakaoPayUserId');
        localStorage.removeItem('kakaoPayPlanType');
        localStorage.removeItem('kakaoPayPlanPrice');
    }, []);

    // URL에서 오류 파라미터 추출
    const queryParams = new URLSearchParams(location.search);
    const errorCode = queryParams.get('code');
    const errorMessage = queryParams.get('message');

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
                <ErrorIcon
                    sx={{ fontSize: 80, mb: 3, color: '#f44336' }}
                />
                <Typography variant="h4" gutterBottom fontWeight={600}>
                    결제에 실패했습니다
                </Typography>
                <Typography variant="body1" paragraph>
                    카카오페이 결제 중 오류가 발생했습니다.
                </Typography>

                {(errorCode || errorMessage) && (
                    <Alert severity="error" sx={{ mb: 4, mt: 2, textAlign: 'left' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            오류 정보:
                        </Typography>
                        {errorCode && (
                            <Typography variant="body2">
                                오류 코드: {errorCode}
                            </Typography>
                        )}
                        {errorMessage && (
                            <Typography variant="body2">
                                오류 메시지: {errorMessage}
                            </Typography>
                        )}
                    </Alert>
                )}

                <Typography variant="body2" color="text.secondary" paragraph>
                    잠시 후 다시 시도하시거나, 문제가 지속되면 고객센터로 문의해주세요.
                </Typography>

                <Button
                    variant="contained"
                    fullWidth
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                    }}
                    onClick={() => navigate('/')}
                >
                    메인으로 돌아가기
                </Button>

                <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
                    onClick={() => {
                        // 멤버십 결제 페이지로 이동하는 대신, 메인 페이지로 이동 후 모달 열기를 위한 상태 설정
                        navigate('/', { state: { openPaymentModal: true } });
                    }}
                >
                    다시 결제하기
                </Button>

                <Button
                    variant="text"
                    fullWidth
                    sx={{ mt: 1, py: 1 }}
                    onClick={() => navigate('/service/chat')}
                >
                    고객센터 문의하기
                </Button>
            </Paper>
        </Container>
    );
};

export default PaymentFailPage;