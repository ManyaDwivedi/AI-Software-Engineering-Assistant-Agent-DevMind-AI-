import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './components/layout/AppLayout.jsx'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Projects from './pages/Projects.jsx'
import CodeWorkspace from './pages/CodeWorkspace.jsx'
import Explain from './pages/Explain.jsx'
import Debug from './pages/Debug.jsx'
import Review from './pages/Review.jsx'
import Generate from './pages/Generate.jsx'
import Tests from './pages/Tests.jsx'
import Refactor from './pages/Refactor.jsx'
import Documentation from './pages/Documentation.jsx'
import ProjectAI from './pages/ProjectAI.jsx'
import ProjectGalaxy from './pages/ProjectGalaxy.jsx'
import CodeDNA from './pages/CodeDNA.jsx'
import Chat from './pages/Chat.jsx'
import History from './pages/History.jsx'
import SettingsPage from './pages/Settings.jsx'
import Profile from './pages/Profile.jsx'
import Help from './pages/Help.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="workspace" element={<CodeWorkspace />} />
            <Route path="tools/explain" element={<Explain />} />
            <Route path="tools/debug" element={<Debug />} />
            <Route path="tools/review" element={<Review />} />
            <Route path="tools/generate" element={<Generate />} />
            <Route path="tools/tests" element={<Tests />} />
            <Route path="tools/refactor" element={<Refactor />} />
            <Route path="tools/docs" element={<Documentation />} />
            <Route path="intelligence/project-ai" element={<ProjectAI />} />
            <Route path="intelligence/galaxy" element={<ProjectGalaxy />} />
            <Route path="intelligence/dna" element={<CodeDNA />} />
            <Route path="chat" element={<Chat />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
