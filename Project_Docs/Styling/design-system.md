# Modern Mobile Design System

## Core Design Specifications

> Version 1.0 | Last Updated: October 2025
>
> This design system defines the visual language and interaction patterns for modern, sleek mobile applications with personality and polish.

---

## 🎨 Design Philosophy

### Core Principles

1. **Soft & Approachable** - Generous rounded corners, soft shadows, gentle gradients
2. **Breathing Room** - Ample padding and spacing creates calm, uncluttered interfaces
3. **Visual Hierarchy** - Clear typography scale and color contrast guide users naturally
4. **Personality Through Color** - Strategic use of gradients and color combinations add life
5. **Smooth Interactions** - All transitions should be smooth (0.3s ease is default)

### Anti-Patterns to Avoid

* ❌ Sharp corners (never use border-radius < 8px)
* ❌ Harsh shadows (avoid spread radius > 8px)
* ❌ Flat, boring buttons (no personality)
* ❌ Cramped spacing (minimum 12px gaps)
* ❌ Generic Material Design defaults (they lack personality)

---

## 📐 Spacing System

### Base Unit: 4px

All spacing should be multiples of 4px for consistency.

**Standard Spacing Scale:**

```
xs:  4px   (tight spacing within components)
sm:  8px   (minimal gaps)
md:  12px  (default gap between related items)
lg:  16px  (standard padding)
xl:  20px  (section padding)
2xl: 24px  (card padding, major sections)
3xl: 32px  (large section breaks)
4xl: 40px  (hero sections)
```

**Common Applications:**

* Card padding: `24px` (2xl)
* Content padding: `20px` (xl)
* Gap between cards: `12px-16px` (md-lg)
* Icon padding: `10px-12px` (2.5-md)
* Bottom safe area: `100px-120px` (for nav/buttons)

---

## 🔤 Typography

### Font Family

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Type Scale

| Level      | Size | Weight | Line Height | Usage            |
| ---------- | ---- | ------ | ----------- | ---------------- |
| H1         | 28px | 700    | 1.2         | Page titles      |
| H2         | 24px | 700    | 1.3         | Section titles   |
| H3         | 20px | 700    | 1.3         | Card titles      |
| H4         | 18px | 600    | 1.4         | Sub-sections     |
| H5         | 16px | 600    | 1.4         | List headers     |
| Body Large | 15px | 500    | 1.6         | Primary text     |
| Body       | 14px | 500    | 1.5         | Default text     |
| Body Small | 13px | 500    | 1.5         | Secondary text   |
| Caption    | 12px | 500    | 1.4         | Labels, metadata |
| Tiny       | 11px | 600    | 1.3         | Badges, tags     |

### Font Weights

* **400** : Regular (rarely used, prefer 500)
* **500** : Medium (default for body text)
* **600** : Semibold (headings, emphasis)
* **700** : Bold (major headings, key numbers)

---

## 🎨 Color System

### Core Colors

**Primary Brand:**

* Primary: `#4F46E5` (Indigo)
* Primary Light: `#6366F1`
* Primary Dark: `#4338CA`

**Semantic Colors:**

* Success: `#10B981` (Green)
* Warning: `#F59E0B` (Amber)
* Error: `#EF4444` (Red)
* Info: `#06B6D4` (Cyan)

**Neutrals:**

* Text Primary: `#1E293B`
* Text Secondary: `#64748B`
* Text Tertiary: `#94A3B8`
* Border: `#E5E7EB`
* Background: `#F8FAFC`
* Card Background: `#FFFFFF`

### Gradient System

**Gradient 1 - Purple Haze (Primary):**

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Use for: Primary CTAs, hero sections, featured cards

**Gradient 2 - Sunset:**

```css
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

Use for: Secondary highlights, accent elements

**Gradient 3 - Ocean:**

```css
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
```

Use for: Info elements, stats, data visualization

**Gradient 4 - Fresh:**

```css
background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
```

Use for: Success states, positive actions

**Gradient 5 - Aurora:**

```css
background: linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 50%, #2BFF88 100%);
```

Use for: Special highlights, premium features

---

## 🧊 Border Radius

### Standard Values

| Size | Value | Usage                               |
| ---- | ----- | ----------------------------------- |
| xs   | 8px   | Small buttons, badges               |
| sm   | 10px  | Icon containers, small cards        |
| md   | 12px  | Input fields, small buttons         |
| lg   | 14px  | Icon badges (44-48px)               |
| xl   | 16px  | Standard cards, buttons             |
| 2xl  | 20px  | Large cards                         |
| 3xl  | 24px  | Modals, bottom sheets (top corners) |
| 4xl  | 28px  | Avatar alternatives                 |
| 5xl  | 32px  | Large modals, screen corners        |

### Guidelines

* **Cards** : 16-24px depending on size
* **Buttons** : 12-16px
* **Input fields** : 12px
* **Icon containers** : 10-14px
* **Avatars** : 12-16px (not circular, use rounded squares)
* **Bottom sheets** : 24-32px (top corners only)
* **Modals** : 20-24px

---

## 🌑 Shadows & Elevation

### Shadow Scale

**Level 1 - Subtle (resting):**

```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
```

Use for: Default cards, list items

**Level 2 - Light (hover):**

```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
```

Use for: Hovered cards, input focus

**Level 3 - Medium (raised):**

```css
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
```

Use for: Important cards, overlays

**Level 4 - High (floating):**

```css
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
```

Use for: Modals, dropdowns, floating buttons

**Colored Shadows (for CTAs):**

```css
/* Primary button */
box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);

