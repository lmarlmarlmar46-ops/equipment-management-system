# EquipTrack UI/UX Redesign - Design Document

## Architecture Overview

This design implements a comprehensive design system for EquipTrack built on CSS custom properties (variables), modular component architecture, and progressive enhancement principles. The system prioritizes:

1. **Consistency** - Every component follows the same design language
2. **Performance** - CSS-first approach with minimal JavaScript for animations
3. **Maintainability** - Centralized design tokens make global changes easy
4. **Accessibility** - WCAG 2.1 Level AA compliance throughout
5. **Scalability** - Component library grows with the application

### Design Philosophy

**"Professional Simplicity"** - Enterprise-grade polish without unnecessary complexity. Every pixel serves a purpose, every animation enhances understanding.

---

## 1. Design System Foundation

### 1.1 Color System

#### Design Token Structure

```css
/* =====================================================
   DESIGN TOKENS - Color System
   ===================================================== */

:root {
  /* ==================== LIGHT MODE ==================== */
  
  /* Primary Backgrounds */
  --bg-primary: #f8fafc;           /* Main page background */
  --bg-secondary: #ffffff;         /* Cards, panels, elevated surfaces */
  --bg-tertiary: #f1f5f9;          /* Subtle backgrounds, hover states */
  --bg-quaternary: #e2e8f0;        /* Disabled states, muted areas */
  
  /* Text Colors */
  --text-primary: #0f172a;         /* Headings, primary content */
  --text-secondary: #475569;       /* Body text, descriptions */
  --text-tertiary: #64748b;        /* Captions, helper text */
  --text-quaternary: #94a3b8;      /* Placeholders, disabled text */
  --text-inverse: #ffffff;         /* Text on dark backgrounds */
  
  /* Border Colors */
  --border-primary: #e2e8f0;       /* Default borders */
  --border-secondary: #cbd5e1;     /* Hover borders */
  --border-focus: #3b82f6;         /* Focus state borders */
  --border-error: #ef4444;         /* Error state borders */
  --border-success: #10b981;       /* Success state borders */
  
  /* Brand Colors */
  --brand-primary: #3b82f6;        /* Primary actions, links */
  --brand-primary-hover: #2563eb;  /* Primary hover state */
  --brand-primary-active: #1d4ed8; /* Primary active state */
  --brand-primary-light: #dbeafe;  /* Light tint backgrounds */
  --brand-primary-lighter: #eff6ff; /* Lighter tint backgrounds */
  
  /* Semantic Colors */
  --success: #10b981;
  --success-hover: #059669;
  --success-light: #d1fae5;
  --success-lighter: #ecfdf5;
  
  --warning: #f59e0b;
  --warning-hover: #d97706;
  --warning-light: #fde68a;
  --warning-lighter: #fef3c7;
  
  --error: #ef4444;
  --error-hover: #dc2626;
  --error-light: #fecaca;
  --error-lighter: #fee2e2;
  
  --info: #3b82f6;
  --info-hover: #2563eb;
  --info-light: #bfdbfe;
  --info-lighter: #dbeafe;
  
  /* Status Colors - Equipment */
  --status-available: #10b981;
  --status-available-bg: #d1fae5;
  --status-allocated: #3b82f6;
  --status-allocated-bg: #dbeafe;
  --status-maintenance: #f59e0b;
  --status-maintenance-bg: #fef3c7;
  --status-retired: #6b7280;
  --status-retired-bg: #f3f4f6;
  
  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.15);
  --shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.15);
  
  /* Overlays */
  --overlay-light: rgba(0, 0, 0, 0.5);
  --overlay-dark: rgba(0, 0, 0, 0.75);
}

[data-theme="dark"] {
  /* ==================== DARK MODE ==================== */
  
  /* Primary Backgrounds */
  --bg-primary: #0f172a;           /* Main page background */
  --bg-secondary: #1e293b;         /* Cards, panels, elevated surfaces */
  --bg-tertiary: #334155;          /* Subtle backgrounds, hover states */
  --bg-quaternary: #475569;        /* Disabled states, muted areas */
  
  /* Text Colors */
  --text-primary: #f8fafc;         /* Headings, primary content */
  --text-secondary: #cbd5e1;       /* Body text, descriptions */
  --text-tertiary: #94a3b8;        /* Captions, helper text */
  --text-quaternary: #64748b;      /* Placeholders, disabled text */
  --text-inverse: #0f172a;         /* Text on light backgrounds */
  
  /* Border Colors */
  --border-primary: #334155;       /* Default borders */
  --border-secondary: #475569;     /* Hover borders */
  --border-focus: #3b82f6;         /* Focus state borders */
  --border-error: #ef4444;         /* Error state borders */
  --border-success: #10b981;       /* Success state borders */
  
  /* Brand Colors */
  --brand-primary: #3b82f6;
  --brand-primary-hover: #60a5fa;
  --brand-primary-active: #2563eb;
  --brand-primary-light: #1e3a8a;
  --brand-primary-lighter: #1e40af;
  
  /* Semantic Colors - Adjusted for dark mode */
  --success: #10b981;
  --success-hover: #34d399;
  --success-light: #064e3b;
  --success-lighter: #065f46;
  
  --warning: #f59e0b;
  --warning-hover: #fbbf24;
  --warning-light: #78350f;
  --warning-lighter: #92400e;
  
  --error: #ef4444;
  --error-hover: #f87171;
  --error-light: #7f1d1d;
  --error-lighter: #991b1b;
  
  --info: #3b82f6;
  --info-hover: #60a5fa;
  --info-light: #1e3a8a;
  --info-lighter: #1e40af;
  
  /* Status Colors - Equipment (Dark Mode) */
  --status-available: #10b981;
  --status-available-bg: #064e3b;
  --status-allocated: #3b82f6;
  --status-allocated-bg: #1e3a8a;
  --status-maintenance: #f59e0b;
  --status-maintenance-bg: #78350f;
  --status-retired: #9ca3af;
  --status-retired-bg: #374151;
  
  /* Shadows - Enhanced for dark mode */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.6), 0 4px 6px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.7), 0 10px 10px rgba(0, 0, 0, 0.6);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.8);
  --shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.25);
  
  /* Overlays */
  --overlay-light: rgba(0, 0, 0, 0.7);
  --overlay-dark: rgba(0, 0, 0, 0.85);
}
```

