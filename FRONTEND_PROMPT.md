# Vue.js Frontend Development Prompt - Brisk Automations Admin Dashboard

## Project Overview

Build a Vue.js admin dashboard for **Brisk Automations**, a FastAPI backend that manages automated report generation and email distribution. The frontend should provide a modern, responsive interface for managing report types, recipients, viewing generated files, and manually triggering reports.

**Backend URL:** `http://localhost:8000` (development)  
**API Base Path:** `/api/v1`

---

## Tech Stack Requirements

- **Vue 3** with Composition API
- **Vue Router** for navigation
- **Pinia** for state management
- **Tailwind CSS** for styling
- **Axios** for HTTP requests
- **Vite** as build tool

---

## UI/UX Requirements

### Layout
- **Sidebar Navigation** (collapsible on mobile)
  - Dashboard (home)
  - **Reports** (expandable submenu)
    - Customer Calls
    - Customer Visit
  - Settings (report types management)
  
### Design
- Clean, modern admin interface
- Responsive design (mobile-friendly)
- Toast notifications for success/error feedback
- Loading states for async operations
- Confirmation modals for destructive actions

---

## Pages & Features

### 1. Dashboard (`/`)
- Overview cards showing:
  - Total report types (active/inactive)
  - Total recipients
  - Recent files generated
- Quick access to recent activity

### 2. Customer Calls Report Page (`/reports/customer-calls`)
- **Status Section:** Show report status (active/inactive), recipient count
- **Recipients List:** Table showing TO/CC/BCC recipients for this report
- **Preview Button:** Fetch and display report preview data in a table
- **Run Button:** Manually trigger report generation (with optional override recipients modal)
- **Toggle Button:** Enable/disable this report type
- **Files Section:** List of generated files with download links

### 3. Customer Visit Report Page (`/reports/customer-visit`)
- Same structure as Customer Calls page

### 4. Report Types Management (`/settings/report-types`)
- CRUD table for report types
- Create/Edit modal with fields: code, name, description, is_active
- Delete with confirmation

### 5. Recipients Management (`/settings/recipients`)
- CRUD table for recipients (filterable by report type)
- Create modal: email, name, report_type_code (dropdown), is_cc, is_bcc
- Edit modal: email, name, is_cc, is_bcc, is_active
- Delete with confirmation

---

## API Endpoints Reference

### Base URL: `http://localhost:8000/api/v1`

---

### Admin Endpoints (`/admin`)

#### Report Types

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/admin/report-types` | List all report types | Query: `active_only: boolean` | `ReportTypeResponse[]` |
| `GET` | `/admin/report-types/{id}` | Get report type by ID | - | `ReportTypeResponse` |
| `POST` | `/admin/report-types` | Create report type | `{ code: string, name: string, description?: string }` | `ReportTypeResponse` |
| `PATCH` | `/admin/report-types/{id}` | Update report type | `{ name?: string, description?: string, is_active?: boolean }` | `ReportTypeResponse` |
| `DELETE` | `/admin/report-types/{id}` | Delete report type | - | `{ message: string, success: boolean }` |

**ReportTypeResponse:**
```typescript
interface ReportTypeResponse {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}
```

#### Recipients

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/admin/recipients` | List recipients | Query: `report_type_code?: string` | `RecipientResponse[]` |
| `GET` | `/admin/recipients/{id}` | Get recipient by ID | - | `RecipientResponse` |
| `POST` | `/admin/recipients` | Create recipient | `RecipientCreate` | `RecipientResponse` |
| `PATCH` | `/admin/recipients/{id}` | Update recipient | `RecipientUpdate` | `RecipientResponse` |
| `DELETE` | `/admin/recipients/{id}` | Delete recipient | - | `{ message: string, success: boolean }` |

**RecipientCreate:**
```typescript
interface RecipientCreate {
  email: string;           // Valid email
  report_type_code: string; // e.g., "customer_calls"
  name?: string;
  is_cc?: boolean;         // Default: false
  is_bcc?: boolean;        // Default: false
}
```

**RecipientUpdate:**
```typescript
interface RecipientUpdate {
  email?: string;
  name?: string;
  is_cc?: boolean;
  is_bcc?: boolean;
  is_active?: boolean;
}
```

**RecipientResponse:**
```typescript
interface RecipientResponse {
  id: number;
  email: string;
  name: string | null;
  report_type_id: number;
  report_type_code: string | null;
  is_active: boolean;
  is_cc: boolean;
  is_bcc: boolean;
  created_at: string | null;
  updated_at: string | null;
}
```

#### Files

