# EquipTrack API Specification

## Overview
RESTful API for the EquipTrack system with JWT-based authentication.

**Base URL**: `https://api.equiptrack.com/v1`

**Authentication**: Bearer Token (JWT)

**Content Type**: `application/json`

---

## Authentication Endpoints

### POST /auth/register
Register a new user account

**Request Body:**
```json
{
  "email": "user@company.com",
  "employee_id": "EMP001",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "department": "Engineering",
  "password": "SecureP@ssw0rd"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user_id": "uuid",
    "email": "user@company.com",
    "verification_sent": true
  }
}
```

### POST /auth/login
User login

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "SecureP@ssw0rd",
  "remember_device": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "user_id": "uuid",
      "email": "user@company.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "EMPLOYEE"
    },
    "mfa_required": false
  }
}
```

**Response (if MFA enabled):** `200 OK`
```json
{
  "success": true,
  "data": {
    "mfa_required": true,
    "session_id": "temp_session_uuid",
    "otp_sent_to": "user@company.com"
  }
}
```

### POST /auth/mfa/verify
Verify MFA code

**Request Body:**
```json
{
  "session_id": "temp_session_uuid",
  "otp_code": "123456"
}
```

**Response:** `200 OK` (same as login success)

### POST /auth/refresh
Refresh access token

**Headers:**
```
Authorization: Bearer {refresh_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "new_access_token",
    "expires_in": 3600
  }
}
```

### POST /auth/logout
Logout user

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/forgot-password
Request password reset

**Request Body:**
```json
{
  "email": "user@company.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset instructions sent to your email"
}
```

### POST /auth/reset-password
Reset password with token

**Request Body:**
```json
{
  "reset_token": "token_from_email",
  "new_password": "NewSecureP@ssw0rd"
}
```

**Response:** `200 OK`

---

## Equipment Endpoints

### GET /equipment
List all equipment with filters

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `category` (uuid)
- `status` (string: AVAILABLE, ASSIGNED, UNDER_MAINTENANCE, etc.)
- `location` (uuid)
- `search` (string: searches asset_tag, serial_number, model_name)
- `sort_by` (string: created_at, purchase_date, model_name)
- `sort_order` (string: asc, desc)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "equipment_id": "uuid",
        "asset_tag": "ASSET-001",
        "serial_number": "SN123456",
        "category": {
          "category_id": "uuid",
          "category_name": "Laptop"
        },
        "manufacturer": "Apple",
        "model_name": "MacBook Pro 16\"",
        "status": "AVAILABLE",
        "condition_rating": "EXCELLENT",
        "location": {
          "location_id": "uuid",
          "location_name": "Main Office"
        },
        "current_value": 2500.00,
        "warranty_end_date": "2025-12-31",
        "under_warranty": true,
        "assigned_to": null,
        "image_url": "https://..."
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 200,
      "items_per_page": 20
    }
  }
}
```