/* Success button */
box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);

/* Error button */
box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
```

---

## 🔘 Component Specifications

### Cards

**Standard Card:**

* Background: `#FFFFFF`
* Border radius: `20px`
* Padding: `20-24px`
* Shadow: `0 2px 8px rgba(0, 0, 0, 0.04)`
* Margin bottom: `16px` (between cards)

**Stat Card:**

* Border radius: `16px`
* Padding: `16px`
* Centered content
* Icon badge at top (40x40px, radius 12px)

**Featured Card:**

* Gradient background
* Border radius: `24px`
* Padding: `24px`
* Colored shadow
* White text

### Buttons

**Primary Button:**

* Background: Gradient or solid primary color
* Border radius: `12-16px`
* Padding: `12-16px` (vertical) × `24-32px` (horizontal)
* Font size: `15-16px`
* Font weight: `600`
* Colored shadow
* Hover: slight translateY(-2px)

**Secondary Button:**

* Background: `rgba(255, 255, 255, 0.2)` with backdrop-filter
* Border: `1px solid rgba(255, 255, 255, 0.3)`
* Same sizing as primary

**Icon Button:**

* Size: `44x44px` or `40x40px`
* Border radius: `12px`
* Background: Light neutral
* Centered icon (20px)

### Icon Badges

**Standard Icon Badge:**

* Size: `44-48px` square
* Border radius: `12-14px`
* Gradient or solid background
* Centered icon (20-22px)
* Color: white for gradient backgrounds

**Small Icon Badge:**

* Size: `36-40px` square
* Border radius: `10-12px`
* Icon size: `18-20px`

### Input Fields

**Standard Input:**

* Border: `1px solid #E5E7EB`
* Border radius: `12px`
* Padding: `12-14px 16px`
* Font size: `15px`
* Background: `#FFFFFF`
* Focus: Border color changes to primary

### Bottom Navigation

**Container:**

* Background: `#FFFFFF`
* Border radius: `24px` (top corners)
* Padding: `12px 20px 20px`
* Shadow: `0 -4px 24px rgba(0, 0, 0, 0.08)`
* Position: Fixed bottom
* Z-index: `10`

**Nav Items:**

* Padding: `8px 16px`
* Border radius: `16px`
* Gap: `6px` (between icon and label)
* Active background: Light neutral
* Icon size: `22px`
* Label size: `12px`

---

## 🎭 Animation Guidelines

### Transition Timing

**Default:**

```css
transition: all 0.3s ease;
```

**Fast (hover states):**

```css
transition: all 0.2s ease;
```

**Smooth (modals, sheets):**

```css
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Animations

**Hover Effects:**

* Cards: `translateY(-4px)` + shadow increase
* Buttons: `translateY(-2px)` + shadow increase
* Scale: `scale(1.05)` for icons

**Modal/Sheet Entry:**

* Overlay: Fade in (opacity 0 → 1)
* Content: Slide up (translateY(100%) → 0)

---

## 📱 Mobile-Specific Guidelines

### Safe Areas

* Top padding: `20px` minimum
* Bottom padding: `100-120px` when fixed nav present
* Side padding: `20-24px` for content

### Touch Targets

* Minimum size: `44x44px`
* Preferred size: `48x48px` for primary actions
* Spacing between targets: `8px` minimum

### Scrolling

* Always use: `overflow-y: auto`
* Add: `WebkitOverflowScrolling: 'touch'`
* Ensure proper padding at bottom

---

## ✅ Component Checklist

When creating any component, ensure:

* [ ] Border radius is 12px or higher
* [ ] Shadow is soft (max 8px blur)
* [ ] Padding is minimum 12px
* [ ] Transitions are defined (0.2-0.3s)
* [ ] Colors are from the design system
* [ ] Typography uses system scale
* [ ] Touch targets are 44px+ for interactive elements
* [ ] Hover states are defined
* [ ] Active states are visually distinct

---

## 🎯 Key Takeaways

1. **Generous rounding** creates approachable, modern feel
2. **Soft shadows** add depth without harshness
3. **Ample spacing** prevents cramped interfaces
4. **Gradients** add personality to key elements
5. **Smooth transitions** make everything feel polished
6. **Icon badges** are better than plain icons
7. **Consistent sizing** creates visual harmony
