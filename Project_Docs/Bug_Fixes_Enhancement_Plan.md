# LeadZen Bug Fixes & Enhancement Plan

## 📋 Overview
This document outlines the identified bugs, enhancements, and implementation plan for LeadZen CRM mobile app. All items will be implemented step-by-step, one at a time.

## 🎯 Implementation Priority Order

### Phase 1: Foundation Fixes (Permissions & Core Functionality)
1. **Fix Permissions System**
2. **Fix Dialer Buttons**

### Phase 2: Notes System Implementation  
3. **Implement Notes System**

### Phase 3: UI/UX Enhancements
4. **Fix Post-Call Tray Hybrid Flow**
5. **Make Pipeline Overview Scrollable**

---

## 🔧 Detailed Bug Fixes & Enhancements

### 1. PERMISSIONS SYSTEM [Priority: HIGH]

#### **Issues:**
- Call detection service failing: "Required permissions not granted"  
- Vibration permission error in dialer
- No persistent permission requests
- Log: "Call detection service failed to start" (logBoxData.js:136:39)
- Log: "Required permissions not granted; cannot start call detection" (logBoxData.js:196:39)

#### **Requirements:**
- **Dual Permission Strategy:**
  - Permission onboarding flow on first app launch
  - On-demand permissions when features are used
- Persistent permission requests until granted
- Settings screen for manual permission management
- Graceful degradation when permissions denied

#### **Permissions Needed:**
- Phone access (call detection)
- Contacts access
- Camera access  
- Storage access
- Vibration access (for dialer feedback)

---

### 2. DIALER FIXES [Priority: HIGH]

#### **Issues:**
- Backspace/erase button not working
- Cross/clear button not working
- Recent calls opening mobile dialer instead of direct dial
- Vibration permission error when dialing

#### **Requirements:**
- Fix T9 dialer backspace functionality
- Fix dialer clear button
- Recent calls should directly dial (not open mobile dialer)
- Handle vibration permission properly

---

### 3. NOTES SYSTEM IMPLEMENTATION [Priority: MEDIUM]

#### **Current Issues:**
- Notes in LeadForm appear as single text box
- No separate notes modal/dialog
- No user attribution or timestamps
- No note categorization

#### **New Notes System Requirements:**

**Notes Architecture:**
- **Tagged Notes System:**
  - Call-related tag (tied to call logs)
  - General tag  
  - Follow-up tag
  - Custom tags

**Notes Display:**
- Individual note entries (not single text box)
- Each note shows:
  - Content
  - "Created by User" (placeholder until user system implemented)
  - Timestamp
  - Tag/category
  - Associated call log (if applicable)

**Notes Access Points:**
- Lead Detail screen (primary location)
- Post-call tray (quick add with call-related tag)
- Lead cards (general notes)
- Pipeline cards (quick view/add)

**Lead Card Action Icons:**
Update lead cards to show 4 action icons at bottom:
1. **Call** (📞)
2. **Email** (📧) 
3. **WhatsApp** (💬) - direct message functionality
4. **Notes** (📝) - add notes

---

### 4. POST-CALL TRAY HYBRID FLOW [Priority: MEDIUM]

#### **Current Issues:**
- "Add to CRM" → "Open lead form" does nothing
- No data carryover between tray and form

#### **New Hybrid Flow Requirements:**

**Post-Call Tray Quick Fields:**
- Name (required)
- Company
- Quick notes (tagged as call-related)

**Flow:**
1. User fills quick fields in post-call tray
2. "Save Quick" - saves minimal lead with call-related note
3. "Add More Details" - opens full LeadForm with pre-filled data
4. Data carryover: All tray data transferred to LeadForm
5. Notes from tray appear in notes system with call-related tag

**Data Persistence:**
- Save tray data to temporary storage
- Pass data to LeadForm via navigation params
- Merge tray data with form data on save

---

### 5. PIPELINE OVERVIEW SCROLLABLE [Priority: LOW]

#### **Issue:**
- Pipeline overview on dashboard not scrollable
- Only fits 5 stages currently
- Won't scale for more pipeline stages

#### **Requirements:**
- Make pipeline overview horizontally scrollable
- Maintain current card design
- Smooth scrolling experience
- Show scroll indicators if needed

---

## 🛠️ Technical Implementation Notes

### **File Locations:**
- **Permissions:** `src/services/PermissionService.js`
- **Dialer:** `src/screens/Dialer.tsx`
- **Notes:** New files needed in `src/components/notes/`
- **Post-Call Tray:** `src/components/PostCallTray.tsx`
- **Pipeline:** `src/components/PipelineBoard.tsx` (Dashboard)

### **New Components Needed:**
- `NotesModal.tsx` - Add/edit notes dialog
- `NotesList.tsx` - Display notes with styling
- `PermissionOnboarding.tsx` - First launch permission flow
- `WhatsAppButton.tsx` - WhatsApp integration

### **Database Changes:**
- Notes table/storage structure with tags
- User attribution field (placeholder)
- Call log association for notes

---

## 📝 Implementation Strategy

### **Approach:**
1. **One bug/feature at a time**
2. **Test thoroughly after each fix**
3. **Maintain backward compatibility**
4. **Follow existing code patterns**

### **Quality Gates:**
- No new errors introduced
- Existing functionality preserved
- User experience improved
- Performance maintained

---

## 📅 Next Steps

1. **Start with Phase 1 - Permissions System**
2. **Get user approval for each implementation**
3. **Test on real device after each fix**
4. **Document changes and update this plan**

---

*Last Updated: October 11, 2025*
*Status: Ready for Implementation*