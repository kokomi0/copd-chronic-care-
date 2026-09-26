import React from 'react';
import GraphNVL from '../../components/GraphNVL';
import { Icons } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';

export default function KnowledgeGraphPage() {
  const { showToast } = useAuth();

  return (
    <div className="graph-explorer-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            COPD 慢阻肺临床知识图谱全景探索 (NVL 引擎)
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            已连接 Neo4j 5.x 知识图谱数据库与 APOC 脱敏中间件，支持双击缩放、拖拽与高维医学推理
          </p>
        </div>
        <button className="btn-outline" onClick={() => showToast('已重置力导向图谱视口', 'info')}>
          <Icons.RefreshCw size={14} /> 重置拓扑画布
        </button>
      </div>

      <GraphNVL />
    </div>
  );
}
