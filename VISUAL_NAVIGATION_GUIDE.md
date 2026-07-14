# SchoolHub - Visual Navigation & UI Layout Guide

**For AI assistants to understand the visual layout and help users navigate based on UI element descriptions**

---

## 🎨 Web App UI Structure

### **Master Layout (All Authenticated Pages)**

```
┌─────────────────────────────────────────────────────────────────┐
│ SchoolHub Logo    [Search Bar]    🔔 Bell    👤 Profile    ⚙️   │  ← Top Navigation
├──────┬───────────────────────────────────────────────────────────┤
│ Side │                  Main Content Area                         │
│ Nav  │                                                             │
│ Menu │                  (Changes based on active page)            │
│      │                                                             │
│      │                                                             │
│      │                                                             │
│ ---- ├ Footer ────────────────────────────────────────────────────┤
│      │ © SchoolHub 2026  |  Terms  |  Privacy  |  Contact        │
└──────┴───────────────────────────────────────────────────────────┘
```

---

### **Top Navigation Bar**

Located at the very top of every authenticated page:

**Left Section:**
- SchoolHub logo (clickable → goes to dashboard)

**Center Section:**
- Global search bar (search students, classes, exams, etc.)

**Right Section:**
- 🔔 **Bell Icon** - Click to see notifications dropdown
  - Shows unread count (red badge)
  - List of recent notifications
  - "View All" link to full notifications page
  
- 👤 **Profile Icon** - Click dropdown menu:
  - View Profile
  - Settings
  - Change Password
  - Logout
  
- ⚙️ **Settings** (context-aware, may vary by role)

---

### **Side Navigation Menu** (Left Sidebar)

**Structure varies by role:**

#### **Student Sidebar Menu:**
```
├─ Dashboard [Home icon]
├─ Classes [Documents icon]
├─ Grades [Chart icon]
├─ Timetable [Calendar icon]
├─ Assignments [Clipboard icon]
├─ Exams [Document icon]
├─ Notifications [Bell icon]
└─ Profile [User icon]
```

**Active menu item**: Highlighted in accent color (usually blue/purple)  
**Current page**: Bold text or background highlight

**Collapsible:**
- Click hamburger menu (☰) to collapse/expand sidebar
- On mobile: Sidebar appears as drawer from left

---

#### **Teacher Sidebar Menu:**
```
├─ Dashboard [Home icon]
├─ Classes [Grid icon]
├─ Grades [Chart icon]
├─ Assignments [Clipboard icon]
├─ Attendance [Person Check icon]
├─ Exams & Quizzes [Test icon]
├─ Notifications [Bell icon]
└─ Settings [Gear icon]
```

---

#### **Parent Sidebar Menu:**
```
├─ Dashboard [Home icon]
├─ Child Performance [Chart icon]
├─ Child Grades [Document icon]
├─ Child Attendance [Calendar icon]
├─ Notifications [Bell icon]
└─ Profile [User icon]
```

---

#### **Admin Sidebar Menu:**
```
├─ Dashboard [Home icon]
├─ Classes [Grid icon]
├─ Exams & Quizzes [Test icon]
├─ Grades [Chart icon]
├─ Attendance [Person Check icon]
├─ Settings [Gear icon]
│  ├─ School Info
│  ├─ Users
│  ├─ Academic Sessions
│  ├─ Subjects
│  ├─ Landing Page/Subdomain
│  ├─ Subscription
│  └─ Payments
├─ Notifications [Bell icon]
└─ Profile [User icon]
```

---

### **Main Content Area Layout Patterns**

#### **Pattern 1: Dashboard Home**
```
┌─────────────────────────────────────────┐
│  Welcome, [User Name]! 👋              │  ← Greeting with emoji
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Stat     │  │ Stat     │  │ Stat   ││  ← Key metrics cards
│  │ 15       │  │ 8        │  │ 3.8    ││    (horizontal row)
│  │ Classes  │  │ Teachers │  │ GPA    ││
│  └──────────┘  └──────────┘  └────────┘│
├─────────────────────────────────────────┤
│  Recent Activities                      │
│  ┌─────────────────────────────────────┐│
│  │ • John submitted assignment 1 hour...││
│  │ • Grade updated: Math exam 85/100   ││
│  │ • New class added: UI Design        ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  Quick Actions (Buttons)                │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐│
│  │ + New│  │ + New│  │ View │  │ More ││
│  │Exam  │  │Class │  │Report│  │  →  ││
│  └──────┘  └──────┘  └──────┘  └──────┘│
└─────────────────────────────────────────┘
```

