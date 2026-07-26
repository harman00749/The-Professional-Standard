# The Data Storm API

Sprint 10 Track B project: a Node.js and Express API upgraded from in-memory arrays to persistent MongoDB Atlas storage using Mongoose ODM.

Sprint 11 adds CORS support for React/Vite clients and multipart image upload handling with Multer and Cloudinary.

## Tech Stack

- JavaScript
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose ODM
- dotenv
- cors
- multer
- Cloudinary
- Postman for API testing

## Sprint 10 Requirements Covered

| Requirement | Status |
| --- | --- |
| Install Mongoose | Done |
| Connect Express to MongoDB Atlas | Done via `config/db.js` |
| Post schema with strict types | Done in `models/Post.js` |
| Deprecate mock array logic | Done |
| `POST /posts` with `Post.create()` | Done |
| `GET /posts` with `Post.find()` | Done |
| `DELETE /posts/:id` with `Post.findByIdAndDelete()` | Done |
| User schema | Done in `models/User.js` |
| `authorId` relationship | Done |
| `.populate()` author payload | Done |
| Top 3 most recent posts route | Done at `GET /posts/top/recent` |
| CORS configured for React client | Done via `CLIENT_ORIGIN` |
| Multipart post creation | Done via `multer` |
| Cloud asset URL storage | Done with optional `imageUrl` |

## MongoDB Atlas Setup

1. Create a free MongoDB Atlas cluster.
2. Create a database user.
3. Add your current IP address in Network Access.
4. Click Connect, choose Drivers, choose Node.js, and copy the connection string.
5. Create a `.env` file from `.env.example`.
6. Replace `<username>`, `<password>`, and `<cluster-url>` with your Atlas values.

Example:

