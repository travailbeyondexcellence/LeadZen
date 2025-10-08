# LeadZen CRM MVP - Product Specification v1.0

**Document Version:** 1.0  
**Date:** October 2025  
**Author:** Development Team  
**Project:** LeadZen Mobile CRM MVP  
**Target:** Demo & Testing Ready MVP  

---

## Table of Contents
1. [MVP Overview](#1-mvp-overview)
2. [Core Features](#2-core-features)
3. [Technical Architecture](#3-technical-architecture)
4. [User Interface Design](#4-user-interface-design)
5. [Data Management](#5-data-management)
6. [Permissions & Integration](#6-permissions--integration)
7. [Development Roadmap](#7-development-roadmap)
8. [Testing Strategy](#8-testing-strategy)

---

## 1. MVP Overview

### 1.1 MVP Goals
- **Primary:** Demonstrate intelligent call overlay functionality with real calls
- **Secondary:** Showcase modern CRM interface with lead management
- **Tertiary:** Validate user experience and gather feedback for full development

### 1.2 MVP Scope (Demo-Ready)
- ✅ **Standalone Android APK** - No server dependencies
- ✅ **Real Call Integration** - Works with actual phone calls
- ✅ **SQLite Database** - Local storage for leads and activities
- ✅ **Built-in Dialer** - Full dialing capabilities within app
- ✅ **30 Demo Leads** - Pre-populated realistic data
- ✅ **Modern UI/UX** - Material Design 3 with 3D effects

### 1.3 MVP Limitations (Acceptable for Demo)
- ❌ No cloud synchronization
- ❌ No team collaboration
- ❌ No quote generation
- ❌ No advanced analytics
- ❌ No user authentication

---

## 2. Core Features

### 2.1 Call Management System

#### 2.1.1 Incoming Call Overlay
**During Call - Simple Overlay:**
- Compact overlay (30% of screen) during active call
- Lead name, company, and status
- Last interaction date
- Quick action buttons: "Add Note" | "Update Status"
- Minimize/maximize toggle
- Auto-dismiss when call ends

**Post-Call - Detailed Bottom Tray:**
- Slides up from bottom (80% of screen height)
- Complete lead profile information
- Tabbed interface: Info | Notes | Activity | Labels
- Rich text note editor with timestamp
- Pipeline status dropdown
- Label management (tags)
- "Create Meeting" and task creation
- Call duration and outcome logging

#### 2.1.2 Outgoing Call Integration
- Built-in dialer with T9 search
- Lead suggestions while typing
- One-tap call from lead profile
- Pre-call lead info display
- Same overlay behavior as incoming calls

#### 2.1.3 Call History & Logging
- Automatic call logging with lead association
- Call duration, timestamp, and outcome
- Link unknown numbers to create new leads
- Call frequency analytics per lead

### 2.2 Lead Management

#### 2.2.1 Lead Database (SQLite)
**Pre-populated Demo Data (30 Leads):**
- 10 Follow-up stage leads
- 8 Warm Leads stage
- 7 Quote stage leads
- 3 Closed Deals
- 2 Not Relevant

**Lead Information Structure:**
```sql
Leads Table:
- id (Primary Key)
- name (String)
- company (String)
- phone_primary (String)
- phone_secondary (String, Optional)
- email (String)
- position (String)
- pipeline_stage (Enum)
- created_date (DateTime)
- last_contact (DateTime)
- lead_source (String)
- priority (High/Medium/Low)
- avatar_url (String, Local Assets)
```

#### 2.2.2 Lead Creation & Editing
- Add new lead form with validation
- Photo capture/selection for lead avatar
- Multiple phone number support
- Pipeline stage assignment
- Label/tag assignment
- Lead source tracking

#### 2.2.3 Lead Search & Filtering
- Real-time search across all fields
- Filter by pipeline stage
- Filter by labels/tags
- Sort by last contact, name, company
- Recent activity prioritization

### 2.3 Pipeline Management

#### 2.3.1 Pipeline Stages (Non-customizable for MVP)
1. **Follow up** - New or cold leads requiring outreach
2. **Warm Leads** - Engaged prospects showing interest
3. **Quote** - Qualified leads receiving proposals
4. **Closed Deal** - Successfully converted customers
5. **Not Relevant** - Unqualified or uninterested prospects

#### 2.3.2 Pipeline Interface
- Kanban-style board view
- Drag-and-drop between stages
- Lead count per stage header
- Quick preview cards with key info
- Stage-specific color coding

### 2.4 Built-in Dialer

#### 2.4.1 Dialer Interface
- Material Design 3 number pad
- T9 search functionality
- Recent calls integration
- Favorites/frequently called
- Lead suggestions during typing

#### 2.4.2 Smart Features
- Auto-format phone numbers
- Country code detection
- Lead matching during dial
- Click-to-call from lead profiles
- Call history integration

---

## 3. Technical Architecture

### 3.1 Technology Stack
- **Framework:** React Native 0.73.6
- **Database:** SQLite (react-native-sqlite-storage)
- **Navigation:** React Navigation 6
- **UI Components:** React Native Elements + Custom Components
- **Icons:** React Native Vector Icons
- **Animations:** React Native Reanimated 3
- **Call Detection:** react-native-call-detection
- **Permissions:** react-native-permissions

### 3.2 App Architecture
```
LeadZen MVP/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CallOverlay/     # Call overlay components
│   │   ├── LeadCard/        # Lead display components
│   │   ├── Dialer/          # Dialer components
│   │   └── Common/          # Shared components
│   ├── screens/             # Main app screens
│   │   ├── Dashboard/       # Main pipeline view
│   │   ├── LeadDetail/      # Individual lead view
│   │   ├── LeadCreate/      # Add new lead
│   │   ├── Dialer/          # Built-in dialer
│   │   └── CallHistory/     # Call logs
│   ├── services/            # Business logic
│   │   ├── CallService/     # Call detection & management
│   │   ├── DatabaseService/ # SQLite operations
│   │   ├── PermissionService/ # Android permissions
│   │   └── DialerService/   # Dialing functionality
│   ├── utils/               # Helper functions
│   └── assets/              # Images, fonts, demo data
├── android/                 # Android-specific code
└── database/                # SQLite schema & seed data
```

### 3.3 Database Schema

#### 3.3.1 Core Tables
```sql
-- Leads table
CREATE TABLE leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT,
    phone_primary TEXT UNIQUE NOT NULL,
    phone_secondary TEXT,
    email TEXT,
    position TEXT,
    pipeline_stage TEXT DEFAULT 'follow_up',
    priority TEXT DEFAULT 'medium',
    lead_source TEXT DEFAULT 'manual',
    avatar_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_contact_at DATETIME
);

-- Notes table
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER REFERENCES leads(id),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    call_id INTEGER
);

-- Call logs table
CREATE TABLE call_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER REFERENCES leads(id),
    phone_number TEXT NOT NULL,
    call_type TEXT NOT NULL, -- 'incoming', 'outgoing', 'missed'
    duration INTEGER DEFAULT 0,
    started_at DATETIME NOT NULL,
    ended_at DATETIME,
    notes TEXT
);

-- Labels table
CREATE TABLE labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lead labels junction table
CREATE TABLE lead_labels (
    lead_id INTEGER REFERENCES leads(id),
    label_id INTEGER REFERENCES labels(id),
    PRIMARY KEY (lead_id, label_id)
);
```

---

## 4. User Interface Design

### 4.1 Design System

#### 4.1.1 Material Design 3 Implementation
- **Color Scheme:** Dynamic theming with brand colors
- **Typography:** Roboto font family with proper hierarchy
- **Elevation:** Consistent shadow and depth system
- **Motion:** Fluid animations with 300ms standard duration
- **Components:** Material You design language

#### 4.1.2 Brand Colors & Theme
```javascript
const theme = {
  primary: '#6366F1',      // Indigo
  secondary: '#8B5CF6',    // Purple
  accent: '#06B6D4',       // Cyan
  success: '#10B981',      // Emerald
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  surface: '#FFFFFF',      // White
  background: '#F8FAFC',   // Gray-50
  onSurface: '#1F2937',    // Gray-800
  onBackground: '#374151'  // Gray-700
};
```

#### 4.1.3 3D Effects & Animations
- **Card Depth:** Subtle shadows with 4-8dp elevation
- **Parallax Effects:** Background elements with depth
- **Morphing Animations:** Smooth transitions between states
- **Micro-interactions:** Button press feedback, loading states
- **Gesture Animations:** Swipe, drag, and scroll feedback

### 4.2 Screen Layouts

#### 4.2.1 Dashboard (Main Pipeline View)
```
┌─────────────────────────────────────┐
│ 🎯 LeadZen          🔍 📞 ⚙️      │ ← Header with search, dialer, settings
├─────────────────────────────────────┤
│ Follow up (10)  │ Warm (8)  │ Quote│ ← Pipeline columns
│ ┌─────────────┐ │ ┌───────┐ │ (7) │
│ │ John Smith  │ │ │ Sarah │ │ ┌───┐│
│ │ ABC Corp    │ │ │ Tech  │ │ │Mike││
│ │ 📞 2h ago   │ │ │ Ltd   │ │ │XYZ││
│ └─────────────┘ │ └───────┘ │ └───┘│
│ ┌─────────────┐ │           │     │
│ │ Jane Doe    │ │           │     │
│ │ XYZ Inc     │ │           │     │
│ │ 📞 1d ago   │ │           │     │
│ └─────────────┘ │           │     │
└─────────────────────────────────────┘
│         + Add Lead                  │ ← Floating action button
└─────────────────────────────────────┘
```

#### 4.2.2 Call Overlay - During Call (Compact)
```
┌─────────────────────────────────────┐
│ 📞 Incoming Call - 00:42           │ ← Native call interface (background)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👤 Sarah Johnson               │ │ ← Lead info overlay (30% screen)
│ │ Tech Solutions Ltd             │ │
│ │ Status: Warm Lead              │ │
│ │ Last Contact: 2 days ago       │ │
│ │                                │ │
│ │ [📝 Add Note] [📊 Update]      │ │ ← Quick actions
│ │                          [─]   │ │ ← Minimize button
│ └─────────────────────────────────┘ │
│                                     │
│ [🔴 End]     [📞 Hold]     [🔇]    │ ← Native call controls
└─────────────────────────────────────┘
```

#### 4.2.3 Post-Call Bottom Tray (Detailed)
```
┌─────────────────────────────────────┐
│                                     │
│ ╭─────────────────────────────────╮ │
│ │ ┌───┐ Sarah Johnson            │ │ ← Draggable handle
│ │ │ 👤│ Tech Solutions Ltd        │ │
│ │ └───┘ (555) 123-4567           │ │
│ │                                │ │
│ │ Info │ Notes │ Activity │ Tags  │ │ ← Tabs
│ │ ─────                          │ │
│ │                                │ │
│ │ 📋 Add Label  [+]              │ │
│ │ 🏷️ [Warm Leads] [Customer]     │ │
│ │                                │ │
│ │ 📝 Call Notes:                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Discussed project timeline  │ │ │
│ │ │ and budget requirements...  │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                │ │
│ │ Move to: [Warm Leads ▼]        │ │
│ │ Assigned to: [Me ▼]            │ │
│ │                                │ │
│ │ [📅 Create Meeting]            │ │
│ │                                │ │
│ ╰─────────────────────────────────╯ │
└─────────────────────────────────────┘
```

#### 4.2.4 Built-in Dialer
```
┌─────────────────────────────────────┐
│ 🎯 LeadZen          ← Back          │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Search or dial...               │ │ ← Search/number input
│ └─────────────────────────────────┘ │
│                                     │
│ 📞 Recent Calls                     │
│ ┌─────────────────────────────────┐ │
│ │ 👤 John Smith - ABC Corp        │ │
│ │    (555) 123-4567 ↗ 2h ago      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⌨️ Keypad                           │
│ ┌─────┬─────┬─────┐                 │
│ │  1  │  2  │  3  │                 │
│ │     │ ABC │ DEF │                 │
│ ├─────┼─────┼─────┤                 │
│ │  4  │  5  │  6  │                 │
│ │ GHI │ JKL │ MNO │                 │
│ ├─────┼─────┼─────┤                 │
│ │  7  │  8  │  9  │                 │
│ │PQRS │ TUV │WXYZ │                 │
│ ├─────┼─────┼─────┤                 │
│ │  *  │  0  │  #  │                 │
│ └─────┴─────┴─────┘                 │
│                                     │
│           [📞 Call]                 │ ← Call button
└─────────────────────────────────────┘
```

### 4.3 Animation Specifications

#### 4.3.1 Screen Transitions
- **Screen to Screen:** Slide transition (300ms, ease-out)
- **Modal Presentation:** Fade + scale up (250ms)
- **Bottom Sheet:** Slide up with spring animation (400ms)
- **Tab Switching:** Cross-fade (200ms)

#### 4.3.2 Interactive Animations
- **Card Hover:** Subtle lift with shadow (150ms)
- **Button Press:** Scale down to 0.95 (100ms)
- **Pull to Refresh:** Elastic bounce animation
- **Drag & Drop:** Real-time position updates with haptic feedback

#### 4.3.3 Loading States
- **Skeleton Loading:** Shimmer effect for cards
- **Spinner:** Custom branded loading indicator
- **Progress Bars:** Smooth fill animations
- **Empty States:** Animated illustrations

---

## 5. Data Management

### 5.1 Demo Data Setup

#### 5.1.1 Sample Leads (30 Total)
**Follow up Stage (10 leads):**
1. John Smith - ABC Corporation - (555) 123-4567
2. Jane Doe - XYZ Industries - (555) 234-5678
3. Mike Johnson - Tech Solutions - (555) 345-6789
4. Sarah Wilson - Global Corp - (555) 456-7890
5. David Brown - StartupXYZ - (555) 567-8901
6. Emily Davis - Enterprise Ltd - (555) 678-9012
7. Chris Miller - Innovation Hub - (555) 789-0123
8. Lisa Garcia - Future Tech - (555) 890-1234
9. Robert Jones - Digital Solutions - (555) 901-2345
10. Amanda Taylor - Growth Partners - (555) 012-3456

**Warm Leads Stage (8 leads):**
11. James Wilson - CloudTech Inc - (555) 111-2222
12. Maria Rodriguez - DataFlow Systems - (555) 222-3333
13. Kevin Lee - Mobile Dynamics - (555) 333-4444
14. Rachel Green - AI Innovations - (555) 444-5555
15. Tom Anderson - Smart Solutions - (555) 555-6666
16. Nicole White - Digital Marketing Co - (555) 666-7777
17. Steve Martin - Web Development LLC - (555) 777-8888
18. Anna Thompson - Creative Agency - (555) 888-9999

**Quote Stage (7 leads):**
19. Brian Clark - Enterprise Solutions - (555) 999-0000
20. Michelle Lewis - SaaS Dynamics - (555) 000-1111
21. Peter Parker - Tech Innovations - (555) 111-0000
22. Jennifer Hall - Business Solutions - (555) 222-1111
23. Mark Davis - Digital Transformation - (555) 333-2222
24. Susan Miller - Cloud Services - (555) 444-3333
25. Tony Stark - Advanced Technologies - (555) 555-4444

**Closed Deal Stage (3 leads):**
26. Bruce Wayne - Wayne Enterprises - (555) 666-5555
27. Diana Prince - Amazon Solutions - (555) 777-6666
28. Clark Kent - Daily Planet Corp - (555) 888-7777

**Not Relevant Stage (2 leads):**
29. Joker Anonymous - Chaos Corp - (555) 999-8888
30. Lex Luthor - LexCorp Industries - (555) 000-9999

#### 5.1.2 Demo Labels/Tags
- **Priority:** VIP, High Priority, Low Priority
- **Industry:** Tech, Healthcare, Finance, Real Estate, Manufacturing
- **Budget:** Budget $, Budget $$, Budget $$$
- **Source:** Website, Referral, Cold Call, Social Media, Event
- **Status:** Hot Lead, Warm Lead, Cold Lead, Customer, Prospect

#### 5.1.3 Sample Call History
- 50 call logs distributed across leads
- Mix of incoming, outgoing, and missed calls
- Realistic call durations (2-45 minutes)
- Associated notes for 70% of calls
- Recent activity within last 30 days

### 5.2 Database Operations

#### 5.2.1 CRUD Operations
- **Create:** Add new leads with validation
- **Read:** Fetch leads with filtering/sorting
- **Update:** Edit lead information and status
- **Delete:** Soft delete with archive functionality

#### 5.2.2 Search & Filter Functions
```javascript
// Search across multiple fields
const searchLeads = (query) => {
  return database.executeSql(`
    SELECT * FROM leads 
    WHERE name LIKE ? OR company LIKE ? OR phone_primary LIKE ?
    ORDER BY last_contact_at DESC
  `, [`%${query}%`, `%${query}%`, `%${query}%`]);
};

// Filter by pipeline stage
const getLeadsByStage = (stage) => {
  return database.executeSql(`
    SELECT * FROM leads 
    WHERE pipeline_stage = ?
    ORDER BY updated_at DESC
  `, [stage]);
};
```

#### 5.2.3 Data Migration & Seeding
- Automatic database creation on first launch
- Seed data insertion with error handling
- Version management for future updates
- Backup/restore functionality

---

## 6. Permissions & Integration

### 6.1 Required Android Permissions

#### 6.1.1 Essential Permissions
```xml
<!-- Call Management -->
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.ANSWER_PHONE_CALLS" />

<!-- Overlay System -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.ACTION_MANAGE_OVERLAY_PERMISSION" />

<!-- Contacts Integration -->
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.WRITE_CONTACTS" />

<!-- Storage -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

<!-- Camera (for lead photos) -->
<uses-permission android:name="android.permission.CAMERA" />
```

#### 6.1.2 Permission Handling Strategy
- **Progressive Disclosure:** Request permissions when needed
- **Clear Explanations:** User-friendly permission rationale
- **Graceful Degradation:** App functions without optional permissions
- **Settings Deep Link:** Easy access to permission settings

### 6.2 Native Android Integration

#### 6.2.1 Call Detection Service
```javascript
// Call state monitoring
const CallDetectionService = {
  startMonitoring: () => {
    // Monitor phone state changes
    // Detect incoming/outgoing calls
    // Trigger overlay display
  },
  
  onCallStateChanged: (state, phoneNumber) => {
    switch(state) {
      case 'RINGING':
        showCallOverlay(phoneNumber);
        break;
      case 'OFFHOOK':
        updateCallStatus('active');
        break;
      case 'IDLE':
        hideCallOverlay();
        showPostCallTray(phoneNumber);
        break;
    }
  }
};
```

#### 6.2.2 Overlay Management
- **Z-Index Priority:** Ensure overlay appears above other apps
- **Touch Handling:** Proper touch event propagation
- **Memory Management:** Efficient overlay lifecycle
- **Battery Optimization:** Minimal background processing

#### 6.2.3 Dialer Integration
- **Native Dialer Hooks:** Intercept dialing actions
- **Number Formatting:** Automatic formatting and validation
- **Contact Matching:** Real-time lead matching while typing
- **Call Logs:** Sync with system call logs

---

## 7. Development Roadmap

### 7.1 Sprint Planning (8 Weeks Total)

#### 7.1.1 Sprint 1-2: Foundation (Weeks 1-2)
**Goals:** Project setup, database, and basic navigation
- ✅ React Native project initialization
- ✅ SQLite database setup and schema
- ✅ Navigation structure (React Navigation 6)
- ✅ Basic UI components library
- ✅ Demo data seeding
- ✅ Permission handling framework

**Deliverables:**
- Working app with navigation
- Database with demo data
- Basic lead list display
- Permission request flow

#### 7.1.2 Sprint 3-4: Call System (Weeks 3-4)
**Goals:** Call detection and overlay system
- 📞 Call detection service implementation
- 🎨 Call overlay UI components
- 📱 System alert window setup
- 🔗 Lead matching during calls
- 📝 Basic note-taking during calls

**Deliverables:**
- Working call overlay
- Lead identification during calls
- Call logging functionality
- Basic call actions

#### 7.1.3 Sprint 5-6: Lead Management (Weeks 5-6)
**Goals:** Complete lead management interface
- 📋 Lead list with search/filter
- ➕ Add/edit lead functionality
- 🏷️ Label management system
- 📊 Pipeline board (Kanban view)
- 👤 Lead detail screens

**Deliverables:**
- Complete lead CRUD operations
- Pipeline visualization
- Lead search and filtering
- Label system implementation

#### 7.1.4 Sprint 7-8: Dialer & Polish (Weeks 7-8)
**Goals:** Built-in dialer and final polish
- ☎️ Built-in dialer interface
- 🔍 T9 search implementation
- 🎨 UI/UX refinements and animations
- 🧪 Testing and bug fixes
- 📦 APK optimization

**Deliverables:**
- Working built-in dialer
- Polished UI with animations
- Tested and stable MVP
- Demo-ready APK

### 7.2 Technical Milestones

#### 7.2.1 Week 2 Milestone: Database Ready
- ✅ SQLite database operational
- ✅ 30 demo leads loaded
- ✅ Basic CRUD operations working
- ✅ Search functionality implemented

#### 7.2.2 Week 4 Milestone: Call System Ready
- ✅ Call detection service active
- ✅ Overlay displays during calls
- ✅ Lead matching functional
- ✅ Call logging operational

#### 7.2.3 Week 6 Milestone: Lead Management Complete
- ✅ Full lead management UI
- ✅ Pipeline board functional
- ✅ Label system working
- ✅ Lead detail views complete

#### 7.2.4 Week 8 Milestone: MVP Complete
- ✅ Built-in dialer operational
- ✅ All features integrated
- ✅ UI polished and animated
- ✅ APK ready for demo

---

## 8. Testing Strategy

### 8.1 Testing Phases

#### 8.1.1 Development Testing (Continuous)
- **Unit Tests:** Core business logic functions
- **Integration Tests:** Database operations and API calls
- **Component Tests:** React Native component behavior
- **Snapshot Tests:** UI consistency validation

#### 8.1.2 Device Testing (Weekly)
- **Real Device Testing:** Multiple Android devices (API 24+)
- **Call Functionality:** Test with actual phone calls
- **Performance Testing:** Memory usage and battery drain
- **Permission Testing:** Various permission scenarios

#### 8.1.3 User Acceptance Testing (Final Week)
- **Demo Scenarios:** Scripted demo workflows
- **Edge Case Testing:** Unusual call scenarios
- **Usability Testing:** UI/UX validation
- **Stress Testing:** High-volume demo data

### 8.2 Demo Scenarios

#### 8.2.1 Primary Demo Flow
1. **App Launch:** Show pipeline with demo leads
2. **Incoming Call Simulation:** Demonstrate call overlay
3. **Lead Interaction:** Add notes and update status
4. **Post-Call Actions:** Show detailed bottom tray
5. **Lead Management:** Navigate through pipeline
6. **Add New Lead:** Create lead and make call
7. **Built-in Dialer:** Demonstrate T9 search and calling

#### 8.2.2 Advanced Demo Features
- **Search Functionality:** Find leads quickly
- **Label Management:** Organize leads with tags
- **Call History:** Review past interactions
- **Data Persistence:** Show data survives app restart

### 8.3 Performance Benchmarks

#### 8.3.1 Response Time Targets
- **App Launch:** < 2 seconds cold start
- **Call Overlay Display:** < 1 second after call detection
- **Search Results:** < 0.5 seconds for any query
- **Screen Transitions:** < 300ms animations
- **Database Operations:** < 100ms for standard queries

#### 8.3.2 Resource Usage Targets
- **Memory Usage:** < 150MB peak usage
- **Battery Drain:** < 3% per hour of active use
- **Storage Space:** < 50MB total app size
- **CPU Usage:** < 15% during call overlay

---

## Appendices

### Appendix A: Technology Dependencies

#### A.1 Core Dependencies
```json
{
  "react-native": "0.73.6",
  "react-navigation": "^6.0.0",
  "react-native-sqlite-storage": "^6.0.1",
  "react-native-call-detection": "^1.0.3",
  "react-native-permissions": "^4.1.0",
  "react-native-vector-icons": "^10.0.0",
  "react-native-reanimated": "^3.6.0",
  "react-native-elements": "^3.4.3"
}
```

#### A.2 Development Dependencies
```json
{
  "@react-native/eslint-config": "^0.73.0",
  "@react-native/metro-config": "^0.73.0",
  "jest": "^29.0.0",
  "detox": "^20.0.0",
  "flipper-plugin-react-native-performance": "^0.3.0"
}
```

### Appendix B: Database Schema Details

#### B.1 Complete Table Definitions
```sql
-- Extended leads table with all fields
CREATE TABLE leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT,
    position TEXT,
    phone_primary TEXT UNIQUE NOT NULL,
    phone_secondary TEXT,
    email TEXT,
    address TEXT,
    website TEXT,
    linkedin_url TEXT,
    pipeline_stage TEXT DEFAULT 'follow_up',
    priority TEXT DEFAULT 'medium',
    lead_source TEXT DEFAULT 'manual',
    lead_score INTEGER DEFAULT 50,
    avatar_path TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_contact_at DATETIME,
    next_followup_at DATETIME,
    deal_value DECIMAL(10,2),
    probability INTEGER DEFAULT 50
);

-- Indexes for performance
CREATE INDEX idx_leads_phone ON leads(phone_primary);
CREATE INDEX idx_leads_stage ON leads(pipeline_stage);
CREATE INDEX idx_leads_last_contact ON leads(last_contact_at);
CREATE INDEX idx_leads_name ON leads(name);
```

### Appendix C: UI Component Library

#### C.1 Custom Components
- **LeadCard:** Reusable lead display component
- **CallOverlay:** Floating call information overlay
- **BottomTray:** Post-call detailed view
- **PipelineBoard:** Kanban-style pipeline visualization
- **DialerKeypad:** Custom dialer interface
- **SearchBar:** Enhanced search with filters
- **LabelChip:** Colorful label/tag component

#### C.2 Animation Components
- **SlideInModal:** Bottom sheet animations
- **FadeTransition:** Screen transition effects
- **ScaleButton:** Interactive button feedback
- **ShimmerLoader:** Loading state animations
- **DragDropList:** Reorderable list animations

---

**Document Status:** Complete v1.0  
**Ready for Development:** ✅ Yes  
**Estimated Completion:** 8 weeks  
**Demo Ready Date:** Week 8  

---

*This MVP specification provides a complete blueprint for developing a demo-ready LeadZen CRM application with intelligent call management capabilities.*