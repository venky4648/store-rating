# Store Rating Backend API

A Node.js backend for user authentication, store management, and store ratings using Express and Sequelize (PostgreSQL).

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
  - [Auth](#auth)
  - [Users](#users)
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
│   ├── authController.js
│   ├── ratingController.js
│   ├── storeController.js
│   └── userController.js
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
│   ├── ratingRoutes.js
│   └── userRoutes.js
├── utils/
│   └── logger.js
├── .env
├── index.js
├── package.json
└── Readme.md
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
   PORT=8000
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

#### Get Authenticated User Profile

- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "_id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "role": "Normal User",
    "createdAt": "2024-07-10T12:00:00.000Z",
    "updatedAt": "2024-07-10T12:00:00.000Z"
  }
  ```

---

### Users (System Administrator Only)

- **GET** `/api/users`  
  - **Headers:** `Authorization: Bearer <admin-token>`
  - **Response:**
    ```json
    {
      "success": true,
      "users": [
        {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "address": "123 Main St",
          "role": "Normal User",
          "createdAt": "...",
          "updatedAt": "..."
        }
      ]
    }
    ```

- **GET** `/api/users/:id`  
  - **Headers:** `Authorization: Bearer <admin-token>`
  - **Response:** Same as above, but for a single user.

- **PUT** `/api/users/:id`  
  - **Headers:** `Authorization: Bearer <admin-token>`
  - **Body:** (any updatable fields)
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "address": "456 Main St",
      "role": "Store Owner"
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "message": "User updated successfully",
      "user": { ...updatedUser }
    }
    ```

- **DELETE** `/api/users/:id`  
  - **Headers:** `Authorization: Bearer <admin-token>`
  - **Response:**
    ```json
    {
      "success": true,
      "message": "User deleted successfully"
    }
    ```

---

### Stores

- **GET** `/api/stores`  
  Returns a list of stores.
  - **Response:**
    ```json
    {
      "success": true,
      "stores": [
        {
          "id": "store-uuid",
          "name": "Store Name",
          "email": "store@email.com",
          "address": "Address",
          "averageRating": "4.50",
          "userId": "owner-uuid",
          "createdAt": "...",
          "updatedAt": "...",
          "owner": {
            "id": "owner-uuid",
            "name": "Owner Name",
            "email": "owner@email.com"
          }
        }
      ]
    }
    ```

- **GET** `/api/stores/:id`  
  Returns a single store by ID.

- **POST** `/api/stores`  
  (Requires authentication as Store Owner or System Administrator)
  - **Body:**
    ```json
    {
      "name": "New Store",
      "email": "store@email.com",
      "address": "Address"
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "message": "Store created successfully",
      "store": { ...store }
    }
    ```

- **PUT** `/api/stores/:id`  
  (Requires authentication as Store Owner or System Administrator)
  - **Body:** (any updatable fields)
  - **Response:** Same as POST.

- **DELETE** `/api/stores/:id`  
  (Requires authentication as Store Owner or System Administrator)
  - **Response:**
    ```json
    {
      "success": true,
      "message": "Store deleted successfully"
    }
    ```

---

### Ratings

- **GET** `/api/ratings`  
  Returns all ratings (public).
  - **Response:**
    ```json
    [
      {
        "id": "rating-uuid",
        "userId": "user-uuid",
        "storeId": "store-uuid",
        "rating": 4,
        "comment": "Great store!",
        "createdAt": "...",
        "updatedAt": "...",
        "rater": {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "ratedStore": {
          "id": "store-uuid",
          "name": "Store Name",
          "address": "Address"
        }
      }
    ]
    ```

- **GET** `/api/ratings/:id`  
  Returns a single rating by ID.

- **GET** `/api/ratings/store/:storeId`  
  Returns all ratings for a specific store.

- **POST** `/api/ratings`  
  (Requires authentication)
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
      "message": "Rating created successfully",
      "rating": { ...rating }
    }
    ```

- **PUT** `/api/ratings/:id`  
  (Requires authentication, only rating owner)
  - **Body:** (any updatable fields)
  - **Response:**
    ```json
    {
      "message": "Rating updated successfully",
      "rating": { ...updatedRating }
    }
    ```

- **DELETE** `/api/ratings/:id`  
  (Requires authentication, only rating owner or System Administrator)
  - **Response:**
    ```json
    {
      "message": "Rating deleted successfully."
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
- `email`
- `address`
- `averageRating`
- `userId` (User UUID, owner)

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
- Only System Administrators can access user management routes.

---

##