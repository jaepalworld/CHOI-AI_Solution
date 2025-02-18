// App.js

import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        <Route path="/" element={<HairAI />} />
        <Route path="/hairai" element={<HairAI />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/hair/style" element={<HairStyle />} />
        <Route path="/face/style" element={<FaceStyle />} />
        <Route path="/service/chat" element={<ServiceChat />} />
        <Route path="/advertising" element={<AIAdvertising />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;