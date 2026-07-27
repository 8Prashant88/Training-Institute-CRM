# Initial Data Model

## User

- id
- fullName
- email
- role
- createdAt
- updatedAt

## Lead

- id
- fullName
- phone
- email
- interestedCourseId
- source
- status
- assignedCounselorId
- nextFollowUpAt
- createdAt
- updatedAt

## LeadNote

- id
- leadId
- authorId
- note
- createdAt

## Course

- id
- title
- duration
- status
- createdAt
- updatedAt

## Batch

- id
- courseId
- title
- capacity
- startDate
- endDate
- status

## Enrollment

- id
- leadId
- batchId
- enrolledAt
- status