| Method | Endpoint | Description | Query Params | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/admin/files` | List report files | `report_type_code?: string, start_date?: date, end_date?: date, limit?: int (1-500), offset?: int` | `FileResponse[]` |
| `GET` | `/admin/files/{id}` | Get file by ID | - | `FileResponse` |

**FileResponse:**
```typescript
interface FileResponse {
  id: number;
  filename: string;
  file_path: string;
  file_url: string;        // Full download URL
  file_size: number | null;
  mime_type: string | null;
  report_type_id: number | null;
  report_date: string | null;
  created_at: string | null;
}
```

---

### Customer Calls Endpoints (`/customer-calls`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/customer-calls/status` | Get report status & recipients | - | `StatusResponse` |
| `GET` | `/customer-calls/preview` | Preview report data (without sending) | - | `PreviewResponse` |
| `POST` | `/customer-calls/run` | Manually trigger report | `{ override_recipients?: string[] }` | `RunResponse` |
| `POST` | `/customer-calls/toggle?is_active={bool}` | Enable/disable report | Query: `is_active: boolean` | `StatusResponse` |

---

### Customer Visit Endpoints (`/customer-visit`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/customer-visit/status` | Get report status & recipients | - | `StatusResponse` |
| `GET` | `/customer-visit/preview` | Preview report data (without sending) | - | `PreviewResponse` |
| `POST` | `/customer-visit/run` | Manually trigger report | `{ override_recipients?: string[] }` | `RunResponse` |
| `POST` | `/customer-visit/toggle?is_active={bool}` | Enable/disable report | Query: `is_active: boolean` | `StatusResponse` |

---

### Shared Response Types

**StatusResponse:**
```typescript
interface StatusResponse {
  report_type_code: string;
  report_type_name: string;
  is_active: boolean;
  recipient_count: number;
  recipients: Array<{ email: string; type: "to" | "cc" | "bcc" }>;
}
```

**PreviewResponse:**
```typescript
interface PreviewResponse {
  success: boolean;
  generated_at: string;     // ISO datetime
  row_count: number;
  columns: string[];
  summary: Record<string, any>[];  // Array of row data
}
```

**RunResponse:**
```typescript
interface RunResponse {
  success: boolean;
  message: string;
  rows: number | null;
  file_path: string | null;
}
```

---

## Static Files

Generated report files are served at: `http://localhost:8000/files/`  
Download URL format: `{base_url}/files/reports/{report_type}/{year}/{month}/{filename}.xlsx`

---

## Report Types Reference

| Code | Name | Description |
|------|------|-------------|
| `customer_calls` | Customer Calls Report | Call dialer tracking report for D7, D30, DD+30, and DD+60 intervals |
| `customer_visit` | Customer Visit Report | D7, D14, and D21 customer visit tracking report grouped by branch |

---

## Error Handling

All endpoints return standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

Error response format:
```json
{
  "detail": "Error message here"
}
```

---

## CORS Configuration

The backend allows requests from:
- `http://localhost:3000`
- `http://localhost:5173`

Allowed methods: `GET, POST, PUT, PATCH, DELETE`

---

## Project Structure Suggestion

```
src/
├── api/
│   ├── axios.ts           # Axios instance with base config
│   ├── admin.ts           # Admin API calls
│   ├── customerCalls.ts   # Customer calls API calls
│   └── customerVisit.ts   # Customer visit API calls
├── components/
│   ├── layout/
│   │   ├── Sidebar.vue
│   │   ├── Header.vue
│   │   └── MainLayout.vue
│   ├── common/
│   │   ├── DataTable.vue
│   │   ├── Modal.vue
│   │   ├── ConfirmDialog.vue
│   │   └── Toast.vue
│   └── reports/
│       ├── ReportStatusCard.vue
│       ├── RecipientsTable.vue
│       ├── PreviewTable.vue
│       └── FilesTable.vue
├── views/
│   ├── Dashboard.vue
│   ├── reports/
│   │   ├── CustomerCalls.vue
│   │   └── CustomerVisit.vue
│   └── settings/
│       ├── ReportTypes.vue
│       └── Recipients.vue
├── stores/
│   ├── reportTypes.ts
│   ├── recipients.ts
│   └── notifications.ts
├── router/
│   └── index.ts
├── types/
│   └── index.ts           # TypeScript interfaces
├── App.vue
└── main.ts
```

---

## Implementation Notes

1. **Sidebar submenu:** Reports menu should expand/collapse to show Customer Calls and Customer Visit links
2. **Report pages should be reusable:** Consider creating a generic `ReportPage.vue` component that accepts the report type as a prop
3. **Real-time feedback:** Use loading spinners during API calls, success/error toasts for actions
4. **File downloads:** Link directly to `file_url` from FileResponse for downloads
5. **Date formatting:** Parse ISO date strings and display in user-friendly format
