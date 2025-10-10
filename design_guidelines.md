# Design Guidelines: StockMaster - Modern Inventory Management System

## Design Approach: Professional Dashboard System

**Selected Framework:** Hybrid approach combining **Material Design principles** with **Fluent Design** productivity patterns, optimized for data-intensive business applications.

**Rationale:** This is a utility-focused, information-dense application requiring clarity, efficiency, and professional aesthetics. The design prioritizes data readability, quick task completion, and visual hierarchy over decorative elements.

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 217 91% 60% (Professional blue - actions, CTAs, active states)
- Secondary: 217 19% 27% (Dark slate - headings, primary text)
- Success: 142 76% 36% (Green - confirmations, positive actions)
- Warning: 38 92% 50% (Amber - alerts, low stock warnings)
- Danger: 0 84% 60% (Red - deletions, critical alerts)
- Neutral Background: 220 14% 96% (Soft gray - page background)
- Surface: 0 0% 100% (White - cards, panels, tables)
- Border: 220 13% 91% (Light gray - dividers, borders)
- Text Primary: 217 19% 27%
- Text Secondary: 215 16% 47%

**Dark Mode:**
- Primary: 217 91% 60% (Same blue, maintained contrast)
- Secondary: 217 19% 90% (Light text)
- Success: 142 76% 45%
- Warning: 38 92% 60%
- Danger: 0 84% 65%
- Background: 222 47% 11% (Deep dark blue-gray)
- Surface: 217 19% 18% (Elevated surfaces)
- Border: 217 19% 27%
- Text Primary: 0 0% 98%
- Text Secondary: 220 9% 70%

### B. Typography

**Font Families:**
- Primary: 'Inter', system-ui, sans-serif (for UI, data, labels)
- Monospace: 'JetBrains Mono', 'Courier New', monospace (for codes, IDs, quantities)

**Type Scale:**
- Display (Dashboard headers): text-3xl/text-2xl font-bold (30px/24px)
- Heading 1 (Page titles): text-2xl/text-xl font-semibold (24px/20px)
- Heading 2 (Section titles): text-xl/text-lg font-semibold (20px/18px)
- Heading 3 (Card titles): text-lg/text-base font-medium (18px/16px)
- Body: text-base/text-sm font-normal (16px/14px)
- Small (Captions, metadata): text-sm/text-xs font-normal (14px/12px)
- Tiny (Labels, badges): text-xs font-medium uppercase tracking-wide (11px)

### C. Layout System

**Spacing Primitives:** Consistent Tailwind units of **2, 4, 6, 8, 12, 16, 20, 24**
- Micro spacing (gaps, padding within components): p-2, p-4, gap-2
- Standard spacing (between elements): p-6, p-8, gap-4, gap-6
- Section spacing (major divisions): p-12, p-16, py-20, py-24
- Container max-width: max-w-7xl for main content areas

**Grid System:**
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Data tables: Full width with horizontal scroll on mobile
- Forms: grid-cols-1 md:grid-cols-2 gap-4 for input pairs
- Sidebar: Fixed w-64 (256px) on desktop, collapsible on mobile

### D. Component Library

**Navigation:**
- Sidebar: Fixed left panel, white/dark surface, grouped navigation with icons
- Top header: Breadcrumbs, search, user menu, notifications
- Active state: Subtle left border (border-l-4) + background color
- Icons: Heroicons outline style, 20px standard size

**Data Display:**
- Tables: Striped rows (even:bg-gray-50), hover states, sticky headers for long lists
- Cards: Rounded corners (rounded-xl), shadow-sm elevation, p-6 padding
- Stats Cards: Large number display (text-3xl font-bold), trend indicators with arrows
- Badges: Rounded-full, px-3 py-1, text-xs font-medium, color-coded by status

**Forms & Inputs:**
- Input fields: rounded-lg, border-2, focus ring with primary color
- Buttons: Primary (solid bg-primary), Secondary (outline), Ghost (transparent)
- Button sizes: sm (px-3 py-1.5), default (px-4 py-2), lg (px-6 py-3)
- Select dropdowns: Custom styled with chevron icons
- File upload: Dashed border dropzone with drag-and-drop support

**Data Visualization:**
- Charts: Recharts library for responsive graphs (line, bar, pie)
- Chart colors: Use primary palette with varied opacity (60%, 80%, 100%)
- Tooltips: Dark background with white text, rounded-lg, shadow-xl

**Feedback & Alerts:**
- Toast notifications: Top-right corner, auto-dismiss, icon + message + close
- Modal dialogs: Centered overlay, max-w-lg, backdrop blur
- Loading states: Skeleton screens for tables, spinner for actions
- Empty states: Centered icon + message + CTA button

**Tables & Lists:**
- Sticky table headers with shadow on scroll
- Row actions: Hover-revealed buttons on right side
- Pagination: Bottom-aligned, showing "X of Y entries"
- Filters: Top bar with dropdowns and search input

### E. Visual Enhancements

**Elevation & Depth:**
- Cards: shadow-sm for subtle lift
- Modals/Dialogs: shadow-2xl for prominence
- Dropdowns: shadow-lg for floating menus
- Active/Hover states: shadow-md for interaction feedback

**Micro-interactions:**
- Button hover: Subtle scale (scale-105) or brightness adjustment
- Card hover: Gentle lift (translate-y-[-2px]) + shadow increase
- Input focus: Ring animation (ring-2 ring-primary ring-offset-2)
- Transitions: transition-all duration-200 for smooth state changes

**Icons & Illustrations:**
- Heroicons for all UI elements (via CDN)
- Empty state illustrations: Use placeholder comments for custom SVGs
- Status indicators: Colored dots (w-2 h-2 rounded-full) for visual scanning

## Critical Implementation Notes

1. **Dark Mode:** Implement system-wide dark mode toggle, persist preference in localStorage
2. **Responsive Design:** Mobile-first approach, collapsible sidebar, touch-friendly targets (min 44px)
3. **Accessibility:** WCAG 2.1 AA compliance, proper ARIA labels, keyboard navigation
4. **Performance:** Virtualized tables for 100+ rows, lazy loading for charts
5. **Consistency:** Use design tokens throughout, no magic numbers or one-off styles

## Images

**Dashboard Hero/Header:**
- Subtle abstract geometric pattern or gradient mesh background for dashboard header section
- Low opacity (20-30%) overlay to maintain text readability
- Optional: Data visualization abstract (dots, lines, grids) in brand colors

**Empty States:**
- Minimalist line art illustrations for "No products", "No data" states
- Simple, professional style matching Material Design illustration principles

**User Avatars:**
- Default to initials in colored circles using user's name hash for color selection