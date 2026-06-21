import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Header from './Header';
import Footer from './Footer';
import FeedbackModal from '../FeedbackModal';
import { User } from '../../types';

export default function Root() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const signOut = useAuthStore((state) => state.signOut);

  // Convert user to our User type for Header compatibility
  const currentUser: User | null = user
    ? {
        id: user.id,
        email: user.email || '',
        fullName: user.fullName || user.email?.split('@')[0] || 'User',
        role: role || 'customer',
      }
    : null;

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="root-layout">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <FeedbackModal />
    </div>
  );
}
