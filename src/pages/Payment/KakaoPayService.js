import axios from 'axios';

const KAKAO_PAY_API_KEY = process.env.REACT_APP_KAKAO_PAY_API_KEY;
const KAKAO_PAY_CID = process.env.REACT_APP_KAKAO_PAY_CID || 'TC0ONETIME'; // 환경 변수가 없으면 기본값 사용
const REDIRECT_URL = window.location.origin;

// 카카오페이 결제 요청 시작
export const initiateKakaoPayment = async (userId, plan) => {
  try {
    const orderInfo = {
      cid: KAKAO_PAY_CID,
      partner_order_id: `order_${Date.now()}`,
      partner_user_id: userId,
      item_name: plan.name,
      quantity: 1,
      total_amount: plan.price,
      vat_amount: Math.floor(plan.price / 11), // VAT calculation (10%)
      tax_free_amount: 0,
      approval_url: `${REDIRECT_URL}/payment/success`,
      cancel_url: `${REDIRECT_URL}/payment/cancel`,
      fail_url: `${REDIRECT_URL}/payment/fail`,
    };

    // Kakao Pay Ready API
    const response = await axios({
      method: 'POST',
      url: 'https://kapi.kakao.com/v1/payment/ready',
      headers: {
        'Authorization': `KakaoAK ${KAKAO_PAY_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      data: new URLSearchParams(orderInfo).toString(),
    });

    // Store transaction info in localStorage for later use
    localStorage.setItem('kakaoPayTid', response.data.tid);
    localStorage.setItem('kakaoPayOrderId', orderInfo.partner_order_id);
    localStorage.setItem('kakaoPayUserId', userId);
    localStorage.setItem('kakaoPayPlanType', plan.id);
    localStorage.setItem('kakaoPayPlanPrice', plan.price);

    // Return the response with payment URL
    return {
      success: true,
      next_redirect_pc_url: response.data.next_redirect_pc_url,
      next_redirect_mobile_url: response.data.next_redirect_mobile_url,
      tid: response.data.tid,
    };
  } catch (error) {
    console.error('Kakao Pay initiation error:', error);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

// Approve Kakao Pay Payment after user confirms
export const approveKakaoPayment = async (pg_token) => {
  try {
    // Retrieve stored transaction info
    const tid = localStorage.getItem('kakaoPayTid');
    const partner_order_id = localStorage.getItem('kakaoPayOrderId');
    const partner_user_id = localStorage.getItem('kakaoPayUserId');

    if (!tid || !partner_order_id || !partner_user_id) {
      throw new Error('Transaction information is missing');
    }

    // Kakao Pay Approve API
    const response = await axios({
      method: 'POST',
      url: 'https://kapi.kakao.com/v1/payment/approve',
      headers: {
        'Authorization': `KakaoAK ${KAKAO_PAY_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      data: new URLSearchParams({
        cid: KAKAO_PAY_CID,
        tid,
        partner_order_id,
        partner_user_id,
        pg_token,
      }).toString(),
    });

    // Clear stored transaction info
    localStorage.removeItem('kakaoPayTid');
    localStorage.removeItem('kakaoPayOrderId');
    localStorage.removeItem('kakaoPayUserId');

    // Get plan info to return
    const planType = localStorage.getItem('kakaoPayPlanType');
    const planPrice = localStorage.getItem('kakaoPayPlanPrice');
    
    localStorage.removeItem('kakaoPayPlanType');
    localStorage.removeItem('kakaoPayPlanPrice');

    // Return success and payment details
    return {
      success: true,
      payment_info: response.data,
      plan_type: planType,
      amount: planPrice
    };
  } catch (error) {
    console.error('Kakao Pay approval error:', error);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

// Cancel Kakao Pay Payment
export const cancelKakaoPayment = async (tid, cancel_amount, cancel_tax_free_amount = 0) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://kapi.kakao.com/v1/payment/cancel',
      headers: {
        'Authorization': `KakaoAK ${KAKAO_PAY_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      data: new URLSearchParams({
        cid: KAKAO_PAY_CID,
        tid,
        cancel_amount,
        cancel_tax_free_amount,
      }).toString(),
    });

    return {
      success: true,
      cancel_info: response.data,
    };
  } catch (error) {
    console.error('Kakao Pay cancellation error:', error);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};