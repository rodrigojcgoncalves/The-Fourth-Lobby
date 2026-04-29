import { createBrowserRouter } from 'react-router-dom';
import Root from './components/layout/Root';
import HomePage from './pages/HomePage';
import EventDetailsPage from './pages/EventDetailsPage';
import TicketsPage from './pages/TicketsPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import PromoterDashboard from './pages/PromoterDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import QRScannerPage from './pages/QRScannerPage';
import CreateEventPage from './pages/CreateEventPage';
import CalculatorPage from './pages/CalculatorPage';
import SuccessPage from './pages/SuccessPage';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      
      // Rotas Protegidas - Cliente
      { path: 'profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: 'tickets', element: <ProtectedRoute><TicketsPage /></ProtectedRoute> },

      // Rotas Protegidas - Promoter
      { 
        path: 'promoter', 
        element: <ProtectedRoute allowedRoles={['promoter']}><PromoterDashboard /></ProtectedRoute> 
      },

      // Rotas Protegidas - Organizador
      { 
        path: 'organizer', 
        element: <ProtectedRoute allowedRoles={['organizer']}><OrganizerDashboard /></ProtectedRoute> 
      },
      { 
        path: 'create-event', 
        element: <ProtectedRoute allowedRoles={['organizer']}><CreateEventPage /></ProtectedRoute> 
      },
      { 
        path: 'calculator', 
        element: <ProtectedRoute allowedRoles={['organizer']}><CalculatorPage /></ProtectedRoute> 
      },
      { 
        path: 'qr-scanner', 
        element: <ProtectedRoute allowedRoles={['organizer']}><QRScannerPage /></ProtectedRoute> 
      },
      
      // Outras rotas
      { path: 'events/:id', element: <EventDetailsPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'success', element: <SuccessPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);