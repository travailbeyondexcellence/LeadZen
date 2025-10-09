# Task 2: SQLite Database & Demo Data Setup

## 🎯 Goal
Implement SQLite database with schema and populate with 30 demo leads for testing.

## 📋 Scope
- Set up SQLite database with proper schema
- Create database service layer for CRUD operations
- Populate database with 30 realistic demo leads
- Implement basic data fetching and display

## 🛠️ Technical Requirements
- Install and configure `react-native-sqlite-storage`
- Create database schema with tables: leads, call_logs, notes, labels
- Implement DatabaseService class with async methods
- Create demo data seeding function
- Add database initialization on app startup

## 📱 Expected Deliverable
A working database system with:
- SQLite database created and initialized
- 30 demo leads distributed across pipeline stages:
  - 10 Follow up leads
  - 8 Warm Leads  
  - 7 Quote stage
  - 3 Closed Deals
  - 2 Not Relevant
- Basic lead listing in Dashboard screen
- Database operations working (create, read, update, delete)

## 🔍 Acceptance Criteria
- [ ] Database creates successfully on first app launch
- [ ] 30 demo leads are inserted without errors
- [ ] Dashboard screen shows list of leads from database
- [ ] Each lead displays: name, company, phone, pipeline stage
- [ ] Database queries execute without errors
- [ ] Data persists after app restart
- [ ] Search functionality works across lead fields

## 📚 Files to Create/Modify
- `src/services/DatabaseService.js` - Main database operations
- `src/data/demoLeads.js` - Demo lead data
- `src/data/schema.sql` - Database schema
- `src/screens/Dashboard.tsx` - Display leads from database
- `src/components/LeadCard.tsx` - Individual lead display component
- `src/utils/dbInit.js` - Database initialization helper

## 🗄️ Database Schema
```sql
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_contact_at DATETIME
);

CREATE TABLE call_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER REFERENCES leads(id),
    phone_number TEXT NOT NULL,
    call_type TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    started_at DATETIME NOT NULL,
    notes TEXT
);
```

## 📱 UI Implementation
- Dashboard screen shows scrollable list of lead cards
- Each lead card displays: avatar, name, company, phone, status
- Pipeline stage shown with color-coded badges
- Pull-to-refresh functionality
- Loading states while fetching data

## ⚠️ Notes
- Use realistic demo data (names, companies, phone numbers)
- Ensure database operations are async and don't block UI
- Handle database errors gracefully
- Test database performance with all 30 leads

## 🚀 Next Task Preview
Task 3 will implement the lead pipeline (Kanban board) visualization.