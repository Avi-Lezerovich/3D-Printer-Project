import React, { useState } from 'react';
import { BarChart3, Calendar, CheckCircle, Clock, DollarSign, Package, Plus, Search, Filter, Users, Settings } from 'lucide-react';

/**
 * ModernManagementShell
 * Polished UI shell integrating analytics & task preview.
 * Uses placeholder/demo data for now; can be wired to real stores later.
 */
type TabId = 'analytics' | 'tasks' | 'budget' | 'inventory' | 'timeline' | 'team';
interface TabDef { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }

export const ModernManagementShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('analytics');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Demo data (replace with store selectors)
  const tasks = [
    { id: 1, title: 'Fine-tune automatic bed leveling system for consistent first layer quality', priority: 'HIGH', status: 'IN_PROGRESS', assignee: 'Mike Johnson', dueDate: 'Jan 10, 2025', progress: 65, tags: ['calibration', 'mechanical', 'quality'], overdue: true },
    { id: 2, title: 'Create and optimize the cooling fan assembly for better print quality', priority: 'HIGH', status: 'IN_PROGRESS', assignee: 'John Doe', dueDate: 'Jan 15, 2025', progress: 40, tags: ['hardware', 'design', 'cooling'], overdue: true },
    { id: 3, title: 'Develop software interface for managing multiple print jobs and queue scheduling', priority: 'MEDIUM', status: 'TODO', assignee: 'Jane Smith', dueDate: 'Jan 20, 2025', progress: 15, tags: ['software', 'ui', 'queue'] },
    { id: 4, title: 'Upgrade printer firmware to include new safety features and performance improvements', priority: 'MEDIUM', status: 'COMPLETED', assignee: 'Sarah Wilson', dueDate: 'Jan 25, 2025', progress: 100, tags: ['firmware', 'upgrade', 'safety'] }
  ];

  const stats = [
    { label: 'Tasks Completed', value: '1/4', icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/10', trend: '+12%' },
    { label: 'Active Tasks', value: '2', icon: Clock, color: 'text-blue-400', bgColor: 'bg-blue-500/10', trend: '+5%' },
    { label: 'Budget Used', value: '$250', icon: DollarSign, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', trend: '+26%' },
    { label: 'Days Remaining', value: '45', icon: Calendar, color: 'text-purple-400', bgColor: 'bg-purple-500/10', trend: '-7%' }
  ];

  const tabs: TabDef[] = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'team', label: 'Team', icon: Users }
  ];

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-400 bg-green-500/10';
      case 'IN_PROGRESS': return 'text-blue-400 bg-blue-500/10';
      case 'TODO': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Project Management Dashboard</h1>
              <p className="text-slate-400 text-sm">3D Printer Project Analytics & Tracking</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors" aria-label="Settings">
                <Settings className="w-5 h-5 text-slate-300" />
              </button>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-slate-300">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      <div className="flex items-center mt-2 text-sm">
                        <span className="text-green-400">{stat.trend}</span>
                        <span className="text-slate-500 ml-1">vs last week</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex space-x-1 bg-slate-800/30 backdrop-blur-sm p-1 rounded-xl border border-slate-700/50 mb-8 overflow-x-auto">
      {tabs.map(tab => {
            const Icon = tab.icon;
            return (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center flex-shrink-0 space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'}`}> 
                <Icon className="w-5 h-5" />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
          {activeTab === 'tasks' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-white flex items-center"><CheckCircle className="w-6 h-6 text-green-400 mr-2" />Task Management</h2>
                  <span className="text-slate-400 text-sm">Organize and track tasks efficiently</span>
                </div>
                <button className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20" />
                </div>
                <button onClick={() => setFilterOpen(!filterOpen)} className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700/20 border border-slate-600/30 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-white">{tasks.length}</div><div className="text-slate-400 text-sm">Total Tasks</div></div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-green-400">{tasks.filter(t=>t.status==='COMPLETED').length}</div><div className="text-slate-400 text-sm">Completed</div></div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-blue-400">{tasks.filter(t=>t.status==='IN_PROGRESS').length}</div><div className="text-slate-400 text-sm">In Progress</div></div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-red-400">{tasks.filter(t=>t.overdue).length}</div><div className="text-slate-400 text-sm">Overdue</div></div>
              </div>

              <div className="space-y-4">
                {filteredTasks.map(task => (
                  <div key={task.id} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg p-4 hover:border-slate-500/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {task.overdue ? <span role="img" aria-label="overdue">⚠️</span> : <CheckCircle className={`w-5 h-5 ${task.status === 'COMPLETED' ? 'text-green-400' : 'text-slate-400'}`} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium text-sm sm:text-base leading-tight mb-2 group-hover:text-blue-300 transition-colors">{task.title}</h3>
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>{task.status.replace('_', ' ')}</span>
                                {task.tags.map(tag => (<span key={tag} className="px-2 py-1 text-xs bg-slate-600/30 text-slate-300 rounded border border-slate-600/50">{tag}</span>))}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-slate-400">
                                <span>👤 {task.assignee}</span>
                                <span>📅 {task.dueDate}</span>
                                {task.overdue && <span className="text-red-400 font-medium">⚠️ Overdue</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 sm:ml-4">
                          <div className="text-right">
                            <div className="text-sm font-medium text-white">{task.progress}%</div>
                            <div className="w-24 bg-slate-600/30 rounded-full h-2 mt-1">
                              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${task.progress}%` }} />
                            </div>
                          </div>
                          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-600/30 rounded transition-colors" aria-label="Task Settings">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center"><BarChart3 className="w-6 h-6 text-blue-400 mr-2" />Project Analytics</h2>
                <span className="text-slate-400 text-sm">Comprehensive insights into project performance & health</span>
              </div>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Advanced Analytics Dashboard</h3>
                <p className="text-slate-400 max-w-md mx-auto">Detailed performance metrics, trend analysis, and predictive insights are being prepared.</p>
              </div>
            </div>
          )}

          {!['tasks', 'analytics'].includes(activeTab) && (
            <div className="p-6">
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Feature Coming Soon</h3>
                <p className="text-slate-400">This section is under development and will be available in the next update.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernManagementShell;
