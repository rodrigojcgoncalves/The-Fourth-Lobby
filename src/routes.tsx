import { createBrowserRouter } from 'react-router-dom';
import Root from './components/layout/Root';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ResidentPage from './pages/ResidentPage';
import EventDetailsPage from './pages/EventDetailsPage';
import TicketsPage from './pages/TicketsPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import PromoterDashboard from './pages/PromoterDashboard';
import PromoterEventsPage from './pages/PromoterEventsPage';
import OrganizerDashboard from './pages/OrganizerDashboard';
import QRScannerPage from './pages/QRScannerPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import OrganizerTeamPage from './pages/OrganizerTeamPage';
import OrganizerLabelPage from './pages/OrganizerLabelPage';
import OrganizerFeedbackPage from './pages/OrganizerFeedbackPage';
import CalculatorPage from './pages/CalculatorPage';
import SuccessPage from './pages/SuccessPage';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import OrganizerLayout from './components/layout/OrganizerLayout';
import InternalEventDetailsPage from './pages/InternalEventDetailsPage';
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'residents/:slug', element: <ResidentPage /> },
      { path: 'login', element: <LoginPage /> },
      
      // Rotas Protegidas - Cliente
      { path: 'profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: 'tickets', element: <ProtectedRoute><TicketsPage /></ProtectedRoute> },

      // Rotas Protegidas - Promoter
      { 
        path: 'portal-promotor', 
        element: <ProtectedRoute allowedRoles={['promoter']}><PromoterDashboard /></ProtectedRoute> 
      },
      { 
        path: 'portal-promotor/label/:id', 
        element: <ProtectedRoute allowedRoles={['promoter']}><PromoterEventsPage /></ProtectedRoute> 
      },

      // Rotas Protegidas - Organizador
      { 
        path: 'organizer', 
        element: <ProtectedRoute allowedRoles={['organizer']}><OrganizerLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <OrganizerDashboard /> },
          { path: 'events/:id', element: <InternalEventDetailsPage /> }, // Será criado a seguir
          { path: 'edit-event/:id', element: <EditEventPage /> },
          { path: 'team', element: <OrganizerTeamPage /> },
          { path: 'label', element: <OrganizerLabelPage /> },
          { path: 'feedback', element: <OrganizerFeedbackPage /> },
        ]
      },
      // Estas rotas ficam for de /organizer/ (ou podiam estar dentro, mas para não quebrar links existentes deixamos fora, exeto edit-event)
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
      { path: 'events/:slug', element: <EventDetailsPage /> },
      { path: 'checkout', element: <ProtectedRoute><CheckoutPage /></ProtectedRoute> },
      { path: 'success', element: <ProtectedRoute><SuccessPage /></ProtectedRoute> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);