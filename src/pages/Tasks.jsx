import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useTasksContext } from '../contexts/TasksContext';
import { Clock, CheckCircle2, XCircle, Loader2, Filter, Trash2, RefreshCw } from 'lucide-react';

const Tasks = () => {
  const navigate = useNavigate();
  const {
    tasks,
    getFilteredTasks,
    getTaskCounts,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    removeTask,
    clearCompletedTasks,
    refreshJobs, // Manual refresh function
    loading,
  } = useTasksContext();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const filteredTasks = getFilteredTasks();
  const taskCounts = getTaskCounts();
  
  /**
   * ✅ MANUAL POLLING - Only when user is on Tasks page
   */
  useEffect(() => {
    console.log('[Tasks] 🔄 Mounted - starting job polling');
    
    // Fetch immediately on mount
    refreshJobs();
    
    // Poll every 30 seconds while on this page
    const interval = setInterval(() => {
      console.log('[Tasks] 🔄 Polling for jobs...');
      refreshJobs();
    }, 30000);
    
    return () => {
      console.log('[Tasks] 🛑 Unmounted - stopping job polling');
      clearInterval(interval);
    };
  }, [refreshJobs]);
  
  /**
   * Manual refresh handler with loading state
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshJobs();
    setTimeout(() => setIsRefreshing(false), 500); // Brief loading animation
  };
  
  // Task type labels and icons
  const taskTypeConfig = {
    scraping: { label: 'Scraping', icon: '🔍', color: 'blue' },
    research: { label: 'Research', icon: '🔬', color: 'purple' },
    strategic_analysis: { label: 'Strategic Analysis', icon: '🎯', color: 'pink' },
    creative_generation: { label: 'Creative Generation', icon: '✨', color: 'cyan' },
    video_generation: { label: 'Video Generation', icon: '🎬', color: 'orange' },
    avatar_video: { label: 'Avatar Video', icon: '👤', color: 'green' },
    ad_generation: { label: 'Ad Generation', icon: '📸', color: 'yellow' },
  };
  
  // Status config
  const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'gray' },
    processing: { label: 'Processing', icon: Loader2, color: 'blue' },
    completed: { label: 'Completed', icon: CheckCircle2, color: 'green' },
    failed: { label: 'Failed', icon: XCircle, color: 'red' },
  };
  
  // Get status color classes
  const getStatusColorClasses = (status) => {
    const colors = {
      pending: 'bg-gray-900/20 border-gray-500/30 text-gray-400',
      processing: 'bg-blue-900/20 border-blue-500/30 text-blue-400',
      completed: 'bg-green-900/20 border-green-500/30 text-green-400',
      failed: 'bg-red-900/20 border-red-500/30 text-red-400',
    };
    return colors[status] || colors.pending;
  };
  
  // Get task type color
  const getTaskTypeColor = (taskType) => {
    const config = taskTypeConfig[taskType];
    if (!config) return 'text-gray-400';
    
    const colors = {
      blue: 'text-blue-400',
      purple: 'text-purple-400',
      pink: 'text-pink-400',
      cyan: 'text-cyan-400',
      orange: 'text-orange-400',
      green: 'text-green-400',
      yellow: 'text-yellow-400',
    };
    return colors[config.color] || 'text-gray-400';
  };
  
  // Format time elapsed
  const formatTimeElapsed = (startTime, endTime) => {
    const end = endTime || Date.now();
    const elapsed = end - startTime;
    
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };
  
  // Navigate to task details
  const navigateToTask = (task) => {
    const { metadata } = task;
    
    switch (task.taskType) {
      case 'research':
      case 'strategic_analysis':
        if (metadata.brandId && metadata.productId) {
          navigate(`/strategic-analysis?brand=${metadata.brandId}&product=${metadata.productId}`);
        }
        break;
        
      case 'video_generation':
      case 'avatar_video':
        navigate('/generation');
        break;
        
      case 'ad_generation':
        if (metadata.productId) {
          navigate(`/product/${metadata.productId}`);
        } else {
          navigate('/generated-ads');
        }
        break;
        
      case 'scraping':
        navigate('/ingestion?tab=scraper');
        break;
        
      default:
        break;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0F0F0F] p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                📋 Tasks & Operations
              </h1>
              <p className="text-gray-400 text-sm">
                Track all your background operations in one place
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed border border-purple-500 hover:border-purple-400 text-white rounded-lg text-sm flex items-center gap-2 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={clearCompletedTasks}
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] hover:border-gray-600 text-gray-300 rounded-lg text-sm flex items-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Clear Completed
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{taskCounts.total}</div>
              <div className="text-xs text-gray-400 mt-1">Total Tasks</div>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">{taskCounts.processing}</div>
              <div className="text-xs text-blue-300/70 mt-1 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing
              </div>
            </div>
            
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">{taskCounts.completed}</div>
              <div className="text-xs text-green-300/70 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </div>
            </div>
            
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-400">{taskCounts.failed}</div>
              <div className="text-xs text-red-300/70 mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Failed
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-300">Filters</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Task Type Filter */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Task Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Types</option>
                  {Object.entries(taskTypeConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="processing">⚡ Processing</option>
                  <option value="completed">✅ Completed</option>
                  <option value="failed">❌ Failed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tasks List */}
        <div className="max-w-7xl mx-auto">
          {filteredTasks.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-[#0F0F0F] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Tasks Found</h3>
              <p className="text-gray-400 text-sm">
                {filterType !== 'all' || filterStatus !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Start a new operation to see it tracked here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const StatusIcon = statusConfig[task.status]?.icon || Clock;
                const typeConfig = taskTypeConfig[task.taskType];
                
                return (
                  <div
                    key={task.taskId}
                    className={`bg-[#1A1A1A] border rounded-xl p-4 hover:border-gray-600 transition-all ${getStatusColorClasses(task.status)}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Icon + Info */}
                      <div className="flex items-start gap-3 flex-1">
                        {/* Type Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-[#0F0F0F] flex items-center justify-center text-xl ${getTaskTypeColor(task.taskType)}`}>
                          {typeConfig?.icon || '📦'}
                        </div>
                        
                        {/* Task Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold text-sm truncate">
                              {task.title}
                            </h3>
                            <span className="px-2 py-0.5 bg-[#0F0F0F] border border-[#262626] rounded text-xs text-gray-400 flex-shrink-0">
                              {typeConfig?.label || task.taskType}
                            </span>
                          </div>
                          
                          {task.description && (
                            <p className="text-gray-400 text-xs mb-2 truncate">
                              {task.description}
                            </p>
                          )}
                          
                          {/* Progress Bar */}
                          {(task.status === 'processing' || task.status === 'completed') && (
                            <div className="mb-2">
                              <div className="w-full bg-[#0F0F0F] rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    task.status === 'completed'
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                      : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
                                  }`}
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500">
                                  {Math.round(task.progress)}%
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTimeElapsed(task.startTime, task.endTime)}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Metadata */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {task.metadata.productName && (
                              <span className="text-xs text-gray-500">
                                📦 {task.metadata.productName}
                              </span>
                            )}
                            {task.status === 'failed' && task.metadata.error && (
                              <span className="text-xs text-red-400">
                                ⚠️ {task.metadata.error}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Status + Actions */}
                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0F0F0F] border border-[#262626] rounded-lg">
                          <StatusIcon className={`w-3 h-3 ${task.status === 'processing' ? 'animate-spin' : ''}`} />
                          <span className="text-xs font-medium">
                            {statusConfig[task.status]?.label}
                          </span>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {(task.status === 'completed' || task.status === 'failed') && (
                            <button
                              onClick={() => removeTask(task.taskId)}
                              className="p-1.5 hover:bg-[#262626] rounded-lg transition-colors"
                              title="Remove task"
                            >
                              <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-400" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => navigateToTask(task)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tasks;

