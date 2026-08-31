-- EquipTrack Database Initialization Script
-- This script creates the initial database schema for the EquipTrack system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables in the correct order (respecting foreign key constraints)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    job_title VARCHAR(100),
    manager_id UUID REFERENCES users(user_id),
    location_id UUID,
    employment_status VARCHAR(20) DEFAULT 'ACTIVE',
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

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    equipment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_tag VARCHAR(50) UNIQUE NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    category_id UUID NOT NULL,
    manufacturer VARCHAR(100),
    model_name VARCHAR(100) NOT NULL,
    model_number VARCHAR(100),
    specifications JSONB,
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    current_value DECIMAL(10,2),
    vendor_id UUID,
    warranty_start_date DATE,
    warranty_end_date DATE,
    warranty_type VARCHAR(50),
    location_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    condition_rating VARCHAR(20),
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    qr_code TEXT,
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

-- Equipment Requests table
CREATE TABLE IF NOT EXISTS equipment_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    requested_by UUID NOT NULL REFERENCES users(user_id),
    request_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'STANDARD',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    business_justification TEXT NOT NULL,
    preferred_delivery_date DATE,
    estimated_total_cost DECIMAL(10,2),
    is_template_used BOOLEAN DEFAULT FALSE,
    template_name VARCHAR(100),
    bulk_request_id UUID,
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

-- Equipment Assignments table
CREATE TABLE IF NOT EXISTS equipment_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(equipment_id),
    user_id UUID NOT NULL REFERENCES users(user_id),
    request_id UUID REFERENCES equipment_requests(request_id),
    assignment_type VARCHAR(50) DEFAULT 'PERMANENT',
    assigned_by UUID NOT NULL REFERENCES users(user_id),
    assignment_date DATE NOT NULL,
    expected_return_date DATE,
    actual_return_date DATE,
    delivery_method VARCHAR(50),
    tracking_number VARCHAR(100),
    courier_service VARCHAR(100),
    assignment_condition VARCHAR(20),
    assignment_checklist JSONB,
    assignment_photos JSONB,
    acceptance_status VARCHAR(50) DEFAULT 'PENDING',
    acceptance_date TIMESTAMP,
    acceptance_signature TEXT,
    acceptance_notes TEXT,
    acceptance_photos JSONB,
    return_initiated BOOLEAN DEFAULT FALSE,
    return_scheduled_date DATE,
    return_method VARCHAR(50),
    return_condition VARCHAR(20),
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

-- Maintenance Tickets table
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    equipment_id UUID NOT NULL REFERENCES equipment(equipment_id),
    reported_by UUID REFERENCES users(user_id),
    assigned_to UUID REFERENCES users(user_id),
    ticket_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    category VARCHAR(50),
    issue_description TEXT NOT NULL,
    steps_to_reproduce TEXT,
    troubleshooting_attempted TEXT,
    issue_photos JSONB,
    diagnosis TEXT,
    resolution TEXT,
    resolution_photos JSONB,
    requires_vendor BOOLEAN DEFAULT FALSE,
    vendor_id UUID,
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

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_equipment_asset_tag ON equipment(asset_tag);
CREATE INDEX idx_equipment_serial ON equipment(serial_number);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_category ON equipment(category_id);

CREATE INDEX idx_requests_number ON equipment_requests(request_number);
CREATE INDEX idx_requests_user ON equipment_requests(requested_by);
CREATE INDEX idx_requests_status ON equipment_requests(status);

CREATE INDEX idx_assignments_equipment ON equipment_assignments(equipment_id);
CREATE INDEX idx_assignments_user ON equipment_assignments(user_id);
CREATE INDEX idx_assignments_active ON equipment_assignments(is_active);

CREATE INDEX idx_tickets_number ON maintenance_tickets(ticket_number);
CREATE INDEX idx_tickets_equipment ON maintenance_tickets(equipment_id);
CREATE INDEX idx_tickets_status ON maintenance_tickets(status);

-- Insert demo data

-- Admin user (password: Admin123!)
INSERT INTO users (user_id, employee_id, email, first_name, last_name, role, department, password_hash, employment_status)
VALUES (
    uuid_generate_v4(),
    'EMP001',
    'admin@equiptrack.com',
    'System',
    'Administrator',
    'SYSTEM_ADMIN',
    'IT',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIJU8U8tle', -- Admin123!
    'ACTIVE'
);

COMMIT;
