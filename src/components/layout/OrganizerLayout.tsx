import { Outlet, NavLink } from 'react-router-dom';
import { CalendarDays, Users, Tag, BrainCircuit, Plus } from 'lucide-react';
import './OrganizerLayout.css';

export default function OrganizerLayout() {
  return (
    <div className="organizer-layout">
      <aside className="organizer-sidebar">
        <div className="sidebar-header">
          <h3>Centro de Comando</h3>
          <p className="sidebar-subtitle">Label Management</p>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/organizer" end className={({ isActive }) => isActive ? 'active' : ''}>
            <CalendarDays className="nav-icon" />
            Meus Eventos
          </NavLink>
          <NavLink to="/organizer/team" className={({ isActive }) => isActive ? 'active' : ''}>
            <Users className="nav-icon" />
            Equipa de RPs
          </NavLink>
          <NavLink to="/organizer/label" className={({ isActive }) => isActive ? 'active' : ''}>
            <Tag className="nav-icon" />
            Perfil da Label
          </NavLink>
          <NavLink to="/organizer/feedback" className={({ isActive }) => isActive ? 'active' : ''}>
            <BrainCircuit className="nav-icon" />
            Feedback e IA
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/create-event" className="btn-primary create-btn">
            <Plus size={16} />
            Criar Evento
          </NavLink>
        </div>
      </aside>
      
      <main className="organizer-content">
        <Outlet />
      </main>
    </div>
  );
}
