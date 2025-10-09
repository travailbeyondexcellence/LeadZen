# Task 3: Lead Pipeline (Kanban Board) Implementation

## 🎯 Goal
Create the main pipeline board interface with drag-and-drop functionality for lead management.

## 📋 Scope
- Implement Kanban-style pipeline board
- Create draggable lead cards
- Add pipeline stage columns (Follow up, Warm Leads, Quote, Closed Deal, Not Relevant)
- Enable drag-and-drop between stages
- Update database when leads move between stages

## 🛠️ Technical Requirements
- Install `react-native-drag-drop` or similar library
- Create PipelineBoard component with horizontal scrolling
- Implement drag-and-drop functionality
- Update database when lead stage changes
- Add visual feedback during drag operations

## 📱 Expected Deliverable
A functional pipeline board with:
- 5 vertical columns representing pipeline stages
- Lead cards that can be dragged between columns
- Real-time database updates when leads move
- Smooth animations during drag operations
- Lead count displayed in column headers
- Responsive design that works on different screen sizes

## 🔍 Acceptance Criteria
- [ ] Pipeline board displays all 5 stages correctly
- [ ] Leads are distributed in correct columns based on database
- [ ] Drag-and-drop works smoothly between columns
- [ ] Database updates immediately when lead is moved
- [ ] Column headers show correct lead count
- [ ] UI provides visual feedback during drag operations
- [ ] Board scrolls horizontally if needed
- [ ] Changes persist after app restart

## 📚 Files to Create/Modify
- `src/components/PipelineBoard.tsx` - Main Kanban board
- `src/components/PipelineColumn.tsx` - Individual pipeline column
- `src/components/DraggableLeadCard.tsx` - Draggable lead card
- `src/services/DatabaseService.js` - Add updateLeadStage method
- `src/screens/Dashboard.tsx` - Use PipelineBoard component
- `src/utils/pipelineConfig.js` - Pipeline stage definitions

## 🎨 UI Design (Based on Reference)
```
┌─────────────────────────────────────┐
│ 📊 Pipeline Board                   │
├─────────────────────────────────────┤
│ Follow up (10)  │ Warm (8)  │ Quote│
│ ┌─────────────┐ │ ┌───────┐ │ (7) │
│ │ 👤 John     │ │ │ Sarah │ │ ┌───┐│
│ │ ABC Corp    │ │ │ Tech  │ │ │Mike││
│ │ 📞 2h ago   │ │ │ Ltd   │ │ │XYZ││
│ └─────────────┘ │ └───────┘ │ └───┘│
│ ┌─────────────┐ │           │     │
│ │ 👤 Jane     │ │           │     │
│ │ XYZ Inc     │ │           │     │
│ │ 📞 1d ago   │ │           │     │
│ └─────────────┘ │           │     │
└─────────────────────────────────────┘
```

## 🔧 Pipeline Stages Configuration
```javascript
const PIPELINE_STAGES = [
  {
    id: 'follow_up',
    title: 'Follow up',
    color: '#F59E0B', // Amber
    description: 'New leads requiring outreach'
  },
  {
    id: 'warm_leads',
    title: 'Warm Leads', 
    color: '#10B981', // Emerald
    description: 'Engaged prospects showing interest'
  },
  {
    id: 'quote',
    title: 'Quote',
    color: '#3B82F6', // Blue
    description: 'Qualified leads receiving proposals'
  },
  {
    id: 'closed_deal',
    title: 'Closed Deal',
    color: '#8B5CF6', // Purple
    description: 'Successfully converted customers'
  },
  {
    id: 'not_relevant',
    title: 'Not Relevant',
    color: '#6B7280', // Gray
    description: 'Unqualified or uninterested prospects'
  }
];
```

## 🎭 Animation & Interaction Details
- Smooth drag animations with spring physics
- Visual elevation/shadow when card is being dragged
- Column highlighting when dragging over
- Haptic feedback on successful drop (Android)
- Loading spinner while database updates

## ⚠️ Notes
- Ensure drag-and-drop works well on touch devices
- Handle edge cases (network issues, database errors)
- Optimize performance for smooth 60fps animations
- Test with all 30 demo leads distributed across stages

## 🚀 Next Task Preview
Task 4 will implement individual lead detail screens with full lead information.