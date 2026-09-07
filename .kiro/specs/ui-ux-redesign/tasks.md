# Implementation Plan: UI/UX Redesign

## Overview

This implementation plan breaks down the comprehensive UI/UX redesign into systematic, incremental coding tasks. The approach follows a foundation-first strategy: establish the design system, build reusable components, enhance existing pages, and finally polish with animations and accessibility features.

The implementation uses CSS custom properties (CSS variables) for theming, maintains the existing React + Vite architecture, and prioritizes progressive enhancement to avoid breaking existing functionality.

## Tasks

- [ ] 1. Establish Design System Foundation
  - [ ] 1.1 Create design tokens CSS file with color system
    - Create `frontend/src/styles/tokens.css` with all CSS custom properties
    - Implement light mode color palette (backgrounds, text, borders, brand colors)
    - Implement dark mode color palette using `[data-theme="dark"]` selector
    - Define semantic color tokens (success, warning, error, info)
    - Define status-specific colors for equipment states
    - Define shadow variables for elevation system
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ] 1.2 Add typography and spacing tokens
    - Add font family, size, weight, and line-height variables to `tokens.css`
    - Add spacing scale based on 4px base unit (0, 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px)
    - Add border radius variables (4px, 6px, 8px, 12px, 16px, 24px, full)
    - Create typography utility classes (heading-1 through heading-6, body-large, body-base, body-small, caption, label)
    - _Requirements: 1.2, 1.3, 1.4_
  
  - [ ] 1.3 Add animation and z-index tokens
    - Add animation duration variables (fast: 150ms, base: 200ms, medium: 300ms, slow: 500ms)
    - Add easing function variables (ease-in, ease-out, ease-in-out, ease-sharp, ease-bounce)
    - Add z-index scale for proper layering (dropdown: 1000, sticky: 1100, modal: 1400, tooltip: 1600, toast: 1700)
    - _Requirements: 1.5, 1.6_
  
  - [ ] 1.4 Import tokens into main application
    - Import `tokens.css` in `frontend/src/main.jsx` or `index.css`
    - Verify theme switching works with `data-theme` attribute on root element
    - Update existing theme toggle logic if needed to use `data-theme="dark"` attribute
    - _Requirements: 1.1, 12.2_

- [ ] 2. Build Core Component Library
  - [ ] 2.1 Create button component styles
    - Create `frontend/src/styles/components/buttons.css`
    - Implement base `.btn` class with all interactive states (hover, focus, active, disabled)
    - Create button variants: `.btn-primary`, `.btn-secondary`, `.btn-tertiary`, `.btn-danger`, `.btn-success`
    - Create button sizes: `.btn-sm`, `.btn-lg`, `.btn-xl`, `.btn-icon`
    - Add `.btn-block` for full-width buttons
    - Implement loading state with `.is-loading` class and spinner animation
    - Add ripple/scale effect on click using CSS transitions
    - _Requirements: 2.1, 8.1_
  
  - [ ] 2.2 Create form input component styles
    - Create `frontend/src/styles/components/forms.css`
    - Implement `.form-group`, `.form-label`, `.form-helper`, `.form-error`, `.form-success` classes
    - Style base input controls: `.form-input`, `.form-select`, `.form-textarea`
    - Add validation states: `.is-error`, `.is-success` with appropriate border colors and shadows
    - Implement `.input-wrapper` with icon positioning (`.icon-left`, `.icon-right`)
    - Style checkbox, radio, and toggle switch components
    - Add focus states with focus ring using `--shadow-focus` token
    - _Requirements: 2.2, 4.1, 4.2, 4.3, 4.4, 8.2_
  
  - [ ] 2.3 Create card component styles
    - Create `frontend/src/styles/components/cards.css`
    - Implement base `.card` class with border, shadow, and rounded corners
    - Create `.card-header`, `.card-body`, `.card-footer` layout sections
    - Add `.card.is-interactive` for clickable cards with hover elevation
    - Create card variants: `.card-outlined`, `.card-elevated`
    - Add subtle hover animations (translateY and shadow increase)
    - _Requirements: 2.3, 8.2_
  
  - [ ] 2.4 Create badge component styles
    - Create `frontend/src/styles/components/badges.css`
    - Implement base `.badge` class with variants: `.badge-primary`, `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-info`, `.badge-neutral`
    - Create status-specific badges: `.badge-status-available`, `.badge-status-allocated`, `.badge-status-maintenance`, `.badge-status-retired`
    - Add badge sizes: `.badge-sm`, `.badge-lg`
    - Implement `.badge-dot` with indicator dot
    - Create `.badge-removable` with remove button styling
    - _Requirements: 2.5, 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 2.5 Create modal component styles
    - Create `frontend/src/styles/components/modals.css`
    - Implement `.modal-overlay` with backdrop and centering
    - Style `.modal` container with fade-in and slide-up animations
    - Create modal sizes: `.modal-sm`, `.modal-lg`, `.modal-xl`, `.modal-full`
    - Style `.modal-header`, `.modal-body`, `.modal-footer` sections
    - Implement `.modal-close` button styling
    - Add entrance/exit animations using `@keyframes fadeIn` and `modalSlideIn`
    - _Requirements: 2.4, 8.4_
  
  - [ ] 2.6 Create toast notification component styles
    - Create `frontend/src/styles/components/toasts.css`
    - Implement `.toast-container` positioned at top-right
    - Style `.toast` with slide-in animation from right
    - Create toast variants: `.toast-success`, `.toast-error`, `.toast-warning`, `.toast-info`
    - Style `.toast-icon`, `.toast-content`, `.toast-title`, `.toast-message`
    - Implement `.toast-close` button
    - Add entrance and exit animations (`toastSlideIn`, `toastSlideOut`)
    - _Requirements: 2.5, 8.5, 9.6_

