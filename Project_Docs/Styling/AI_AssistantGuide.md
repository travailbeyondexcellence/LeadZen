# AI Coding Assistant Guidelines

## Prompting Instructions for Modern Mobile UI Design

> Use these guidelines when instructing AI coding assistants (Claude, ChatGPT, etc.) to generate mobile UI components.

---

## 📋 Core Design Prompt Template

When asking AI to create mobile UI components, always include this base prompt:

```
Create a React Native component with the following modern design specifications:

DESIGN SYSTEM REQUIREMENTS:
- Border radius: All elements must have 12px+ border radius (cards: 20px, buttons: 12-16px, icons: 12px)
- Shadows: Use soft shadows only (max 8px blur, 0.04-0.08 opacity)
- Spacing: Minimum 12px gaps, 20-24px padding for cards, 16-20px for content
- Colors: Use the specified color palette with gradients for featured elements
- Typography: Use system fonts (-apple-system, BlinkMacSystemFont) with clear hierarchy
- Transitions: All interactive elements need 0.2-0.3s ease transitions

AVOID:
- Sharp corners (no border-radius < 8px)
- Harsh shadows (no heavy box-shadows)
- Flat Material Design defaults
- Cramped spacing (no gaps < 12px)
- Generic gray buttons without personality

INCLUDE:
- Icon badges with gradient backgrounds (44-48px, rounded 12-14px)
- Smooth hover/press states with subtle transforms
- Proper touch targets (44px minimum)
- Bottom padding for fixed navigation (100-120px)
```

---

## 🎨 Component-Specific Prompts

### For Cards

```
Create a card component with:
- White background (#FFFFFF)
- 20px border radius
- 24px padding
- Soft shadow: 0 2px 8px rgba(0, 0, 0, 0.04)
- Smooth hover effect that lifts the card 4px up and increases shadow
- 0.3s ease transition on all properties
```

### For Buttons

```
Create a primary button with:
- Gradient background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- 12-16px border radius
- 12px vertical, 24px horizontal padding
- White text, 15px, weight 600
- Colored shadow: 0 4px 16px rgba(79, 70, 229, 0.3)
- Hover: translateY(-2px) with increased shadow
- Press: translateY(0) to create depth effect
```

### For Icon Badges

```
Create icon badge containers:
- Size: 44x44px or 48x48px
- Border radius: 12-14px
- Gradient background (use design system gradients)
- White icon centered, size 20-22px
- Optional: subtle scale transform on hover (1.05)
```

### For Lists/Navigation

```
Create a navigation list with:
- Each item: 10-12px vertical padding, 20px horizontal
- Icon size: 20px with proper color contrast
- Text: 14-15px, weight 500-600
- Active state: Light background (#F8FAFC), colored text/icon
- Hover state: Same light background with smooth transition
- Gap between items: 4-8px
```

---

## 🚫 Anti-Pattern Warnings

### Tell AI to AVOID:

```
DO NOT use any of these patterns:
❌ border-radius: 4px (too sharp)
❌ box-shadow: 0 1px 3px (too subtle, lacks depth)
❌ padding: 8px (too cramped)
❌ Hard-edged borders without radius
❌ Pure gray backgrounds without warmth
❌ Material Design ripple effects (use subtle transforms instead)
❌ Heavy/dark shadows
❌ Generic sans-serif fonts (use system fonts)
```

---

## ✅ Success Patterns

### Tell AI to USE:

```
✅ Border radius: 12px minimum, 16-24px for cards
✅ Soft shadows with low opacity (0.04-0.08)
✅ Generous padding: 20-24px for cards
✅ Gradients for featured elements and CTAs
✅ Icon badges instead of plain icons
✅ Smooth transitions: 0.2-0.3s ease
✅ Hover states that lift elements slightly
✅ Clear visual hierarchy through size and weight
✅ Ample white space and breathing room
```

---

## 📱 Mobile-Specific Instructions

```
For mobile layouts, ensure:
- Maximum container width: 428px
- Touch targets: 44px minimum size
- Bottom navigation: Fixed at bottom, 80px height, 24px top border radius
- Content bottom padding: 100-120px when fixed nav present
- Safe area padding: 20px on sides
- Scrollable content: Use overflow-y: auto with WebkitOverflowScrolling: touch
- Prevent layout shift: All fixed elements have proper z-index (10+)
```

---

## 🎯 Complete Example Prompt

Here's a full example of how to ask AI to create a screen:

```
Create a React Native mobile app home screen with the following specifications:

LAYOUT:
- Container: max-width 428px, centered, full viewport height
- Header: White background, 16-20px padding, rounded bottom corners (24px)
- Content: Scrollable area with 20px padding, 120px bottom padding for nav
- Bottom navigation: Fixed at bottom, white, rounded top (24px), shadow upward

HEADER SECTION:
- Greeting text: 14px, #64748B color
- User name: 24px, bold (700), #1E293B
- Menu button: 44x44px, 12px radius, #F8FAFC background, menu icon 20px
- Notification icon: Same as menu button, with red dot indicator (8px)

FEATURED CARD:
- Gradient background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- Border radius: 24px
- Padding: 24px
- Title: 18px, weight 600, white
- Subtitle: 14px, white, 0.9 opacity
- Button: Glassmorphism style (rgba(255,255,255,0.2) bg, 1px white border 0.3 opacity)
- Decorative circle: Absolute positioned, right -20px, bottom -20px, 120px size

STATS ROW (3 columns):
- Each stat card: White bg, 16px radius, 16px padding, centered
- Icon badge: 40x40px, 12px radius, gradient background, white icon 20px
- Value: 18px, bold (700), #1E293B
- Label: 12px, #64748B

CARDS GRID (2 columns):
- Gap between cards: 16px
- Each card: White bg, 20px radius, 20px padding
- Icon badge: 48x48px, 14px radius, gradient, white icon 24px
- Title: 16px, weight 600
- Subtitle: 13px, #64748B
- Hover: Transform up 4px, increase shadow

BOTTOM NAVIGATION:
- 4 items: Home, Explore, Saved, Profile
- Each: 8px padding, 16px radius when active
- Active state: #F8FAFC background, #4F46E5 icon and text
- Icon size: 22px
- Label: 12px, weight 500 (600 when active)

INTERACTIONS:
- All transitions: 0.3s ease
- Hover on cards: translateY(-4px) + shadow increase
- Button press: slight scale down (0.98)
- Smooth scrolling with proper momentum

COLORS TO USE:
- Primary: #4F46E5
- Text Primary: #1E293B
- Text Secondary: #64748B
- Background: #F8FAFC
- Card: #FFFFFF
- Success: #10B981
- Gradient 1: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- Gradient 2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
- Gradient 3: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)

Make sure every element has personality and the design feels modern, not generic Material Design.
```

