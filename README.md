# Instant Messaging MVP

A beginner-friendly real-time instant messenger built with Node.js, Express, Socket.IO, and vanilla JavaScript.

## What the app does

This project provides a single global chat room where connected users can:
- Join with a display name
- Exchange messages in real time
- See who is online
- See join/leave system events
- See typing indicators
- View message timestamps

## Tech stack

- **Backend:** Node.js, Express, Socket.IO
- **Frontend:** HTML, CSS, vanilla JavaScript

## Project structure

- `/home/runner/work/Instant-messaging-/Instant-messaging-/server.js`
- `/home/runner/work/Instant-messaging-/Instant-messaging-/public/index.html`
- `/home/runner/work/Instant-messaging-/Instant-messaging-/public/style.css`
- `/home/runner/work/Instant-messaging-/Instant-messaging-/public/app.js`
- `/home/runner/work/Instant-messaging-/Instant-messaging-/package.json`
- `/home/runner/work/Instant-messaging-/Instant-messaging-/.gitignore`

## Setup and run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open your browser at:
   ```
   http://localhost:3000
   ```

Use two browser windows/tabs with different display names to test live messaging.

## Environment variable

- `PORT` (optional): server port (defaults to `3000`)

## Scripts

- `npm start` - run the app
- `npm run dev` - run the app (same command, simple local workflow)

## Optional future improvements

- Private/direct messages
- Multiple chat rooms
- Message persistence with a database
- Authentication and avatars
- Read receipts and delivery status
