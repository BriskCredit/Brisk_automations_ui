# Brisk Automations UI - Feature Checklist

## Project Setup
- [x] Vue 3 + Vite + TypeScript initialization
- [x] Vue Router configuration
- [x] Pinia store setup
- [x] TanStack Query (Vue Query) integration
- [x] Tailwind CSS configuration
- [x] Axios instance with interceptors
- [x] ESLint + Prettier configuration
- [x] API architecture (endpoints → services → components)
- [x] TypeScript interfaces/types

## Layout & Navigation
- [x] Main layout wrapper
- [x] Sidebar navigation (collapsible)
- [x] Reports submenu (expandable)
- [x] Header with page title
- [x] Toast notification system
- [ ] Mobile responsive sidebar (overlay on mobile)

## Common Components
- [x] Modal component (reusable)
- [x] Confirm dialog component
- [x] DataTable component (sortable, with actions)
- [x] Loading spinner component
- [x] Empty state component
- [x] Badge/Status indicator component

## Dashboard Page (`/`)
- [x] Overview card: Total report types (active/inactive)
- [x] Overview card: Total recipients count
- [x] Overview card: Recent files generated
- [x] Quick access/Recent activity section

## Report Types Management (`/settings/report-types`)
- [ ] Report types list table
- [ ] Create report type modal
- [ ] Edit report type modal
- [ ] Delete report type with confirmation
- [ ] Toggle active/inactive status
- [ ] Loading & error states

## Recipients Management (`/settings/recipients`)
- [ ] Recipients list table
- [ ] Filter by report type dropdown
- [ ] Create recipient modal (email, name, report_type_code, is_cc, is_bcc)
- [ ] Edit recipient modal (email, name, is_cc, is_bcc, is_active)
- [ ] Delete recipient with confirmation
- [ ] Loading & error states

## Customer Calls Report (`/reports/customer-calls`)
- [x] Status card (active/inactive, recipient count)
- [x] Recipients list (TO/CC/BCC breakdown)
- [x] Preview button with data table display
- [x] Run report button
- [x] Override recipients modal (for manual run)
- [x] Toggle report active/inactive
- [x] Generated files list with download links
- [x] Loading & error states
- [x] Recipients drawer (manage recipients per report)

## Customer Visit Report (`/reports/customer-visit`)
- [x] Status card (active/inactive, recipient count)
- [x] Recipients list (TO/CC/BCC breakdown)
- [x] Preview button with data table display
- [x] Run report button
- [x] Override recipients modal (for manual run)
- [x] Toggle report active/inactive
- [x] Generated files list with download links
- [x] Loading & error states
- [x] Recipients drawer (manage recipients per report)

## Polish & Enhancements
- [ ] Date formatting utility
- [ ] File size formatting utility
- [ ] Error handling improvements
- [ ] Form validation
- [ ] Keyboard navigation support
- [ ] Loading skeletons