- [ ] 3. Checkpoint - Core components complete
  - Ensure all component styles are imported and rendering correctly
  - Test button, form, card, badge, modal, and toast components across pages
  - Verify theme switching works for all components
  - Ask user if any adjustments needed before proceeding to tables

- [ ] 4. Enhance Data Tables
  - [ ] 4.1 Create table component base styles
    - Create `frontend/src/styles/components/tables.css`
    - Implement `.table-container`, `.table-wrapper`, `.data-table` base structure
    - Style table toolbar: `.table-toolbar`, `.table-search`, `.table-search-input`, `.table-search-icon`
    - Create filter chips: `.table-filters`, `.filter-chip`, `.filter-chip-remove`
    - Add page size selector: `.page-size-selector`, `.page-size-select`
    - _Requirements: 3.1, 3.3, 3.4_
  
  - [ ] 4.2 Add table header and sorting styles
    - Style sticky table headers with `.data-table thead` and proper z-index
    - Implement sortable column headers: `.table-header-sortable`, `.table-sort-icon`
    - Add sorting states: `.is-sorted`, `.is-sorted-desc` with rotation animations
    - Add hover effects on sortable headers
    - _Requirements: 3.1, 3.2_
  
  - [ ] 4.3 Style table body and row interactions
    - Style table rows: `.data-table tbody tr` with hover background
    - Implement row selection: `.row-checkbox`, `.is-selected` state
    - Create row actions: `.row-actions`, `.row-action-btn` with fade-in on hover
    - Add border styles and cell padding
    - _Requirements: 3.6_
  
  - [ ] 4.4 Add table pagination styles
    - Implement `.table-pagination` layout
    - Style pagination controls: `.pagination-btn`, `.pagination-info`, `.pagination-controls`
    - Add active page state: `.pagination-btn.is-active`
    - Add disabled button styling
    - _Requirements: 3.8_
  
  - [ ] 4.5 Create table empty state and skeleton loaders
    - Implement `.table-empty` with icon, title, message, and action button
    - Create skeleton loader: `.skeleton`, `.skeleton-text`, `.skeleton-table-row`, `.skeleton-table-cell`
    - Add shimmer animation using `@keyframes shimmer`
    - _Requirements: 3.9, 3.10, 9.1, 9.2_
  
  - [ ] 4.6 Make tables responsive for mobile
    - Add media query for mobile (max-width: 767px)
    - Transform table to card layout: hide thead, display tbody tr as blocks
    - Style mobile table cells with `data-label` attribute for field names
    - Stack table toolbar elements vertically on mobile
    - _Requirements: 3.7, 11.2_

