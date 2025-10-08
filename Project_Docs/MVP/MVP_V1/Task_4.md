# Task 4: Lead Detail Screen & Lead Management

## 🎯 Goal
Create comprehensive lead detail screens with full CRUD (Create, Read, Update, Delete) functionality.

## 📋 Scope
- Implement detailed lead profile screen
- Add lead creation/editing forms
- Create tabbed interface for lead information
- Implement lead search and filtering
- Add label/tag management system

## 🛠️ Technical Requirements
- Create detailed lead profile screen with tabs
- Implement form validation for lead creation/editing
- Add search functionality across all lead fields
- Create label/tag system with color coding
- Implement lead deletion with confirmation

## 📱 Expected Deliverable
Complete lead management system with:
- Detailed lead profile with tabs (Info, Notes, Activity, Labels)
- Add/Edit lead form with validation
- Search bar with real-time filtering
- Label management (create, assign, remove labels)
- Lead deletion with confirmation dialog
- Navigation between pipeline and detail screens

## 🔍 Acceptance Criteria
- [ ] Tapping lead card opens detailed profile screen
- [ ] Lead detail shows all information in organized tabs
- [ ] Add new lead button opens creation form
- [ ] Form validation prevents invalid data entry
- [ ] Search functionality filters leads in real-time
- [ ] Labels can be created, assigned, and removed
- [ ] Lead deletion works with confirmation
- [ ] Navigation flows work smoothly
- [ ] All changes save to database immediately

## 📚 Files to Create/Modify
- `src/screens/LeadDetail.tsx` - Main lead detail screen
- `src/screens/LeadForm.tsx` - Add/Edit lead form
- `src/components/TabView.tsx` - Tabbed interface component
- `src/components/SearchBar.tsx` - Search functionality
- `src/components/LabelManager.tsx` - Label management
- `src/services/DatabaseService.js` - Add CRUD methods
- `src/utils/validation.js` - Form validation helpers

## 🎨 UI Design (Based on Reference)
```
┌─────────────────────────────────────┐
│ ← Back    👤 Sarah Johnson          │
├─────────────────────────────────────┤
│ 📸 [Photo] Sarah Johnson           │
│            Tech Solutions Ltd       │
│            (555) 123-4567          │
│            sarah@tech.com          │
│                                    │
│ Info │ Notes │ Activity │ Labels   │ ← Tabs
│ ─────                              │
│                                    │
│ 📋 Company: Tech Solutions Ltd     │
│ 💼 Position: Sales Director       │
│ 📧 Email: sarah@tech.com          │
│ 📞 Phone: (555) 123-4567          │
│ 📅 Created: Oct 8, 2025           │
│ 🎯 Pipeline: Warm Leads           │
│                                    │
│ 🏷️ Labels:                        │
│ [Warm Leads] [Customer] [High Pri] │
│                                    │
│ [📝 Add Note] [📞 Call] [✏️ Edit]  │
└─────────────────────────────────────┘
```

## 📋 Form Fields & Validation
**Lead Creation/Edit Form:**
- Name (required, min 2 characters)
- Company (optional)
- Position (optional)
- Primary Phone (required, valid phone format)
- Secondary Phone (optional, valid phone format)
- Email (optional, valid email format)
- Pipeline Stage (dropdown, default: Follow up)
- Priority (Low/Medium/High, default: Medium)
- Lead Source (Manual/Website/Referral/etc.)

**Validation Rules:**
```javascript
const validation = {
  name: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s]+$/
  },
  phone_primary: {
    required: true,
    pattern: /^\(\d{3}\)\s\d{3}-\d{4}$/
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};
```

## 🏷️ Label System Implementation
- Default labels: VIP, Customer, Hot Lead, Cold Lead, High Priority
- Color-coded labels with customizable colors
- Multi-select label assignment
- Label creation with name and color picker
- Label usage count tracking

## 🔍 Search & Filter Features
- Real-time search across: name, company, phone, email
- Filter by pipeline stage
- Filter by labels/tags
- Sort options: Name, Company, Last Contact, Created Date
- Recent activity prioritization

## 🎭 Animation & UX Details
- Smooth screen transitions (slide from right)
- Tab switching animations (cross-fade)
- Form input animations (floating labels)
- Loading states for database operations
- Success/error toast messages

## ⚠️ Notes
- Ensure form auto-saves draft data
- Handle keyboard properly on form screens
- Implement proper error handling for database operations
- Test form validation thoroughly
- Optimize search performance for large datasets

## 🚀 Next Task Preview
Task 5 will implement Android permissions and call detection service.