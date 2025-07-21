# DocSpace - Setup Guide

This guide will walk you through setting up the DocSpace application for local development.

## 1. Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v16 or higher
- **Bun**: latest version
- **Git**

## 2. Firebase Setup

### Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  Enable **Email/Password** authentication in the **Authentication > Sign-in method** tab.
3.  Create a **Firestore Database** in test mode. We'll add security rules later.

### Get Firebase Credentials

1.  In your Firebase project, go to **Project Settings** > **General**.
2.  Under "Your apps", click the web icon (`</>`) to create a new web app.
3.  Copy the `firebaseConfig` object. You'll need this for the frontend.

## 3. Project Installation

### Clone the Repository

```bash
git clone <repository-url>
cd DocSpace
```

### Install Dependencies

```bash
# Install frontend dependencies
cd frontend && bun install

# Install backend dependencies
cd ../backend && bun install
```

## 4. Environment Configuration

### Frontend

Create a `firebaseConfig.json` file in `frontend/src/config/` and paste the `firebaseConfig` object you copied from the Firebase console:

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_STORAGE_BUCKET",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

### Backend

The backend uses the Firebase Admin SDK and requires a service account.

1.  In your Firebase project, go to **Project Settings** > **Service accounts**.
2.  Click **Generate new private key** to download a service account JSON file.
3.  **Do not commit this file to Git.**

## 5. Running the Application

### Start the Backend

```bash
# From the backend/ directory
bun start
```

The backend will be available at `http://localhost:5000`.

### Start the Frontend

```bash
# From the frontend/ directory
bun dev
```

The frontend will be available at `http://localhost:5173`.

## 6. Firestore Security Rules

For production, it's important to secure your Firestore database. Here are some basic security rules to get you started:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /docs/{docId} {
      allow read, write: if request.auth != null && request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
    }
  }
}
```

These rules ensure that only authenticated users can create documents and that only members of a document can read or write to it.