### GET /equipment/:id
Get equipment details

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "equipment_id": "uuid",
    "asset_tag": "ASSET-001",
    "serial_number": "SN123456",
    "category": {
      "category_id": "uuid",
      "category_name": "Laptop"
    },
    "manufacturer": "Apple",
    "model_name": "MacBook Pro 16\"",
    "specifications": {
      "cpu": "M1 Pro",
      "ram": "16GB",
      "storage": "512GB SSD",
      "screen": "16 inch Retina"
    },
    "purchase_date": "2024-01-15",
    "purchase_price": 2799.00,
    "current_value": 2500.00,
    "vendor": {
      "vendor_id": "uuid",
      "vendor_name": "Apple Store"
    },
    "warranty_start_date": "2024-01-15",
    "warranty_end_date": "2025-01-15",
    "warranty_type": "MANUFACTURER",
    "location": {
      "location_id": "uuid",
      "location_name": "Main Office"
    },
    "status": "ASSIGNED",
    "condition_rating": "EXCELLENT",
    "health_score": 95,
    "last_maintenance_date": "2024-06-15",
    "next_maintenance_due": "2025-01-15",
    "qr_code": "https://...",
    "image_url": "https://...",
    "current_assignment": {
      "assignment_id": "uuid",
      "user": {
        "user_id": "uuid",
        "name": "John Doe",
        "employee_id": "EMP001"
      },
      "assignment_date": "2024-02-01",
      "expected_return_date": null
    },
    "accessories": [
      {
        "accessory_id": "uuid",
        "accessory_type": "CHARGER",
        "accessory_name": "USB-C Power Adapter",
        "serial_number": "PWR123",
        "quantity": 1
      }
    ],
    "maintenance_history_count": 2,
    "assignment_history_count": 3,
    "notes": "Additional notes",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-06-15T14:20:00Z"
  }
}
```

### POST /equipment
Create new equipment

**Role Required:** IT_ADMIN

**Request Body:**
```json
{
  "asset_tag": "ASSET-001",
  "serial_number": "SN123456",
  "category_id": "uuid",
  "manufacturer": "Apple",
  "model_name": "MacBook Pro 16\"",
  "model_number": "MK1E3",
  "specifications": {
    "cpu": "M1 Pro",
    "ram": "16GB",
    "storage": "512GB SSD"
  },
  "purchase_date": "2024-01-15",
  "purchase_price": 2799.00,
  "vendor_id": "uuid",
  "warranty_start_date": "2024-01-15",
  "warranty_end_date": "2025-01-15",
  "warranty_type": "MANUFACTURER",
  "location_id": "uuid",
  "condition_rating": "EXCELLENT",
  "accessories": [
    {
      "accessory_type": "CHARGER",
      "accessory_name": "USB-C Power Adapter",
      "quantity": 1
    }
  ],
  "notes": "Bulk purchase"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Equipment created successfully",
  "data": {
    "equipment_id": "uuid",
    "asset_tag": "ASSET-001",
    "qr_code": "https://..."
  }
}
```

### PATCH /equipment/:id
Update equipment

**Role Required:** IT_ADMIN

**Request Body:** (partial update)
```json
{
  "status": "UNDER_MAINTENANCE",
  "condition_rating": "GOOD",
  "notes": "Minor scratches on body"
}
```

**Response:** `200 OK`

### DELETE /equipment/:id
Delete/retire equipment

**Role Required:** IT_ADMIN

**Response:** `200 OK`

### GET /equipment/:id/history
Get equipment history

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "history_id": "uuid",
        "event_type": "ASSIGNED",
        "event_description": "Assigned to John Doe",
        "from_user": null,
        "to_user": {
          "user_id": "uuid",
          "name": "John Doe"
        },
        "from_status": "AVAILABLE",
        "to_status": "ASSIGNED",
        "performed_by": {
          "user_id": "uuid",
          "name": "Admin User"
        },
        "event_timestamp": "2024-02-01T10:00:00Z"
      }
    ]
  }
}
```

---

## Equipment Request Endpoints

### GET /requests
List equipment requests

**Query Parameters:**
- `page`, `limit`
- `status` (DRAFT, PENDING, APPROVED, REJECTED, etc.)
- `priority` (URGENT, HIGH, STANDARD, LOW)
- `requested_by` (uuid)
- `date_from`, `date_to`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "request_id": "uuid",
        "request_number": "REQ-2024-00001",
        "requested_by": {
          "user_id": "uuid",
          "name": "John Doe",
          "employee_id": "EMP001",
          "department": "Engineering"
        },
        "request_type": "NEW",
        "priority": "STANDARD",
        "status": "PENDING",
        "items_count": 2,
        "estimated_total_cost": 3500.00,
        "current_approver": {
          "user_id": "uuid",
          "name": "Manager Name"
        },
        "created_at": "2024-08-01T09:00:00Z",
        "age_days": 5
      }
    ],
    "pagination": {...}
  }
}
```

### GET /requests/:id
Get request details

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "request_id": "uuid",
    "request_number": "REQ-2024-00001",
    "requested_by": {
      "user_id": "uuid",
      "name": "John Doe",
      "employee_id": "EMP001",
      "department": "Engineering",
      "email": "john@company.com"
    },
    "request_type": "NEW",
    "priority": "STANDARD",
    "status": "PENDING",
    "business_justification": "Need laptop for remote work",
    "preferred_delivery_date": "2024-09-01",
    "estimated_total_cost": 3500.00,
    "items": [
      {
        "item_id": "uuid",
        "category": {
          "category_id": "uuid",
          "category_name": "Laptop"
        },
        "preferred_model": "MacBook Pro 16\"",
        "specifications": {
          "ram": "16GB",
          "storage": "512GB"
        },
        "quantity": 1,
        "unit_price_estimate": 2799.00,
        "status": "PENDING"
      }
    ],
    "approval_workflow": [
      {
        "approval_id": "uuid",
        "approver": {
          "user_id": "uuid",
          "name": "Manager Name"
        },
        "approval_level": 1,
        "approval_role": "MANAGER",
        "status": "PENDING",
        "sla_due_date": "2024-08-08T09:00:00Z"
      }
    ],
    "created_at": "2024-08-01T09:00:00Z",
    "updated_at": "2024-08-01T09:00:00Z"
  }
}
```

