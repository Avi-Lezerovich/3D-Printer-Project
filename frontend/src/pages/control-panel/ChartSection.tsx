import TemperatureChart from '../../components/TemperatureChart';

const ChartSection = () => {
  return (
    <section className="panel chart-section">
      <h2>Live Temperature Chart</h2>
      <div className="temperature-chart-container">
        <TemperatureChart />
      </div>
    </section>
  );
};

export default ChartSection;
