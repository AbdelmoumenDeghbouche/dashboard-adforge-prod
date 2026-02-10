# Dashboard Components

Production-ready dashboard components for AD Forge platform.

## Structure

```
dashboard/
├── DashboardLayout.jsx       # Main layout wrapper with sidebar and header
├── Sidebar.jsx               # Left navigation sidebar with menu items
├── DashboardHeader.jsx       # Top header with greeting, notifications, and actions
├── WelcomeSection.jsx        # Welcome message section
├── KPICards.jsx              # Key Performance Indicator cards
├── QuickActions.jsx          # Quick action cards for common tasks
├── RecentVideos.jsx          # Recent videos list with metrics
├── RightSidebar.jsx          # Right sidebar container
├── TrendingSection.jsx       # Trending topics widget
├── NotificationsSection.jsx  # Notifications widget
├── AIRecommendations.jsx     # AI-powered recommendations widget
└── index.js                  # Centralized exports
```

## Usage

### Basic Implementation

```jsx
import { DashboardLayout, KPICards, QuickActions } from '../components/dashboard';

const MyDashboard = () => {
  return (
    <DashboardLayout>
      <KPICards />
      <QuickActions />
    </DashboardLayout>
  );
};
```

## Components Overview

### DashboardLayout
Main layout component that wraps the entire dashboard. Includes sidebar and header.

**Props:** 
- `children` - React nodes to render in main content area

### Sidebar
Left navigation sidebar with collapsible sections.

**Features:**
- User profile display
- Expandable menu sections
- Active state management
- Smooth transitions

### DashboardHeader
Top header bar with contextual information and actions.

**Features:**
- Dynamic greeting based on user
- Real-time date/time display
- Notification bell
- Settings button
- New campaign action button

### KPICards
Grid of key performance indicator cards.

**Features:**
- 4 KPI metrics with icons
- Percentage change indicators
- Visual progress bars
- Hover effects

### QuickActions
Action cards for common dashboard tasks.

**Features:**
- 4 action cards with gradients
- Hover scale effects
- Icon indicators
- Descriptive text

### RecentVideos
List of recent video campaigns with metrics.

**Features:**
- Video thumbnail display
- Platform indicators (TikTok, Instagram, YouTube)
- Performance metrics (views, engagement)
- ROI display with progress bar
- Status badges (Live, Pausé)

### RightSidebar
Container for right sidebar widgets.

**Contains:**
- TrendingSection
- NotificationsSection
- AIRecommendations

### TrendingSection
Displays trending topics with ratings.

**Features:**
- Star ratings
- Percentage changes
- Trend indicators (🔥 or 📉)

### NotificationsSection
Shows recent notifications and alerts.

**Features:**
- Type-based color coding (success, warning, info)
- Time indicators
- Icon representations

### AIRecommendations
AI-powered recommendations for optimizing campaigns.

**Features:**
- Confidence badges
- Action buttons
- Gradient backgrounds
- Estimated performance improvements

## Styling

All components use:
- Tailwind CSS for styling
- Dark theme (#0A0A0A, #0F0F0F, #1A1A1A)
- Consistent color scheme
- Smooth transitions and hover effects
- Responsive design patterns

## Best Practices

1. **Component Composition**: Each component is self-contained and reusable
2. **Props Validation**: Consider adding PropTypes for production
3. **Accessibility**: Add ARIA labels and keyboard navigation
4. **Performance**: Use React.memo for heavy components
5. **State Management**: Consider using Context API or Redux for global state

## Future Enhancements

- [ ] Add skeleton loaders
- [ ] Implement real-time data updates
- [ ] Add chart components for analytics
- [ ] Implement drag-and-drop for widgets
- [ ] Add export/download functionality
- [ ] Implement theme customization
- [ ] Add mobile responsive layout