### POST /requests
Create equipment request

**Request Body:**
```json
{
  "request_type": "NEW",
  "priority": "STANDARD",
  "business_justification": "Need laptop for remote work",
  "preferred_delivery_date": "2024-09-01",
  "items": [
    {
      "category_id": "uuid",
      "preferred_model": "MacBook Pro 16\"",
      "specifications": {
        "ram": "16GB",
        "storage": "512GB"
      },
      "quantity": 1
    }
  ],
  "save_as_draft": false
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Request submitted successfully",
  "data": {
    "request_id": "uuid",
    "request_number": "REQ-2024-00001",
    "status": "PENDING",
    "approval_required": true,
    "estimated_approval_time_days": 3
  }
}
```

### POST /requests/bulk
Create bulk requests

**Role Required:** MANAGER, IT_ADMIN

**Request Body:**
```json
{
  "requests": [
    {
      "employee_id": "EMP001",
      "category_id": "uuid",
      "quantity": 1,
      "justification": "New hire"
    },
    {
      "employee_id": "EMP002",
      "category_id": "uuid",
      "quantity": 1,
      "justification": "Replacement"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Bulk requests created",
  "data": {
    "bulk_request_id": "uuid",
    "total_requests": 2,
    "requests": [
      {
        "request_id": "uuid",
        "request_number": "REQ-2024-00001",
        "employee_id": "EMP001"
      }
    ]
  }
}
```

### PATCH /requests/:id
Update request (for drafts)

**Request Body:**
```json
{
  "business_justification": "Updated justification",
  "items": [...]
}
```

**Response:** `200 OK`

### POST /requests/:id/submit
Submit draft request

**Response:** `200 OK`

### POST /requests/:id/cancel
Cancel request

**Request Body:**
```json
{
  "cancellation_reason": "No longer needed"
}
```

**Response:** `200 OK`

---

## Approval Endpoints

### GET /approvals/pending
Get pending approvals for current user

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "approval_id": "uuid",
        "request": {
          "request_id": "uuid",
          "request_number": "REQ-2024-00001",
          "requested_by": {
            "name": "John Doe",
            "department": "Engineering"
          },
          "items_count": 2,
          "estimated_total_cost": 3500.00
        },
        "approval_level": 1,
        "status": "PENDING",
        "sla_due_date": "2024-08-08T09:00:00Z",
        "hours_remaining": 48
      }
    ]
  }
}
```

### POST /approvals/:id/approve
Approve request

**Request Body:**
```json
{
  "comments": "Approved for business needs",
  "conditions": null
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Request approved",
  "data": {
    "approval_id": "uuid",
    "next_approver_required": false,
    "request_status": "APPROVED"
  }
}
```

### POST /approvals/:id/reject
Reject request

**Request Body:**
```json
{
  "reason": "Budget constraints"
}
```

**Response:** `200 OK`

### POST /approvals/:id/partial-approve
Partially approve request

**Request Body:**
```json
{
  "approved_items": ["item_id_1"],
  "rejected_items": ["item_id_2"],
  "comments": "Approved laptop, rejected monitor due to budget"
}
```

**Response:** `200 OK`

### POST /approvals/:id/request-info
Request more information

**Request Body:**
```json
{
  "questions": "Please provide more details on why 32GB RAM is needed?"
}
```

**Response:** `200 OK`

### POST /approvals/:id/delegate
Delegate approval

**Request Body:**
```json
{
  "delegate_to_user_id": "uuid",
  "reason": "On vacation"
}
```

**Response:** `200 OK`

---

## Assignment Endpoints

### GET /assignments
List equipment assignments

**Query Parameters:**
- `user_id` (uuid)
- `equipment_id` (uuid)
- `status` (ACTIVE, RETURNED)
- `page`, `limit`

**Response:** `200 OK`

### POST /assignments
Assign equipment to user

**Role Required:** IT_ADMIN

**Request Body:**
```json
{
  "equipment_id": "uuid",
  "user_id": "uuid",
  "request_id": "uuid",
  "assignment_type": "PERMANENT",
  "delivery_method": "SHIP",
  "expected_return_date": null,
  "assignment_checklist": {
    "physical_inspection": true,
    "functional_test": true,
    "data_wiped": true,
    "software_installed": true
  },
  "notes": "Ship to home address"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Equipment assigned successfully",
  "data": {
    "assignment_id": "uuid",
    "acceptance_required": true,
    "tracking_number": null
  }
}
```

### POST /assignments/:id/accept
Employee accepts equipment

**Request Body:**
```json
{
  "condition_confirmed": true,
  "issues_noted": "",
  "photos": ["url1", "url2"],
  "signature": "base64_signature_data"
}
```

**Response:** `200 OK`

### POST /assignments/:id/reject
Employee rejects equipment (issues found)

**Request Body:**
```json
{
  "issues": "Screen has dead pixels",
  "photos": ["url1", "url2"]
}
```

**Response:** `200 OK`

### POST /assignments/:id/initiate-return
Initiate equipment return

**Request Body:**
```json
{
  "return_reason": "No longer needed",
  "return_method": "SHIP",
  "scheduled_date": "2024-09-15",
  "partial_return": false
}
```

**Response:** `200 OK`

### POST /assignments/:id/process-return
Process returned equipment

**Role Required:** IT_ADMIN

**Request Body:**
```json
{
  "condition_rating": "GOOD",
  "return_checklist": {
    "no_damage": true,
    "all_accessories": true,
    "data_wiped": true
  },
  "photos": ["url1", "url2"],
  "damage_found": false,
  "damage_description": null,
  "damage_cost": null,
  "notes": "Minor wear, ready for reallocation"
}
```

**Response:** `200 OK`

---

## Maintenance Endpoints

### GET /maintenance/tickets
List maintenance tickets

**Query Parameters:**
- `equipment_id`, `status`, `priority`, `assigned_to`
- `page`, `limit`

**Response:** `200 OK`

### GET /maintenance/tickets/:id
Get ticket details

**Response:** `200 OK`

### POST /maintenance/tickets
Create maintenance ticket

**Request Body:**
```json
{
  "equipment_id": "uuid",
  "ticket_type": "REACTIVE",
  "priority": "HIGH",
  "category": "HARDWARE",
  "issue_description": "Laptop won't power on",
  "steps_to_reproduce": "Pressed power button multiple times",
  "issue_photos": ["url1"]
}
```

**Response:** `201 Created`

### PATCH /maintenance/tickets/:id
Update ticket

**Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "assigned_to": "uuid",
  "diagnosis": "Battery failure",
  "estimated_cost": 150.00
}
```

