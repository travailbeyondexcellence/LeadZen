# Sidebar Design Specification

## Modern Navigation Drawer with Personality

> Detailed specifications for creating a polished, feature-rich sidebar navigation.

---

## 🎨 Overview

The sidebar is a full-height navigation drawer that slides in from the left. It features:

* Profile section with avatar and dropdown menu
* Grouped navigation items with icons and badges
* Software/integration section
* Settings quick actions
* Create task button

---

## 📐 Layout & Structure

### Dimensions

```
Width: 280-300px
Height: 100vh (full viewport height)
Background: #FFFFFF
Shadow: 4px 0 24px rgba(0, 0, 0, 0.1)
Z-index: 999
```

### Animation

```css
transform: translateX(-100%) /* Closed state */
transform: translateX(0)      /* Open state */
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

### Structure Hierarchy

```
┌─────────────────────────┐
│ Profile Header Section  │ ← Fixed
├─────────────────────────┤
│                         │
│  Scrollable Nav Area    │ ← Scrollable
│  - General              │
│  - Software             │
│                         │
├─────────────────────────┤
│ Footer Section          │ ← Fixed
│ - Settings Icons        │
│ - Create Button         │
└─────────────────────────┘
```

---

## 👤 Profile Header Section

### Container

```css
padding: 20px 20px 16px
border-bottom: 1px solid #F1F5F9
```

### Profile Item (Clickable)

```css
display: flex
align-items: center
gap: 12px
padding: 8px
border-radius: 12px
cursor: pointer
transition: background 0.2s ease

/* Hover/Active State */
background: #F8FAFC
```

### Avatar

```css
/* Container */
width: 44px
height: 44px
border-radius: 12px
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
position: relative

/* Initials */
font-size: 16px
font-weight: 700
color: white

/* Online Indicator (absolute positioned) */
width: 10px
height: 10px
background: #10B981
border: 2px solid white
border-radius: 50%
position: absolute
bottom: 2px
right: 2px
```

### Text Content

```css
/* Greeting */
font-size: 11px
color: #64748B
margin-bottom: 2px
/* Example: "Good Morning 👋" */

/* Name */
font-size: 15px
font-weight: 600
color: #1E293B
margin-bottom: 2px

/* Role */
font-size: 11px
color: #64748B
text-transform: uppercase
letter-spacing: 0.5px
/* Example: "PRODUCT DESIGNER" */
```

### Dropdown Indicator

```css
ChevronDown icon
size: 20px
color: #64748B
transform: rotate(0deg) /* Closed */
transform: rotate(180deg) /* Open */
transition: transform 0.3s ease
```

---

## 📱 Profile Dropdown Menu

### Container

```css
position: fixed
top: 80px
left: 20px (when sidebar open)
width: 260px
background: #FFFFFF
border-radius: 16px
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12)
padding: 8px
z-index: 1000
opacity: 0 (closed) → 1 (open)
transform: translateY(-8px) (closed) → translateY(0) (open)
transition: all 0.3s ease
```

### Menu Items

```css
/* Each item */
display: flex
align-items: center
gap: 12px
padding: 10px 12px
border-radius: 10px
cursor: pointer
transition: background 0.2s ease

/* Hover */
background: #F8FAFC

/* Structure */
[Icon] [Label] [Shortcut]
18px   flex-1  11px
```

### Menu Item Elements

```css
/* Icon */
size: 18px
color: #64748B

/* Label */
font-size: 14px
font-weight: 500
color: #1E293B
flex: 1

/* Keyboard Shortcut */
font-size: 11px
color: #64748B
background: #F8FAFC
padding: 2px 6px
border-radius: 4px
/* Example: "⌘K" */
```

### Menu Items List

1. View Profile (⌘K)
2. Analytics (⌘A)
3. Subscription (⌘S)
4. Settings (⌘G)
5. Add account (⌘P)
6. Log out (⌘Q)

---

## 🧭 Navigation Section

### Container

```css
flex: 1
overflow-y: auto
padding: 8px 0
```

### Section Labels

```css
font-size: 11px
font-weight: 600
color: #64748B
text-transform: uppercase
letter-spacing: 0.5px
padding: 16px 20px 8px
display: flex
align-items: center
justify-content: space-between

/* Right icon (Settings or Plus) */
size: 14px
```

**Section Examples:**

* "GENERAL" with Settings icon
* "SOFTWARES" with Plus icon
* "SETTINGS"

### Navigation Items

#### Standard Nav Item

```css
display: flex
align-items: center
gap: 12px
padding: 10px 20px
cursor: pointer
transition: all 0.2s ease

