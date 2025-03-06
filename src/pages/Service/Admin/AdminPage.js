import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

const AdminPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // 일반 사용자 이메일 패턴 확인 (관리자가 아닌 경우)
                if (!currentUser.email.endsWith('@drawing-studio-admin.com')) {
                    console.log('관리자 도메인이 아닌 이메일로 로그인되어 있습니다.');
                    // 일반 사용자로 판단하고 로그아웃 처리
                    await signOut(auth);
                    setUser(null);
                    setIsAdmin(false);
                    setIsSuperAdmin(false);
                    setLoading(false);
                    return;
                }

                setUser(currentUser);

                // 관리자 권한 확인
                try {
                    const adminRef = doc(db, 'admins', currentUser.uid);
                    const adminDoc = await getDoc(adminRef);

                    if (adminDoc.exists()) {
                        const adminData = adminDoc.data();
                        setIsAdmin(adminData.isAdmin === true);
                        setIsSuperAdmin(adminData.isSuper === true);
                    } else {
                        // 관리자 권한 없음
                        setIsAdmin(false);
                        setIsSuperAdmin(false);
                    }
                } catch (error) {
                    console.error('관리자 권한 확인 오류:', error);
                    setIsAdmin(false);
                    setIsSuperAdmin(false);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
                setIsSuperAdmin(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    // 로그인하지 않았거나 관리자 권한이 없는 경우 로그인 페이지 표시
    if (!user || (!isAdmin && !isSuperAdmin)) {
        return <AdminLogin />;
    }

    // 슈퍼 관리자인 경우 슈퍼 관리자 대시보드 표시
    if (isSuperAdmin) {
        return <SuperAdminDashboard />;
    }

    // 일반 관리자인 경우 관리자 대시보드 표시
    return <AdminDashboard />;
};

export default AdminPage;