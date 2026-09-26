import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * 细粒度角色权限守卫 (RBAC Role Guard)
 * 拦截跨角色越权访问，确保患者/医生/护士/院长/运维各司其职
 */
export function RoleRoute({ allow, children }) {
  const { role, showToast } = useAuth();

  const allowedRoles = Array.isArray(allow) ? allow : [allow];

  const isAllowed = allowedRoles.includes(role);

  useEffect(() => {
    if (!isAllowed) {
      showToast('已拦截跨角色访问，已安全回退至您所属角色的专属工作台', 'warning');
    }
  }, [isAllowed]);

  if (!isAllowed) {
    // 越权时友好拦截并回退到用户自身的主工作台
    const fallbackPath = `/app/${role || 'patient'}/dashboard`;
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
