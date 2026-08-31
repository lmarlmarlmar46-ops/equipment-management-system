# EquipTrack - Database Schema Design

## Overview
This document defines the complete database schema for the EquipTrack system using PostgreSQL.

## Entity Relationship Diagram (ERD) Description

```
Users ←→ Equipment_Requests ←→ Approvals
Users ←→ Equipment_Assignments ←→ Equipment
Equipment ←→ Maintenance_Tickets
Equipment ←→ Equipment_History
Users ←→ Notifications
Equipment ←→ Inventory_Transactions
Equipment_Categories ←→ Equipment
Vendors ←→ Maintenance_Tickets
Locations ←→ Equipment
```

---

## Core Tables

### 1. users
Stores all system users (employees, admins, maintenance staff)

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(50) NOT NULL, -- EMPLOYEE, IT_ADMIN, MANAGER, MAINTENANCE, AUDITOR, SYSTEM_ADMIN
    department VARCHAR(100),
    job_title VARCHAR(100),
    manager_id UUID REFERENCES users(user_id),
    location_id UUID REFERENCES locations(location_id),
    employment_status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, ON_LEAVE, TERMINATED
    date_joined DATE,
    last_working_day DATE,
    password_hash VARCHAR(255) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    account_locked BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_department ON users(department);
```

### 2. user_sessions
Tracks user login sessions

```sql
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    remember_device BOOLEAN DEFAULT FALSE,
    device_fingerprint VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
```

### 3. locations
Physical locations for inventory and users

```sql
CREATE TABLE locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_name VARCHAR(100) NOT NULL,
    location_type VARCHAR(50), -- OFFICE, WAREHOUSE, REMOTE
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_locations_type ON locations(location_type);
CREATE INDEX idx_locations_active ON locations(is_active);
```

### 4. equipment_categories
Equipment types and categories

```sql
CREATE TABLE equipment_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) NOT NULL UNIQUE,
    parent_category_id UUID REFERENCES equipment_categories(category_id),
    description TEXT,
    default_warranty_months INTEGER DEFAULT 12,
    default_depreciation_rate DECIMAL(5,2), -- Percentage per year
    requires_approval_above_value DECIMAL(10,2),
    preventive_maintenance_interval_days INTEGER, -- For PM scheduling
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON equipment_categories(parent_category_id);
CREATE INDEX idx_categories_active ON equipment_categories(is_active);
```

### 5. equipment
Main equipment/asset table

```sql
CREATE TABLE equipment (
    equipment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_tag VARCHAR(50) UNIQUE NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    category_id UUID NOT NULL REFERENCES equipment_categories(category_id),
    manufacturer VARCHAR(100),
    model_name VARCHAR(100) NOT NULL,
    model_number VARCHAR(100),
    specifications JSONB, -- Flexible field for specs (RAM, CPU, etc.)
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    current_value DECIMAL(10,2),
    vendor_id UUID REFERENCES vendors(vendor_id),
    warranty_start_date DATE,
    warranty_end_date DATE,
    warranty_type VARCHAR(50), -- MANUFACTURER, EXTENDED, NONE
    location_id UUID REFERENCES locations(location_id),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    -- Status: AVAILABLE, ASSIGNED, UNDER_MAINTENANCE, DAMAGED, LOST, RETIRED, RESERVED, IN_TRANSIT
    condition_rating VARCHAR(20), -- EXCELLENT, GOOD, FAIR, POOR
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    qr_code VARCHAR(255), -- Path to QR code image
    image_url VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    retired_date DATE,
    retirement_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id)
);

