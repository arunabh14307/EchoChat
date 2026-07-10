# Database Configuration & Models Summary

This folder is created to organize and track **database configurations, exports, and backup dumps**.

### 🗄️ Connected Database: MongoDB
* Connection details: Handled via Mongoose schemas inside [backend/src/models/](file:///c:/Users/arunabh%20singh/Desktop/EchoChat/backend/src/models/).
* Mapped schemas:
  1. `User.model.js` — stores profile settings, passwords, and notification rules.
  2. `Conversation.model.js` — stores 1-on-1 private rooms and groups.
  3. `Message.model.js` — stores text timeline items and attachment maps.
  4. `Notification.model.js` — stores notification history logs.
  5. `RefreshToken.model.js` — logs session tokens.

### 💾 Database Backups
* You can export your local MongoDB collections to this folder using:
  ```bash
  mongodump --db=echochat --out=./database/backups
  ```
