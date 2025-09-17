Overview
--------

A **RESTful API** for an e-commerce platform built with **Node.js**, **Express**, and **Prisma**.  
It provides **user authentication**, **cart operations**, **order management**, and **user management**.  
Designed for scalability and clean architecture, following best coding practices.

---

## 📌 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)


---

## ✨ Features

✅ **User Authentication** - Register , login , and JWT-based authentication.

✅ **User Management** - Add a new address , Delete an address , List all addresses ,  Update profile , Change user role , List all users.

✅ **Cart Operations** - Add items, Update quantities, Remove items from the cart , list all carts.

✅ **Order Management** — Create orders , list orders , cancelOrder  , getOrders.

✅ **Product Management** - createProduct , updateProduct  , listProducts , deleteProduct , getProductById , searchProducts.
 
## 🛠 Tech Stack

**Backend:** Node.js, Express.js, Prisma , Typescript

**Database:** MySQL  

**Authentication:** JWT  

**Validation:** Zod  

API Usage
---------
To get started with the API, follow these steps:

1. Clone the repository: git clone https://github.com/Sahilnegi-code/EcommerceApi.git

3. Install the dependencies: npm  install

5. Add your own `.env` file with the necessary environment variables.

6. Start the development server: npm start
   
7. Initialize Prisma:  npx prisma init
   
9. Generate Prisma Client: npx prisma generate

11. Open Prisma Studio: npx prisma studio

13. Start the Server:  npm start
