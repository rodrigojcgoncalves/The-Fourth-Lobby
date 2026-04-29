# 1. Adicionar isto a APP.JSX:

contexto: permitir o acesso a certas páginas apenas quem tem premissões para tal. Usado no auth.Service, authStore.js e ProtectedRoutes.jsx

No teu ficheiro de rotas, vais envolver as páginas sensíveis com este componente:

<Routes>
  <Route path="/login" element={<LoginPage />} />
  
  {/* Apenas organizadores podem entrar aqui */}
  <Route 
    path="/dashboard/*" 
    element={
      <ProtectedRoute allowedRoles={['organizer']}>
        <DashboardLayout />
      </ProtectedRoute>
    } 
  />
</Routes>