```env
PORT=5000
MONGODB_URI=mongodb+srv://harman:YOUR_PASSWORD@data-storm-cluster.xxxxx.mongodb.net/data-storm-api?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Do not commit your real `.env` file.

## Run Locally

```bash
npm install
npm run dev
```

Server:

```txt
http://localhost:5000
```

Health/info route:

```txt
GET http://localhost:5000/
```

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | API health/info route |
| POST | `/users` | Create an author user |
| GET | `/users` | Fetch all users |
| DELETE | `/users/:id` | Delete one user and their posts |
| POST | `/posts` | Create a post in MongoDB |
| GET | `/posts` | Fetch all posts with populated author |
| GET | `/posts/top/recent` | Fetch top 3 most recent posts |
| GET | `/posts/:id` | Fetch one post |
| PUT | `/posts/:id` | Update one post |
| DELETE | `/posts/:id` | Delete one post |
| POST | `/login` | Return a mock JWT token |

## Postman Request Bodies

Use Postman with the server running at:

```txt
http://localhost:5000
```

Select `Body -> raw -> JSON` for every POST/PUT request.

### 1. GET /

URL:

```txt
http://localhost:5000/
```

Expected output:

```json
{
  "message": "The Data Storm API is running",
  "sprint": "Sprint 10 - The Data Storm",
  "track": "Track B - Fullstack Developers",
  "database": "connected"
}
```

### 2. POST /users

URL:

```txt
http://localhost:5000/users
```

Body:

```json
{
  "name": "Harman",
  "email": "harman@example.com"
}
```

Expected output:

```json
{
  "message": "User created successfully",
  "data": {
    "_id": "MONGODB_USER_ID",
    "name": "Harman",
    "email": "harman@example.com"
  }
}
```

If the same email already exists, the API returns:

```json
{
  "message": "User with this email already exists"
}
```

### 3. GET /users

URL:

```txt
http://localhost:5000/users
```

Expected output:

```json
{
  "message": "Users fetched successfully",
  "count": 1,
  "data": [
    {
      "_id": "MONGODB_USER_ID",
      "name": "Harman",
      "email": "harman@example.com"
    }
  ]
}
```

### 4. DELETE /users/:id

Use the `_id` from a created user.

URL:

```txt
http://localhost:5000/users/PASTE_USER_ID_HERE
```

Expected output:

```json
{
  "message": "User deleted successfully",
  "deletedId": "MONGODB_USER_ID",
  "deletedPostsCount": 1
}
```

This also deletes posts created by that user.

### 5. POST /posts

Recommended body for the demo:

```json
{
  "title": "Sprint 10 Backend",
  "content": "This post is stored permanently in MongoDB Atlas.",
  "author": {
    "name": "Harman",
    "email": "harman@example.com"
  }
}
```

Expected output:

```json
{
  "message": "Post created successfully",
  "data": {
    "_id": "MONGODB_POST_ID",
    "title": "Sprint 10 Backend",
    "content": "This post is stored permanently in MongoDB Atlas.",
    "authorId": {
      "_id": "MONGODB_USER_ID",
      "name": "Harman",
      "email": "harman@example.com"
    }
  }
}
```

You can also create a post with an existing author:

```json
{
  "title": "MongoDB Atlas Persistence",
  "content": "This request uses an existing User _id as authorId.",
  "authorId": "PASTE_USER_ID_HERE"
}
```

For multipart image upload, use `Body -> form-data`:

```text
title: Sprint 11 Upload Post
content: This post includes a Cloudinary thumbnail.
authorName: Harman
authorEmail: harman@example.com
thumbnail: choose an image file
```

The image file is streamed to Cloudinary. MongoDB stores only the returned `imageUrl` string.

### 6. GET /posts

URL:

```txt
http://localhost:5000/posts
```

Expected output:

```json
{
  "message": "Posts fetched successfully",
  "count": 1,
  "data": [
    {
      "_id": "MONGODB_POST_ID",
      "title": "Sprint 10 Backend",
      "content": "This post is stored permanently in MongoDB Atlas.",
      "authorId": {
        "_id": "MONGODB_USER_ID",
        "name": "Harman",
        "email": "harman@example.com"
      }
    }
  ]
}
```

The `authorId` object proves that Mongoose `.populate()` is working.

### 7. GET /posts/top/recent

URL:

```txt
http://localhost:5000/posts/top/recent
```

Expected output:

```json
{
  "message": "Top 3 most recent posts fetched successfully",
  "count": 1,
  "data": [
    {
      "_id": "MONGODB_POST_ID",
      "title": "Sprint 10 Backend",
      "content": "This post is stored permanently in MongoDB Atlas."
    }
  ]
}
```

### 8. PUT /posts/:id

URL:

```txt
http://localhost:5000/posts/PASTE_POST_ID_HERE
```

Body:

```json
{
  "title": "Updated Sprint 10 Backend",
  "content": "MongoDB update request is working successfully."
}
```

### 9. DELETE /posts/:id

Use the `_id` from a created post.

URL:

```txt
http://localhost:5000/posts/PASTE_POST_ID_HERE
```

Expected output:

```json
{
  "message": "Post deleted successfully",
  "deletedId": "MONGODB_POST_ID"
}
```

### 10. POST /login

```json
{
  "username": "harman",
  "password": "demo123"
}
```

## MongoDB Atlas Proof

After running `POST /posts`, open MongoDB Atlas:

```txt
DataStormCluster -> Browse Collections -> data-storm-api -> posts
```

The `posts` collection should show a document with:

```txt
title: "Sprint 10 Backend"
content: "This post is stored permanently in MongoDB Atlas."
authorId: ObjectId(...)
createdAt: Date(...)
updatedAt: Date(...)
```

This proves that the Postman payload was persisted to the cloud database.

## Sprint 11 Frontend Integration

The React/Vite frontend should call this backend through:

```env
VITE_API_BASE_URL=http://localhost:5000
```

For deployed frontend:

```env
VITE_API_BASE_URL=https://the-data-storm-afcz.onrender.com
```

On Render, add the frontend origin to the backend environment:

```env
CLIENT_ORIGIN=http://localhost:5173,https://YOUR_VERCEL_URL.vercel.app
```

If Cloudinary upload is required, also add:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Demo Checklist

1. Start the server with `npm run dev`.
2. Open Postman.
3. Run `GET /` and show database status.
4. Run `POST /users` to create an author.
5. Run `POST /posts` to insert a post into MongoDB Atlas.
6. Run `GET /posts` and show populated `authorId`.
7. Run `GET /posts/top/recent` and show the latest 3 posts.
8. Open MongoDB Atlas Database view and show the saved document before deleting it.
9. Run `DELETE /posts/:id` and show successful deletion.
10. Run `GET /posts` again to confirm the post was deleted.
11. Open the React `/data-storm` page and create/delete posts from the browser UI.
