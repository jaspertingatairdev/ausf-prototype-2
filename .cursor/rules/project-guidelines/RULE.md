---
description: "Core guidelines for this clickable prototype project - enforces browser-only data storage and local-first architecture"
alwaysApply: true
---

# Project Guidelines

## Project Type
This is a **clickable prototype** for demonstration and testing purposes.

## Data Storage Rules
- **All data must be stored locally in the browser**
- Use browser storage APIs such as:
  - `localStorage` for persistent data
  - `sessionStorage` for temporary session data
  - IndexedDB for more complex data structures if needed
- **DO NOT** make backend API calls for data persistence
- **DO NOT** integrate with external databases or services for storing data
- All data operations (create, read, update, delete) should be handled through browser-based storage only

## Implementation Guidelines
- Simulate data persistence using browser storage mechanisms
- Mock any API responses or external data sources
- Keep the prototype self-contained and runnable entirely in the browser
- Focus on user experience and interface interactions rather than actual backend integration