### 1.2 Typography System

```css
/* =====================================================
   DESIGN TOKENS - Typography
   ===================================================== */

:root {
  /* Font Families */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
               'Helvetica Neue', 'Arial', sans-serif;
  --font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 
               'Courier New', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}

/* Typography Classes */
.heading-1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

.heading-2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

.heading-3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
}

.heading-4 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
}

.heading-5 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  color: var(--text-primary);
}

.heading-6 {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  color: var(--text-primary);
}

.body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

.body-base {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

.body-small {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

.caption {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-tertiary);
}

.label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--text-primary);
}

.overline {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
}
```

### 1.3 Spacing System

```css
/* =====================================================
   DESIGN TOKENS - Spacing
   ===================================================== */

:root {
  /* Spacing Scale (based on 4px) */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
}
```

### 1.4 Border Radius System

```css
/* =====================================================
   DESIGN TOKENS - Border Radius
   ===================================================== */

:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px */
  --radius-base: 0.375rem; /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-2xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;   /* Fully rounded */
}
```

### 1.5 Animation Tokens

```css
/* =====================================================
   DESIGN TOKENS - Animation
   ===================================================== */

:root {
  /* Durations */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-medium: 300ms;
  --duration-slow: 500ms;
  
  /* Easing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### 1.6 Z-Index Scale

```css
/* =====================================================
   DESIGN TOKENS - Z-Index
   ===================================================== */

:root {
  --z-below: -1;
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-fixed: 1200;
  --z-modal-backdrop: 1300;
  --z-modal: 1400;
  --z-popover: 1500;
  --z-tooltip: 1600;
  --z-toast: 1700;
}
```

---

## 2. Component Library

### 2.1 Button Components

#### Button Variants

```css
/* =====================================================
   COMPONENT - Buttons
   ===================================================== */

