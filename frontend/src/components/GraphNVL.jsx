import React, { useEffect, useRef, useState } from 'react';

const CATEGORY_COLORS = {
  '疾病': { fill: '#00897B', stroke: '#004D40', text: '#FFFFFF' },
  '核心症状': { fill: '#FB8C00', stroke: '#EF6C00', text: '#FFFFFF' },
  '症状': { fill: '#FFA726', stroke: '#FB8C00', text: '#FFFFFF' },
  '吸入维持': { fill: '#0288D1', stroke: '#01579B', text: '#FFFFFF' },
  'E组强化': { fill: '#7B1FA2', stroke: '#4A148C', text: '#FFFFFF' },
  '规范吸入制剂': { fill: '#03A9F4', stroke: '#0288D1', text: '#FFFFFF' },
  '肺康复': { fill: '#43A047', stroke: '#2E7D32', text: '#FFFFFF' },
  '预防疫苗': { fill: '#8E24AA', stroke: '#6A1B9A', text: '#FFFFFF' },
  '并发症': { fill: '#E53935', stroke: '#B71C1C', text: '#FFFFFF' },
  '患者全景': { fill: '#00ACC1', stroke: '#00838F', text: '#FFFFFF' },
  '默认': { fill: '#78909C', stroke: '#455A64', text: '#FFFFFF' }
};

class NVLGraphViewer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;
    this.onNodeClick = options.onNodeClick || null;

    this.transform = { x: 0, y: 0, scale: 1 };
    this.isDragging = false;
    this.dragNode = null;
    this.lastMouse = { x: 0, y: 0 };

    this._bindEvents();
    this.resize();
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 600;
    this.height = rect.height || 450;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.render();
  }

  setData(nodes, edges) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const r = Math.min(cx, cy) * 0.65;

    this.nodes = nodes.map((n, idx) => {
      const angle = (idx / nodes.length) * Math.PI * 2;
      return {
        ...n,
        x: cx + r * Math.cos(angle) + (Math.random() * 20 - 10),
        y: cy + r * Math.sin(angle) + (Math.random() * 20 - 10),
        vx: 0,
        vy: 0,
        radius: n.label === 'Disease' ? 32 : (n.label === 'Patient' ? 28 : 24)
      };
    });

    this.edges = edges;
    this._simulateLayout(40);
    this.render();
  }

  _simulateLayout(steps = 30) {
    const kRepel = 2200;
    const kAttract = 0.04;
    const dt = 0.6;

    for (let s = 0; s < steps; s++) {
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const a = this.nodes[i];
          const b = this.nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 350) {
            const force = kRepel / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          }
        }
      }

      for (const e of this.edges) {
        const a = this.nodes.find(n => n.id === e.source);
        const b = this.nodes.find(n => n.id === e.target);
        if (a && b) {
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 110) * kAttract;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }

      const cx = this.width / 2;
      const cy = this.height / 2;
      for (const n of this.nodes) {
        n.vx += (cx - n.x) * 0.005;
        n.vy += (cy - n.y) * 0.005;
        n.vx *= 0.7;
        n.vy *= 0.7;
        n.x += n.vx * dt;
        n.y += n.vy * dt;
      }
    }
  }

  _bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left - this.transform.x) / this.transform.scale,
        y: (clientY - rect.top - this.transform.y) / this.transform.scale
      };
    };

    this.onStart = (e) => {
      const pos = getPos(e);
      this.lastMouse = { x: e.clientX || (e.touches && e.touches[0].clientX), y: e.clientY || (e.touches && e.touches[0].clientY) };
      
      const hit = this.nodes.slice().reverse().find(n => {
        const dx = n.x - pos.x;
        const dy = n.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
      });

      if (hit) {
        this.dragNode = hit;
        this.selectedNode = hit;
        if (this.onNodeClick) this.onNodeClick(hit);
      } else {
        this.isDragging = true;
        this.selectedNode = null;
        if (this.onNodeClick) this.onNodeClick(null);
      }
      this.render();
    };

    this.onMove = (e) => {
      if (!this.dragNode && !this.isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - this.lastMouse.x;
      const dy = clientY - this.lastMouse.y;
      this.lastMouse = { x: clientX, y: clientY };

      if (this.dragNode) {
        this.dragNode.x += dx / this.transform.scale;
        this.dragNode.y += dy / this.transform.scale;
        this.render();
      } else if (this.isDragging) {
        this.transform.x += dx;
        this.transform.y += dy;
        this.render();
      }
    };

    this.onEnd = () => {
      this.isDragging = false;
      this.dragNode = null;
    };

    this.onWheel = (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      this.transform.scale = Math.max(0.4, Math.min(2.5, this.transform.scale * factor));
      this.render();
    };

    this.canvas.addEventListener('mousedown', this.onStart);
    window.addEventListener('mousemove', this.onMove);
    window.addEventListener('mouseup', this.onEnd);

    this.canvas.addEventListener('touchstart', this.onStart, { passive: true });
    window.addEventListener('touchmove', this.onMove, { passive: true });
    window.addEventListener('touchend', this.onEnd);

    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
  }

  destroy() {
    this.canvas.removeEventListener('mousedown', this.onStart);
    window.removeEventListener('mousemove', this.onMove);
    window.removeEventListener('mouseup', this.onEnd);
    this.canvas.removeEventListener('touchstart', this.onStart);
    window.removeEventListener('touchmove', this.onMove);
    window.removeEventListener('touchend', this.onEnd);
    this.canvas.removeEventListener('wheel', this.onWheel);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.transform.x, this.transform.y);
    ctx.scale(this.transform.scale, this.transform.scale);

    ctx.lineWidth = 1.5;
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'center';

    for (const e of this.edges) {
      const a = this.nodes.find(n => n.id === e.source);
      const b = this.nodes.find(n => n.id === e.target);
      if (!a || !b) continue;

      ctx.strokeStyle = (this.selectedNode && (this.selectedNode.id === a.id || this.selectedNode.id === b.id))
        ? '#00897B' : 'rgba(148, 163, 184, 0.45)';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      ctx.fillStyle = 'rgba(100, 116, 139, 0.8)';
      ctx.fillText(e.type, midX, midY - 3);
    }

    for (const n of this.nodes) {
      const colors = CATEGORY_COLORS[n.category] || CATEGORY_COLORS['默认'];
      const isSelected = this.selectedNode && this.selectedNode.id === n.id;

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 137, 123, 0.25)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = colors.fill;
      ctx.fill();
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = `bold ${n.label === 'Disease' ? 12 : 11}px -apple-system, sans-serif`;
      ctx.fillText(n.label, n.x, n.y + 4);

      ctx.fillStyle = '#64748B';
      ctx.font = '11px -apple-system, sans-serif';
      const displayTitle = n.title && n.title.length > 10 ? n.title.slice(0, 9) + '...' : (n.title || '');
      ctx.fillText(displayTitle, n.x, n.y + n.radius + 14);
    }

    ctx.restore();
  }
}

