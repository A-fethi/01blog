# 01blog

01Blog is a social blogging platform designed for students to share their learning experiences, discoveries, and progress. Users can create posts with media, subscribe to other users, interact with posts, and report inappropriate content. Administrators have tools to manage users and moderate content.

## Tech Stack
**Backend:**  
- Java Spring Boot  
- Spring Security (JWT-based authentication)  
- Spring Data JPA  
- PostgreSQL  
- Lombok (optional)  
- Maven  

**Frontend:**  
- Angular 17+  
- Angular Material  
- RxJS for reactive programming  
- SCSS for styling  

**Deployment & Dev Tools:**  
- Docker & Docker Compose  
- Optional: AWS S3 or local filesystem for media storage  

---

## Features

**User Features:**  
- Register and login with secure password hashing (BCrypt)  
- Role-based access control (User vs Admin)  
- Create, edit, delete posts with media (images/videos)  
- Like and comment on posts  
- Subscribe/unsubscribe to other users  
- Receive notifications for new posts from subscribed users  
- View user block pages (public profile with posts)  
- Report inappropriate posts or users  

**Admin Features:**  
- View all users, posts, and reports  
- Ban users or delete posts  
- Manage reported content  
- Admin dashboard with clean UI  

**Additional Features:**  
- Pagination/infinite scroll for feeds  
- Media preview before upload  
- Responsive UI (desktop and mobile)