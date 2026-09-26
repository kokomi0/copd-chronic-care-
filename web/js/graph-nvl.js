// ==============================================================================
// 智肺呼吸 (RespiCare 360) - 知识图谱 NVL 拓扑交互渲染引擎 (HTML5 Canvas 力导向图)
// ==============================================================================
(function (global) {
  'use strict';

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

      // 视口变换参数 (平移与缩放)
      this.transform = { x: 0, y: 0, scale: 1 };
      this.isDragging = false;
      this.dragNode = null;
      this.lastMouse = { x: 0, y: 0 };

      this._bindEvents();
      this.resize();
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.width = rect.width || 600;
      this.height = rect.height || 450;
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.scale(dpr, dpr);
      this.render();
    }

    setData(nodes, edges) {
      // 初始化节点坐标 (居中圆形分布)
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
        // 1. 斥力 (所有节点对)
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

        // 2. 引力 (边相连节点)
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

        // 3. 向心约束与阻尼更新
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

      const onStart = (e) => {
        const pos = getPos(e);
        this.lastMouse = { x: e.clientX || e.touches[0].clientX, y: e.clientY || e.touches[0].clientY };
        
        // 拾取命中节点
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
        }
        this.render();
      };

      const onMove = (e) => {
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

      const onEnd = () => {
        this.isDragging = false;
        this.dragNode = null;
      };

      this.canvas.addEventListener('mousedown', onStart);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);

      this.canvas.addEventListener('touchstart', onStart, { passive: true });
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('touchend', onEnd);

      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        this.transform.scale = Math.max(0.4, Math.min(2.5, this.transform.scale * factor));
        this.render();
      }, { passive: false });
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      ctx.save();
      ctx.translate(this.transform.x, this.transform.y);
      ctx.scale(this.transform.scale, this.transform.scale);

      // 1. 绘制边 (Edges)
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

        // 边关系文字标注
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        ctx.fillStyle = 'rgba(100, 116, 139, 0.8)';
        ctx.fillText(e.type, midX, midY - 3);
      }

      // 2. 绘制节点 (Nodes)
      for (const n of this.nodes) {
        const colors = CATEGORY_COLORS[n.category] || CATEGORY_COLORS['默认'];
        const isSelected = this.selectedNode && this.selectedNode.id === n.id;

        // 选中外光环
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 137, 123, 0.25)';
          ctx.fill();
        }

        // 节点实体圆
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = colors.fill;
        ctx.fill();
        ctx.strokeStyle = colors.stroke;
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();

        // 节点文字 (标签与名称)
        ctx.fillStyle = colors.text;
        ctx.font = `bold ${n.label === 'Disease' ? 12 : 11}px -apple-system, sans-serif`;
        ctx.fillText(n.label, n.x, n.y + 4);

        // 节点下方详细标题
        ctx.fillStyle = 'var(--text-main)';
        ctx.font = '11px -apple-system, sans-serif';
        const displayTitle = n.title.length > 10 ? n.title.slice(0, 9) + '...' : n.title;
        ctx.fillText(displayTitle, n.x, n.y + n.radius + 14);
      }

      ctx.restore();
    }
  }

  global.NVLGraphViewer = NVLGraphViewer;
})(window);