---

#### **Pattern 2: List Page (Classes, Grades, Exams, etc.)**
```
┌──────────────────────────────────────────┐
│ [Filters ▼] [Search bar] [+ New ▶] [⋮]   │  ← Action bar
├──────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐  │
│ │ [Item 1]                    [Edit]  │  │  ← List item card
│ │ Details and info            [Delete]│  │
│ └─────────────────────────────────────┘  │
│ ┌─────────────────────────────────────┐  │
│ │ [Item 2]                    [Edit]  │  │
│ │ Details and info            [Delete]│  │
│ └─────────────────────────────────────┘  │
│ ┌─────────────────────────────────────┐  │
│ │ [Item 3]                    [Edit]  │  │
│ │ Details and info            [Delete]│  │
│ └─────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│ Page 1 of 4 [< Prev] [1] [2] [3] [Next >]│  ← Pagination
└──────────────────────────────────────────┘
```

---

#### **Pattern 3: Form/Detail Page**
```
┌──────────────────────────────────────────┐
│ [← Back] Page Title          [More ⋮]    │
├──────────────────────────────────────────┤
│ ┌─ Section 1 ────────────────────────┐  │
│ │ ✓ Completed / ○ Pending            │  │  ← Section headers
│ │ [Field Label]                      │  │
│ │ ┌──────────────────────────────┐   │  │
│ │ │ Input value here            │   │  │
│ │ └──────────────────────────────┘   │  │
│ │ [Field Label 2]                    │  │
│ │ ┌──────────────────────────────┐   │  │
│ │ │ Another input               │   │  │
│ │ └──────────────────────────────┘   │  │
│ └────────────────────────────────────┘  │
│ ┌─ Section 2 ────────────────────────┐  │
│ │ [Checkbox] Option 1                │  │
│ │ [Checkbox] Option 2                │  │
│ │ [Radio] ◉ Choice A                 │  │
│ │ [Radio] ○ Choice B                 │  │
│ └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│ [Cancel]                    [Save] [Save & Next] │  ← Form buttons
└──────────────────────────────────────────┘
```

---

#### **Pattern 4: Grades/Analytics Page**
```
┌──────────────────────────────────────────┐
│ [Filter By ▼] [Term ▼] [Subject ▼] [📊]  │
├──────────────────────────────────────────┤
│ ┌─ Quick Stats ──────────────────────┐   │
│ │ GPA: 3.8  │  Ave: 82%  │  Pos: 3/45│   │
│ └────────────────────────────────────┘   │
├──────────────────────────────────────────┤
│ Performance Chart                        │
│ ┌────────────────────────────────────┐   │
│ │  100│                              │   │
│ │   75│    ╱╲    ╱╲                  │   │
│ │   50│   ╱  ╲  ╱  ╲   ╱            │   │
│ │   25│__╱____╲╱____╲_╱___________   │   │
│ │    0├─────────────────────────────│   │
│ │     J  F  M  A  M  J  J  A  S  O  │   │
│ └────────────────────────────────────┘   │
├──────────────────────────────────────────┤
│ Grades Table                             │
│ │ Subject │ Exam │ Assign │ Ave │ Grade ││
│ │─────────┼──────┼────────┼─────┼────── ││
│ │ Math    │ 85   │ 88     │ 86  │ A    ││
│ │ English │ 92   │ 95     │ 93  │ A+   ││
│ │ Science │ 78   │ 81     │ 79  │ B    ││
│ └────────────────────────────────────────┘
│ [Download Report ↓]                      │
└──────────────────────────────────────────┘
```

---

