// ==============================================================================
// 智肺呼吸 (RespiCare 360) - 医疗时序图表引擎 (ECharts 集成与 Canvas 高保真渲染)
// ==============================================================================
(function (global) {
  'use strict';

  const AppCharts = {
    // --------------------------------------------------------------------------
    // 1. 患者近 30/90 天 CAT 与血氧时序折线图
    // --------------------------------------------------------------------------
    renderTrendChart(container, options = {}) {
      if (!container) return;
      const labels = options.labels || ['9-20', '9-21', '9-22', '9-23', '9-24', '9-25', '9-26'];
      const catData = options.catData || [16, 15, 17, 19, 16, 14, 15];
      const spo2Data = options.spo2Data || [94, 95, 93, 92, 95, 96, 96];

      if (window.echarts) {
        const chart = echarts.init(container);
        chart.setOption({
          tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
          legend: { data: ['CAT 评估总分 (分)', '脉搏血氧 SpO2 (%)'], bottom: 0 },
          grid: { top: 30, right: 30, bottom: 40, left: 40 },
          xAxis: { type: 'category', data: labels, axisLine: { lineStyle: { color: '#94A3B8' } } },
          yAxis: [
            { type: 'value', name: 'CAT', min: 0, max: 40, interval: 10 },
            { type: 'value', name: 'SpO2', min: 85, max: 100, interval: 5 }
          ],
          series: [
            {
              name: 'CAT 评估总分 (分)',
              type: 'line',
              smooth: true,
              data: catData,
              itemStyle: { color: '#00897B' },
              lineStyle: { width: 3 }
            },
            {
              name: '脉搏血氧 SpO2 (%)',
              type: 'line',
              yAxisIndex: 1,
              smooth: true,
              data: spo2Data,
              itemStyle: { color: '#43A047' },
              lineStyle: { width: 2.5, type: 'dashed' }
            }
          ]
        });
        window.addEventListener('resize', () => chart.resize());
        return chart;
      }
    },

    // --------------------------------------------------------------------------
    // 2. GOLD E 组高危急性加重预警雷达图 (医生端)
    // --------------------------------------------------------------------------
    renderRadarChart(container, indicators, values) {
      if (!container || !window.echarts) return;
      const chart = echarts.init(container);
      chart.setOption({
        radar: {
          indicator: indicators || [
            { name: '近1年加重频次', max: 4 },
            { name: 'CAT波动幅度', max: 40 },
            { name: 'mMRC气促级别', max: 4 },
            { name: '夜间低氧去饱和', max: 10 },
            { name: '吸入依从性低', max: 100 },
            { name: '心肺合并症风险', max: 100 }
          ],
          radius: '65%',
          splitArea: { areaStyle: { color: ['rgba(0, 137, 123, 0.05)', 'rgba(0, 137, 123, 0.12)'] } }
        },
        series: [{
          type: 'radar',
          data: [{
            value: values || [3, 24, 3, 7, 28, 65],
            name: '患者高危急性加重特征雷达',
            areaStyle: { color: 'rgba(229, 57, 53, 0.4)' },
            lineStyle: { color: '#E53935', width: 2 },
            itemStyle: { color: '#E53935' }
          }]
        }]
      });
      window.addEventListener('resize', () => chart.resize());
      return chart;
    },

    // --------------------------------------------------------------------------
    // 3. 全院 GOLD A/B/E 组人群演变环形图 (院长端)
    // --------------------------------------------------------------------------
    renderDonutChart(container, data) {
      if (!container || !window.echarts) return;
      const chart = echarts.init(container);
      chart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        color: ['#43A047', '#FB8C00', '#E53935'],
        series: [{
          name: 'GOLD 分组人群分布',
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
          data: data || [
            { value: 280, name: 'A组 (轻症少加重)' },
            { value: 620, name: 'B组 (重症状少加重)' },
            { value: 386, name: 'E组 (频繁加重高危)' }
          ]
        }]
      });
      window.addEventListener('resize', () => chart.resize());
      return chart;
    }
  };

  global.AppCharts = AppCharts;
})(window);