.btn {
  /* Base button styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  white-space: nowrap;
  user-select: none;
  position: relative;
  overflow: hidden;
}

.btn:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Primary Button */
.btn-primary {
  background: var(--brand-primary);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover:not(:disabled) {
  background: var(--brand-primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active:not(:disabled) {
  background: var(--brand-primary-active);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Secondary Button */
.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-primary);
  box-shadow: var(--shadow-xs);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-sm);
}

.btn-secondary:active:not(:disabled) {
  background: var(--bg-primary);
  box-shadow: var(--shadow-xs);
}

/* Tertiary Button (Ghost) */
.btn-tertiary {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}

.btn-tertiary:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-tertiary:active:not(:disabled) {
  background: var(--bg-quaternary);
}

/* Danger Button */
.btn-danger {
  background: var(--error);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
}

.btn-danger:hover:not(:disabled) {
  background: var(--error-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-danger:active:not(:disabled) {
  background: var(--error);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Success Button */
.btn-success {
  background: var(--success);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
}

.btn-success:hover:not(:disabled) {
  background: var(--success-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* Button Sizes */
.btn-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
  gap: var(--space-1);
}

.btn-lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-base);
}

.btn-xl {
  padding: var(--space-5) var(--space-8);
  font-size: var(--text-lg);
}

/* Icon-only button */
.btn-icon {
  padding: var(--space-3);
  aspect-ratio: 1 / 1;
}

/* Button with loading state */
.btn.is-loading {
  color: transparent;
  pointer-events: none;
}

.btn.is-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--radius-full);
  animation: spin var(--duration-slow) linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Full width button */
.btn-block {
  width: 100%;
}
```

#### Button Usage Examples

```jsx
// Primary action
<button className="btn btn-primary">
  <PlusIcon /> Add Equipment
</button>

// Secondary action
<button className="btn btn-secondary">
  Cancel
</button>

// Danger action
<button className="btn btn-danger">
  Delete Item
</button>

// Ghost button
<button className="btn btn-tertiary">
  Learn More
</button>

// Loading state
<button className="btn btn-primary is-loading">
  Saving...
</button>

// Icon-only
<button className="btn btn-secondary btn-icon" title="Refresh">
  <RefreshIcon />
</button>
```

### 2.2 Form Input Components

```css
/* =====================================================
   COMPONENT - Form Inputs
   ===================================================== */

/* Form Group */
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

/* Form Label */
.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  line-height: var(--leading-normal);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.form-label.is-required::after {
  content: '*';
  color: var(--error);
  margin-left: var(--space-1);
}

/* Form Helper Text */
.form-helper {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  line-height: var(--leading-normal);
}

/* Base Input Styles */
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  transition: all var(--duration-base) var(--ease-out);
  outline: none;
}

.form-input:hover:not(:disabled),
.form-select:hover:not(:disabled),
.form-textarea:hover:not(:disabled) {
  border-color: var(--border-secondary);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
  background: var(--bg-primary);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-quaternary);
}

.form-input:disabled,
.form-select:disabled,
.form-textarea:disabled {
  background: var(--bg-quaternary);
  color: var(--text-quaternary);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Textarea specific */
.form-textarea {
  min-height: 100px;
  resize: vertical;
}

/* Select dropdown styling */
.form-select {
  appearance: none;
  padding-right: var(--space-8);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  background-size: 16px;
  cursor: pointer;
}

/* Input States */
.form-input.is-error,
.form-select.is-error,
.form-textarea.is-error {
  border-color: var(--border-error);
}

.form-input.is-error:focus,
.form-select.is-error:focus,
.form-textarea.is-error:focus {
  box-shadow: 0 0 0 3px var(--error-lighter);
}

.form-input.is-success,
.form-select.is-success,
.form-textarea.is-success {
  border-color: var(--border-success);
}

.form-input.is-success:focus,
.form-select.is-success:focus,
.form-textarea.is-success:focus {
  box-shadow: 0 0 0 3px var(--success-lighter);
}

/* Error Message */
.form-error {
  font-size: var(--text-xs);
  color: var(--error);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  line-height: var(--leading-normal);
}

/* Success Message */
.form-success {
  font-size: var(--text-xs);
  color: var(--success);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  line-height: var(--leading-normal);
}

/* Input with Icon */
.input-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper .icon-left {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  pointer-events: none;
}

.input-wrapper .icon-right {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  pointer-events: none;
}

.input-wrapper.has-icon-left .form-input {
  padding-left: var(--space-10);
}

.input-wrapper.has-icon-right .form-input {
  padding-right: var(--space-10);
}

/* Checkbox & Radio */
.form-checkbox,
.form-radio {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--text-primary);
  user-select: none;
}

.form-checkbox input[type="checkbox"],
.form-radio input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--brand-primary);
}

