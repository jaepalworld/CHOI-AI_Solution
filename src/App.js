import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
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
import PaymentSuccessPage from './pages/Payment/PaymentSuccessPage';
import PaymentCancelPage from './pages/Payment/PaymentCancelPage';
import PaymentFailPage from './pages/Payment/PaymentFailPage';
import BackC from './pages/Back/BackC';
import BackClear from './pages/Back/BackClear';
import BackCreate from './pages/Back/BackCreate';

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdminPort, setIsAdminPort] = useState(false);
  const [fastApiStatus, setFastApiStatus] = useState('확인 중...');
  const [comfyUiStatus, setComfyUiStatus] = useState('확인 중...');
  const [logs, setLogs] = useState([]);

  // 로그 추가 함수
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prevLogs => [logMessage, ...prevLogs.slice(0, 19)]); // 최대 20개 로그 유지
    console.log(logMessage);
  };

  // FastAPI 서버 연결 테스트
  const testFastApiConnection = async () => {
    try {
      addLog('FastAPI 서버 연결 테스트 중...');
      setFastApiStatus('확인 중...');
      
      const response = await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
      
      if (response.status === 200) {
        setFastApiStatus('연결됨 ✅');
        addLog('FastAPI 서버 연결 성공!');
        return true;
      } else {
        setFastApiStatus(`연결 실패 ❌ (상태 코드: ${response.status})`);
        addLog(`FastAPI 서버 연결 실패: 상태 코드 ${response.status}`);
        return false;
      }
    } catch (error) {
      setFastApiStatus('연결 실패 ❌');
      addLog(`FastAPI 서버 연결 오류: ${error.message}`);
      return false;
    }
  };

  // ComfyUI 서버 연결 테스트 (FastAPI를 통해)
  const testComfyUiConnection = async () => {
    try {
      addLog('FastAPI를 통해 ComfyUI 연결 테스트 중...');
      setComfyUiStatus('확인 중...');
      
      const response = await axios.get(`${API_BASE_URL}/test-comfyui`, { timeout: 8000 });
      
      if (response.data && response.data.status === 'success') {
        setComfyUiStatus('연결됨 ✅');
        addLog('ComfyUI 서버 연결 성공!');
        return true;
      } else {
        setComfyUiStatus('연결 실패 ❌');
        addLog(`ComfyUI 서버 연결 실패: ${response.data?.message || '알 수 없는 오류'}`);
        return false;
      }
    } catch (error) {
      setComfyUiStatus('연결 실패 ❌');
      addLog(`ComfyUI 서버 연결 오류: ${error.message}`);
      return false;
    }
  };

  // 모든 테스트 실행
  const runAllTests = async () => {
    const fastApiConnected = await testFastApiConnection();
    
    // FastAPI 연결이 성공한 경우에만 ComfyUI 연결 테스트
    if (fastApiConnected) {
      await testComfyUiConnection();
    } else {
      setComfyUiStatus('확인 불가 ⚠️');
      addLog('FastAPI 서버 연결 실패로 ComfyUI 연결 확인 불가');
    }
  };

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

    // 연결 테스트 실행
    addLog('React 앱이 시작되었습니다');
    setTimeout(runAllTests, 2000);

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="App">
        <div className="connection-status">
          <h1>SSTest - 연결 테스트</h1>
          <div className="status-container">
            <div className="status-item">
              <h3>FastAPI 서버 상태 (포트 8000):</h3>
              <p className={fastApiStatus.includes('연결됨') ? 'status-success' : 
                           fastApiStatus.includes('실패') ? 'status-error' : 'status-pending'}>
                {fastApiStatus}
              </p>
            </div>
            
            <div className="status-item">
              <h3>ComfyUI 서버 상태 (포트 8188):</h3>
              <p className={comfyUiStatus.includes('연결됨') ? 'status-success' : 
                          comfyUiStatus.includes('실패') ? 'status-error' : 'status-pending'}>
                {comfyUiStatus}
              </p>
            </div>
          </div>
          
          <button onClick={runAllTests} className="test-button">
            테스트 다시 실행
          </button>
          
          <div className="logs-container">
            <h3>로그:</h3>
            <div className="logs">
              {logs.map((log, index) => (
                <div key={index} className="log-entry">{log}</div>
              ))}
            </div>
          </div>
        </div>
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


          <Route path="/admin/chat/:chatId" element={<AdminChat />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;