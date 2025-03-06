import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
// import Home from './pages/Home';
import HairAI from './pages/HairAI';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';
import HairStyle from './pages/Hair/HairStyle';
import FaceStyle from './pages/Face/FaceStyle';
import ServiceChat from './pages/Service/ServiceChat';
import AIAdvertising from './pages/Advertising/AI-advertising';
import ComfyTest from './pages/Comfyui/ComfyTest';
import AdminPage from './pages/Service/Admin/AdminPage';
import ChatManagement from './pages/Service/Admin/ChatManagement';
import AdminDashboard from './pages/Service/Admin/AdminDashboard';
import AdminChat from './pages/Service/Admin/AdminChat';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdminPort, setIsAdminPort] = useState(false);

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
      <Routes>
        {/* 포트가 3005이고 경로가 루트인 경우 /admin으로 리디렉션 */}
        {isAdminPort && <Route path="/" element={<Navigate to="/admin" replace />} />}

        <Route path="/" element={<HairAI />} />
        <Route path="/hairai" element={<HairAI />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/hair/style" element={<HairStyle />} />
        <Route path="/face/style" element={<FaceStyle />} />
        <Route path="/service/chat" element={<ServiceChat />} />
        <Route path="/advertising" element={<AIAdvertising />} />
        <Route path="/Comfyui/ComfyTest" element={<ComfyTest />} />
        <Route path="/admin/chat-management" element={<ChatManagement />} />

        {/* AdminDashboard와 AdminPage 라우트가 중복되었으므로 하나만 남깁니다 */}
        <Route path="/admin" element={<AdminPage />} />

        <Route path="/admin/chat/:chatId" element={<AdminChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;