import { Outlet, NavLink } from 'react-router-dom';
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
            Meus Eventos
          </NavLink>
          <NavLink to="/organizer/team" className={({ isActive }) => isActive ? 'active' : ''}>
            Equipa de RPs
          </NavLink>
          <NavLink to="/organizer/label" className={({ isActive }) => isActive ? 'active' : ''}>
            Perfil da Label
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/create-event" className="btn-primary create-btn">
            + Criar Evento
          </NavLink>
        </div>
      </aside>
      
      <main className="organizer-content">
        <Outlet />
      </main>
    </div>
  );
}
