import { useState } from 'react';
import { useAppStore } from '../shared/store';
import { 
  BarChart3, Calendar, CheckCircle, Clock, DollarSign, Package, Plus, Search, Filter, 
  AlertCircle, TrendingUp, Target, Zap, Activity, RefreshCw, Edit3
} from 'lucide-react';

const ProjectManagementUI = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const { sidebarCollapsed } = useAppStore();

  // Sample data
  const tasks = [
    {
      id: 1,
      title: "Fine-tune automatic bed leveling system for consistent first layer quality",
      priority: "HIGH",
      status: "IN_PROGRESS",
      assignee: "Mike Johnson",
      dueDate: "Jan 10, 2025",
      progress: 65,
      tags: ["calibration", "mechanical", "quality"],
      overdue: true
    },
    {
      id: 2,
      title: "Create and optimize the cooling fan assembly for better print quality",
      priority: "HIGH", 
      status: "IN_PROGRESS",
      assignee: "John Doe",
      dueDate: "Jan 15, 2025",
      progress: 40,
      tags: ["hardware", "design", "cooling"],
      overdue: true
    },
    {
      id: 3,
      title: "Develop software interface for managing multiple print jobs and queue scheduling",
      priority: "MEDIUM",
      status: "TODO",
      assignee: "Jane Smith",
      dueDate: "Jan 20, 2025",
      progress: 15,
      tags: ["software", "ui", "queue"]
    },
    {
      id: 4,
      title: "Upgrade printer firmware to include new safety features and performance improvements",
      priority: "MEDIUM",
      status: "COMPLETED",
      assignee: "Sarah Wilson",
      dueDate: "Jan 25, 2025",
      progress: 100,
      tags: ["firmware", "upgrade", "safety"]
    }
  ];

  const budgetItems = [
    {
      id: 1,
      category: "Hardware Components",
      budgeted: 800,
      spent: 620,
      items: [
        { name: "Stepper Motors", cost: 120, status: "purchased" },
        { name: "Control Board", cost: 85, status: "purchased" },
        { name: "Print Bed", cost: 65, status: "purchased" },
        { name: "Extruder Assembly", cost: 150, status: "purchased" },
        { name: "Frame Materials", cost: 200, status: "purchased" }
      ]
    },
    {
      id: 2,
      category: "Electronics & Sensors",
      budgeted: 300,
      spent: 180,
      items: [
        { name: "Temperature Sensors", cost: 45, status: "purchased" },
        { name: "Endstop Switches", cost: 25, status: "purchased" },
        { name: "Power Supply", cost: 110, status: "purchased" }
      ]
    },
    {
      id: 3,
      category: "Software & Tools",
      budgeted: 200,
      spent: 75,
      items: [
        { name: "CAD Software License", cost: 50, status: "purchased" },
        { name: "Development Tools", cost: 25, status: "purchased" }
      ]
    },
    {
      id: 4,
      category: "Testing & Materials",
      budgeted: 150,
      spent: 90,
      items: [
        { name: "Filament Samples", cost: 40, status: "purchased" },
        { name: "Calibration Tools", cost: 50, status: "purchased" }
      ]
    }
  ];

  const inventoryItems = [
    {
      id: 1,
      name: "PLA Filament - White",
      category: "Filaments",
      stock: 12,
      minStock: 5,
      unit: "kg",
      status: "in_stock",
      cost: 25,
      supplier: "PrintMat Co.",
      lastRestocked: "Jan 5, 2025"
    },
    {
      id: 2,
      name: "ABS Filament - Black",
      category: "Filaments",
      stock: 3,
      minStock: 5,
      unit: "kg",
      status: "low_stock",
      cost: 28,
      supplier: "PrintMat Co.",
      lastRestocked: "Dec 20, 2024"
    },
    {
      id: 3,
      name: "Nozzle 0.4mm",
      category: "Components",
      stock: 8,
      minStock: 3,
      unit: "pcs",
      status: "in_stock",
      cost: 12,
      supplier: "TechParts Ltd.",
      lastRestocked: "Jan 8, 2025"
    },
    {
      id: 4,
      name: "Print Bed Adhesive",
      category: "Consumables",
      stock: 1,
      minStock: 2,
      unit: "bottles",
      status: "low_stock",
      cost: 15,
      supplier: "PrintMat Co.",
      lastRestocked: "Dec 15, 2024"
    },
    {
      id: 5,
      name: "Stepper Motor Belt",
      category: "Components",
      stock: 0,
      minStock: 2,
      unit: "meters",
      status: "out_of_stock",
      cost: 8,
      supplier: "TechParts Ltd.",
      lastRestocked: "Nov 30, 2024"
    }
  ];

  const timelineEvents = [
    {
      id: 1,
      title: "Project Kickoff & Planning",
      date: "Dec 1, 2024",
      type: "milestone",
      status: "completed",
      description: "Initial project planning and requirement gathering phase",
      progress: 100
    },
    {
      id: 2,
      title: "Hardware Design Phase",
      date: "Dec 15, 2024",
      type: "phase",
      status: "completed",
      description: "Mechanical design and component selection",
      progress: 100
    },
    {
      id: 3,
      title: "Prototype Assembly",
      date: "Jan 5, 2025",
      type: "milestone",
      status: "completed",
      description: "First working prototype assembled and tested",
      progress: 100
    },
    {
      id: 4,
      title: "Software Development",
      date: "Jan 10, 2025",
      type: "phase",
      status: "in_progress",
      description: "Firmware and control software development",
      progress: 65
    },
    {
      id: 5,
      title: "Calibration & Testing",
      date: "Jan 20, 2025",
      type: "phase",
      status: "upcoming",
      description: "Fine-tuning and quality assurance testing",
      progress: 0
    },
    {
      id: 6,
      title: "Beta Release",
      date: "Feb 1, 2025",
      type: "milestone",
      status: "upcoming",
      description: "Limited beta release for testing",
      progress: 0
    },
    {
      id: 7,
      title: "Final Production",
      date: "Feb 15, 2025",
      type: "milestone",
      status: "upcoming",
      description: "Final production version ready",
      progress: 0
    }
  ];

  const stats = [
    { label: "Tasks Completed", value: "1/4", icon: CheckCircle, color: "text-green-400", bgColor: "bg-green-500/10", trend: "+12%" },
    { label: "Active Tasks", value: "2", icon: Clock, color: "text-blue-400", bgColor: "bg-blue-500/10", trend: "+5%" },
    { label: "Budget Used", value: "$965", icon: DollarSign, color: "text-yellow-400", bgColor: "bg-yellow-500/10", trend: "+26%" },
    { label: "Days Remaining", value: "25", icon: Calendar, color: "text-purple-400", bgColor: "bg-purple-500/10", trend: "-7%" }
  ];

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'timeline', label: 'Timeline', icon: Calendar }
  ];

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
      case 'completed': return 'text-green-400 bg-green-500/10';
      case 'in_progress': return 'text-blue-400 bg-blue-500/10';
      case 'upcoming': return 'text-purple-400 bg-purple-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-400 bg-green-500/10';
      case 'low_stock': return 'text-yellow-400 bg-yellow-500/10';
      case 'out_of_stock': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.budgeted, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const budgetUtilization = (totalSpent / totalBudget) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Fixed Navigation Tabs */}
      <div 
        className={`fixed top-0 z-50 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 transition-all duration-300 ${
          sidebarCollapsed ? 'left-[70px] right-0' : 'left-[280px] right-0'
        } max-lg:left-0 max-lg:right-0`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-1 bg-slate-800/50 backdrop-blur-sm p-1 rounded-xl border border-slate-700/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content with top padding to account for fixed header */}
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      <div className="flex items-center mt-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
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

        {/* Main Content Area */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
          
          {/* Analytics View */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <BarChart3 className="w-6 h-6 text-blue-400 mr-2" />
                  Project Analytics
                </h2>
                <span className="text-slate-400 text-sm">Comprehensive insights into your project&apos;s performance and health</span>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Budget Overview Chart */}
                <div className="bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 text-yellow-400 mr-2" />
                    Budget Utilization
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Budget</span>
                      <span className="text-white font-medium">${totalBudget}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Spent</span>
                      <span className="text-white font-medium">${totalSpent}</span>
                    </div>
                    <div className="w-full bg-slate-600/30 rounded-full h-3">
                      <div 
                        className="h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${budgetUtilization}%` }}
                      ></div>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-white">{budgetUtilization.toFixed(1)}%</span>
                      <p className="text-slate-400 text-sm">Budget Used</p>
                    </div>
                  </div>
                </div>

                {/* Task Progress */}
                <div className="bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    Task Progress
                  </h3>
                  <div className="space-y-4">
                    {['Hardware', 'Software', 'Testing', 'Documentation'].map((category, index) => {
                      const progress = [75, 45, 30, 60][index];
                      return (
                        <div key={category}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-300">{category}</span>
                            <span className="text-white font-medium">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-600/30 rounded-full h-2">
                            <div 
                              className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg p-6 text-center">
                  <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">92%</div>
                  <div className="text-slate-400 text-sm">Quality Score</div>
                </div>
                <div className="bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg p-6 text-center">
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">7.2</div>
                  <div className="text-slate-400 text-sm">Velocity</div>
                </div>
                <div className="bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg p-6 text-center">
                  <Activity className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-slate-400 text-sm">Uptime</div>
                </div>
              </div>
            </div>
          )}

          {/* Tasks View */}
          {activeTab === 'tasks' && (
            <div className="p-6">
              {/* Header with Search and Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                    Task Management
                  </h2>
                  <span className="text-slate-400 text-sm">Organize and track your 3D printing project tasks efficiently</span>
                </div>
                <button className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
                <button 
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div>

              {/* Task Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700/20 border border-slate-600/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">4</div>
                  <div className="text-slate-400 text-sm">Total Tasks</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">1</div>
                  <div className="text-slate-400 text-sm">Completed</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">2</div>
                  <div className="text-slate-400 text-sm">In Progress</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">2</div>
                  <div className="text-slate-400 text-sm">Overdue</div>
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg p-4 hover:border-slate-500/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {task.overdue ? (
                                <AlertCircle className="w-5 h-5 text-red-400" />
                              ) : (
                                <CheckCircle className={`w-5 h-5 ${task.status === 'COMPLETED' ? 'text-green-400' : 'text-slate-400'}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium text-sm sm:text-base leading-tight mb-2 group-hover:text-blue-300 transition-colors">
                                {task.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
                                  {task.status.replace('_', ' ')}
                                </span>
                                {task.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 text-xs bg-slate-600/30 text-slate-300 rounded border border-slate-600/50">
                                    {tag}
                                  </span>
                                ))}
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
                              <div 
                                className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-600/30 rounded transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget View */}
          {activeTab === 'budget' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <DollarSign className="w-6 h-6 text-yellow-400 mr-2" />
                    Budget Management
                  </h2>
                  <span className="text-slate-400 text-sm">Track project expenses and budget allocation</span>
                </div>
                <button className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add Expense</span>
                </button>
              </div>

              {/* Budget Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg p-6 text-center">
                  <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">${totalBudget}</div>
                  <div className="text-slate-400 text-sm">Total Budget</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-red-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">${totalSpent}</div>
                  <div className="text-slate-400 text-sm">Total Spent</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
                  <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">${totalBudget - totalSpent}</div>
                  <div className="text-slate-400 text-sm">Remaining</div>
                </div>
              </div>

              {/* Budget Categories */}
              <div className="space-y-6">
                {budgetItems.map((category) => {
                  const utilization = (category.spent / category.budgeted) * 100;
                  return (
                    <div key={category.id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg p-6 hover:border-slate-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">{category.category}</h3>
                          <div className="text-right">
                            <div className="text-white font-medium">${category.spent} / ${category.budgeted}</div>
                            <div className="text-slate-400 text-sm">{utilization.toFixed(1)}% used</div>
                          </div>
                        </div>
                        <div className="w-full bg-slate-600/30 rounded-full h-3 mb-4">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              utilization > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                              utilization > 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                              'bg-gradient-to-r from-green-500 to-blue-500'
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          ></div>
                        </div>
                        <div className="space-y-2">
                          {category.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${item.status === 'purchased' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                                <span className="text-slate-300">{item.name}</span>
                              </div>
                              <span className="text-white font-medium">${item.cost}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inventory View */}
          {activeTab === 'inventory' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Package className="w-6 h-6 text-blue-400 mr-2" />
                    Inventory Management
                  </h2>
                  <span className="text-slate-400 text-sm">Monitor stock levels and manage supplies</span>
                </div>
                <button className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Inventory Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700/20 border border-slate-600/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{inventoryItems.length}</div>
                  <div className="text-slate-400 text-sm">Total Items</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{inventoryItems.filter(item => item.status === 'in_stock').length}</div>
                  <div className="text-slate-400 text-sm">In Stock</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{inventoryItems.filter(item => item.status === 'low_stock').length}</div>
                  <div className="text-slate-400 text-sm">Low Stock</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{inventoryItems.filter(item => item.status === 'out_of_stock').length}</div>
                  <div className="text-slate-400 text-sm">Out of Stock</div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              {/* Inventory List */}
              <div className="space-y-4">
                {inventoryItems.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg p-4 hover:border-slate-500/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <Package className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium text-base leading-tight mb-2 group-hover:text-blue-300 transition-colors">
                                {item.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="px-2 py-1 text-xs bg-slate-600/30 text-slate-300 rounded border border-slate-600/50">
                                  {item.category}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getStockStatusColor(item.status)}`}>
                                  {item.status.replace('_', ' ').toUpperCase()}
                                </span>
                                <span className="px-2 py-1 text-xs bg-slate-600/30 text-slate-300 rounded border border-slate-600/50">
                                  ${item.cost} each
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-slate-400">
                                <span>🏪 {item.supplier}</span>
                                <span>📅 Last: {item.lastRestocked}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 sm:ml-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">{item.stock} {item.unit}</div>
                            <div className="text-sm text-slate-400">Min: {item.minStock}</div>
                            {item.stock <= item.minStock && (
                              <div className="text-xs text-red-400 font-medium mt-1">⚠️ Reorder needed</div>
                            )}
                          </div>
                          <button className="flex items-center space-x-1 px-3 py-2 bg-slate-600/30 hover:bg-slate-600/50 text-slate-300 rounded transition-colors text-sm">
                            <RefreshCw className="w-4 h-4" />
                            <span>Restock</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline View */}
          {activeTab === 'timeline' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Calendar className="w-6 h-6 text-purple-400 mr-2" />
                    Project Timeline
                  </h2>
                  <span className="text-slate-400 text-sm">Track milestones and project phases</span>
                </div>
                <button className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add Milestone</span>
                </button>
              </div>

              {/* Timeline Progress */}
              <div className="bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
                  <span className="text-2xl font-bold text-white">58%</span>
                </div>
                <div className="w-full bg-slate-600/30 rounded-full h-4">
                  <div className="h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: '58%' }}></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-slate-400">
                  <span>Started Dec 1, 2024</span>
                  <span>Expected completion: Feb 15, 2025</span>
                </div>
              </div>

              {/* Timeline Events */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-slate-600"></div>
                
                <div className="space-y-6">
                  {timelineEvents.map((event) => (
                    <div key={event.id} className="relative flex items-start space-x-4">
                      {/* Timeline dot */}
                      <div className={`relative z-10 flex-shrink-0 w-4 h-4 rounded-full border-2 ${
                        event.status === 'completed' ? 'bg-green-500 border-green-400' :
                        event.status === 'in_progress' ? 'bg-blue-500 border-blue-400 animate-pulse' :
                        'bg-slate-600 border-slate-500'
                      }`}>
                        {event.type === 'milestone' && (
                          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20"></div>
                        )}
                      </div>

                      {/* Event content */}
                      <div className="flex-1 min-w-0 pb-8">
                        <div className="bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg p-4 hover:border-slate-500/50 transition-colors group">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-white font-medium text-base mb-1 group-hover:text-blue-300 transition-colors">
                                {event.title}
                              </h3>
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(event.status)}`}>
                                  {event.status.replace('_', ' ').toUpperCase()}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded border ${
                                  event.type === 'milestone' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                                  'text-blue-400 bg-blue-500/10 border-blue-500/20'
                                }`}>
                                  {event.type.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-white">{event.date}</div>
                              <div className="text-xs text-slate-400 mt-1">{event.progress}% complete</div>
                            </div>
                          </div>
                          <p className="text-slate-300 text-sm mb-3">{event.description}</p>
                          {event.status === 'in_progress' && (
                            <div className="w-full bg-slate-600/30 rounded-full h-2">
                              <div 
                                className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                                style={{ width: `${event.progress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManagementUI;
