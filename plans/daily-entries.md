# Staff Member - View Shifts and Daily Entries

## Overview
**Screens:** 
- Staff Member Portal: Shifts Tab
- Submit Daily Entry Popup
- View Daily Entry Popup

## Daily Entry Statuses

| Status | Description |
|--------|-------------|
| **Not Submitted** | Not submitted by Worker yet |
| **Pending Approval** | Submitted by Worker and awaiting approval from Supervisor |
| **Pending Re-approval** | Edited by Admin and requires re-approval by Supervisor |
| **Approved** | Approved by Supervisor |
| **Paid** | Compiled in timesheet and paid out |

## Shift List View

Staff Members can view the full list of their shifts sorted by start date in descending order.

### Shift Information Displayed
- Type (Labour or Container)
- Supervisor full name
- Shift date
- Start and end time
- Number of hours worked
- Daily entry status (see **Daily Entry Statuses**)

### Filtering Options
Filter by the following fields:
- **Type** (dropdown: Labour, Container)
- **Shift date** (date range)
- **Daily entry status** (dropdown: all daily entry statuses)

## Submit Daily Entry

Submit daily entry in a popup:

### Fields
- **Number of hours** (number)
  - Note: If the Worker did not work that day, they should submit 0
- **Worker note** (text; optional)

## View Daily Entry

If a daily entry has been submitted, view entry in a popup:

### Information Displayed
- Daily entry status
- Number of hours
  - Note: If the Supervisor edited the number of hours, a "Edited by [Supervisor name]" will be shown
- Worker note
- Supervisor note
- Admin note