- [ ] 5. Update Equipment Page with Enhanced Tables
  - [ ] 5.1 Apply table styles to Equipment.jsx
    - Wrap equipment table with `.table-container` and `.table-wrapper`
    - Add `.data-table` class to table element
    - Implement table toolbar with search input and action buttons
    - Add proper class names to headers, rows, and cells
    - _Requirements: 3.1, 3.3_
  
  - [ ] 5.2 Add sorting functionality to equipment table
    - Apply `.table-header-sortable` to sortable columns
    - Add sort icon elements with `.table-sort-icon`
    - Implement sorting state classes: `.is-sorted`, `.is-sorted-desc`
    - Add click handlers to cycle through sort states
    - _Requirements: 3.2_
  
  - [ ] 5.3 Implement equipment table pagination
    - Add pagination component at table bottom with `.table-pagination`
    - Include page size selector with options (10, 25, 50, 100)
    - Display pagination info showing current range of items
    - Add pagination buttons with proper states
    - _Requirements: 3.8_
  
  - [ ] 5.4 Add equipment status badges
    - Replace text status indicators with badge components
    - Apply appropriate badge classes: `.badge-status-available`, `.badge-status-allocated`, etc.
    - Add badge icons where appropriate
    - _Requirements: 7.1_
  
  - [ ] 5.5 Add equipment table skeleton loader
    - Create skeleton loader component for initial table load
    - Display skeleton rows matching table structure
    - Show skeleton during data fetch, hide when data loads
    - _Requirements: 3.10, 9.1_

- [ ] 6. Update Employees Page with Enhanced Tables
  - [ ] 6.1 Apply table styles to Employees.jsx
    - Wrap employee table with `.table-container` and `.table-wrapper`
    - Add `.data-table` class and toolbar with search
    - Apply table header and cell styling
    - _Requirements: 3.1, 3.3_
  
  - [ ] 6.2 Add employee table pagination and sorting
    - Implement sortable column headers
    - Add pagination controls at bottom
    - Include page size selector
    - _Requirements: 3.2, 3.8_
  
  - [ ] 6.3 Add role/status badges to employee table
    - Replace text role indicators with badge components
    - Use appropriate badge variants for different roles
    - _Requirements: 7.1_

- [ ] 7. Update Allocations Page with Enhanced Tables
  - [ ] 7.1 Apply table styles to Allocations.jsx
    - Wrap allocation table with table container and wrapper
    - Add data-table class and implement toolbar
    - _Requirements: 3.1, 3.3_
  
  - [ ] 7.2 Add allocation status badges
    - Replace allocation status text with badge components
    - Use color-coded badges for different allocation states
    - _Requirements: 7.2_
  
  - [ ] 7.3 Implement allocation table sorting and pagination
    - Add sortable headers for date, employee, equipment columns
    - Implement pagination with controls
    - _Requirements: 3.2, 3.8_

- [ ] 8. Enhance Dashboard Visualizations
  - [ ] 8.1 Create stat card component styles
    - Create `frontend/src/styles/components/stats.css`
    - Implement `.stats-grid` with responsive grid layout
    - Style `.stat-card` with hover elevation effects
    - Create `.stat-icon`, `.stat-content`, `.stat-label`, `.stat-value`, `.stat-change` elements
    - Add stat card variants: `.stat-card-primary`, `.stat-card-success`, `.stat-card-warning`, `.stat-card-error`
    - Implement hover animations (translateY and accent border)
    - _Requirements: 5.1, 5.3, 8.2_
  
  - [ ] 8.2 Create progress bar component styles
    - Add `.progress-bar`, `.progress-fill` styles to stats.css
    - Implement progress variants: `.progress-fill-success`, `.progress-fill-warning`, `.progress-fill-error`
    - Create `.progress-with-label` layout with percentage display
    - Add shimmer animation to progress fill using `@keyframes progressShimmer`
    - Implement circular progress: `.progress-circular` with SVG styling
    - _Requirements: 5.4, 8.3_
  
  - [ ] 8.3 Update Dashboard.jsx with stat cards
    - Replace current dashboard metrics with stat card components
    - Apply `.stats-grid` and `.stat-card` classes
    - Add icons to stat cards (using existing icon library)
    - Implement stat change indicators with `.is-positive`, `.is-negative`, `.is-neutral` classes
    - _Requirements: 5.1, 5.8_
  
  - [ ] 8.4 Add dashboard skeleton loaders
    - Create skeleton loader for stat cards
    - Display during initial dashboard load
    - Match skeleton structure to final stat card layout
    - _Requirements: 5.7, 9.1_
  
  - [ ] 8.5 Make dashboard responsive for mobile
    - Add media query to stack stat cards vertically on mobile
    - Adjust stat card sizing for smaller screens
    - Ensure progress bars remain readable on mobile
    - _Requirements: 5.6, 11.4_