#### **Pattern 5: Modal/Dialog**
```
┌──────────────────────────────────────────┐
│ [Overlay/Dimmed Background]              │
│                                          │
│     ╔════════════════════════════════╗   │
│     ║ Dialog Title            [×]    ║   │ ← Modal window
│     ╠════════════════════════════════╣   │
│     ║ Content here...                ║   │
│     ║                                ║   │
│     ║ [Input field]                  ║   │
│     ║ ┌──────────────────────────┐   ║   │
│     ║ │ Enter text here         │   ║   │
│     ║ └──────────────────────────┘   ║   │
│     ║                                ║   │
│     ╠════════════════════════════════╣   │
│     ║ [Cancel]            [Confirm]  ║   │
│     ╚════════════════════════════════╝   │
│                                          │
└──────────────────────────────────────────┘
```

---

### **Common Buttons & Their Locations**

**Primary Actions** (Blue/Accent Color):
- "Create New" - Usually top right of list pages
- "Save" - Bottom right of forms
- "Submit" - In modals and forms
- "Start Exam" - Exam detail pages

**Secondary Actions** (Gray):
- "Cancel" - Usually next to Save
- "Edit" - On cards and list items
- "View More" - End of lists with pagination

**Danger Actions** (Red):
- "Delete" - Associated with items
- "Remove" - For unlinking or removing selections

**Icon Buttons** (Top Right Area):
- 🔔 Notifications
- 👤 Profile dropdown
- ⚙️ Settings
- 🔍 Search
- ⋮ More options

---

### **Color Coding**

**Text/Backgrounds:**
- **Accent Color** (Blue/Purple) - Active items, primary buttons, links
- **Success Green** - Completed, approved, excellent grades
- **Warning Orange** - Pending, needs action, moderate grades
- **Danger Red** - Failed, rejected, poor grades, errors
- **Neutral Gray** - Disabled, inactive, borders, secondary elements

**Grade Color Coding (typically):**
- **A/A+** → Green
- **B/B+** → Blue
- **C/C+** → Yellow/Orange
- **D/D+** → Orange
- **F** → Red

---

## 📱 Mobile App UI Structure

### **Master Layout (Mobile)**

```
┌───────────────────────────────┐
│ < [Page Title]  [≡ Menu]      │  ← Header bar (always present)
├───────────────────────────────┤
│                               │
│   Main Content                │
│   (Scrollable)                │
│                               │
│                               │
├───────────────────────────────┤
│ [Icon] [Icon] [Icon] [Icon]   │  ← Bottom Tab Navigation
│  Home  Grades Classes Tests    │     (5 tabs typical)
└───────────────────────────────┘
```

---

### **Mobile Header Bar**

**Left Section:**
- `<` Back arrow (if on child page)
- Page title (centered or left-aligned)

**Right Section:**
- ≡ Menu button (shows sidebar as drawer)
- 🔔 Notification bell (with unread count)
- ⋮ More options (three dots)

---

### **Mobile Bottom Tab Navigation**

**Fixed at screen bottom** - always visible

Typical tabs (may vary by role):
1. 🏠 **Dashboard/Home** - Main overview
2. 📊 **Grades** - Grade viewing/submission
3. 📚 **Classes** - Class list and enrollment
4. 📝 **Assignments** - Assignment list and submission
5. 📅 **Exams/Schedule** - Exam and timetable access

**Icon + Label** shown  
**Active tab** - Highlighted in accent color  
**Inactive tab** - Gray

---

### **Mobile Card Layout**

```
┌─────────────────────────────┐
│ Item Title                  │  ← Bold heading
├─────────────────────────────┤
│ Subtext or description      │  ← Gray secondary text
│                             │
│ Status: Active ✓            │  ← Status indicator
│                             │
│            [View Details →] │  ← Action link
├─────────────────────────────┤
```

**Full width cards** on mobile  
**Vertical stacking** with space between  
**Tap anywhere** on card to open details  

---

### **Mobile Form Layout**

```
┌─────────────────────────────┐
│ < Back              Title    │
├─────────────────────────────┤
│ [Field Label]               │
│ ┌───────────────────────────┐│
│ │ [Text input fills width]  ││
│ └───────────────────────────┘│
│                             │
│ [Another Field Label]       │
│ ┌───────────────────────────┐│
│ │ [Another input]          ││
│ └───────────────────────────┘│
│                             │
│ [Checkbox] ☑ Option 1       │
│ [Checkbox] ☐ Option 2       │
│                             │
│ ┌──────────┐  ┌──────────┐  │
│ │ Cancel   │  │ Save     │  │  ← Full-width buttons
│ └──────────┘  └──────────┘  │
├─────────────────────────────┤
│ (Bottom tab navigation)     │
└─────────────────────────────┘
```