---

## 🔄 Iteration Prompts

### If AI generates generic/flat design:

```
The design is too generic and lacks personality. Please update with:
1. Increase all border radius values (minimum 12px, cards 20px)
2. Add gradient backgrounds to primary buttons and featured cards
3. Use icon badges (44x44px with gradient backgrounds) instead of plain icons
4. Soften all shadows (use 0.04-0.08 opacity, not 0.2+)
5. Add more padding (24px for cards, not 16px)
6. Add smooth hover effects (translateY and scale)
7. Make everything feel more "soft" and "premium"
```

### If AI uses too-sharp corners:

```
The corners are too sharp. Update all border-radius values:
- Cards: 20px minimum
- Buttons: 12-16px
- Icon containers: 12-14px
- Input fields: 12px
- Bottom navigation: 24px (top corners)
No element should have border-radius < 8px.
```

### If spacing is cramped:

```
The spacing is too tight. Increase to:
- Card padding: 24px (currently too small)
- Content padding: 20px sides
- Gap between cards: 16px minimum
- Bottom safe area: 120px (for fixed navigation)
- Gap between sections: 24px
All spacing should be multiples of 4px.
```

---

## 📊 Validation Checklist

After AI generates code, verify:

```
✓ Border radius values are 12px or higher
✓ Shadows are soft (blur 8-24px, opacity 0.04-0.12)
✓ Card padding is 20-24px
✓ Content has proper bottom padding (100-120px)
✓ All interactive elements have transitions
✓ Touch targets are 44px minimum
✓ Gradients are used for featured elements
✓ Icon badges have gradient backgrounds
✓ Typography hierarchy is clear
✓ Colors match the design system
✓ Hover/press states are defined
✓ No elements have sharp corners
✓ Proper spacing between all elements
```

---

## 🎨 Color Prompt Shortcuts

### Quick gradient references:

```
Primary gradient: "purple gradient from #667eea to #764ba2"
Sunset gradient: "pink gradient from #f093fb to #f5576c"
Ocean gradient: "blue gradient from #4facfe to #00f2fe"
Fresh gradient: "green gradient from #43e97b to #38f9d7"
```

### Quick color references:

```
"Use indigo primary (#4F46E5), slate text (#1E293B for primary, #64748B for secondary), 
and very light gray background (#F8FAFC)"
```

---

## 💡 Pro Tips

1. **Always specify exact values** - Don't say "rounded corners," say "20px border radius"
2. **Reference gradients by name** - "Use Primary gradient" is clearer than describing colors
3. **Show examples** - Include screenshots or reference existing components
4. **Iterate gradually** - Fix one aspect at a time (spacing, then shadows, then colors)
5. **Use design tokens** - Reference the design-tokens.json file in prompts
6. **Be specific about shadows** - "Soft shadow with 8px blur and 0.04 opacity"
7. **Mention transitions explicitly** - AI often forgets to add smooth interactions
8. **Test on device** - Always verify touch targets and scrolling work properly

---

## 🚀 Advanced Techniques

### For complex layouts:

```
Break down the screen into sections:
1. Header (fixed, with rounded bottom)
2. Scrollable content area (with proper padding)
3. Fixed bottom element (navigation or action bar)

Ensure:
- Scrollable area has overflow-y: auto
- Bottom padding accounts for fixed elements
- Fixed elements have proper z-index (10+)
- Border radius on appropriate corners only
```

### For animations:

```
Add smooth micro-interactions:
- Cards: Hover lifts 4px up with increased shadow
- Buttons: Press creates depth effect (translateY)
- Icons: Subtle scale on hover (1.05-1.1)
- Sheets: Slide up from bottom with backdrop fade
All transitions: 0.2-0.4s with appropriate easing
```

### For consistency:

```
Reference the component-examples.md file and say:
"Create a component similar to [Component Name] from the design system, 
but adapted for [specific use case]"
```

---

## 📝 Template Prompt Library

Save these for quick reuse:

**Gradient Card:**

```
"Create a gradient card with 24px radius, 24px padding, gradient background [specify], 
white text, and a glassmorphism button"
```

**Stat Card:**

```
"Create a stat card with centered content, 40x40px gradient icon badge, 
large bold number, and small label text"
```

**List Item:**

```
"Create a list item with left icon badge (44x44px, gradient), title and subtitle, 
right chevron, hover background change, 16px padding"
```

**Bottom Sheet:**

```
"Create a bottom sheet modal with 32px top border radius, handle bar, 
backdrop blur, slide-up animation, max-height 80vh, scrollable content"
```
