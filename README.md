Here’s a complete `README.md` for your [E-learning platform](https://github.com/thahayaseen/e-learning) built with **Next.js**, **Express.js**, **MongoDB**, **AWS S3**, **Stripe**, and more:

---

```markdown
# 🧠 E-Learning Platform

A full-featured, scalable E-Learning platform built using **Next.js** for the frontend and **Node.js + Express** for the backend. It supports real-time messaging, course management, lesson tracking, authentication, payments, and cloud media handling.

---

## 📂 Project Structure

```

e-learning/
├── Backend/         # Node.js + Express backend
├── Frontend/        # Next.js frontend
├── README.md

```

---

## 🚀 Features

### 👤 Auth & Users
- Google OAuth Login
- Role-based access: Admin, Mentor, Student
- JWT-based session management

### 🎓 Course & Lesson Management
- Create & manage courses, lessons, tasks
- Assign mentors to courses
- Student progress tracking

### 💬 Real-Time Chat & Video
- Chatrooms using Socket.IO
- Video call integration with PeerJS

### 💳 Payments
- Stripe Integration
- Subscription and payment tracking

### ☁️ Media & Storage
- Cloudinary for images/videos
- AWS S3 bucket integration

---

## 🛠️ Tech Stack

| Frontend      | Backend        | Database | Realtime | Payments | Media    |
|---------------|----------------|----------|----------|----------|----------|
| Next.js       | Express.js     | MongoDB  | Socket.IO| Stripe   | AWS S3, Cloudinary |
| Tailwind CSS  | Node.js        | Mongoose | PeerJS   | Razorpay (optional) | |

---

## 🔐 Environment Variables

### Backend `.env`

```

PORT=
JWT\_SECRET=
JWT\_REFRESH\_KEY=
MAILPASS=
STRIPE\_SECRET\_KEY=
NEXT\_PUBLIC\_SERVER=
MONGODBLINK=

# REDIS\_HOST=redis

# REDIS\_PORT=6379

```

### Frontend `.env.local`

```

AUTH\_SECRET=
GOOGLE\_CLIENT\_ID=
NEXT\_PUBLIC\_HOST=
NEXT\_PUBLIC\_S3Route=
NEXT\_PUBLIC\_SERVER=
JWT\_SECRET=
AWS\_ACCESS\_KEY\_ID=
AWS\_SECRET\_ACCESS\_KEY=
AWS\_REGION=
AWS\_BUCKET\_NAME=
NEXT\_PUBLIC\_STRIPE\_PUBLISHABLE\_KEY=
STRIPE\_SECRET\_KEY=

````

> ⚠️ **Important**: Never commit `.env` files to Git. Use `.env.example` instead.

---

## 💻 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/thahayaseen/e-learning.git
cd e-learning
````

### 2. Install Dependencies

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### 3. Set up your `.env` files (see above)

### 4. Run the app

```bash
# In Backend directory
npm run dev

# In Frontend directory
npm run dev
```

---

## 🧪 Testing

* Manual testing with Postman
* JWT protected routes
* Real-time features tested using multiple clients

---

## 📷 Screenshots

> Add screenshots or a Loom walkthrough demo link here.

---

## 🙋 Author

* **Thaha Yaseen K**
* [GitHub](https://github.com/thahayaseen)

---

## 📄 License

MIT

```

---

Let me know if you'd like me to include a visual walkthrough (e.g. Loom video), deployment instructions (like Vercel + Railway), or contribution guidelines.
```
