# Multi-Tenant Dynamic & Static Code Generation System

## Objective

Implement a scalable multi-tenant code generation system where each organization can configure entity codes as either:

- Dynamic (Auto Generated)
- Static (Manual Entry)

Supported entities:

- Areas
- Brands
- Categories
- Items
- Orders
- Returns
- Salesmen
- Routes
- UOM
- Warehouses

The system must:

- Prevent duplicate codes under concurrency
- Support organization-specific formatting
- Be reusable across entities
- Be transaction-safe
- Support future extensibility

---

# Architecture Overview

The implementation will use a centralized configuration-driven architecture where each organization maintains separate code generation settings per component.

The system will support:

- Dynamic code generation
- Manual/static code entry
- Prefix configuration
- Padding configuration
- Sequence tracking
- Concurrency-safe increments

---

# Backend (om-laravel)

## Database Design

### New Table: code_settings

A normalized configuration table will store all code generation settings.

Each row represents:

- One organization
- One component

This structure is preferred over multiple component-specific columns because it is:

- Scalable
- Maintainable
- Easier to extend
- Cleaner to query

---

## Table Fields

### Identification

- id
- organisation_id
- component

### Configuration

- is_auto
- prefix
- separator
- padding
- starting_number

### Sequence Tracking

- current_number

### Metadata

- timestamps
- soft deletes

---

## Supported Components

- area
- brand
- category
- item
- order
- return
- salesman
- route
- uom
- warehouse

---

# Concurrency Handling

The system will use database-level row locking during sequence generation to prevent duplicate codes in high-concurrency scenarios.

The sequence update process will:

- Run inside a database transaction
- Lock the relevant configuration row
- Increment the sequence atomically
- Return the generated code safely

This ensures:

- No duplicate codes
- Sequential generation
- Queue safety
- Multi-server compatibility

---

# Database Constraints

All entity tables must enforce unique constraints using:

- organisation_id
- code

This prevents:

- Manual duplicates
- Import conflicts
- Race-condition edge cases
- Invalid direct database inserts

---

# Service Layer

## New Service: CodeGenerationService

A centralized service will handle all code generation logic.

### Responsibilities

- Load organization configuration
- Validate component settings
- Handle transactions
- Apply locking
- Increment sequences
- Format generated codes
- Return final generated values

---

# Code Formatting Support

The system will support configurable formatting options including:

- Prefixes
- Separators
- Zero-padding
- Starting numbers

Example formats:

- ITEM-0001
- BR-1001
- ORD/2026/00001

---

# Component Configuration Strategy

Each component can independently operate in:

## Dynamic Mode

- Code generated automatically
- Input field disabled on frontend
- Backend ignores manually submitted values

## Static Mode

- User manually enters code
- Backend validates uniqueness
- Frontend input remains editable

---

# Trait-Based Integration

## New Trait: HasGeneratedCode

Reusable trait for all supported models.

### Responsibilities

- Detect organization settings
- Generate code automatically when required
- Avoid overwriting manually supplied codes
- Keep model integration lightweight

---

# Caching Strategy

Configuration settings will be cached to reduce database reads.

Only configuration data will be cached.

Sequence counters will never be cached.

Cache invalidation will occur whenever settings are updated.

---

# API Design

## Configuration Endpoints

### Get Settings

Returns all component configurations for an organization.

### Update Settings

Updates configuration for a specific component.

### Preview Next Code

Returns the next generated code preview without incrementing the sequence.

---

# Frontend (om-ionic)

## New Component: CodeConfigModal.tsx

Configuration modal for managing:

- Dynamic/Static mode
- Prefix
- Padding
- Starting number
- Separator

---

# Organisation Settings Screen

A new section will be added to manage code generation settings for all supported components.

Components include:

- Areas
- Brands
- Categories
- Items
- Orders
- Returns
- Salesmen
- Routes
- UOM
- Warehouses

---

# Create Form Enhancements

All create forms will support dynamic behavior based on configuration.

---

## Dynamic Mode Behavior

- Code field becomes read-only
- Auto-generated preview displayed
- Code automatically assigned during save

---

## Static Mode Behavior

- Code field remains editable
- User manually enters code
- Validation enforced during submission

---

# Preview Functionality

The frontend will prefetch and display the next generated code when dynamic mode is enabled.

The preview endpoint will:

- Not increment the sequence
- Only simulate the next value

---

# Organization Initialization

When a new organization is created:

- Default code settings will automatically be seeded
- All supported components will receive default configurations

Default mode:

- Static/manual entry

---

# Audit Logging

The system should track configuration changes including:

- Mode changes
- Prefix updates
- Sequence resets
- Padding changes

Audit logs should include:

- User who made the change
- Previous value
- Updated value
- Timestamp

---

# Sequence Gap Handling

Sequence gaps may occur if:

- Code generated successfully
- Entity creation fails afterward

Example:

- ITEM-0005
- ITEM-0006 (missing)
- ITEM-0007

This behavior is acceptable and recommended because preventing gaps introduces:

- Longer lock durations
- Higher deadlock risk
- Reduced scalability
- Complex rollback handling

---

# Queue Compatibility

The architecture is fully queue-safe.

The same locking and transaction mechanisms will work correctly for:

- Queued jobs
- Background processing
- Bulk imports
- API bursts

---

# Verification Plan

# Automated Tests

## Unit Tests

Validate:

- Prefix formatting
- Padding behavior
- Separator handling
- Sequence generation

---

## Feature Tests

Validate:

- Dynamic generation
- Static/manual entry
- Validation rules
- Organization isolation

---

## Concurrency Tests

Simulate multiple simultaneous requests to ensure:

- No duplicate codes
- Correct sequence ordering
- Transaction safety

---

## Multi-Tenant Tests

Verify organizations maintain independent sequences.

Example:

- ORG-1 => ITEM-0001
- ORG-2 => ITEM-0001

Both should be valid.

---

## Failure Recovery Tests

Validate rollback scenarios and ensure:

- No duplicate generation
- Stable sequence handling
- Safe transaction recovery

---

# Manual Verification

## Dynamic Configuration Test

1. Navigate to Organization Settings
2. Set "Items" to Dynamic
3. Configure:
   - Prefix: ITEM-
   - Starting Number: 1000
4. Create a new Item

Expected Result:

- ITEM-1001 appears automatically
- Code field is read-only

---

## Static Configuration Test

1. Set "Brands" to Static
2. Create a new Brand

Expected Result:

- Code field remains editable
- Validation enforced on submit

---

## Multi-Organization Verification

Verify different organizations can maintain separate configurations and sequences for the same component.

---

# Future Enhancements

The architecture is designed to support future extensions including:

- Year-based sequences
- Branch-level sequences
- Custom format templates
- Component-specific formatting rules
- Resettable yearly counters
- Advanced pattern builders

Examples:

- INV-2026-0001
- MUM-ITEM-0001
- ORD/{YEAR}/{NUMBER}

---

# Final Recommendation

The proposed implementation provides:

- Enterprise-safe concurrency handling
- Scalable configuration architecture
- Reusable code generation flow
- Multi-tenant isolation
- Future extensibility
- Maintainable frontend integration

This approach is production-ready and significantly more scalable than a column-based configuration structure.