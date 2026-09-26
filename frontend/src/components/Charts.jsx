import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export function TrendChart({ labels, catData, spo2Data, style = { height: 320, width: '100%' } }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { data: ['CAT 评估总分 (分)', '脉搏血氧 SpO2 (%)'], bottom: 0 },
      grid: { top: 30, right: 30, bottom: 40, left: 40 },
      xAxis: {
        type: 'category',
        data: labels || ['9-20', '9-21', '9-22', '9-23', '9-24', '9-25', '9-26'],
        axisLine: { lineStyle: { color: '#94A3B8' } }
      },
      yAxis: [
        { type: 'value', name: 'CAT', min: 0, max: 40, interval: 10 },
        { type: 'value', name: 'SpO2', min: 85, max: 100, interval: 5 }
      ],
      series: [
        {
          name: 'CAT 评估总分 (分)',
          type: 'line',
          smooth: true,
          data: catData || [16, 15, 17, 19, 16, 14, 15],
          itemStyle: { color: '#00897B' },
          lineStyle: { width: 3 }
        },
        {
          name: '脉搏血氧 SpO2 (%)',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: spo2Data || [94, 95, 93, 92, 95, 96, 96],
          itemStyle: { color: '#43A047' },
          lineStyle: { width: 2.5, type: 'dashed' }
        }
      ]
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [labels, catData, spo2Data]);

  return <div ref={chartRef} style={style} />;
}

export function RadarChart({ indicators, values, style = { height: 320, width: '100%' } }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
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

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [indicators, values]);

  return <div ref={chartRef} style={style} />;
}

export function DonutChart({ data, style = { height: 300, width: '100%' } }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
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
        label: { show: true, formatter: '{b}: {c}人 ({d}%)' },
        data: data || [
          { value: 120, name: 'GOLD A组 (低风险/少症状)' },
          { value: 185, name: 'GOLD B组 (低风险/重症状)' },
          { value: 95, name: 'GOLD E组 (频发急性加重高危)' }
        ]
      }]
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={style} />;
}

export const LineTrendChart = TrendChart;