export default function GraphNVL({ onNodeClick }) {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const viewer = new NVLGraphViewer(canvasRef.current, {
      onNodeClick: (node) => {
        setSelectedNode(node);
        if (onNodeClick) onNodeClick(node);
      }
    });
    viewerRef.current = viewer;

    fetch('/api/graph/topology')
      .then(r => r.json())
      .then(res => {
        if (res && res.nodes) {
          viewer.setData(res.nodes, res.edges);
        } else {
          loadFallback();
        }
      })
      .catch(() => loadFallback());

    function loadFallback() {
      viewer.setData([
        { id: 'c1', label: 'Disease', title: '慢性阻塞性肺疾病 (COPD)', category: '疾病' },
        { id: 's1', label: 'Symptom', title: '活动后劳力性气促', category: '核心症状' },
        { id: 's2', label: 'Symptom', title: '慢性咳嗽与脓痰', category: '核心症状' },
        { id: 'm1', label: 'Medication', title: '布地奈德福莫特罗 (ICS+LABA)', category: '吸入维持' },
        { id: 'm2', label: 'Medication', title: '噻托溴铵 (LAMA)', category: '吸入维持' },
        { id: 'm3', label: 'Medication', title: '氟替美维 (ICS+LAMA+LABA三联)', category: 'E组强化' },
        { id: 'r1', label: 'Rehabilitation', title: '缩唇腹式呼吸操 (Daily)', category: '肺康复' },
        { id: 'v1', label: 'Vaccination', title: '四价流感疫苗 (Annual)', category: '预防疫苗' },
        { id: 'cp1', label: 'Complication', title: '慢性肺源性心脏病', category: '并发症' },
        { id: 'p1', label: 'Patient', title: 'ANON-COPD-2026001 (GOLD E)', category: '患者全景' }
      ], [
        { source: 'c1', target: 's1', type: 'HAS_SYMPTOM' },
        { source: 'c1', target: 's2', type: 'HAS_SYMPTOM' },
        { source: 'c1', target: 'm1', type: 'TREATED_BY' },
        { source: 'c1', target: 'm2', type: 'TREATED_BY' },
        { source: 'c1', target: 'm3', type: 'TREATED_BY' },
        { source: 'c1', target: 'r1', type: 'REHABILITATION_PATH' },
        { source: 'c1', target: 'v1', type: 'PREVENTED_BY' },
        { source: 'c1', target: 'cp1', type: 'LEADS_TO' },
        { source: 'p1', target: 'c1', type: 'DIAGNOSED_WITH' },
        { source: 'p1', target: 'm1', type: 'TAKES_MEDICATION' },
        { source: 'p1', target: 'v1', type: 'VACCINATED_WITH' }
      ]);
    }

    const handleResize = () => viewer.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      viewer.destroy();
    };
  }, []);

  return (
    <div className="graph-container" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      
      {/* 悬浮图例 */}
      <div style={{ position: 'absolute', top: 16, left: 16, background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', fontSize: '12px', border: '1px solid var(--border-light)' }}>
        <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--primary)' }}>知识图谱实体图例</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px 12px' }}>
          {Object.entries(CATEGORY_COLORS).filter(([k]) => k !== '默认').map(([cat, c]) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.fill, display: 'inline-block' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 节点点击详情弹片 */}
      {selectedNode && (
        <div style={{ position: 'absolute', bottom: 16, right: 16, maxWidth: 300, background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="badge badge-primary">{selectedNode.category}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {selectedNode.id}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{selectedNode.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            本体类型: <strong>{selectedNode.label}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
