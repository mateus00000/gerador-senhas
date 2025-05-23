# Password Generator Backend

A simple backend API for the Password Generator mobile app that handles user authentication and password item management.

## Features

- User authentication (signup, signin) with JWT
- Password item management (create, list, delete)
- SQLite database storage
- UUID generation for IDs
- Password encryption

## Setup

1. Install dependencies:
```
npm install
```

2. Create a `.env` file in the root of the backend folder with the following content:
```
PORT=3000
JWT_SECRET=your_super_secret_key_change_me_in_production
```

3. Start the server:
```
npm start
```

Or for development with auto-reload:
```
npm run dev
```

## Password Encryption

As of the latest update, all passwords stored in the database are now encrypted using AES-256-CBC encryption. This ensures that passwords are securely stored and cannot be read directly from the database.

### Encryption Key

The encryption key is stored in the `.env` file as `ENCRYPTION_KEY`. This key is automatically generated when you first run `npm install` through the `createEnv.js` script.

### Handling Existing Data

If you had password items stored in the database before this update, they will not be encrypted. The backend will attempt to decrypt them when fetching, which will cause errors. You have two options:

1. Clear your existing items and create new ones (recommended).
2. If you want to keep your existing items, you'll need to manually update them in the database with encrypted versions.

### Recreating the .env File

If you ever need to recreate the `.env` file, you can run:

```bash
node createEnv.js
```

**Important Note:** If you recreate the `.env` file, a new encryption key will be generated, and you won't be able to decrypt previously encrypted passwords. If you need to preserve your existing encrypted passwords, make sure to backup your existing `.env` file before regenerating it.

## API Endpoints

### Authentication

- `POST /api/signup` - Register a new user
  - Payload: `{ email, name, password, confirmPassword }`
  - Response: `{ token }`

- `POST /api/signin` - Login existing user
  - Payload: `{ email, password }`
  - Response: `{ token }`

### Password Items

- `POST /api/item` - Create a new password item
  - Headers: `Authorization: Bearer <token>`
  - Payload: `{ name, password }`
  - Response: `{ id, name, message }`

- `GET /api/items` - Get all password items for the logged-in user
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of items

- `DELETE /api/item/:id` - Delete a password item by ID
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message }` 