/* Active State */
background: #F8FAFC
border-left: 4px solid #4F46E5 (optional accent)

/* Hover State */
background: #F8FAFC
```

#### Nav Item Structure

```
[Icon: 20px] [Label: flex-1] [Badge/Indicator]
```

#### Icon Container

```css
width: 20px
height: 20px
color: #64748B
/* Active: color matches theme */
```

#### Label

```css
font-size: 14px
font-weight: 500
color: #1E293B
flex: 1
/* Active: color: #4F46E5 */
```

---

## 🏷️ Badges & Indicators

### Notification Badge

```css
background: #EF4444
color: white
font-size: 10px
font-weight: 600
padding: 2px 6px
border-radius: 6px
min-width: 18px
text-align: center
```

### Avatar Stack (for collaboration indicators)

```css
/* Container */
display: flex
margin-left: auto

/* Each avatar */
width: 22px
height: 22px
border-radius: 50%
border: 2px solid white
margin-left: -8px (except first)
z-index: [decreasing from left to right]

/* Last avatar with count */
background: [gradient color]
font-size: 9px
font-weight: 600
color: white
text: "+5" (example)
```

---

## 🎨 Software/Integration Items

### Software Item

```css
display: flex
align-items: center
gap: 12px
padding: 10px 20px
cursor: pointer
transition: background 0.2s ease

/* Hover */
background: #F8FAFC
```

### Software Icon

```css
/* Gradient Icon Container */
width: 28px
height: 28px
border-radius: 8px
background: [specific gradient]
display: flex
align-items: center
justify-content: center
font-size: 16px (emoji)

