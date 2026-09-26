// ==============================================================================
// 智肺呼吸 (RespiCare 360) - 强路由鉴权与 RBAC 分流路由器
// ==============================================================================
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RoleRoute } from '../components/auth/RoleRoute';

import LoginPage from '../pages/auth/LoginPage';
import AppLayout from '../layouts/AppLayout';

import PatientDashboardPage from '../pages/roles/PatientDashboardPage';
import DoctorDashboardPage from '../pages/roles/DoctorDashboardPage';
import NurseDashboardPage from '../pages/roles/NurseDashboardPage';
import DirectorDashboardPage from '../pages/roles/DirectorDashboardPage';
import AdminDashboardPage from '../pages/roles/AdminDashboardPage';

import KnowledgeGraphPage from '../pages/common/KnowledgeGraphPage';
import ProfilePage from '../pages/common/ProfilePage';

// 重定向到用户当前所属角色的主工作台
function RoleHomeRedirect() {
  const { role } = useAuth();
  return <Navigate to={`/app/${role || 'patient'}/dashboard`} replace />;
}

// 全局 404 / 兜底拦截守卫
function FallbackRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated && role) {
    return <Navigate to={`/app/${role}/dashboard`} replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. 公开认证路由 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. 受保护的核心应用路由 (需持有有效 JWT Token) */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* /app 默认重定向至对应角色工作台 */}
        <Route index element={<RoleHomeRedirect />} />

        {/* 五大角色专属 RBAC 隔离工作台 */}
        <Route
          path="patient/dashboard"
          element={
            <RoleRoute allow="patient">
              <PatientDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="doctor/dashboard"
          element={
            <RoleRoute allow="doctor">
              <DoctorDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="nurse/dashboard"
          element={
            <RoleRoute allow="nurse">
              <NurseDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="director/dashboard"
          element={
            <RoleRoute allow="director">
              <DirectorDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="admin/dashboard"
          element={
            <RoleRoute allow="tech_admin">
              <AdminDashboardPage />
            </RoleRoute>
          }
        />

        {/* 公共全景知识图谱与个人中心 */}
        <Route path="graph" element={<KnowledgeGraphPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 3. 根路径与未知链接兜底：冷启动强制跳往登录或主页 */}
      <Route path="/" element={<FallbackRedirect />} />
      <Route path="*" element={<FallbackRedirect />} />
    </Routes>
  );
}
