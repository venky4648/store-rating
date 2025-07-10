# Store Rating Backend API

A Node.js backend for user authentication, store management, and store ratings using Express and Sequelize (PostgreSQL).

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
  - [Auth](#auth)
  - [Stores](#stores)
  - [Ratings](#ratings)
- [Models](#models)
- [Notes](#notes)

---

## Features

- User registration and login with JWT authentication
- Role-based access (Normal User, Store Owner, System Administrator)
- Store CRUD operations
- Users can rate stores (one rating per user per store)
- Sequelize ORM with PostgreSQL

---

## Project Structure

```
backend/
│
├── config/
│   └── database.js
├── controllers/
│   └── authController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── User.js
│   ├── Store.js
│   ├── Rating.js
│   └── associations.js
├── routes/
│   ├── authRoutes.js
│   ├── storeRoutes.js
│   └── ratingRoutes.js
└── index.js
```

---

## Setup

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**  
   Create a `.env` file in `backend/`:
   ```
   PORT=5000
   JWT_SECRET=your_jwt_secret
   DATABASE_URL=your_postgres_connection_string
   ```
4. **Run the server**
   ```bash
   npm start
   ```

---

## API Endpoints

### Auth

#### Register

- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "yourpassword",
    "address": "123 Main St",
    "role": "Normal User"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "_id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Normal User",
    "token": "jwt_token"
  }
  ```

#### Login

- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "yourpassword"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "_id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Normal User",
    "token": "jwt_token"
  }
  ```

---

### Stores

- **GET** `/api/stores`  
  Returns a list of stores.

- **POST** `/api/stores`  
  (Requires authentication and appropriate role)

---

### Ratings

- **POST** `/api/ratings`
  - **Headers:** `Authorization: Bearer <token>`
  - **Body:**
    ```json
    {
      "storeId": "store-uuid",
      "rating": 4,
      "comment": "Great store!"
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "message": "Rating submitted successfully",
      "rating": {
        "id": "rating-uuid",
        "userId": "user-uuid",
        "storeId": "store-uuid",
        "rating": 4,
        "comment": "Great store!"
      }
    }
    ```

---

## Models

### User

- `id` (UUID)
- `name`
- `email`
- `password`
- `address`
- `role` (Normal User, Store Owner, System Administrator)

### Store

- `id` (UUID)
- `name`
- `address`
- `ownerId` (User UUID)

### Rating

- `id` (UUID)
- `userId` (User UUID)
- `storeId` (Store UUID)
- `rating` (integer)
- `comment` (string)

---

## Notes

- All protected routes require a JWT token in the `Authorization` header.
- A user can only rate a specific store once (enforced by a unique index on `user_id` + `store_id`).
- Use consistent file casing for imports (e.g., always `User.js`).

---

## License

MIT