**Response:** `200 OK`

### POST /maintenance/tickets/:id/resolve
Resolve ticket

**Request Body:**
```json
{
  "resolution": "Replaced battery",
  "actual_cost": 145.00,
  "parts_used": [
    {
      "part_name": "Battery",
      "part_number": "BAT123",
      "quantity": 1,
      "unit_cost": 120.00
    }
  ],
  "labor_cost": 25.00,
  "resolution_photos": ["url1"]
}
```

**Response:** `200 OK`

### POST /maintenance/tickets/:id/close
Close ticket

**Response:** `200 OK`

---

## Inventory Endpoints

### GET /inventory/summary
Get inventory summary

**Query Parameters:**
- `category_id`, `location_id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category_name": "Laptop",
        "location_name": "Main Office",
        "available_count": 15,
        "assigned_count": 45,
        "maintenance_count": 3,
        "damaged_count": 1,
        "total_count": 64,
        "total_value": 150000.00
      }
    ],
    "totals": {
      "total_assets": 200,
      "total_value": 500000.00,
      "available": 50,
      "assigned": 130,
      "maintenance": 15,
      "damaged": 5
    }
  }
}
```

### GET /inventory/low-stock
Get low stock items

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "category_name": "Monitor",
        "available_count": 2,
        "reorder_point": 5,
        "suggested_order_quantity": 10
      }
    ]
  }
}
```

### POST /inventory/transactions
Record inventory transaction

**Role Required:** IT_ADMIN

**Request Body:**
```json
{
  "transaction_type": "PURCHASE",
  "equipment_id": "uuid",
  "quantity": 1,
  "to_location_id": "uuid",
  "unit_cost": 2799.00,
  "notes": "New purchase"
}
```

**Response:** `201 Created`

---

## Notification Endpoints

### GET /notifications
Get user notifications

**Query Parameters:**
- `is_read` (boolean)
- `notification_type`
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "notification_id": "uuid",
        "notification_type": "REQUEST_APPROVED",
        "title": "Equipment Request Approved",
        "message": "Your request REQ-2024-00001 has been approved",
        "priority": "NORMAL",
        "is_read": false,
        "action_url": "/requests/uuid",
        "created_at": "2024-08-05T10:30:00Z"
      }
    ],
    "unread_count": 5
  }
}
```

### PATCH /notifications/:id/read
Mark notification as read

**Response:** `200 OK`

### POST /notifications/mark-all-read
Mark all notifications as read

**Response:** `200 OK`