- [ ] 9. Enhance Form Experiences
  - [ ] 9.1 Update Equipment form with enhanced styles
    - Apply form component classes to equipment add/edit forms
    - Add `.form-group`, `.form-label`, `.form-input`, `.form-select` classes
    - Implement required field indicators with `.is-required`
    - Add helper text with `.form-helper`
    - _Requirements: 4.1, 4.8_
  
  - [ ] 9.2 Add form validation UI
    - Implement inline error messages with `.form-error` class
    - Add error state styling to inputs with `.is-error`
    - Display success indicators where appropriate with `.is-success`
    - Add icons to error and success messages
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [ ] 9.3 Add form loading states
    - Implement button loading state with `.is-loading` class
    - Disable form inputs during submission
    - Show loading spinner on submit button
    - _Requirements: 4.5, 9.4_
  
  - [ ] 9.4 Update Employee and Allocation forms
    - Apply same form enhancements to employee add/edit forms
    - Apply form styles to allocation forms
    - Ensure consistent form experience across all pages
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 10. Enhance Navigation and Layout
  - [ ] 10.1 Create sidebar navigation styles
    - Create `frontend/src/styles/components/navigation.css`
    - Style `.app-sidebar` with fixed positioning and transitions
    - Implement `.sidebar-header`, `.sidebar-logo` styling
    - Style `.sidebar-nav`, `.nav-section`, `.nav-section-title`
    - Create `.nav-link` with all states (default, hover, active)
    - Add active page indicator with left border accent (`.is-active` class)
    - Implement `.sidebar-footer`, `.sidebar-user` components
    - _Requirements: 6.1, 6.2, 6.8_
  
  - [ ] 10.2 Apply sidebar styles to MainLayout.jsx
    - Apply navigation classes to existing sidebar structure
    - Add `.nav-link` class to navigation items
    - Implement active state detection and apply `.is-active` class
    - Add user avatar section to sidebar footer
    - _Requirements: 6.1, 6.2, 6.8_
  
  - [ ] 10.3 Create page header and breadcrumb styles
    - Add page header styles to navigation.css
    - Implement `.page-header`, `.breadcrumbs`, `.breadcrumb-item` styles
    - Style `.page-title`, `.page-description`, `.page-header-actions`
    - Add breadcrumb separators with icons
    - _Requirements: 6.4, 6.5_
  
  - [ ] 10.4 Add page headers to main pages
    - Add page header component to Dashboard, Equipment, Employees, Allocations pages
    - Include breadcrumbs for nested pages
    - Position primary actions in page header actions area
    - _Requirements: 6.4, 6.5_
  
  - [ ] 10.5 Make navigation responsive for mobile
    - Add hamburger menu button for mobile (< 768px)
    - Implement sidebar slide-in/out animation on mobile
    - Add `.is-open` state for mobile sidebar
    - Add overlay backdrop when mobile sidebar is open
    - _Requirements: 6.3, 11.1_

- [ ] 11. Implement Modal Components
  - [ ] 11.1 Create reusable Modal component
    - Create `frontend/src/components/Modal.jsx` React component
    - Accept props: isOpen, onClose, title, size, children
    - Render modal overlay with fade-in animation
    - Implement modal header with close button
    - Include modal body and optional footer
    - _Requirements: 2.4, 8.4_
  
  - [ ] 11.2 Add modal focus trapping
    - Implement focus trap within modal when open
    - Return focus to trigger element on close
    - Handle ESC key press to close modal
    - Prevent body scroll when modal is open
    - _Requirements: 2.4, 10.3_
  
  - [ ] 11.3 Replace existing modals with Modal component
    - Update equipment add/edit forms to use Modal component
    - Update employee forms to use Modal component
    - Update allocation forms to use Modal component
    - Ensure all modals use consistent styling
    - _Requirements: 2.4_
  
  - [ ] 11.4 Make modals responsive for mobile
    - Use `.modal-full` class for full-screen modals on mobile
    - Adjust modal padding and spacing for small screens
    - Ensure modal content remains scrollable on mobile
    - _Requirements: 11.5_

