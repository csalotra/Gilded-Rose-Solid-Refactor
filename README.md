# Gilded Rose Refactoring

A production-grade refactoring of the classic Gilded Rose inventory problem.
This repository demonstrates how legacy code can be transformed into a clean,
extensible, and testable design using SOLID principles and comprehensive unit tests.

---

## Problem Overview

An inventory system manages grocery items that degrade in quality over time.
Each item has:

- `name`: name of the item
- `sellIn`: number of days remaining to sell the item
- `quality`: value of the item

At the end of each day, the system updates both values according to defined business rules.

The challenge is to extend the existing behavior while preserving all current logic
and improving the codebase for maintainability and scalability.

---

## Business Rules

### General Rules
- Quality decreases as items approach their sell-by date
- Once the sell-by date has passed, quality degrades twice as fast
- Quality is never negative
- Quality never exceeds 25

### Special Items
- **Cheddar Cheese**
  - Increases in quality over time
  - Increases twice as fast after the sell-by date

- **Instant Ramen**
  - Quality never changes
  - Sell-in value never decreases

### Organic Items
- Degrade in quality twice as fast as normal items
- After the sell-by date, degrade four times as fast

### Expiration Rule
- Any item that is **5 days past its sell-by date** is removed from inventory

---

## Design Approach

This solution focuses on refactoring legacy logic into a clean, extensible design.

### Key Principles Applied
- **Single Responsibility Principle**
- **Open / Closed Principle**
- **Strategy Pattern for item behavior**
- **Centralized quality constraints**
- **Defensive copying to prevent external mutation**

### Architecture Overview
- `Item` – data model
- `ItemUpdater` – behavior contract
- `BaseUpdater` – shared logic and invariants
- Specialized updaters for each item category
- `StoreInventory` – orchestration and lifecycle management

New item types can be added without modifying existing update logic.

---

## Testing

- Unit tests are written using **Chai**
- All business rules are covered
- Edge cases and boundary conditions are validated
- Tests protect against regressions during refactoring

---
