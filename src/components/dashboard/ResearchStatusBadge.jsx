/**
 * ResearchStatusBadge Component
 * Displays research status with colored badge
 * 
 * 4 States:
 * - null/'no_research': Gray badge - "No Research"
 * - 'processing': Yellow badge with 🔄 - "Researching..."
 * - 'completed': Green badge with ✅ - "Ready"
 * - 'failed': Red badge with ❌ - "Failed"
 */

export default function ResearchStatusBadge({ status }) {
  // Status configuration
  const statusConfig = {
    processing: {
      label: 'Researching...',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      icon: '🔄',
    },
    completed: {
      label: 'Ready',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: '✅',
    },
    failed: {
      label: 'Failed',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      icon: '❌',
    },
    no_research: {
      label: 'No Research',
      bgColor: 'bg-gray-200',
      textColor: 'text-gray-700',
      icon: '📋',
    },
  };

  // Determine config based on status
  const config = statusConfig[status] || statusConfig.no_research;

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 
        px-3 py-1 
        rounded-full 
        text-xs font-medium
        ${config.bgColor} 
        ${config.textColor}
        shadow-sm
      `}
    >
      <span className="text-sm">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

