import KanbanBoard from '../components/KanbanBoard';
import { useAppStore } from '../shared/store';
import '../styles/project-management.css';

export default function ProjectManagement() {
  const tasks = useAppStore((s) => s.tasks);
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const doingTasks = tasks.filter((t) => t.status === 'doing').length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="project-management-container">
      <section className="dashboard-header">
        <h1>Project Management Dashboard</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{todoTasks}</div>
            <div className="stat-label">To Do</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{doingTasks}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{doneTasks}</div>
            <div className="stat-label">Complete</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{progress}%</div>
            <div className="stat-label">Progress</div>
          </div>
        </div>
      </section>

      <KanbanBoard />

      <div className="widgets-grid">
        <section className="widget-card">
          <h2>Budget Tracker</h2>
          <div>
            <div className="budget-info">
              <span>Total Budget</span>
              <span>$400.00</span>
            </div>
            <div className="budget-info">
              <span>Spent</span>
              <span style={{ color: 'var(--warn)' }}>$180.32</span>
            </div>
            <div className="budget-info">
              <span>Remaining</span>
              <span style={{ color: 'var(--good)' }}>$219.68</span>
            </div>
            <div className="budget-bar">
              <div className="budget-bar-fill" style={{ width: '45%' }} />
            </div>
          </div>
        </section>

        <section className="widget-card">
          <h2>Inventory Status</h2>
          <div className="inventory-status">
            <div className="inventory-item">
              <span>GT2 Belts</span>
              <span style={{ color: 'var(--good)' }}>2m remaining</span>
            </div>
            <div className="inventory-item">
              <span>Nozzles 0.4mm</span>
              <span style={{ color: 'var(--warn)' }}>3 pcs (low)</span>
            </div>
            <div className="inventory-item">
              <span>PLA Filament</span>
              <span style={{ color: 'var(--good)' }}>1.2kg</span>
            </div>
            <div className="inventory-item">
              <span>Stepper Drivers</span>
              <span style={{ color: 'var(--bad)' }}>0 spare (order)</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