CREATE INDEX idx_equipment_asset_tag ON equipment(asset_tag);
CREATE INDEX idx_equipment_serial ON equipment(serial_number);
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_location ON equipment(location_id);
CREATE INDEX idx_equipment_warranty ON equipment(warranty_end_date);
CREATE INDEX idx_equipment_active ON equipment(is_active);
```

### 6. equipment_accessories
Accessories assigned with equipment

```sql
CREATE TABLE equipment_accessories (
    accessory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,
    accessory_type VARCHAR(100) NOT NULL, -- CHARGER, MOUSE, KEYBOARD, CABLE, etc.
    accessory_name VARCHAR(100),
    serial_number VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    condition_rating VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accessories_equipment ON equipment_accessories(equipment_id);
CREATE INDEX idx_accessories_type ON equipment_accessories(accessory_type);
```

### 7. equipment_requests
Equipment requests from employees

```sql
CREATE TABLE equipment_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL, -- Human-readable: REQ-2024-00001
    requested_by UUID NOT NULL REFERENCES users(user_id),
    request_type VARCHAR(50) NOT NULL, -- NEW, REPLACEMENT, UPGRADE, TEMPORARY, BULK
    priority VARCHAR(20) DEFAULT 'STANDARD', -- URGENT, HIGH, STANDARD, LOW
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    -- Status: DRAFT, PENDING, UNDER_REVIEW, APPROVED, REJECTED, PARTIALLY_APPROVED, 
    --         ALLOCATED, CANCELLED, MORE_INFO_REQUIRED
    business_justification TEXT NOT NULL,
    preferred_delivery_date DATE,
    estimated_total_cost DECIMAL(10,2),
    is_template_used BOOLEAN DEFAULT FALSE,
    template_name VARCHAR(100),
    bulk_request_id UUID, -- Links individual requests from bulk operation
    parent_request_id UUID REFERENCES equipment_requests(request_id),
    current_approver_id UUID REFERENCES users(user_id),
    final_approval_date TIMESTAMP,
    rejection_reason TEXT,
    cancellation_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id)
);

