// 관리자 계정 생성 스크립트
const { auth, db } = require('../firebase/firebase');
const { createUserWithEmailAndPassword } = require('firebase/auth');
const { doc, setDoc } = require('firebase/firestore');

// 관리자 계정 생성
const createAdmin = async () => {
    try {
        // 일반 관리자 생성
        const adminUser = await createUserWithEmailAndPassword(auth, 'admin@drawing-studio.com', 'admin1234');
        await setDoc(doc(db, 'admins', adminUser.user.uid), {
            adminId: 'admin',
            isAdmin: true,
            isSuper: false,
            createdAt: new Date()
        });

        // 슈퍼 관리자 생성
        const superUser = await createUserWithEmailAndPassword(auth, 'sadmin@drawing-studio.com', 'sadmin123');
        await setDoc(doc(db, 'admins', superUser.user.uid), {
            adminId: 'sadmin',
            isAdmin: true,
            isSuper: true,
            createdAt: new Date()
        });

        console.log('관리자 계정이 생성되었습니다.');
    } catch (error) {
        console.error('관리자 계정 생성 오류:', error);
    }
};

createAdmin();