- [ ] 12. Implement Toast Notifications
  - [ ] 12.1 Create Toast notification system
    - Create `frontend/src/components/Toast.jsx` component
    - Create `frontend/src/context/ToastContext.jsx` for global toast management
    - Implement toast container in App.jsx
    - Accept toast types: success, error, warning, info
    - _Requirements: 8.5, 9.6_
  
  - [ ] 12.2 Add toast auto-dismiss functionality
    - Implement automatic toast dismissal after 5 seconds
    - Add manual close button to toasts
    - Implement toast exit animation
    - _Requirements: 8.5, 9.6_
  
  - [ ] 12.3 Replace alert() calls with toast notifications
    - Find and replace browser alert() calls with toast notifications
    - Use success toast for successful operations
    - Use error toast for failed operations
    - Use info toast for informational messages
    - _Requirements: 4.7, 9.6_

- [ ] 13. Enhance Accessibility
  - [ ] 13.1 Add focus visible styles
    - Create `frontend/src/styles/accessibility.css`
    - Implement global `:focus-visible` styles with outline
    - Create `.skip-to-content` link for keyboard navigation
    - Implement `.sr-only` and `.sr-only-focusable` utility classes
    - _Requirements: 10.1, 10.2_
  
  - [ ] 13.2 Add ARIA labels and roles
    - Add `aria-label` attributes to icon-only buttons
    - Add `role` attributes to custom interactive elements
    - Add `aria-live` regions for dynamic content updates
    - Add `aria-describedby` for form validation messages
    - _Requirements: 10.5, 10.6_
  
  - [ ] 13.3 Ensure keyboard navigation
    - Verify Tab key navigation order is logical
    - Test ESC key closes modals, dropdowns, and overlays
    - Implement arrow key navigation for dropdowns and lists
    - Ensure all interactive elements are keyboard accessible
    - _Requirements: 10.2, 10.3, 10.4_
  
  - [ ] 13.4 Add reduced motion support
    - Add `@media (prefers-reduced-motion: reduce)` query to accessibility.css
    - Disable/minimize all animations for users with motion sensitivity
    - Set animation and transition durations to near-zero
    - _Requirements: 10.1, 8.3, 8.4, 8.5_
  
  - [ ] 13.5 Verify color contrast ratios
    - Test all text/background combinations meet WCAG AA standards (4.5:1 for normal, 3:1 for large)
    - Test in both light and dark modes
    - Adjust colors if contrast is insufficient
    - Use browser DevTools or axe DevTools for testing
    - _Requirements: 10.7, 12.1_
  
  - [ ] 13.6 Add alternative text indicators
    - Ensure status is not conveyed by color alone (add icons or text)
    - Add descriptive alt text to all informational images
    - Add text labels alongside color-coded badges where appropriate
    - _Requirements: 10.7_

- [ ] 14. Add Micro-interactions and Animations
  - [ ] 14.1 Add button ripple effects
    - Implement subtle scale animation on button click
    - Add smooth color transitions on hover
    - Ensure animations respect reduced-motion preference
    - _Requirements: 8.1_
  
  - [ ] 14.2 Add list item stagger animations
    - Implement staggered fade-in for list items
    - Add animation delays for sequential entrance
    - Apply to table rows and card grids
    - _Requirements: 8.7_
  
  - [ ] 14.3 Add smooth scroll behavior
    - Add `scroll-behavior: smooth` to root element
    - Implement smooth scrolling for anchor links
    - Respect reduced-motion preference
    - _Requirements: 8.8_
  
  - [ ] 14.4 Add loading page progress bar
    - Create top-of-page loading indicator
    - Show during route transitions
    - Use thin colored bar with animation
    - _Requirements: 9.5_