/* Examples */
Figma: gradient(#F24E1E, #FF7262) - 🎨
Slack: gradient(#4A154B, #611f69) - 💬
Adobe: gradient(#FA0F00, #FF6B00) - 🎭
Jira:  gradient(#0052CC, #2684FF) - 📊
```

### Software Label

```css
font-size: 14px
font-weight: 500
color: #1E293B
```

### Add New Plugin Item

```css
/* Same structure as nav item */
color: #64748B (muted to show it's secondary)
icon: Plus (20px)
```

---

## ⚙️ Footer Section

### Container

```css
border-top: 1px solid #F1F5F9
padding: 16px 20px
```

### Settings Icons Row

```css
display: flex
gap: 8px
margin-bottom: 16px
```

### Setting Icon Button

```css
width: 36px
height: 36px
border-radius: 10px
background: #F8FAFC
display: flex
align-items: center
justify-content: center
cursor: pointer
transition: all 0.2s ease
color: #64748B

/* Hover */
background: #E5E7EB
color: #1E293B
```

**Icon Types:**

* User (profile settings)
* Wifi (connection)
* Monitor (display)
* Smartphone (device)
* Sun/Moon (theme toggle)

### Create Task Button

```css
width: 100%
padding: 12px
border-radius: 12px
background: #F8FAFC
border: 2px dashed #E5E7EB
display: flex
flex-direction: column
align-items: center
gap: 4px
cursor: pointer
transition: all 0.2s ease

/* Hover */
background: #FFFFFF
border-color: #4F46E5
```

#### Create Button Structure

```
[Icon Container]
  ↓
[Button Text]
  ↓
[Secondary Text]
```

#### Icon Container

```css
width: 32px
height: 32px
border-radius: 8px
background: #FFFFFF
display: flex
align-items: center
justify-content: center
color: #64748B
```

#### Button Text

```css
font-size: 13px
font-weight: 600
color: #1E293B
/* Example: "Create New Task" */
```

#### Secondary Text

```css
font-size: 11px
color: #64748B
/* Example: "or use invite link" */
/* "invite link" in color: #4F46E5 */
```

---

## 🎯 Interaction States

### Item States

**Default (Inactive):**

```css
background: transparent
icon color: #64748B
text color: #1E293B
```

**Hover:**

```css
background: #F8FAFC
transition: background 0.2s ease
```

**Active (Current Page):**

```css
background: #F8FAFC
icon color: #4F46E5
text color: #4F46E5 (optional)
font-weight: 600
border-left: 4px solid #4F46E5 (optional)
```

**Pressed:**

```css
background: #E5E7EB
transition: background 0.1s ease
```

---

## 📱 Overlay & Opening Animation

### Backdrop Overlay

```css
position: fixed
top: 0
left: 0
right: 0
bottom: 0
background: rgba(0, 0, 0, 0.5)
backdrop-filter: blur(4px)
z-index: 998
opacity: 0 (closed) → 1 (open)
pointer-events: none (closed) → auto (open)
transition: opacity 0.3s ease
```

### Opening Sequence

1. Overlay fades in (0.3s)
2. Sidebar slides in from left (0.3s cubic-bezier)
3. Profile menu can open after sidebar is open

### Closing Sequence

1. Profile menu closes instantly (if open)
2. Sidebar slides out to left (0.3s)
3. Overlay fades out (0.3s)

---

## 💡 Implementation Example

### Complete Sidebar Component Structure

```jsx
<>
  {/* Overlay */}
  <TouchableOpacity 
    style={overlayStyle}
    onPress={closeSidebar}
  />
  
  {/* Sidebar Container */}
  <View style={sidebarStyle}>
  
    {/* Profile Header */}
    <View style={headerStyle}>
      <TouchableOpacity 
        style={profileSectionStyle}
        onPress={toggleProfileMenu}
      >
        {/* Avatar with online indicator */}
        {/* Name, greeting, role */}
        {/* ChevronDown */}
      </TouchableOpacity>
    </View>
  
    {/* Scrollable Nav */}
    <ScrollView style={navScrollStyle}>
    
      {/* General Section */}
      <Text style={sectionLabelStyle}>GENERAL</Text>
      {generalItems.map(item => (
        <NavItem {...item} />
      ))}
    
      {/* Software Section */}
      <Text style={sectionLabelStyle}>SOFTWARES</Text>
      {softwareItems.map(item => (
        <SoftwareItem {...item} />
      ))}
      <AddPluginItem />
    
    </ScrollView>
  
    {/* Footer */}
    <View style={footerStyle}>
      <Text style={sectionLabelStyle}>SETTINGS</Text>
    
      <View style={settingsIconsRow}>
        {settingIcons.map(icon => (
          <SettingIcon {...icon} />
        ))}
      </View>
    
      <CreateTaskButton />
    </View>
  
  </View>
  
  {/* Profile Dropdown Menu */}
  <View style={profileMenuStyle}>
    {menuItems.map(item => (
      <ProfileMenuItem {...item} />
    ))}
  </View>
</>
```

---

## 🎨 Customization Options

### Color Themes

**Light Mode (Default):**

```
Background: #FFFFFF
Text: #1E293B / #64748B
Hover: #F8FAFC
Border: #F1F5F9
```

**Dark Mode:**

```
Background: #1E293B
Text: #FFFFFF / #94A3B8
Hover: #334155
Border: #475569
```

### Width Variants

**Compact:** 260px

**Standard:** 280px (recommended)

**Wide:** 300px

### Style Variants

**Minimal:**

* No section labels
* No borders
* Smaller padding

**Compact:**

* Icons only when collapsed
* Expands on hover
* 60px collapsed width

**Full:**

* All features shown
* Rich interactions
* Current specification

---

## ✅ Design Checklist

When implementing sidebar, ensure:

* [ ] Smooth slide-in animation (0.3s cubic-bezier)
* [ ] Backdrop overlay with blur effect
* [ ] Profile section with online indicator
* [ ] Dropdown menu with keyboard shortcuts
* [ ] Section labels with proper hierarchy
* [ ] Navigation items with hover states
* [ ] Active page is visually distinct
* [ ] Badge and avatar stack for notifications
* [ ] Software icons with gradients
* [ ] Settings quick action icons
* [ ] Create button with dashed border
* [ ] Proper scrolling in nav area
* [ ] Header and footer are fixed
* [ ] Touch targets are 44px+ height
* [ ] All transitions are smooth
* [ ] Overlay closes sidebar when clicked
* [ ] Profile menu closes when sidebar closes

---

## 🚀 Advanced Features

### Multi-level Navigation

* Add expand/collapse for sub-items
* Use ChevronRight icon to indicate expandable
* Indent child items 32px

### Search

* Add search bar below profile section
* Filter navigation items in real-time
* Highlight matching text

### Drag to Open

* Swipe gesture from left edge
* Threshold: 50px swipe distance
* Velocity-based animation

### Resize Handle

* Draggable edge for custom width
* Min: 260px, Max: 400px
* Persist width preference

---

## 💡 Pro Tips

1. **Animation Performance:** Use `transform` instead of `left/right` for smooth 60fps
2. **Z-index Management:** Sidebar (999), Overlay (998), Dropdown (1000)
3. **Touch Optimization:** Ensure 44px minimum height for all clickable items
4. **Accessibility:** Support keyboard navigation (Tab, Enter, Escape)
5. **Loading States:** Show skeleton screens while fetching user data
6. **Error States:** Handle missing avatar with initials fallback
7. **Responsive:** Hide automatically on very small screens (< 320px)
8. **Testing:** Test on different viewport heights to ensure footer is accessible