.form-checkbox input[type="checkbox"]:focus-visible,
.form-radio input[type="radio"]:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Toggle Switch */
.form-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  user-select: none;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--bg-quaternary);
  border-radius: var(--radius-full);
  transition: background var(--duration-base) var(--ease-out);
}

.toggle-switch::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: var(--radius-full);
  transition: transform var(--duration-base) var(--ease-out);
}

.form-toggle input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.form-toggle input[type="checkbox"]:checked + .toggle-switch {
  background: var(--brand-primary);
}

.form-toggle input[type="checkbox"]:checked + .toggle-switch::before {
  transform: translateX(20px);
}

.form-toggle input[type="checkbox"]:focus-visible + .toggle-switch {
  box-shadow: var(--shadow-focus);
}
```

### 2.3 Card Component

```css
/* =====================================================
   COMPONENT - Cards
   ===================================================== */

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--duration-base) var(--ease-out);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

/* Card Interactive (Clickable) */
.card.is-interactive {
  cursor: pointer;
}

.card.is-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-secondary);
}

.card.is-interactive:active {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

/* Card Header */
.card-header {
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.card-header-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Card Body */
.card-body {
  padding: var(--space-6);
}

.card-body-compact {
  padding: var(--space-4);
}

.card-body-spacious {
  padding: var(--space-8);
}

/* Card Footer */
.card-footer {
  padding: var(--space-5) var(--space-6);
  border-top: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-tertiary);
}

/* Card Variants */
.card-outlined {
  background: transparent;
  border-width: 2px;
  box-shadow: none;
}

.card-elevated {
  border: none;
  box-shadow: var(--shadow-lg);
}

.card-elevated:hover {
  box-shadow: var(--shadow-xl);
}
```

### 2.4 Badge Component

```css
/* =====================================================
   COMPONENT - Badges
   ===================================================== */

.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  line-height: var(--leading-none);
  border-radius: var(--radius-base);
  white-space: nowrap;
  transition: all var(--duration-fast) var(--ease-out);
}

/* Badge Variants */
.badge-primary {
  background: var(--brand-primary-lighter);
  color: var(--brand-primary);
}

.badge-success {
  background: var(--success-lighter);
  color: var(--success);
}

.badge-warning {
  background: var(--warning-lighter);
  color: var(--warning);
}

.badge-error {
  background: var(--error-lighter);
  color: var(--error);
}

.badge-info {
  background: var(--info-lighter);
  color: var(--info);
}

.badge-neutral {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

/* Status Badges */
.badge-status-available {
  background: var(--status-available-bg);
  color: var(--status-available);
}

.badge-status-allocated {
  background: var(--status-allocated-bg);
  color: var(--status-allocated);
}

.badge-status-maintenance {
  background: var(--status-maintenance-bg);
  color: var(--status-maintenance);
}

.badge-status-retired {
  background: var(--status-retired-bg);
  color: var(--status-retired);
}

/* Badge Sizes */
.badge-sm {
  padding: 2px var(--space-2);
  font-size: 0.625rem; /* 10px */
}

.badge-lg {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}

/* Badge with Dot Indicator */
.badge-dot::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: currentColor;
}

/* Removable Badge */
.badge-removable {
  padding-right: var(--space-1);
  cursor: pointer;
}

.badge-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  color: currentColor;
  opacity: 0.6;
  transition: all var(--duration-fast) var(--ease-out);
}

.badge-remove-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}
```

### 2.5 Modal Component

```css
/* =====================================================
   COMPONENT - Modal
   ===================================================== */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-light);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: var(--z-modal-backdrop);
  animation: fadeIn var(--duration-base) var(--ease-out);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: var(--z-modal);
  animation: modalSlideIn var(--duration-medium) var(--ease-out);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-sm {
  max-width: 400px;
}

.modal-lg {
  max-width: 700px;
}

.modal-xl {
  max-width: 900px;
}

.modal-full {
  max-width: 95vw;
  max-height: 95vh;
}

/* Modal Header */
.modal-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Modal Body */
.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
  flex: 1;
}

/* Modal Footer */
.modal-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  background: var(--bg-tertiary);
}

.modal-footer-spread {
  justify-content: space-between;
}
```

### 2.6 Toast Notification Component

```css
/* =====================================================
   COMPONENT - Toast Notifications
   ===================================================== */

