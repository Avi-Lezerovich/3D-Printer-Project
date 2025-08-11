import React from 'react';

interface PrintQueueProps {
  queue: { name: string }[];
}

const PrintQueue: React.FC<PrintQueueProps> = ({ queue }) => {
  return (
    <section className="panel">
      <h2>Print Queue</h2>
      <ul className="print-queue">
        {queue.map((item, index) => (
          <li key={index} className="print-queue-item">
            {item.name}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PrintQueue;