- [ ] 15. Responsive Design Testing and Fixes
  - [ ] 15.1 Test mobile viewport (< 768px)
    - Test all pages on mobile viewport
    - Verify sidebar collapses to hamburger menu
    - Verify tables transform to card layouts
    - Verify forms stack vertically with full-width inputs
    - Fix any layout issues discovered
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [ ] 15.2 Test tablet viewport (768px - 1024px)
    - Test all pages on tablet viewport
    - Verify layout adapts appropriately
    - Verify touch targets are minimum 44px
    - Fix any layout issues discovered
    - _Requirements: 11.6_
  
  - [ ] 15.3 Test device rotation
    - Test portrait and landscape orientations
    - Verify layout adapts smoothly during rotation
    - Fix any layout issues discovered
    - _Requirements: 11.7_

- [ ] 16. Dark Mode Refinement
  - [ ] 16.1 Refine dark mode color palette
    - Review all dark mode colors for proper contrast
    - Adjust shadow opacity for dark mode
    - Refine border colors to ensure visibility
    - Test all components in dark mode
    - _Requirements: 12.1, 12.4, 12.5_
  
  - [ ] 16.2 Add smooth theme transition
    - Implement color transition on theme switch
    - Add transition timing to all color properties
    - Ensure theme preference persists in localStorage
    - _Requirements: 12.2, 12.3_
  
  - [ ] 16.3 Test theme switching across all pages
    - Switch themes on each page and verify appearance
    - Ensure no visual glitches during transition
    - Verify all colors update correctly
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 17. Cross-browser Testing
  - [ ] 17.1 Test in Chrome and Edge
    - Test all pages and interactions in Chrome (latest version)
    - Test all pages and interactions in Edge (latest version)
    - Document and fix any browser-specific issues
    - _Requirements: All_
  
  - [ ] 17.2 Test in Firefox
    - Test all pages and interactions in Firefox (latest version)
    - Test CSS grid and flexbox layouts
    - Document and fix any Firefox-specific issues
    - _Requirements: All_
  
  - [ ] 17.3 Test in Safari
    - Test all pages and interactions in Safari (latest version)
    - Test on macOS and iOS if possible
    - Document and fix any Safari-specific issues
    - _Requirements: All_

- [ ] 18. Performance Optimization
  - [ ] 18.1 Optimize CSS bundle size
    - Remove unused CSS rules
    - Combine related stylesheets
    - Minify CSS for production
    - Verify bundle size is under 50KB gzipped
    - _Requirements: Performance goals_
  
  - [ ] 18.2 Optimize animations for 60fps
    - Use CSS transforms (translate, scale, rotate) instead of position/size changes
    - Use `will-change` property sparingly for animated elements
    - Test animations on lower-end devices
    - Verify smooth 60fps animation performance
    - _Requirements: Performance goals, 8.1, 8.2, 8.3_
  
  - [ ] 18.3 Measure and optimize Core Web Vitals
    - Measure First Contentful Paint (target < 1.5s)
    - Measure Largest Contentful Paint (target < 2.5s)
    - Measure Cumulative Layout Shift (target < 0.1)
    - Measure Time to Interactive (target < 3.5s)
    - Fix any performance issues discovered
    - _Requirements: Performance goals_

- [ ] 19. Final Accessibility Audit
  - [ ] 19.1 Run automated accessibility tests
    - Run axe DevTools on all pages
    - Run Lighthouse accessibility audit
    - Document all issues found
    - Fix all critical and serious issues
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  
  - [ ] 19.2 Manual keyboard navigation testing
    - Test complete keyboard navigation flow on each page
    - Verify focus indicators are always visible
    - Verify tab order is logical
    - Verify ESC, Enter, and Arrow keys work as expected
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ] 19.3 Screen reader testing
    - Test with NVDA (Windows) or VoiceOver (Mac)
    - Verify all interactive elements are announced correctly
    - Verify form validation messages are announced
    - Verify status changes are announced
    - Document and fix any screen reader issues
    - _Requirements: 10.5, 10.6_