.toast-container {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  pointer-events: none;
}

.toast {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--space-4);
  min-width: 300px;
  max-width: 400px;
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  animation: toastSlideIn var(--duration-medium) var(--ease-out);
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast.is-exiting {
  animation: toastSlideOut var(--duration-medium) var(--ease-in);
}

@keyframes toastSlideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100px);
  }
}

/* Toast Icon */
.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Toast Content */
.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
}

.toast-message {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* Toast Close Button */
.toast-close {
  width: 24px;
  height: 24px;
  padding: 0;
  flex-shrink: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-base);
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}

.toast-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Toast Variants */
.toast-success {
  border-left: 4px solid var(--success);
}

.toast-success .toast-icon {
  color: var(--success);
}

.toast-error {
  border-left: 4px solid var(--error);
}

.toast-error .toast-icon {
  color: var(--error);
}

.toast-warning {
  border-left: 4px solid var(--warning);
}

.toast-warning .toast-icon {
  color: var(--warning);
}

.toast-info {
  border-left: 4px solid var(--info);
}

.toast-info .toast-icon {
  color: var(--info);
}
```

---

## 3. Enhanced Data Tables

### 3.1 Table Structure

```css
/* =====================================================
   COMPONENT - Enhanced Data Tables
   ===================================================== */

.table-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* Table Toolbar */
.table-toolbar {
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.table-toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.table-toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.table-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

/* Search Input */
.table-search {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.table-search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-10);
  font-size: var(--text-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  transition: all var(--duration-base) var(--ease-out);
}

.table-search-input:focus {
  background: var(--bg-primary);
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
  outline: none;
}

.table-search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  pointer-events: none;
}

/* Filter Chips */
.table-filters {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  padding: 0 var(--space-6) var(--space-4);
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  background: var(--brand-primary-lighter);
  color: var(--brand-primary);
  border-radius: var(--radius-full);
  transition: all var(--duration-fast) var(--ease-out);
}

.filter-chip-remove {
  width: 14px;
  height: 14px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  color: currentColor;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.filter-chip-remove:hover {
  opacity: 1;
}

/* Table Wrapper - Horizontal Scroll */
.table-wrapper {
  overflow-x: auto;
  overflow-y: visible;
}

/* Table */
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

/* Table Header */
.data-table thead {
  background: var(--bg-tertiary);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.data-table th {
  padding: var(--space-3) var(--space-6);
  text-align: left;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-primary);
  white-space: nowrap;
  user-select: none;
}

/* Sortable Header */
.table-header-sortable {
  cursor: pointer;
  position: relative;
  padding-right: var(--space-8);
  transition: color var(--duration-fast) var(--ease-out);
}

.table-header-sortable:hover {
  color: var(--text-primary);
}

.table-sort-icon {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  opacity: 0.3;
  transition: all var(--duration-fast) var(--ease-out);
}

.table-header-sortable:hover .table-sort-icon {
  opacity: 0.6;
}

.table-header-sortable.is-sorted .table-sort-icon {
  opacity: 1;
  color: var(--brand-primary);
}

.table-header-sortable.is-sorted-desc .table-sort-icon {
  transform: translateY(-50%) rotate(180deg);
}

/* Table Body */
.data-table tbody tr {
  transition: background var(--duration-fast) var(--ease-out);
}

.data-table tbody tr:hover {
  background: var(--bg-tertiary);
}

.data-table td {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-sm);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-primary);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

/* Row Selection */
.data-table .row-checkbox {
  width: 40px;
  padding-left: var(--space-4);
  padding-right: var(--space-2);
}

.data-table tbody tr.is-selected {
  background: var(--brand-primary-lighter);
}

/* Row Actions */
.row-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.data-table tbody tr:hover .row-actions {
  opacity: 1;
}

.row-action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-base);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.row-action-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* Empty State */
.table-empty {
  padding: var(--space-16) var(--space-6);
  text-align: center;
}

.table-empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
  color: var(--text-quaternary);
}

.table-empty-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.table-empty-message {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--space-4) 0;
}

