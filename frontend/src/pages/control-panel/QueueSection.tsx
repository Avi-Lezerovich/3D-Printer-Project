import { useAppStore } from '../../shared/store';
import PrintQueue from '../../components/control-panel/PrintQueue';

const QueueSection = () => {
  const queue = useAppStore((s) => s.queue);

  return (
    <section className="panel queue-section">
      <PrintQueue queue={queue} />
    </section>
  );
};

export default QueueSection;
