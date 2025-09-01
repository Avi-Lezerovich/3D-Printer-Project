import { Outlet } from 'react-router-dom';
import { useAppStore } from '../../store';
import './main-content.css';

const MainContent = () => {
    const { sidebarCollapsed } = useAppStore();

    return (
        <div className={`main-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <main className="app-main" role="main" id="main-content">
                <Outlet />
            </main>
            <footer className="app-footer">
                © {new Date().getFullYear()} 3D Printer Project • Built with React + Vite
            </footer>
        </div>
    );
};

export default MainContent;