/* Table Pagination */
.table-pagination {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.pagination-info {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.pagination-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn.is-active {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: white;
}

/* Page Size Selector */
.page-size-selector {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.page-size-select {
  padding: var(--space-1) var(--space-6) var(--space-1) var(--space-2);
  font-size: var(--text-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-base);
  color: var(--text-primary);
  cursor: pointer;
}
```

### 3.2 Skeleton Loader for Tables

```css
/* =====================================================
   COMPONENT - Skeleton Loaders
   ===================================================== */

.skeleton {
  background: var(--bg-tertiary);
  border-radius: var(--radius-base);
  position: relative;
  overflow: hidden;
}

.skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-text {
  height: 1em;
  margin-bottom: var(--space-2);
}

.skeleton-text-sm {
  height: 0.75em;
}

.skeleton-text-lg {
  height: 1.25em;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
}

.skeleton-table-row {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
}

.skeleton-table-cell {
  flex: 1;
  height: 20px;
}
```

---

## 4. Dashboard Visualizations

### 4.1 Stat Cards

```css
/* =====================================================
   COMPONENT - Dashboard Stat Cards
   ===================================================== */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  transition: all var(--duration-base) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--brand-primary);
  transform: scaleY(0);
  transition: transform var(--duration-base) var(--ease-out);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--border-secondary);
}

.stat-card:hover::before {
  transform: scaleY(1);
}

/* Stat Icon */
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: var(--text-2xl);
}

/* Stat Content */
.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  margin: 0 0 var(--space-1) 0;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
  line-height: var(--leading-none);
}

.stat-change {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.stat-change.is-positive {
  color: var(--success);
}

.stat-change.is-negative {
  color: var(--error);
}

.stat-change.is-neutral {
  color: var(--text-tertiary);
}

/* Stat Card Variants */
.stat-card-primary .stat-icon {
  background: var(--brand-primary-lighter);
  color: var(--brand-primary);
}

.stat-card-success .stat-icon {
  background: var(--success-lighter);
  color: var(--success);
}

.stat-card-warning .stat-icon {
  background: var(--warning-lighter);
  color: var(--warning);
}

.stat-card-error .stat-icon {
  background: var(--error-lighter);
  color: var(--error);
}

.stat-card-info .stat-icon {
  background: var(--info-lighter);
  color: var(--info);
}
```

### 4.2 Progress Bars & Charts

```css
/* =====================================================
   COMPONENT - Progress Indicators
   ===================================================== */

/* Linear Progress Bar */
.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--brand-primary);
  border-radius: var(--radius-full);
  transition: width var(--duration-medium) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transform: translateX(-100%);
  animation: progressShimmer 1.5s infinite;
}

@keyframes progressShimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Progress Variants */
.progress-fill-success {
  background: var(--success);
}

.progress-fill-warning {
  background: var(--warning);
}

.progress-fill-error {
  background: var(--error);
}

/* Progress with Label */
.progress-with-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.progress-wrapper {
  flex: 1;
}

.progress-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  min-width: 45px;
  text-align: right;
}

/* Circular Progress */
.progress-circular {
  width: 120px;
  height: 120px;
  position: relative;
}

.progress-circular svg {
  transform: rotate(-90deg);
}

.progress-circular-bg {
  stroke: var(--bg-tertiary);
}

.progress-circular-fill {
  stroke: var(--brand-primary);
  stroke-linecap: round;
  transition: stroke-dashoffset var(--duration-medium) var(--ease-out);
}

.progress-circular-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}
```

---

## 5. Navigation & Layout

### 5.1 Sidebar Navigation

```css
/* =====================================================
   LAYOUT - Sidebar Navigation
   ===================================================== */

.app-sidebar {
  width: 280px;
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: var(--z-fixed);
  transition: transform var(--duration-medium) var(--ease-out);
}

/* Sidebar Header */
.sidebar-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-primary);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.sidebar-logo:hover {
  opacity: 0.8;
}

.sidebar-logo-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-primary);
  color: white;
  border-radius: var(--radius-lg);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
}

.sidebar-logo-text {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

/* Sidebar Navigation */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) 0;
}

/* Navigation Section */
.nav-section {
  margin-bottom: var(--space-6);
}

.nav-section-title {
  padding: var(--space-2) var(--space-6);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  color: var(--text-tertiary);
}

/* Navigation Links */
.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
  margin: var(--space-1) var(--space-3);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base) var(--ease-out);
  position: relative;
}

.nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--brand-primary);
  border-radius: 0 var(--radius-base) var(--radius-base) 0;
  transition: height var(--duration-base) var(--ease-out);
}