CREATE INDEX idx_requests_number ON equipment_requests(request_number);
CREATE INDEX idx_requests_user ON equipment_requests(requested_by);
CREATE INDEX idx_requests_status ON equipment_requests(status);
CREATE INDEX idx_requests_priority ON equipment_requests(priority);
CREATE INDEX idx_requests_approver ON equipment_requests(current_approver_id);
CREATE INDEX idx_requests_created ON equipment_requests(created_at);
CREATE INDEX idx_requests_bulk ON equipment_requests(bulk_request_id);
```

### 8. request_items
Individual items within a request

```sql
CREATE TABLE request_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES equipment_requests(request_id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES equipment_categories(category_id),
    preferred_model VARCHAR(100),
    specifications JSONB,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_estimate DECIMAL(10,2),
    total_price_estimate DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, ALLOCATED
    approval_notes TEXT,
    allocated_equipment_id UUID REFERENCES equipment(equipment_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_request_items_request ON request_items(request_id);
CREATE INDEX idx_request_items_category ON request_items(category_id);
CREATE INDEX idx_request_items_status ON request_items(status);
```

### 9. request_approvals
Approval workflow tracking

```sql
CREATE TABLE request_approvals (
    approval_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES equipment_requests(request_id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(user_id),
    approval_level INTEGER NOT NULL, -- 1, 2, 3 (for multi-level approvals)
    approval_role VARCHAR(50), -- MANAGER, IT_ADMIN, DEPARTMENT_HEAD
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    -- Status: PENDING, APPROVED, REJECTED, DELEGATED, MORE_INFO_REQUIRED
    decision_date TIMESTAMP,
    comments TEXT,
    conditions TEXT, -- For conditional approvals
    delegated_to UUID REFERENCES users(user_id),
    delegation_reason TEXT,
    is_escalated BOOLEAN DEFAULT FALSE,
    escalation_date TIMESTAMP,
    sla_due_date TIMESTAMP,
    sla_breached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approvals_request ON request_approvals(request_id);
CREATE INDEX idx_approvals_approver ON request_approvals(approver_id);
CREATE INDEX idx_approvals_status ON request_approvals(status);
CREATE INDEX idx_approvals_sla ON request_approvals(sla_due_date);
CREATE INDEX idx_approvals_level ON request_approvals(approval_level);
```

### 10. equipment_assignments
Tracks equipment allocation to employees

```sql
CREATE TABLE equipment_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(equipment_id),
    user_id UUID NOT NULL REFERENCES users(user_id),
    request_id UUID REFERENCES equipment_requests(request_id),
    assignment_type VARCHAR(50) DEFAULT 'PERMANENT', -- PERMANENT, TEMPORARY, LOANER
    assigned_by UUID NOT NULL REFERENCES users(user_id),
    assignment_date DATE NOT NULL,
    expected_return_date DATE,
    actual_return_date DATE,
    delivery_method VARCHAR(50), -- SHIP, PICKUP, HAND_DELIVERY
    tracking_number VARCHAR(100),
    courier_service VARCHAR(100),
    assignment_condition VARCHAR(20), -- Condition at assignment
    assignment_checklist JSONB, -- Pre-allocation checklist results
    assignment_photos JSONB, -- Array of photo URLs
    acceptance_status VARCHAR(50) DEFAULT 'PENDING',
    -- Status: PENDING, ACCEPTED, REJECTED, IN_TRANSIT
    acceptance_date TIMESTAMP,
    acceptance_signature TEXT, -- Digital signature data
    acceptance_notes TEXT,
    acceptance_photos JSONB,
    return_initiated BOOLEAN DEFAULT FALSE,
    return_scheduled_date DATE,
    return_method VARCHAR(50),
    return_condition VARCHAR(20), -- Condition at return
    return_checklist JSONB,
    return_photos JSONB,
    return_processed_by UUID REFERENCES users(user_id),
    damage_at_return BOOLEAN DEFAULT FALSE,
    damage_description TEXT,
    damage_cost DECIMAL(10,2),
    damage_charged BOOLEAN DEFAULT FALSE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignments_equipment ON equipment_assignments(equipment_id);
CREATE INDEX idx_assignments_user ON equipment_assignments(user_id);
CREATE INDEX idx_assignments_request ON equipment_assignments(request_id);
CREATE INDEX idx_assignments_active ON equipment_assignments(is_active);
CREATE INDEX idx_assignments_return_date ON equipment_assignments(expected_return_date);
CREATE INDEX idx_assignments_acceptance ON equipment_assignments(acceptance_status);
```

### 11. maintenance_tickets
Equipment maintenance and repair tracking

```sql
CREATE TABLE maintenance_tickets (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL, -- MAINT-2024-00001
    equipment_id UUID NOT NULL REFERENCES equipment(equipment_id),
    reported_by UUID REFERENCES users(user_id),
    assigned_to UUID REFERENCES users(user_id), -- Maintenance staff
    ticket_type VARCHAR(50) NOT NULL, -- REACTIVE, PREVENTIVE, INSPECTION
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- CRITICAL, HIGH, MEDIUM, LOW
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    -- Status: OPEN, IN_PROGRESS, WAITING_PARTS, WITH_VENDOR, RESOLVED, CLOSED, CANCELLED
    category VARCHAR(50), -- HARDWARE, SOFTWARE, PERFORMANCE, PHYSICAL_DAMAGE
    issue_description TEXT NOT NULL,
    steps_to_reproduce TEXT,
    troubleshooting_attempted TEXT,
    issue_photos JSONB,
    diagnosis TEXT,
    resolution TEXT,
    resolution_photos JSONB,
    requires_vendor BOOLEAN DEFAULT FALSE,
    vendor_id UUID REFERENCES vendors(vendor_id),
    vendor_ticket_number VARCHAR(100),
    vendor_estimate DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    parts_cost DECIMAL(10,2),
    labor_cost DECIMAL(10,2),
    loaner_provided BOOLEAN DEFAULT FALSE,
    loaner_equipment_id UUID REFERENCES equipment(equipment_id),
    sla_due_date TIMESTAMP,
    sla_breached BOOLEAN DEFAULT FALSE,
    time_to_resolve_hours DECIMAL(10,2),
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_ticket_number ON maintenance_tickets(ticket_number);
CREATE INDEX idx_maintenance_equipment ON maintenance_tickets(equipment_id);
CREATE INDEX idx_maintenance_reported_by ON maintenance_tickets(reported_by);
CREATE INDEX idx_maintenance_assigned_to ON maintenance_tickets(assigned_to);
CREATE INDEX idx_maintenance_status ON maintenance_tickets(status);
CREATE INDEX idx_maintenance_priority ON maintenance_tickets(priority);
CREATE INDEX idx_maintenance_sla ON maintenance_tickets(sla_due_date);
CREATE INDEX idx_maintenance_type ON maintenance_tickets(ticket_type);
```

### 12. maintenance_parts
Parts used in maintenance

```sql
CREATE TABLE maintenance_parts (
    part_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES maintenance_tickets(ticket_id) ON DELETE CASCADE,
    part_name VARCHAR(100) NOT NULL,
    part_number VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    vendor_id UUID REFERENCES vendors(vendor_id),
    ordered_date DATE,
    received_date DATE,
    warranty_months INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parts_ticket ON maintenance_parts(ticket_id);
CREATE INDEX idx_parts_vendor ON maintenance_parts(vendor_id);
```

### 13. vendors
Equipment and service vendors

```sql
CREATE TABLE vendors (
    vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name VARCHAR(100) NOT NULL,
    vendor_type VARCHAR(50), -- MANUFACTURER, RETAILER, SERVICE_PROVIDER
    contact_person VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    website VARCHAR(255),
    payment_terms VARCHAR(100),
    is_preferred BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendors_type ON vendors(vendor_type);
CREATE INDEX idx_vendors_active ON vendors(is_active);
CREATE INDEX idx_vendors_preferred ON vendors(is_preferred);
```

### 14. equipment_history
Complete audit trail for equipment

```sql
CREATE TABLE equipment_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(equipment_id),
    event_type VARCHAR(50) NOT NULL,
    -- Event types: CREATED, ASSIGNED, RETURNED, MAINTENANCE_STARTED, MAINTENANCE_COMPLETED,
    --              STATUS_CHANGED, LOCATION_CHANGED, TRANSFERRED, DAMAGED, LOST, RETIRED
    event_description TEXT,
    from_user_id UUID REFERENCES users(user_id),
    to_user_id UUID REFERENCES users(user_id),
    from_location_id UUID REFERENCES locations(location_id),
    to_location_id UUID REFERENCES locations(location_id),
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    related_request_id UUID REFERENCES equipment_requests(request_id),
    related_ticket_id UUID REFERENCES maintenance_tickets(ticket_id),
    related_assignment_id UUID REFERENCES equipment_assignments(assignment_id),
    metadata JSONB, -- Additional event-specific data
    performed_by UUID REFERENCES users(user_id),
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_history_equipment ON equipment_history(equipment_id);
CREATE INDEX idx_history_event_type ON equipment_history(event_type);
CREATE INDEX idx_history_timestamp ON equipment_history(event_timestamp);
CREATE INDEX idx_history_from_user ON equipment_history(from_user_id);
CREATE INDEX idx_history_to_user ON equipment_history(to_user_id);
```

### 15. inventory_transactions
Inventory movements and adjustments

```sql
CREATE TABLE inventory_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(50) NOT NULL,
    -- Types: PURCHASE, RETURN_TO_INVENTORY, ALLOCATION, TRANSFER, WRITE_OFF, ADJUSTMENT
    equipment_id UUID REFERENCES equipment(equipment_id),
    category_id UUID REFERENCES equipment_categories(category_id),
    quantity INTEGER NOT NULL DEFAULT 1,
    from_location_id UUID REFERENCES locations(location_id),
    to_location_id UUID REFERENCES locations(location_id),
    reference_type VARCHAR(50), -- REQUEST, ASSIGNMENT, MAINTENANCE, PURCHASE_ORDER
    reference_id UUID, -- ID of the related record
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    notes TEXT,
    performed_by UUID REFERENCES users(user_id),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_transactions_equipment ON inventory_transactions(equipment_id);
CREATE INDEX idx_transactions_category ON inventory_transactions(category_id);
CREATE INDEX idx_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_transactions_location_from ON inventory_transactions(from_location_id);
CREATE INDEX idx_transactions_location_to ON inventory_transactions(to_location_id);
```

### 16. reservations
Equipment reservations for future dates

```sql
CREATE TABLE reservations (
    reservation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    category_id UUID NOT NULL REFERENCES equipment_categories(category_id),
    preferred_model VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1,
    reservation_start_date DATE NOT NULL,
    reservation_end_date DATE,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    -- Status: ACTIVE, FULFILLED, CANCELLED, EXPIRED
    priority INTEGER DEFAULT 0, -- For queue ordering
    request_created BOOLEAN DEFAULT FALSE,
    request_id UUID REFERENCES equipment_requests(request_id),
    fulfilled_date DATE,
    cancelled_date DATE,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_category ON reservations(category_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_start_date ON reservations(reservation_start_date);
```

### 17. notifications
User notification tracking

```sql
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    notification_type VARCHAR(50) NOT NULL,
    -- Types: REQUEST_SUBMITTED, REQUEST_APPROVED, REQUEST_REJECTED, EQUIPMENT_READY,
    --        EQUIPMENT_SHIPPED, MAINTENANCE_COMPLETE, RETURN_REMINDER, LOW_STOCK, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL', -- CRITICAL, HIGH, NORMAL, LOW
    channels JSONB, -- ["EMAIL", "IN_APP", "SMS", "PUSH"]
    related_entity_type VARCHAR(50), -- REQUEST, EQUIPMENT, TICKET, etc.
    related_entity_id UUID,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    sms_sent BOOLEAN DEFAULT FALSE,
    sms_sent_at TIMESTAMP,
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

### 18. notification_preferences
User notification preferences

```sql
CREATE TABLE notification_preferences (
    preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    notification_type VARCHAR(50) NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    digest_mode BOOLEAN DEFAULT FALSE, -- Daily digest vs real-time
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_type)
);

CREATE INDEX idx_preferences_user ON notification_preferences(user_id);
```

### 19. request_templates
Reusable request templates

```sql
CREATE TABLE request_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    template_type VARCHAR(50), -- ROLE_BASED, DEPARTMENT_BASED, CUSTOM
    applicable_role VARCHAR(50),
    applicable_department VARCHAR(100),
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(user_id),
    items JSONB NOT NULL, -- Array of equipment items with specifications
    estimated_total_cost DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_name ON request_templates(template_name);
CREATE INDEX idx_templates_type ON request_templates(template_type);
CREATE INDEX idx_templates_active ON request_templates(is_active);
```

### 20. equipment_transfers
Equipment transfers between employees

```sql
CREATE TABLE equipment_transfers (
    transfer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    equipment_id UUID NOT NULL REFERENCES equipment(equipment_id),
    from_user_id UUID NOT NULL REFERENCES users(user_id),
    to_user_id UUID NOT NULL REFERENCES users(user_id),
    transfer_type VARCHAR(50) NOT NULL, -- PERMANENT, TEMPORARY, PROJECT_BASED
    transfer_reason TEXT NOT NULL,
    requested_by UUID REFERENCES users(user_id),
    approved_by UUID REFERENCES users(user_id),
    status VARCHAR(50) DEFAULT 'PENDING',
    -- Status: PENDING, APPROVED, REJECTED, IN_PROGRESS, COMPLETED, CANCELLED
    transfer_date DATE,
    return_due_date DATE, -- For temporary transfers
    actual_return_date DATE,
    from_user_acceptance BOOLEAN DEFAULT FALSE,
    to_user_acceptance BOOLEAN DEFAULT FALSE,
    condition_at_transfer VARCHAR(20),
    transfer_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transfers_equipment ON equipment_transfers(equipment_id);
CREATE INDEX idx_transfers_from_user ON equipment_transfers(from_user_id);
CREATE INDEX idx_transfers_to_user ON equipment_transfers(to_user_id);
CREATE INDEX idx_transfers_status ON equipment_transfers(status);
```

### 21. audit_logs
System-wide audit trail

```sql
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- USER, EQUIPMENT, REQUEST, TICKET, etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    result VARCHAR(20), -- SUCCESS, FAILURE
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

### 22. system_settings
System configuration and settings

```sql
CREATE TABLE system_settings (
    setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50), -- STRING, NUMBER, BOOLEAN, JSON
    category VARCHAR(50), -- APPROVAL_WORKFLOW, NOTIFICATIONS, SLA, SECURITY
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON system_settings(setting_key);
CREATE INDEX idx_settings_category ON system_settings(category);
```

### 23. reports
Saved reports and report schedules

```sql
CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(100) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    -- Types: INVENTORY, ALLOCATION, MAINTENANCE, FINANCIAL, UTILIZATION, COMPLIANCE
    parameters JSONB, -- Report filters and parameters
    schedule VARCHAR(50), -- DAILY, WEEKLY, MONTHLY, QUARTERLY, ON_DEMAND
    recipients JSONB, -- Array of user IDs or email addresses
    format VARCHAR(20) DEFAULT 'PDF', -- PDF, EXCEL, CSV
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_schedule ON reports(schedule);
CREATE INDEX idx_reports_next_run ON reports(next_run_at);
```

### 24. physical_audits
Physical inventory audit tracking

```sql
CREATE TABLE physical_audits (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_number VARCHAR(50) UNIQUE NOT NULL,
    audit_type VARCHAR(50) DEFAULT 'FULL', -- FULL, PARTIAL, SPOT_CHECK
    location_id UUID REFERENCES locations(location_id),
    status VARCHAR(50) DEFAULT 'PLANNED',
    -- Status: PLANNED, IN_PROGRESS, COMPLETED, REPORTED
    planned_start_date DATE,
    actual_start_date DATE,
    completed_date DATE,
    auditor_id UUID REFERENCES users(user_id),
    expected_count INTEGER,
    actual_count INTEGER,
    discrepancies_count INTEGER DEFAULT 0,
    findings TEXT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audits_location ON physical_audits(location_id);
CREATE INDEX idx_audits_status ON physical_audits(status);
CREATE INDEX idx_audits_date ON physical_audits(planned_start_date);
```

### 25. audit_items
Individual items checked during physical audits

```sql
CREATE TABLE audit_items (
    audit_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES physical_audits(audit_id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(equipment_id),
    expected_status VARCHAR(50),
    actual_status VARCHAR(50),
    expected_location_id UUID REFERENCES locations(location_id),
    actual_location_id UUID REFERENCES locations(location_id),
    expected_condition VARCHAR(20),
    actual_condition VARCHAR(20),
    discrepancy_type VARCHAR(50), -- MISSING, EXTRA, STATUS_MISMATCH, LOCATION_MISMATCH, CONDITION_MISMATCH
    discrepancy_notes TEXT,
    resolution_action TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    audit_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_items_audit ON audit_items(audit_id);
CREATE INDEX idx_audit_items_equipment ON audit_items(equipment_id);
CREATE INDEX idx_audit_items_discrepancy ON audit_items(discrepancy_type);
```

---

## Views

### v_current_equipment_status
Real-time equipment status view

```sql
CREATE VIEW v_current_equipment_status AS
SELECT 
    e.equipment_id,
    e.asset_tag,
    e.serial_number,
    ec.category_name,
    e.manufacturer,
    e.model_name,
    e.status,
    e.condition_rating,
    l.location_name,
    u.first_name || ' ' || u.last_name AS assigned_to_name,
    u.employee_id AS assigned_to_employee_id,
    ea.assignment_date,
    ea.expected_return_date,
    e.purchase_date,
    e.current_value,
    e.warranty_end_date,
    CASE WHEN e.warranty_end_date >= CURRENT_DATE THEN TRUE ELSE FALSE END AS under_warranty,
    e.next_maintenance_due,
    CASE WHEN e.next_maintenance_due <= CURRENT_DATE THEN TRUE ELSE FALSE END AS maintenance_overdue
FROM equipment e
LEFT JOIN equipment_categories ec ON e.category_id = ec.category_id
LEFT JOIN locations l ON e.location_id = l.location_id
LEFT JOIN equipment_assignments ea ON e.equipment_id = ea.equipment_id AND ea.is_active = TRUE
LEFT JOIN users u ON ea.user_id = u.user_id
WHERE e.is_active = TRUE;
```

### v_pending_requests_summary
Summary of pending requests

```sql
CREATE VIEW v_pending_requests_summary AS
SELECT 
    er.request_id,
    er.request_number,
    u.first_name || ' ' || u.last_name AS requested_by_name,
    u.employee_id,
    u.department,
    er.request_type,
    er.priority,
    er.status,
    er.estimated_total_cost,
    COUNT(ri.item_id) AS items_count,
    er.created_at,
    CURRENT_TIMESTAMP - er.created_at AS age,
    approver.first_name || ' ' || approver.last_name AS current_approver_name
FROM equipment_requests er
JOIN users u ON er.requested_by = u.user_id
LEFT JOIN request_items ri ON er.request_id = ri.request_id
LEFT JOIN users approver ON er.current_approver_id = approver.user_id
WHERE er.status IN ('PENDING', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED')
GROUP BY er.request_id, u.first_name, u.last_name, u.employee_id, u.department, 
         approver.first_name, approver.last_name;
```

### v_maintenance_summary
Active maintenance tickets summary

```sql
CREATE VIEW v_maintenance_summary AS
SELECT 
    mt.ticket_id,
    mt.ticket_number,
    e.asset_tag,
    e.model_name,
    ec.category_name,
    mt.priority,
    mt.status,
    mt.ticket_type,
    reporter.first_name || ' ' || reporter.last_name AS reported_by_name,
    assignee.first_name || ' ' || assignee.last_name AS assigned_to_name,
    mt.opened_at,
    mt.sla_due_date,
    CASE WHEN mt.sla_due_date < CURRENT_TIMESTAMP THEN TRUE ELSE FALSE END AS sla_breached,
    mt.actual_cost
FROM maintenance_tickets mt
JOIN equipment e ON mt.equipment_id = e.equipment_id
LEFT JOIN equipment_categories ec ON e.category_id = ec.category_id
LEFT JOIN users reporter ON mt.reported_by = reporter.user_id
LEFT JOIN users assignee ON mt.assigned_to = assignee.user_id
WHERE mt.status NOT IN ('CLOSED', 'CANCELLED');
```

### v_inventory_summary
Inventory levels by category and location

```sql
CREATE VIEW v_inventory_summary AS
SELECT 
    ec.category_name,
    l.location_name,
    COUNT(*) FILTER (WHERE e.status = 'AVAILABLE') AS available_count,
    COUNT(*) FILTER (WHERE e.status = 'ASSIGNED') AS assigned_count,
    COUNT(*) FILTER (WHERE e.status = 'UNDER_MAINTENANCE') AS maintenance_count,
    COUNT(*) FILTER (WHERE e.status = 'DAMAGED') AS damaged_count,
    COUNT(*) AS total_count,
    SUM(e.current_value) AS total_value
FROM equipment e
JOIN equipment_categories ec ON e.category_id = ec.category_id
LEFT JOIN locations l ON e.location_id = l.location_id
WHERE e.is_active = TRUE AND e.status != 'RETIRED'
GROUP BY ec.category_name, l.location_name;
```

---

## Triggers

### Update timestamp trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (apply to all other tables with updated_at)
```

### Audit log trigger

```sql
CREATE OR REPLACE FUNCTION log_equipment_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO equipment_history (
            equipment_id, event_type, event_description, 
            from_status, to_status, performed_by
        ) VALUES (
            NEW.equipment_id, 'STATUS_CHANGED', 
            'Status changed from ' || OLD.status || ' to ' || NEW.status,
            OLD.status, NEW.status, NEW.updated_by
        );
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO equipment_history (
            equipment_id, event_type, event_description, performed_by
        ) VALUES (
            NEW.equipment_id, 'CREATED', 
            'Equipment created', NEW.created_by
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER equipment_audit_trigger
AFTER INSERT OR UPDATE ON equipment
FOR EACH ROW EXECUTE FUNCTION log_equipment_changes();
```

---

## Indexes Summary

All critical foreign keys and frequently queried columns have indexes defined above. Additional composite indexes may be added based on specific query patterns identified during performance testing.

---

## Data Retention Policy

```sql
-- Archive old data periodically
-- Audit logs: Retain for 7 years
-- Equipment history: Retain indefinitely
-- Notifications: Archive after 90 days
-- Closed tickets: Archive after 2 years
-- Completed requests: Archive after 3 years
```

---

## Sample Queries

### Get employee's current equipment
```sql
SELECT 
    e.asset_tag, e.model_name, ec.category_name, 
    ea.assignment_date, e.current_value
FROM equipment e
JOIN equipment_assignments ea ON e.equipment_id = ea.equipment_id
JOIN equipment_categories ec ON e.category_id = ec.category_id
WHERE ea.user_id = 'USER_UUID' AND ea.is_active = TRUE;
```

### Get pending approvals for a user
```sql
SELECT 
    er.request_number, u.first_name || ' ' || u.last_name AS requester,
    er.estimated_total_cost, ra.sla_due_date
FROM request_approvals ra
JOIN equipment_requests er ON ra.request_id = er.request_id
JOIN users u ON er.requested_by = u.user_id
WHERE ra.approver_id = 'USER_UUID' AND ra.status = 'PENDING'
ORDER BY ra.sla_due_date;
```

### Equipment lifecycle cost
```sql
SELECT 
    e.asset_tag, e.model_name,
    e.purchase_price,
    COALESCE(SUM(mt.actual_cost), 0) AS total_maintenance_cost,
    e.purchase_price + COALESCE(SUM(mt.actual_cost), 0) AS total_lifecycle_cost
FROM equipment e
LEFT JOIN maintenance_tickets mt ON e.equipment_id = mt.equipment_id
WHERE e.equipment_id = 'EQUIPMENT_UUID'
GROUP BY e.equipment_id;
```

---

This database schema provides a solid foundation for the EquipTrack system with proper normalization, indexing, and audit capabilities.
