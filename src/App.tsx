// Main App component with routing and theme initialization
// Updated with new emergency management routes

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleSelection } from './pages/auth/RoleSelection';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { CreateEmergency } from './pages/emergencies/CreateEmergency';
import { EmergencyList } from './pages/emergencies/EmergencyList';
import { EmergencyDetail } from './pages/emergencies/EmergencyDetail';
import { OpportunityList } from './pages/opportunities/OpportunityList';
import { ProjectList } from './pages/projects/ProjectList';
import { ProjectDetail } from './pages/projects/ProjectDetail';
import { PaymentDashboard } from './pages/payments/PaymentDashboard';
import { Profile } from './pages/Profile';
import { useAuthStore } from './stores/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/role-selection" 
          element={!isAuthenticated ? <RoleSelection /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Gestionnaire routes */}
        <Route
          path="/emergencies"
          element={
            <ProtectedRoute allowedRoles={['gestionnaire']}>
              <Layout>
                <EmergencyList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-emergency"
          element={
            <ProtectedRoute allowedRoles={['gestionnaire']}>
              <Layout>
                <CreateEmergency />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/emergencies/:id"
          element={
            <ProtectedRoute allowedRoles={['gestionnaire']}>
              <Layout>
                <EmergencyDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Artisan routes */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={['artisan']}>
              <Layout>
                <ProjectList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/opportunities"
          element={
            <ProtectedRoute allowedRoles={['artisan']}>
              <Layout>
                <OpportunityList />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Payment routes */}
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Layout>
                <PaymentDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion Utilisateurs</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Page en cours de développement</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/certifications"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certifications</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Page en cours de développement</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Profile route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default redirects */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" /> : 
            <Navigate to="/role-selection" />
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;