.nav-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-link.is-active {
  background: var(--brand-primary-lighter);
  color: var(--brand-primary);
  font-weight: var(--font-semibold);
}

.nav-link.is-active::before {
  height: 60%;
}

.nav-link-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-link-badge {
  margin-left: auto;
  padding: 2px var(--space-2);
  font-size: 0.625rem;
  font-weight: var(--font-bold);
  background: var(--error);
  color: white;
  border-radius: var(--radius-full);
  min-width: 18px;
  text-align: center;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-primary);
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  transition: background var(--duration-base) var(--ease-out);
  cursor: pointer;
}

.sidebar-user:hover {
  background: var(--bg-tertiary);
}

.sidebar-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--brand-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.sidebar-user-info {
  flex: 1;
  min-width: 0;
}

.sidebar-user-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-role {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: capitalize;
}
```

### 5.2 Page Header & Breadcrumbs

```css
/* =====================================================
   LAYOUT - Page Header
   ===================================================== */

.page-header {
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--border-primary);
}

/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.breadcrumb-link {
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
}

.breadcrumb-link:hover {
  color: var(--text-primary);
}

.breadcrumb-separator {
  width: 12px;
  height: 12px;
  color: var(--text-quaternary);
}

.breadcrumb-item:last-child {
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

/* Page Header Content */
.page-header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);
}

.page-header-text {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
  line-height: var(--leading-tight);
}

.page-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--leading-relaxed);
  max-width: 600px;
}

.page-header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
```

---

## 6. Accessibility Features

### 6.1 Focus States

```css
/* =====================================================
   ACCESSIBILITY - Focus States
   ===================================================== */

/* Global Focus Visible */
*:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Skip to Content Link */
.skip-to-content {
  position: absolute;
  top: -100px;
  left: var(--space-4);
  z-index: var(--z-tooltip);
  padding: var(--space-3) var(--space-4);
  background: var(--brand-primary);
  color: white;
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  text-decoration: none;
  transition: top var(--duration-base) var(--ease-out);
}

