import { useState } from 'react';
import { motion } from 'framer-motion';
import TemperatureChart from '../../components/TemperatureChart';

const ChartSection = () => {
  const [chartType, setChartType] = useState<'temperature' | 'progress' | 'speed'>('temperature');
  const [timeRange, setTimeRange] = useState<'1h' | '4h' | '12h' | '24h'>('1h');

  return (
    <section className="panel chart-section">
      <div className="chart-header">
        <h2>📊 Monitoring</h2>
        <div className="chart-controls">
          <div className="chart-type-selector">
            {(['temperature', 'progress', 'speed'] as const).map((type) => (
              <motion.button
                key={type}
                className={`chart-type-btn ${chartType === type ? 'active' : ''}`}
                onClick={() => setChartType(type)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {type === 'temperature' && '🌡️'}
                {type === 'progress' && '📈'}
                {type === 'speed' && '⚡'}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </motion.button>
            ))}
          </div>
          
          <div className="time-range-selector">
            {(['1h', '4h', '12h', '24h'] as const).map((range) => (
              <motion.button
                key={range}
                className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {range}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-content">
        <motion.div 
          className="temperature-chart-container"
          key={chartType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {chartType === 'temperature' && <TemperatureChart />}
          {chartType === 'progress' && (
            <div className="chart-placeholder">
              <div className="placeholder-icon">📈</div>
              <p>Progress Chart</p>
              <small>Print progress over time</small>
            </div>
          )}
          {chartType === 'speed' && (
            <div className="chart-placeholder">
              <div className="placeholder-icon">⚡</div>
              <p>Speed Chart</p>
              <small>Print speed variations</small>
            </div>
          )}
        </motion.div>

        <div className="chart-metrics">
          <div className="metric-card">
            <div className="metric-icon">🌡️</div>
            <div className="metric-info">
              <div className="metric-label">Avg Temp</div>
              <div className="metric-value">205°C</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">📏</div>
            <div className="metric-info">
              <div className="metric-label">Layer Height</div>
              <div className="metric-value">0.2mm</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">⚡</div>
            <div className="metric-info">
              <div className="metric-label">Print Speed</div>
              <div className="metric-value">50mm/s</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">💰</div>
            <div className="metric-info">
              <div className="metric-label">Filament Used</div>
              <div className="metric-value">24.5g</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChartSection;
