// ==============================================================================
// 智肺呼吸 (RespiCare 360) - Lucide 矢量 SVG 医疗图标库 (React 组件规范)
// ==============================================================================
(function (global) {
  'use strict';
  const h = React.createElement;

  function createSvgIcon(svgContent, defaultClass = "") {
    return function (props) {
      const size = props.size || 20;
      const color = props.color || "currentColor";
      const className = (props.className || "") + " " + defaultClass;
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className: className.trim(),
        style: props.style
      }, svgContent);
    };
  }

  const Icons = {
    // 基础操作与导航
    Activity: createSvgIcon(h('polyline', { points: '22 12 18 12 15 21 9 3 6 12 2 12' })),
    HeartPulse: createSvgIcon([
      h('path', { key: '1', d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' }),
      h('path', { key: '2', d: 'M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27' })
    ]),
    ShieldAlert: createSvgIcon([
      h('path', { key: '1', d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10' }),
      h('line', { key: '2', x1: '12', y1: '8', x2: '12', y2: '12' }),
      h('line', { key: '3', x1: '12', y1: '16', x2: '12.01', y2: '16' })
    ]),
    AlertTriangle: createSvgIcon([
      h('path', { key: '1', d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
      h('line', { key: '2', x1: '12', y1: '9', x2: '12', y2: '13' }),
      h('line', { key: '3', x1: '12', y1: '17', x2: '12.01', y2: '17' })
    ]),
    BarChart2: createSvgIcon([
      h('line', { key: '1', x1: '18', y1: '20', x2: '18', y2: '10' }),
      h('line', { key: '2', x1: '12', y1: '20', x2: '12', y2: '4' }),
      h('line', { key: '3', x1: '6', y1: '20', x2: '6', y2: '14' })
    ]),
    Share2: createSvgIcon([
      h('circle', { key: '1', cx: '18', cy: '5', r: '3' }),
      h('circle', { key: '2', cx: '6', cy: '12', r: '3' }),
      h('circle', { key: '3', cx: '18', cy: '19', r: '3' }),
      h('line', { key: '4', x1: '8.59', y1: '13.51', x2: '15.42', y2: '17.49' }),
      h('line', { key: '5', x1: '15.41', y1: '6.51', x2: '8.59', y2: '10.49' })
    ]),
    Clock: createSvgIcon([
      h('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
      h('polyline', { key: '2', points: '12 6 12 12 16 14' })
    ]),
    Bluetooth: createSvgIcon(h('polyline', { points: '6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5' })),
    MessageSquare: createSvgIcon(h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })),
    FileText: createSvgIcon([
      h('path', { key: '1', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      h('polyline', { key: '2', points: '14 2 14 8 20 8' }),
      h('line', { key: '3', x1: '16', y1: '13', x2: '8', y2: '13' }),
      h('line', { key: '4', x1: '16', y1: '17', x2: '8', y2: '17' }),
      h('polyline', { key: '5', points: '10 9 9 9 8 9' })
    ]),
    Download: createSvgIcon([
      h('path', { key: '1', d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
      h('polyline', { key: '2', points: '7 10 12 15 17 10' }),
      h('line', { key: '3', x1: '12', y1: '15', x2: '12', y2: '3' })
    ]),
    Stethoscope: createSvgIcon([
      h('path', { key: '1', d: 'M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3' }),
      h('path', { key: '2', d: 'M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4' }),
      h('circle', { key: '3', cx: '20', cy: '10', r: '2' })
    ]),
    UserCheck: createSvgIcon([
      h('path', { key: '1', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
      h('circle', { key: '2', cx: '9', cy: '7', r: '4' }),
      h('polyline', { key: '3', points: '16 11 18 13 22 9' })
    ]),
    Users: createSvgIcon([
      h('path', { key: '1', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
      h('circle', { key: '2', cx: '9', cy: '7', r: '4' }),
      h('path', { key: '3', d: 'M22 21v-2a4 4 0 0 0-3-3.87' }),
      h('path', { key: '4', d: 'M16 3.13a4 4 0 0 1 0 7.75' })
    ]),
    Bell: createSvgIcon([
      h('path', { key: '1', d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' }),
      h('path', { key: '2', d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0' })
    ]),
    Settings: createSvgIcon([
      h('circle', { key: '1', cx: '12', cy: '12', r: '3' }),
      h('path', { key: '2', d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' })
    ]),
    Sun: createSvgIcon([
      h('circle', { key: '1', cx: '12', cy: '12', r: '4' }),
      h('path', { key: '2', d: 'M12 2v2' }),
      h('path', { key: '3', d: 'M12 20v2' }),
      h('path', { key: '4', d: 'm4.93 4.93 1.41 1.41' }),
      h('path', { key: '5', d: 'm17.66 17.66 1.41 1.41' }),
      h('path', { key: '6', d: 'M2 12h2' }),
      h('path', { key: '7', d: 'M20 12h2' }),
      h('path', { key: '8', d: 'm6.34 17.66-1.41 1.41' }),
      h('path', { key: '9', d: 'm19.07 4.93-1.41 1.41' })
    ]),
    Moon: createSvgIcon(h('path', { d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' })),
    Monitor: createSvgIcon([
      h('rect', { key: '1', width: '20', height: '14', x: '2', y: '3', rx: '2' }),
      h('line', { key: '2', x1: '8', y1: '21', x2: '16', y2: '21' }),
      h('line', { key: '3', x1: '12', y1: '17', x2: '12', y2: '21' })
    ]),
    Smartphone: createSvgIcon([
      h('rect', { key: '1', width: '14', height: '20', x: '5', y: '2', rx: '2', ry: '2' }),
      h('path', { key: '2', d: 'M12 18h.01' })
    ]),
    CheckCircle: createSvgIcon([
      h('path', { key: '1', d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
      h('polyline', { key: '2', points: '22 4 12 14.01 9 11.01' })
    ]),
    XCircle: createSvgIcon([
      h('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
      h('line', { key: '2', x1: '15', y1: '9', x2: '9', y2: '15' }),
      h('line', { key: '3', x1: '9', y1: '9', x2: '15', y2: '15' })
    ]),
    Database: createSvgIcon([
      h('ellipse', { key: '1', cx: '12', cy: '5', rx: '9', ry: '3' }),
      h('path', { key: '2', d: 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5' }),
      h('path', { key: '3', d: 'M3 12c0 1.66 4 3 9 3s9-1.34 9-3' })
    ]),
    Cpu: createSvgIcon([
      h('rect', { key: '1', width: '16', height: '16', x: '4', y: '4', rx: '2' }),
      h('rect', { key: '2', width: '6', height: '6', x: '9', y: '9', rx: '1' }),
      h('path', { key: '3', d: 'M15 2v2' }),
      h('path', { key: '4', d: 'M15 20v2' }),
      h('path', { key: '5', d: 'M2 15h2' }),
      h('path', { key: '6', d: 'M2 9h2' }),
      h('path', { key: '7', d: 'M20 15h2' }),
      h('path', { key: '8', d: 'M20 9h2' }),
      h('path', { key: '9', d: 'M9 2v2' }),
      h('path', { key: '10', d: 'M9 20v2' })
    ]),
    Eye: createSvgIcon([
      h('path', { key: '1', d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' }),
      h('circle', { key: '2', cx: '12', cy: '12', r: '3' })
    ]),
    EyeOff: createSvgIcon([
      h('path', { key: '1', d: 'M9.88 9.88a3 3 0 1 0 4.24 4.24' }),
      h('path', { key: '2', d: 'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' }),
      h('path', { key: '3', d: 'M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' }),
      h('line', { key: '4', x1: '2', y1: '2', x2: '22', y2: '22' })
    ]),
    LogOut: createSvgIcon([
      h('path', { key: '1', d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
      h('polyline', { key: '2', points: '16 17 21 12 16 7' }),
      h('line', { key: '3', x1: '21', y1: '12', x2: '9', y2: '12' })
    ]),
    RefreshCw: createSvgIcon([
      h('path', { key: '1', d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }),
      h('path', { key: '2', d: 'M21 3v5h-5' }),
      h('path', { key: '3', d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }),
      h('path', { key: '4', d: 'M8 16H3v5' })
    ]),
    Compass: createSvgIcon([
      h('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
      h('polygon', { key: '2', points: '16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76' })
    ]),
    Zap: createSvgIcon(h('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' }))
  };

  global.Icons = Icons;
})(window);
