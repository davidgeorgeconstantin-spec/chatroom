import { Navigate, Route, Routes } from 'react-router';
import { ChatLayout } from '@/components/layout/ChatLayout';
import { JoinScreen } from '@/features/auth/JoinScreen';
import { useSession } from '@/features/auth/sessionStore';

export default function App() {
  const user = useSession((s) => s.user);
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/room/general" replace /> : <JoinScreen />} />
      <Route path="/room/:roomId" element={user ? <ChatLayout /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
