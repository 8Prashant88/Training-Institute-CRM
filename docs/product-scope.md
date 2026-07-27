# Training Institute Lead and Enrollment CRM

## Problem

Training institutes receive inquiries from website forms, calls, messages,
walk-ins, and social media. Without a centralized system, follow-ups may be
missed, lead ownership becomes unclear, and conversion data becomes difficult
to track.

## Primary Users

### Administrator

- Manage counselors
- Manage courses and batches
- View all leads
- Assign leads
- View reports
- Convert qualified leads into enrollments

### Counselor

- View assigned leads
- Update lead status
- Add follow-up notes
- Set next follow-up date
- Convert eligible leads into enrollments

### Public Visitor

- Submit an inquiry

## Main Workflow

Public inquiry
→ lead created
→ counselor assigned
→ counselor contacts lead
→ follow-up notes added
→ lead status updated
→ lead converted
→ enrollment created

## Version 1 Features

- Public inquiry form
- Login and logout
- Admin and counselor roles
- Lead list and lead details
- Counselor assignment
- Follow-up notes
- Follow-up dates
- Course management
- Batch management
- Lead-to-enrollment conversion
- Search and filtering
- Dashboard statistics
- CSV export

## Explicitly Excluded

- Payment gateway
- Attendance
- Certificates
- Payroll
- Online classes
- Complex drag-and-drop pipeline
- Microservices
- Mobile application during the first three weeks

## User Stories

- As a visitor, I want to submit an inquiry so the academy can contact me.
- As an administrator, I want to assign a lead to a counselor.
- As a counselor, I want to record every follow-up.
- As a counselor, I want to see follow-ups due today.
- As an administrator, I want to create courses and batches.
- As an administrator, I want to convert a qualified lead into an enrollment.
- As an administrator, I want to see lead and enrollment statistics.

### Inquiry Submission Acceptance Criteria

- Full name is required.
- Phone number is required.
- Interested course is required.
- Email is optional.
- Invalid input is rejected.
- A valid submission creates exactly one lead.
- A successful submission displays confirmation.
- A database or server failure displays a safe error message.