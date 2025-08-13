import { useAppStore } from '../../shared/store';
import ControlPanelHeader from '../../components/control-panel/ControlPanelHeader';

const Header = () => {
  const { connected, setConnected } = useAppStore((state) => ({
    connected: state.connected,
    setConnected: state.setConnected,
  }));

  const handleToggleConnection = () => {
    setConnected(!connected);
  };

  return (
    <header className="control-panel-main-header">
      <h1>Control Panel</h1>
      <ControlPanelHeader
        connected={connected}
        onToggleConnection={handleToggleConnection}
      />
    </header>
  );
};

export default Header;