### GET /notifications/preferences
Get notification preferences

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "preferences": [
      {
        "notification_type": "REQUEST_APPROVED",
        "email_enabled": true,
        "in_app_enabled": true,
        "sms_enabled": false,
        "push_enabled": true
      }
    ],
    "quiet_hours": {
      "start": "22:00",
      "end": "08:00"
    }
  }
}
```

### PUT /notifications/preferences
Update notification preferences

**Request Body:**
```json
{
  "preferences": [
    {
      "notification_type": "REQUEST_APPROVED",
      "email_enabled": true,
      "sms_enabled": false
    }
  ],
  "quiet_hours": {
    "start": "22:00",
    "end": "08:00"
  }
}
```

**Response:** `200 OK`

---

## Reporting Endpoints

### GET /reports/equipment-allocation
Equipment allocation report

**Query Parameters:**
- `department`, `location_id`, `date_from`, `date_to`
- `format` (json, pdf, excel, csv)

**Response:** `200 OK` or download file

### GET /reports/maintenance
Maintenance report

**Query Parameters:**
- `date_from`, `date_to`, `equipment_id`, `format`

**Response:** `200 OK` or download file

### GET /reports/inventory-valuation
Inventory valuation report

**Response:** `200 OK`

### GET /reports/utilization
Equipment utilization report

**Response:** `200 OK`

### POST /reports/schedule
Schedule recurring report

**Request Body:**
```json
{
  "report_type": "INVENTORY",
  "schedule": "WEEKLY",
  "recipients": ["email1@company.com"],
  "format": "PDF",
  "parameters": {
    "location_id": "uuid"
  }
}
```

**Response:** `201 Created`

---

## User Management Endpoints

### GET /users
List users

**Role Required:** MANAGER, IT_ADMIN

**Query Parameters:**
- `role`, `department`, `status`, `page`, `limit`

**Response:** `200 OK`

### GET /users/:id
Get user details

**Response:** `200 OK`

### GET /users/:id/equipment
Get user's equipment

**Response:** `200 OK`

### PATCH /users/:id
Update user

**Role Required:** SYSTEM_ADMIN

**Request Body:**
```json
{
  "role": "MANAGER",
  "department": "Engineering",
  "manager_id": "uuid"
}
```

**Response:** `200 OK`

---

## Dashboard Endpoints

### GET /dashboard/stats
Get dashboard statistics

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_assets": {
      "count": 200,
      "value": 500000.00
    },
    "equipment_by_status": {
      "AVAILABLE": 50,
      "ASSIGNED": 130,
      "UNDER_MAINTENANCE": 15,
      "DAMAGED": 5
    },
    "pending_requests": 12,
    "pending_approvals": 5,
    "open_maintenance_tickets": 8,
    "low_stock_items": 3,
    "allocation_rate": 75.5,
    "average_allocation_time_days": 3.2,
    "maintenance_cost_mtd": 5200.00
  }
}
```

### GET /dashboard/trends
Get trend data

**Query Parameters:**
- `metric` (allocations, maintenance_cost, requests)
- `period` (7days, 30days, 90days, 1year)

**Response:** `200 OK`

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2024-08-05T10:30:00Z"
  }
}
```

### Error Codes
- `400` Bad Request - Invalid input
- `401` Unauthorized - Authentication required
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `409` Conflict - Resource conflict (e.g., duplicate)
- `422` Unprocessable Entity - Validation errors
- `429` Too Many Requests - Rate limit exceeded
- `500` Internal Server Error - Server error

### Validation Error Example
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "email": ["Email is required"],
        "password": ["Password must be at least 8 characters"]
      }
    }
  }
}
```

---

## Rate Limiting

- Rate limit: 1000 requests per hour per user
- Headers returned:
  - `X-RateLimit-Limit`: 1000
  - `X-RateLimit-Remaining`: 950
  - `X-RateLimit-Reset`: 1628179200

---

## Pagination

All list endpoints support pagination:
- Default `limit`: 20
- Maximum `limit`: 100
- Response includes pagination metadata

---

## Filtering and Sorting

- Use query parameters for filtering
- Use `sort_by` and `sort_order` for sorting
- Multiple filters can be combined

---

## Webhooks (Optional)

### Available Events
- `request.submitted`
- `request.approved`
- `request.rejected`
- `equipment.assigned`
- `equipment.returned`
- `maintenance.created`
- `maintenance.completed`

### Webhook Payload Example
```json
{
  "event": "request.approved",
  "timestamp": "2024-08-05T10:30:00Z",
  "data": {
    "request_id": "uuid",
    "request_number": "REQ-2024-00001"
  }
}
```

---

This API specification provides comprehensive endpoints for all EquipTrack functionality. Would you like me to create implementation code for the backend or frontend next?
