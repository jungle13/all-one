// raffle-frontend/src/components/GaugeChart.js
import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import styles from './GaugeChart.module.css';

const GaugeChart = ({ value, total }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const data = [{ name: 'progress', value: percentage }];
  const endAngle = 360 * (percentage / 100);

  return (
    <div className={styles.gaugeContainer}>
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={90 - 360}
          barSize={20}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            fill="#007bff"
            angleAxisId={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className={styles.gaugeTextContent}>
        <div className={styles.gaugePercentage}>{percentage.toFixed(1)}%</div>
        <div className={styles.gaugeValues}>{`${value} / ${total} vendidos`}</div>
      </div>
    </div>
  );
};

export default GaugeChart;