.skip-to-content:focus {
  top: var(--space-4);
  outline: 2px solid white;
  outline-offset: 2px;
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus,
.sr-only-focusable:active {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### 6.2 Reduced Motion Support

```css
/* =====================================================
   ACCESSIBILITY - Reduced Motion
   ===================================================== */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. Responsive Design

### 7.1 Breakpoints & Media Queries

```css
/* =====================================================
   RESPONSIVE DESIGN - Breakpoints
   ===================================================== */

/* Mobile-first approach */

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) {
  /* Adjustments for small devices */
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  /* Adjustments for tablets */
}

/* Large devices (desktops, 1024px and up) */
@media (min-width: 1024px) {
  /* Adjustments for desktops */
}

/* Extra large devices (large desktops, 1440px and up) */
@media (min-width: 1440px) {
  /* Adjustments for large screens */
}

/* Mobile-specific adjustments */
@media (max-width: 767px) {
  .app-sidebar {
    transform: translateX(-100%);
  }
  
  .app-sidebar.is-open {
    transform: translateX(0);
  }
  
  .app-content {
    margin-left: 0;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-search {
    max-width: none;
  }
  
  /* Transform tables to cards on mobile */
  .data-table thead {
    display: none;
  }
  
  .data-table tbody tr {
    display: block;
    margin-bottom: var(--space-4);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
  }
  
  .data-table td {
    display: flex;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--border-primary);
  }
  
  .data-table td::before {
    content: attr(data-label);
    font-weight: var(--font-semibold);
    color: var(--text-secondary);
  }
  
  .data-table td:last-child {
    border-bottom: none;
  }
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Design Token Consistency

*For any* component using design tokens, all color, spacing, typography, and animation values SHALL reference CSS custom properties from the design system rather than hard-coded values.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

### Property 2: Theme Switching Completeness

*For any* theme switch between light and dark mode, all visual elements SHALL update to use the appropriate theme-specific color values without requiring page reload.

**Validates: Requirements 1.1, 12.1, 12.2, 12.3**

### Property 3: Interactive State Completeness

*For any* interactive component (buttons, inputs, links), all required states (default, hover, focus, active, disabled) SHALL be styled with appropriate visual feedback.

**Validates: Requirements 2.1, 2.2, 8.1, 8.2**

### Property 4: Focus Indicator Visibility

*For any* interactive element receiving keyboard focus, a visible focus indicator with sufficient contrast SHALL be displayed meeting WCAG 2.1 Level AA standards.

**Validates: Requirements 10.1, 10.2, 10.7**

### Property 5: Table Sorting Bidirectionality

*For any* sortable table column, clicking the column header SHALL cycle through ascending, descending, and unsorted states with appropriate visual indicators.

**Validates: Requirements 3.1, 3.2**

### Property 6: Form Validation State Mapping

*For any* form input with validation rules, the input SHALL display appropriate visual state (error, success, default) matching the validation result with corresponding messages.

**Validates: Requirements 4.2, 4.3, 4.4, 4.6**

### Property 7: Modal Focus Trapping

*For any* open modal dialog, keyboard focus SHALL remain trapped within the modal until dismissed, and pressing ESC key SHALL close the modal.

**Validates: Requirements 2.4, 10.3, 10.4**

### Property 8: Responsive Layout Transformation

*For any* page viewed on mobile viewports (< 768px), tables SHALL transform to card layouts, sidebars SHALL collapse to hamburger menus, and content SHALL stack vertically maintaining readability.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

### Property 9: Animation Duration Accessibility

*For any* user with reduced motion preferences enabled, all animations and transitions SHALL use minimal durations (≤ 0.01ms) to respect accessibility settings.

**Validates: Requirements 8.3, 8.4, 8.5, 8.6**

### Property 10: Color Contrast Compliance

*For any* text element and its background, the contrast ratio SHALL meet WCAG 2.1 Level AA standards (4.5:1 for normal text, 3:1 for large text) in both light and dark modes.

**Validates: Requirements 10.7, 12.1, 12.6**

### Property 11: Loading State Skeleton Matching

*For any* content area displaying skeleton loaders during data fetch, the skeleton structure SHALL match the final loaded content layout.

**Validates: Requirements 3.10, 9.1**

### Property 12: Toast Notification Auto-dismiss

*For any* toast notification displayed to the user, the toast SHALL automatically dismiss after a consistent duration (4-6 seconds) unless manually closed earlier.

**Validates: Requirements 8.5, 9.6**

### Property 13: Spacing Scale Consistency

*For any* component using spacing (padding, margin, gap), the spacing value SHALL be a multiple of the base spacing unit (4px) from the spacing scale.

**Validates: Requirements 1.3**

### Property 14: Button State Preservation During Loading

*For any* button in loading state, the button SHALL maintain its dimensions, display a loading indicator, and prevent multiple submissions.

**Validates: Requirements 4.5, 9.4**

### Property 15: Empty State Actionability

*For any* empty state display, the component SHALL include a descriptive title, explanation message, and when applicable, a primary action button to resolve the empty state.

**Validates: Requirements 3.9, 9.2, 9.3**

---

## Implementation Guidelines

### Development Workflow

1. **Phase 1: Foundation** - Implement design tokens and CSS variables system
2. **Phase 2: Core Components** - Build button, input, card, badge, modal components
3. **Phase 3: Data Tables** - Enhance table with sorting, filtering, pagination
4. **Phase 4: Forms** - Implement form validation UI and loading states
5. **Phase 5: Dashboard** - Build stat cards and progress visualizations
6. **Phase 6: Navigation** - Refine sidebar and page headers
7. **Phase 7: Responsive** - Test and fix mobile/tablet layouts
8. **Phase 8: Accessibility** - Audit and fix a11y issues
9. **Phase 9: Animations** - Add micro-interactions and transitions
10. **Phase 10: Testing** - Cross-browser testing and performance optimization

### Browser Testing Checklist

- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome Mobile (Android 10+)

### Accessibility Audit Checklist

- [ ] Run axe DevTools on all pages
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Verify keyboard-only navigation
- [ ] Check color contrast ratios
- [ ] Test with reduced motion enabled
- [ ] Verify focus indicators on all interactive elements
- [ ] Check form validation announcements
- [ ] Test modal focus trapping

### Performance Checklist

- [ ] CSS bundle size < 50KB gzipped
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Interaction response time < 100ms
- [ ] No layout shifts (CLS < 0.1)
- [ ] Smooth 60fps animations

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-27  
**Status:** Design Complete - Ready for Implementation
