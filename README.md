
# Cosocial-API
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Express JS](https://img.shields.io/badge/Powered%20by-Node%20JS-purple)](https://expressjs.com/)
[![Express JS](https://img.shields.io/badge/ExpressJS-Rest%20API-blue)](https://expressjs.com/)

A social media Rest API that enables authenticated users to create, edit and delete posts made by them. Further, it enables registered users to see each other posts and also follow and chat up each other.


## Features

- User creation
- Authentication
- User deletion
- API routes
- Posts creation, editing and deletion
- View posts
- Like and reply posts
- Real time notifications
- Chat service
- Follow/unfollow registered user(s)




## API Reference - Authentication

BASE URL: https://cosocial-api.onrender.com/

#### User sign up

```http
  POST /api/auth/sign-up
```

| Parameter | Type     | Description                | Required                |
| :-------- | :------- | :------------------------- | :------------------------- |
| `username` | `string` | Username of user       | Yes
| `email` | `string` |  Email address of user       | Yes              |
| `password` | `string` |  Password of user       | Yes


#### User sign in

```http
  POST /api/auth/login
  
```

| Parameter | Type     | Description                | Required                |
| :-------- | :------- | :------------------------- | :------------------------- |
| `email` | `string` |  Email address of user       | Yes              |
| `password` | `string` |  Password of user       | Yes


## API Reference - Users

BASE URL: https://cosocial-api.onrender.com/

N.B: All users routes are protected

**`Authorization: bearer ${token}`**

#### Get current authenticated user

```http
  GET /api/users
```


#### Get all users

```http
  POST /api/users/all-users
```


#### Get notifications

```http
  GET /api/users/notifications
```

#### Delete all notifications

```http
  DELETE /api/users/notifications
```

#### Mark all notifications as read

```http
  PUT /api/users/notifications/read
```

#### Mark all notifications as unread

```http
  PUT /api/users/n/unread
```

#### Mark a notification as read

```http
  PUT /api/users/notifications/unread/:id
```

#### Delete a Notification

```http
  DELETE /api/users/notifications/:id
```

#### Update user password

```http
  PATCH /api/user/update-password
```
| Parameter | Type     | Description                |  Required    | Min-Length          |
| :-------- | :------- | :------------------------- | :------------------------- | :------------------------- |
| `oldPassword` | `string` |  Current password of user       | Yes| 6
| `newPassword` | `string` |  New password of user       | Yes | 6

#### Get user's non following

```http
  GET /api/users/notfollowing
```

#### Get user's non followers

```http
  GET /api/users/nonfollowers
```

#### Get user's non followers

```http
  GET /api/users/nonfollowers
```


#### Update user's profile

```http
  PUT /api/users/:id
```

| Parameter | Type     | Description                |  Required    | Min-Length          |
| :-------- | :------- | :------------------------- | :------------------------- | :------------------------- |
| `email` | `string` |  Current password of user       | No| 4
| `username` | `string` |  New password of user       | Yes | 6
| `password` | `string` |  New password of user       | Yes | 6

#### Delete user

```http
  DELETE /api/users/:id
```

#### Get user

```http
  GET /api/users/:id
```


#### Follow user

```http
  GET /api/users/:id/follow
```

#### Unfollow user

```http
  GET /api/users/:id/unfollow
```

#### Get user's followers

```http
  GET /api/users/:id/followers
```

#### Get user's following

```http
  GET /api/users/:id/following
```
## API Reference - Posts

BASE URL: https://cosocial-api.onrender.com/

N.B: All posts routes are protected

**`Authorization: bearer ${token}`**

#### Create Post

```http
  POST /api/posts
```

| Parameter | Type     | Description                |  Required    | Min-Length          |
| :-------- | :------- | :------------------------- | :------------------------- | :------------------------- |
| `description` | `string` | Description        | Yes| 1
| `image` | `File` |  Image      | No | N/A



#### Get all bookmarks

```http
  GET /api/posts/bookmark
```

#### Explore

```http
  GET /api/posts/explore
```

#### Get user posts

```http
  GET /api/posts/user-posts/:id
```

#### Update Post

```http
  PUT /api/posts/:id
```

| Parameter | Type     | Description                |  Required    | Min-Length          |
| :-------- | :------- | :------------------------- | :------------------------- | :------------------------- |
| `description` | `string` | Description        | Yes| 1
| `image` | `File` |  Image      | No | 6

#### Delete post

```http
  DELETE /api/posts/:id
```

#### Get post

```http
  GET /api/posts/:id
```

#### Like post

```http
  PUT /api/posts/:id
```


#### Get posts on timeline

```http
  GET /api/posts/:id/timeline
```


#### Bookmark post

```http
  PUT /api/posts/:id/bookmark
```


#### Reply post

```http
  PUT /api/posts/:id/reply
```


#### Delete Reply

```http
  DELETE /api/posts/:id/reply
```


#### Like reply to post

```http
  PUT /api/posts/:id/reply/like
```


## API Reference - Posts

BASE URL: https://cosocial-api.onrender.com/

N.B: All conversations routes are protected

**`Authorization: bearer ${token}`**

#### Chat with user

```http
  POST /api/conversations
```

| Parameter | Type     | Description                |  Required    | Min-Length          |
| :-------- | :------- | :------------------------- | :------------------------- | :------------------------- |
| `senderId` | `string` | ID of sender        | Yes| 5
| `receiverId` | `File` |  ID of receiver      | Yes | 5
| `text` | `File` |  Message Text      | Yes | 1


#### Get chat users

```http
  GET /api/conversations/users
```


#### Get chat

```http
  GET /api/conversations/:receiverId
```

## Demo
Please visit this  [demo web app - Cosocial](https://cosocial.vercel.app/) to see the API in action. Kindly note there may be a 10 or 15 seconds delay when calling the API for the first time or after one or two hours of inactivity.

## Feedback

If you have any feedback, please reach out to me via chisomije92@gmail.com

