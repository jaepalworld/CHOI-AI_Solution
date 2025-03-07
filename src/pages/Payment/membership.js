// src/pages/Payment/membership.js
import { db } from '../../firebase/firebase';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    addDoc
} from 'firebase/firestore';

// 사용자 멤버십 정보 가져오기
export const getUserMembership = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().membership) {
            return userDoc.data().membership;
        }

        return null;
    } catch (error) {
        console.error('Error fetching user membership:', error);
        throw error;
    }
};

// 멤버십 상태 확인 (활성화 여부 및 유형)
export const checkMembershipStatus = async (userId) => {
    try {
        const membership = await getUserMembership(userId);

        if (!membership) {
            return {
                isActive: false,
                type: null,
                remainingDays: 0
            };
        }

        const now = new Date();
        const expiryDate = membership.expiryDate.toDate();
        const isActive = now < expiryDate;
        const remainingDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

        return {
            isActive,
            type: membership.type,
            remainingDays: isActive ? remainingDays : 0,
            expiryDate: membership.expiryDate
        };
    } catch (error) {
        console.error('Error checking membership status:', error);
        throw error;
    }
};

// 새 멤버십 등록 또는 갱신 (카카오페이 결제 정보 저장)
export const setUserMembership = async (userId, membershipType, paymentInfo) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        // 멤버십 만료일 계산 (30일)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        // 결제 정보 저장
        const paymentRef = await addDoc(collection(db, 'payments'), {
            userId,
            amount: membershipType === 'standard' ? 9900 : 19900,
            type: membershipType,
            paymentMethod: 'kakaopay',
            status: 'completed',
            timestamp: serverTimestamp(),
            ...paymentInfo
        });

        // 사용자 정보에 멤버십 정보 업데이트
        if (userDoc.exists()) {
            await updateDoc(userRef, {
                membership: {
                    type: membershipType,
                    startDate: serverTimestamp(),
                    expiryDate,
                    paymentId: paymentRef.id,
                    autoRenew: true
                },
                updatedAt: serverTimestamp()
            });
        } else {
            await setDoc(userRef, {
                membership: {
                    type: membershipType,
                    startDate: serverTimestamp(),
                    expiryDate,
                    paymentId: paymentRef.id,
                    autoRenew: true
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }

        return {
            success: true,
            paymentId: paymentRef.id,
            membershipType,
            expiryDate
        };
    } catch (error) {
        console.error('Error setting user membership:', error);
        throw error;
    }
};

// 멤버십 취소
export const cancelMembership = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            'membership.autoRenew': false,
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error cancelling membership:', error);
        throw error;
    }
};

// 멤버십 사용량 추적 (일일 사용 횟수 등)
export const trackMembershipUsage = async (userId, action) => {
    try {
        // 현재 날짜의 날짜만 추출 (시간 제외)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식

        const usageRef = doc(db, 'usage', `${userId}_${dateString}`);
        const usageDoc = await getDoc(usageRef);

        // 사용자의 멤버십 정보 가져오기
        const membershipStatus = await checkMembershipStatus(userId);

        if (!membershipStatus.isActive) {
            return {
                success: false,
                message: '활성화된 멤버십이 없습니다.'
            };
        }

        let dailyLimit = 10; // 스탠다드 플랜 기본값
        if (membershipStatus.type === 'pro') {
            dailyLimit = 999999; // 프로 플랜은 실질적으로 무제한
        }

        if (usageDoc.exists()) {
            const currentUsage = usageDoc.data();

            // 해당 액션의 사용량 확인
            const actionCount = currentUsage[action] || 0;
            const totalCount = currentUsage.total || 0;

            // 일일 한도 초과 체크
            if (totalCount >= dailyLimit) {
                return {
                    success: false,
                    message: '일일 사용 한도에 도달했습니다.',
                    currentUsage: totalCount,
                    limit: dailyLimit
                };
            }

            // 사용량 증가
            await updateDoc(usageRef, {
                [action]: actionCount + 1,
                total: totalCount + 1,
                updatedAt: serverTimestamp()
            });

            return {
                success: true,
                currentUsage: totalCount + 1,
                limit: dailyLimit
            };
        } else {
            // 해당 날짜의 첫 사용
            await setDoc(usageRef, {
                userId,
                date: dateString,
                [action]: 1,
                total: 1,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return {
                success: true,
                currentUsage: 1,
                limit: dailyLimit
            };
        }
    } catch (error) {
        console.error('Error tracking membership usage:', error);
        throw error;
    }
};

// 필요한 경우 PaymentModal 컴포넌트에서 사용할 수 있도록 멤버십 유형 정보 제공
export const membershipTypes = {
    standard: {
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
    pro: {
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
};