---

### **Mobile Responsive Behavior**

- **Single Column** layout (not 2-column like web)
- **Full Width** inputs and cards
- **Larger Touch Targets** (buttons ~44px height minimum)
- **Vertical Scrolling** primary interaction
- **Pull-to-Refresh** on some list pages
- **Swipe Navigation** between exam questions
- **Keyboard Handling** - Inputs push content up

---

## 🔄 Common Navigation Flows

### **Typical Student Flow (Mobile)**

```
Login Page
    ↓
[Enter credentials]
    ↓
Dashboard Tab (Shows today's schedule, due assignments)
    ↓
[Student taps "Exams" card]
    ↓
Exams Tab (List of available exams)
    ↓
[Student taps exam to access]
    ↓
Exam Detail Screen
    ↓
[Student taps "Start Exam"]
    ↓
Exam Taking Screen (Questions with timer)
    ↓
[Answer all questions]
    ↓
Review Screen (Confirm before submit)
    ↓
[Tap "Submit"]
    ↓
Confirmation Screen
```

---

### **Typical Teacher Flow (Web)**

```
Login Page
    ↓
[Select Teacher role]
    ↓
Teacher Dashboard
    ↓
[Click "Classes"]
    ↓
Classes Page (List with + New button)
    ↓
[Click "+ New Class"]
    ↓
Create Class Form
    ↓
[Fill details and click "Create"]
    ↓
Class Created Success Message
    ↓
[Click class name]
    ↓
Class Detail Page
    ↓
[Click "Enroll Students" tab]
    ↓
Add students via search or invite code
```

---

### **Typical Admin Flow (Web)**

```
Login
    ↓
Admin Dashboard
    ↓
[Click "Settings" in sidebar]
    ↓
Settings Main Page (Overview of sections)
    ↓
[Click "School Info"]
    ↓
Edit School Details Form
    ↓
[Update fields and click "Save"]
    ↓
Confirmation message
    ↓
[Go back to Settings]
    ↓
[Click "Subdomain" for landing page]
    ↓
Landing Page Builder
    ↓
[Customize sections, add images, colors]
    ↓
[Preview and Save]
```

---

## 🎯 UI Element Reference Guide

### **Web Element Descriptions**

**Search Bar:**
- Located in top nav center area
- Placeholder text: "Search students, classes, exams..."
- Icon: 🔍 magnifying glass
- Click to focus, type to search
- Results appear in dropdown

**Notification Bell:**
- Located top right, before profile icon
- Red badge shows unread count
- Click → Dropdown shows recent notifications
- "View All" link → Full notifications page

**Status Badges:**
- ✓ Green checkmark = Active/Completed/Approved
- ⏱ Orange clock = Pending/In Progress
- ✕ Red X = Failed/Rejected/Closed
- ? Gray = Unknown/Unreviewed

**Grade Chips/Badges:**
- Large colored boxes showing letter grade (A, B, C, etc.)
- Color indicates performance (green=good, red=poor)
- Sometimes show percentage (85/100) below

**Accordion Sections:**
- Expandable/collapsible sections with title
- Click title → Content expands/collapses
- Arrow icon (↓ or ▶) indicates state
- Used for "Advanced Options", subsections, etc.

**Tab Strips:**
- Horizontal row of tabs at top of content area
- Active tab highlighted in accent color, underlined
- Click tab to switch content panel
- All tabs at same level (not nested)

---

### **Mobile Element Descriptions**

**Pull-to-Refresh:**
- Pull list down from top
- Loading spinner appears
- Data refreshes without page reload
- Used on dashboard, assignment list, grades

**Swipe Actions:**
- Swipe card left → Reveals Edit/Delete options
- Often used on list items for quick actions
- Tap outside card to dismiss

**Float Action Button (FAB):**
- Circular button, usually bottom right
- Primary action for page (+ New, Send, etc.)
- Rises above content
- Has subtle shadow for 3D effect

