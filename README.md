**ShopHub🛒**

A full-stack e-commerce application built using MongoDB, Express.js, React, and Node.js with Razorpay payment processing and Nodemailer email confirmations.

 **Features**
* Product catalog, search, and user-submitted listings
* Shopping cart with quantity management and shipping calculations
* Address collection modal and order tracking view
* Razorpay checkout integration with payment verification
* Automated HTML order confirmation emails via Nodemailer

**Tech Stack**
* **Frontend:** React, React Router, Context API, Axios
* **Backend:** Node.js, Express.js, MongoDB (Mongoose)
* **Integrations:** Razorpay API, Nodemailer

**Environment Variables**

Create a `.env` file inside the `backend` directory with the following variables:

```env
PORT=5000(you can choose any port number)
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**Getting Started**

**1. Backend Setup**
Bash

cd backend

npm install

npm start

**2. Frontend Setup**
Bash

cd frontend

npm install

npm start

**3. Push the README to GitHub**

(in powershell)

git add README.md

git commit -m "Add README with setup and configuration details"

git push


**Enjoy😊❤️**
