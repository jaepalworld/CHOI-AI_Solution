import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
// import Home from './pages/Home';
import HairAI from './pages/HairAI';
import LookBook from './pages/lookbook/LookBook';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';
import HairStyle from './pages/Hair/HairStyle';
import FaceStan from './pages/Face/FaceStan.js';
import FacePro from './pages/Face/FacePro.js';
import ServiceChat from './pages/Service/ServiceChat';
import ComfyTest from './pages/Comfyui/ComfyTest';
import AdminPage from './pages/Service/Admin/AdminPage';
import ChatManagement from './pages/Service/Admin/ChatManagement';
import AdminDashboard from './pages/Service/Admin/AdminDashboard';
import AdminChat from './pages/Service/Admin/AdminChat';
import PaymentSuccessPage from './pages/Payment/PaymentSuccessPage';
import PaymentCancelPage from './pages/Payment/PaymentCancelPage';
import PaymentFailPage from './pages/Payment/PaymentFailPage';
import BackC from './pages/Back/BackC';
import BackClear from './pages/Back/BackClear';
import BackCreate from './pages/Back/BackCreate';
import LandingPage from './components/LandingPage'; // 새로 만든 랜딩 페이지


// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdminPort, setIsAdminPort] = useState(false);


  // 로그 추가 함수




  useEffect(() => {
    // 현재 URL의 포트 번호 확인
    const port = window.location.port;

    // 포트가 3005인 경우 관리자 모드로 설정
    if (port === '3005') {
      setIsAdminPort(true);
      // 세션 스토리지에 관리자 모드임을 저장
      sessionStorage.setItem('userType', 'admin');
    } else {
      // 일반 사용자 모드임을 저장
      sessionStorage.setItem('userType', 'regular');
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });



    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="App">

        <Routes>
          {/* 포트가 3005이고 경로가 루트인 경우 /admin으로 리디렉션 */}
          {isAdminPort && <Route path="/" element={<Navigate to="/admin" replace />} />}


          <Route path="/" element={<LandingPage />} /> {/* 첫 화면을 랜딩 페이지로 변경 */}
          <Route path="/main" element={<HairAI />} /> {/* 기존 메인 페이지 경로 변경 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/hair/style" element={<HairStyle />} />
          <Route path="/face/FaceStan" element={<FaceStan />} />
          <Route path="/lookbook" element={<LookBook />} />
          <Route path="/service/chat" element={<ServiceChat />} />
          {/* <Route path="/Comfyui/ComfyTest" element={<ComfyTest />} /> */}
          <Route path="/admin/chat-management" element={<ChatManagement />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />
          <Route path="/payment/fail" element={<PaymentFailPage />} />
          {/* AdminDashboard와 AdminPage 라우트가 중복되었으므로 하나만 남깁니다 */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/back" element={<BackC />} />
          <Route path="/back/clear" element={<BackClear />} />
          <Route path="/back/create" element={<BackCreate />} />
          <Route path="/face/FacePro" element={<FacePro />} />

          <Route path="/admin/chat/:chatId" element={<AdminChat />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;