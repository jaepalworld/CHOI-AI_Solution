// src/pages/Payment/PaymentCancelPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Alert
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

const PaymentCancelPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // 결제 취소 시 로컬 스토리지에 저장된 결제 정보 삭제
        localStorage.removeItem('kakaoPayTid');
        localStorage.removeItem('kakaoPayOrderId');
        localStorage.removeItem('kakaoPayUserId');
        localStorage.removeItem('kakaoPayPlanType');
        localStorage.removeItem('kakaoPayPlanPrice');
    }, []);

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
                <CancelIcon
                    sx={{ fontSize: 80, mb: 3, color: '#f44336' }}
                />
                <Typography variant="h4" gutterBottom fontWeight={600}>
                    결제가 취소되었습니다
                </Typography>
                <Typography variant="body1" paragraph>
                    카카오페이 결제가 사용자에 의해 취소되었습니다.
                </Typography>

                <Alert severity="info" sx={{ mb: 4, mt: 2 }}>
                    결제를 다시 시도하시려면 멤버십 결제 메뉴에서 다시 시도해주세요.
                </Alert>

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
            </Paper>
        </Container>
    );
};

export default PaymentCancelPage;