- [ ] 20. Final Integration and Polish
  - [ ] 20.1 Review all pages for consistency
    - Verify all pages use the design system consistently
    - Check spacing, colors, typography across all pages
    - Ensure all buttons, forms, tables, badges use consistent styling
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 20.2 Test complete user workflows
    - Test equipment management workflow (add, edit, delete, allocate)
    - Test employee management workflow
    - Test allocation workflow
    - Ensure smooth transitions between pages
    - Verify loading states and error handling throughout
    - _Requirements: All workflow-related requirements_
  
  - [ ] 20.3 Create design system documentation
    - Document available CSS classes and their usage
    - Create examples for each component
    - Document theming and customization
    - Add inline code comments for complex styles
    - _Requirements: Design system foundation_
  
  - [ ] 20.4 Final checkpoint - Complete redesign review
    - Ensure all requirements have been implemented
    - Verify all correctness properties are satisfied
    - Test on multiple devices and browsers
    - Get user feedback on the redesign
    - Address any final issues or polish items

## Notes

- **CSS-First Approach**: This implementation prioritizes CSS for styling and animations to minimize JavaScript overhead and maintain performance.

- **Progressive Enhancement**: Each phase builds on the previous one without breaking existing functionality. The application remains functional at every checkpoint.

- **Component Reusability**: All components are designed to be reusable across different pages. Once styled, they can be applied anywhere in the application by adding CSS classes.

- **Mobile-First Responsive Design**: Base styles target mobile viewports, with media queries progressively enhancing layouts for larger screens.

- **Accessibility by Default**: Focus states, keyboard navigation, and screen reader support are integrated throughout, not added as an afterthought.

- **Theme Switching**: The design system uses CSS custom properties that automatically update when the `data-theme` attribute changes, enabling seamless light/dark mode switching.

- **Performance Considerations**: All animations use CSS transforms for GPU acceleration. Skeleton loaders prevent layout shift. Reduced motion preferences are respected.

- **Browser Compatibility**: Styles are designed for modern browsers (last 2 versions). CSS features like Grid, Flexbox, and CSS Variables are fully supported in the target browser list.

- **Incremental Testing**: Checkpoints throughout the implementation allow for testing and user feedback at key milestones, reducing the risk of large-scale rework.

- **Design Tokens**: All magic numbers are replaced with semantic CSS variables, making global design changes easy and maintaining visual consistency.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4"] },
    { "id": 3, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6"] },
    { "id": 4, "tasks": ["4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3", "4.4", "4.5"] },
    { "id": 6, "tasks": ["4.6"] },
    { "id": 7, "tasks": ["5.1", "6.1", "7.1", "8.1"] },
    { "id": 8, "tasks": ["5.2", "5.4", "6.2", "6.3", "7.2", "8.2"] },
    { "id": 9, "tasks": ["5.3", "5.5", "7.3", "8.3"] },
    { "id": 10, "tasks": ["8.4", "8.5"] },
    { "id": 11, "tasks": ["9.1", "10.1"] },
    { "id": 12, "tasks": ["9.2", "9.3", "9.4", "10.2", "10.3"] },
    { "id": 13, "tasks": ["10.4", "10.5"] },
    { "id": 14, "tasks": ["11.1"] },
    { "id": 15, "tasks": ["11.2", "11.3"] },
    { "id": 16, "tasks": ["11.4", "12.1"] },
    { "id": 17, "tasks": ["12.2", "12.3"] },
    { "id": 18, "tasks": ["13.1", "13.2", "13.3", "13.4"] },
    { "id": 19, "tasks": ["13.5", "13.6"] },
    { "id": 20, "tasks": ["14.1", "14.2", "14.3", "14.4"] },
    { "id": 21, "tasks": ["15.1", "15.2", "15.3"] },
    { "id": 22, "tasks": ["16.1", "16.2"] },
    { "id": 23, "tasks": ["16.3"] },
    { "id": 24, "tasks": ["17.1", "17.2", "17.3"] },
    { "id": 25, "tasks": ["18.1", "18.2"] },
    { "id": 26, "tasks": ["18.3"] },
    { "id": 27, "tasks": ["19.1", "19.2", "19.3"] },
    { "id": 28, "tasks": ["20.1", "20.2"] },
    { "id": 29, "tasks": ["20.3", "20.4"] }
  ]
}
```
