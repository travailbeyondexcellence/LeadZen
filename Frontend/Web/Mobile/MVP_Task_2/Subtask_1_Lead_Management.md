# Subtask 1: Lead Management System

## Objective
Create a comprehensive lead data management system with modern UI components following the established design system.

## Components to Implement

### 1. Lead Data Models
```typescript
interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  value?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
  nextFollowUpAt?: Date;
}

enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted', 
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost'
}

enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  URGENT = 'urgent'
}
```

### 2. Lead List Screen
- Modern card-based layout with lead summary
- Status indicators with color coding
- Priority badges
- Swipe actions for quick operations
- Pull-to-refresh functionality
- Infinite scroll pagination

### 3. Lead Creation/Edit Form
- Multi-step form with validation
- Company autocomplete
- Source selection dropdown
- Priority and status selectors
- Notes with rich text support
- Save draft functionality

### 4. Lead Detail View
- Comprehensive lead information display
- Contact history timeline
- Quick action buttons (call, email, edit)
- Notes and activities section
- Follow-up scheduling

## Design Specifications
- **Colors**: Teal blue theme (#14B8A6) for primary actions
- **Cards**: White background with soft shadows (elevation 2-3)
- **Typography**: Clear hierarchy with 16px base for readability
- **Spacing**: 16px base unit with generous padding
- **Interactions**: Material ripple effects on pressable elements
- **Status Colors**: 
  - New: #06B6D4 (cyan)
  - Contacted: #F59E0B (amber) 
  - Qualified: #10B981 (emerald)
  - Proposal: #8B5CF6 (purple)
  - Closed Won: #10B981 (green)
  - Closed Lost: #EF4444 (red)

## Files to Create/Modify
- `src/types/Lead.ts` - Lead interfaces and enums
- `src/screens/LeadList.tsx` - Lead listing screen
- `src/screens/LeadDetail.tsx` - Lead detail view
- `src/screens/LeadForm.tsx` - Lead creation/editing form
- `src/components/LeadCard.tsx` - Lead summary card component
- `src/components/StatusBadge.tsx` - Status indicator component
- `src/components/PriorityBadge.tsx` - Priority indicator component