**Bottom Sheet:**
- Modal that slides up from bottom (like iOS action sheet)
- Semi-transparent background
- Tap background to dismiss
- Shows more options or form in contained area

**Chip/Tag:**
- Small pill-shaped element with text
- Often used for filters, selections, categories
- Can be tap-able or dismissible (with X)

---

## 🌈 Visual Hierarchy & Emphasis

### **What Gets User Attention First:**

1. **Headings** - Largest text, bold, accent color
2. **Status Indicators** - Green/red badges, check marks
3. **Buttons** - Bright accent colors, larger touch area
4. **Cards** - Contained boxes with shadow/border
5. **Data in Tables** - Numbers and comparisons
6. **Form Labels** - Above inputs, bold or accent color
7. **Helper Text** - Small gray text below inputs

### **Content Grouping:**

- **Related items** grouped in cards or sections
- **Whitespace** separates sections
- **Borders/lines** define boundaries
- **Indentation** shows hierarchy
- **Icons** provide visual quick-reference

---

## 📊 Dashboard Quick Stats Layout

**Typical Layout Pattern:**

```
┌─────────────┬─────────────┬──────────────┐
│ Stat 1      │ Stat 2      │ Stat 3       │
│ Value: 25   │ Value: 92%  │ Value: 3.8   │
│ Label       │ Label       │ Label        │
└─────────────┴─────────────┴──────────────┘
```

**Each Stat Card:**
- Large prominent number
- Small label text below
- Optional trend arrow (↑ green, ↓ red)
- Optional percentage change (e.g., "+5% from last month")
- Color coding sometimes applied (green for good, red for needs attention)

---

## 🔐 Authentication & Onboarding UI

### **Login Page Layout**

```
┌────────────────────────────────┐
│                                │
│    [SchoolHub Logo]            │  ← Logo/branding
│                                │
│    Welcome Back 👋             │  ← Greeting
│                                │
│    [Email Input Field]         │
│    [Password Input Field]      │
│                                │
│    [☐ Remember me checkbox]    │
│                                │
│    [Blue: Sign In Button]      │  ← Primary action
│                                │
│    [Forgot Password?] [Sign Up]│  ← Secondary links
│                                │
│    ──────────────────────      │
│    Or sign in with:            │
│    [Google Icon] [Apple Icon]  │
│                                │
└────────────────────────────────┘
```

### **Signup Page Flow**

- Step 1: Email, Password, Confirm Password
- Step 2: Full Name, Phone (optional)
- Step 3: Select User Role (Student/Teacher/Parent/Admin)
- Step 4: School Selection (optional, or given invite code)
- Confirm → Email verification page
- User checks email, clicks verification link
- Redirected to onboarding flow

---

## 💡 UI Tips for Users

**If you see a page and can't find something:**
1. Look in the sidebar menu (left on web, hamburger on mobile)
2. Check top navigation bar for icon buttons
3. Look for filter/sort buttons on list pages (usually top bar)
4. Check if there's a "+ New" or similar button
5. Try searching using the search bar

**If a button is grayed out (disabled):**
- Complete required fields first
- Or check subscription tier (might need upgrade)
- Or check permissions (wrong role)

**If you see a colored badge/chip:**
- Green = Good/Complete/Active
- Orange = Pending/Warning/Needs Action
- Red = Error/Failed/Needs Urgent Action
- Blue = Info/Selected

**Touchpoints for More Info:**
- Hover text (on web) shows tooltips
- Question mark icons ❓ show help
- Long-press elements (mobile) for menu options
- Click ⋮ three dots for "More options"

---

## 🎬 Animation & Interaction Patterns

**Loading States:**
- Spinner animation while data loads
- Skeleton loaders show content structure
- Progress bars for file uploads

**Success Feedback:**
- Green checkmark appears briefly
- Toast notification: "Saved successfully" (auto-dismisses)
- Page updates with new data

**Error Feedback:**
- Red error message appears
- Form input highlights in red
- Error toast: "Something went wrong" (stickier, needs dismiss)

**Transitions:**
- Page fade when navigating
- Sidebar slide animation when opening/closing
- Bottom sheet slides up from mobile bottom
- Modal fade in with background dim

---

