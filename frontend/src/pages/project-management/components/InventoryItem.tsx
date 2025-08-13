import { motion } from 'framer-motion';
import { InventoryItem as InventoryItemType } from '../types';

interface InventoryItemProps {
  item: InventoryItemType;
}

const InventoryItem = ({ item }: InventoryItemProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'critical':
        return '🔥';
      default:
        return '❔';
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      layout
    >
      <td>{item.name}</td>
      <td>
        {item.current} {item.unit}
      </td>
      <td>
        {item.minimum} {item.unit}
      </td>
      <td>
        <span className={`status-badge ${item.status}`}>
          {getStatusIcon(item.status)} {item.status}
        </span>
      </td>
      <td>{item.lastUpdated}</td>
    </motion.tr>
  );
};

export default InventoryItem;
