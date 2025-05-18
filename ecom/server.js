const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 3000;
// MongoDB connection
mongoose.connect("mongodb://localhost:27017/ecommerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Define schemas
const userSchema = new mongoose.Schema({
  email: String,
  phone: String,
  password: String,
  state: String,
  district: String,
  areaName: String,
  pincode: String,
  cart: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
      mrp: Number,
      discount: Number,
      mainImage: String,
      quantity: Number,
      size: String,
      color: String,
      brand: String,
      category: String,
    },
  ],
});

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  brand: String,
  sku: String,
  productCode: String,
  price: Number,
  mrp: Number,
  discount: Number,
  stock: Number,
  lowStockAlert: Number,
  deliveryCharge: Number,
  freeDelivery: Boolean,
  sizes: [String],
  colors: [String],
  variants: [String],
  mainImage: String,
  additionalImages: [String],
  shortDescription: String,
  fullDescription: String,
  keyFeatures: [String],
  material: String,
  dimensions: String,
  weight: String,
  warranty: String,
  tags: [String],
  status: String,
  launchDate: Date,
  returnPolicy: String,
  bankOffers: String,
  specialOffer: String,
});

const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userDetails: {
    email: String,
    phone: String,
    address: {
      state: String,
      district: String,
      areaName: String,
      pincode: String,
    },
  },
  products: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
      mrp: Number,
      discount: Number,
      quantity: Number,
      size: String,
      color: String,
      mainImage: String,
      brand: String,
      category: String,
    },
  ],
  totalAmount: Number,
  upiTransactionId: String,
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" },
});

// Create models
const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Configure multer for file uploads
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Session management (simplified for demo)
let currentUser = null;
let adminLoggedIn = false;

// Routes
app.get("/", (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>E-commerce Site</title>
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background-color: #f8f9fa;
                }
                .hero-section {
                    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                    color: white;
                    padding: 4rem 0;
                    margin-bottom: 2rem;
                    border-radius: 0 0 10px 10px;
                }
                .nav-links {
                    margin: 1.5rem 0;
                }
                .nav-links a {
                    margin: 0 10px;
                    text-decoration: none;
                    font-weight: 500;
                }
                @media (max-width: 768px) {
                    .hero-section {
                        padding: 2rem 0;
                    }
                    .nav-links a {
                        display: block;
                        margin: 10px auto;
                        text-align: center;
                        max-width: 200px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container-fluid px-0">
                <div class="hero-section text-center">
                    <div class="container">
                        <h1 class="display-4 fw-bold mb-4">Welcome to Our E-commerce Site</h1>
                        <p class="lead">Shop the best products at amazing prices</p>
                    </div>
                </div>
                
                <div class="container text-center">
                    <div class="nav-links">
                        <a href="/login" class="btn btn-outline-primary btn-lg px-4">Login</a>
                        <a href="/register" class="btn btn-primary btn-lg px-4">Register</a>
                        ${
                          adminLoggedIn
                            ? '<a href="/admin" class="btn btn-dark btn-lg px-4">Admin Panel</a>'
                            : ""
                        }
                    </div>
                </div>
            </div>

            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
});

// Registration routes
app.get("/register", (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Register - E-commerce Site</title>
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background-color: #f8f9fa;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .logo-container {
                    text-align: center;
                    padding: 2rem 0 1rem 0;
                }
                .shop-logo {
                    max-width: 180px;
                    height: auto;
                }
                .registration-card {
                    max-width: 500px;
                    margin: 0 auto 3rem auto;
                    padding: 2rem;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    background: white;
                }
                .form-title {
                    color: #343a40;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    font-weight: 600;
                }
                .form-label {
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }
                .form-control {
                    padding: 0.75rem;
                    border-radius: 8px;
                }
                .btn-next {
                    width: 100%;
                    padding: 0.75rem;
                    margin-top: 1rem;
                    font-weight: 500;
                    border-radius: 8px;
                    background-color: #0d6efd;
                    border: none;
                    transition: all 0.3s ease;
                }
                .btn-next:hover {
                    background-color: #0b5ed7;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
                }
                @media (max-width: 576px) {
                    .shop-logo {
                        max-width: 140px;
                    }
                    .registration-card {
                        margin: 0 1rem 2rem 1rem;
                        padding: 1.5rem;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Logo Section -->
            <div class="container-fluid">
                <div class="logo-container">
                    <img src="https://www.freepnglogos.com/uploads/flipkart-logo-png/flipkart-logo-transparent-png-download-0.png" alt="Shop Logo" class="shop-logo">
                    <!-- Replace with your actual logo URL -->
                </div>
            </div>

            <!-- Registration Form -->
            <div class="container py-2">
                <div class="registration-card">
                    <h2 class="form-title">Create Your Account</h2>
                    <form action="/register-step1" method="post">
                        <div class="mb-4">
                            <label for="email" class="form-label">Email address</label>
                            <input type="email" class="form-control" id="email" name="email" placeholder="Enter your email" required>
                        </div>
                        <div class="mb-4">
                            <label for="phone" class="form-label">Phone number</label>
                            <input type="tel" class="form-control" id="phone" name="phone" placeholder="Enter your phone number" required>
                        </div>
                        <div class="mb-4">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" name="password" placeholder="Create a password" required>
                            <div class="form-text">Use 8 or more characters with a mix of letters, numbers & symbols</div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-next">Continue</button>
                    </form>
                    <div class="text-center mt-3">
                        <p class="text-muted">Already have an account? <a href="/login">Sign in</a></p>
                    </div>
                </div>
            </div>

            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
});

app.post("/register-step1", async (req, res) => {
  const { email, phone, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Registration Error</title>
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background-color: #f8f9fa;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .error-container {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .error-card {
                    max-width: 500px;
                    width: 100%;
                    padding: 2rem;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    background: white;
                    text-align: center;
                }
                .error-icon {
                    font-size: 3rem;
                    color: #dc3545;
                    margin-bottom: 1rem;
                }
                .error-title {
                    color: #dc3545;
                    margin-bottom: 1rem;
                    font-weight: 600;
                }
                .error-message {
                    margin-bottom: 1.5rem;
                    color: #6c757d;
                }
                .btn-retry {
                    padding: 0.5rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                @media (max-width: 576px) {
                    .error-card {
                        margin: 0 1rem;
                        padding: 1.5rem;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container-fluid">
                <div class="error-container">
                    <div class="error-card">
                        <div class="error-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                            </svg>
                        </div>
                        <h2 class="error-title">Registration Error</h2>
                        <p class="error-message">User with this email or phone number already exists.</p>
                        <a href="/register" class="btn btn-primary btn-retry">Try Again</a>
                    </div>
                </div>
            </div>

            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
  }

  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Registration - Step 2 | E-commerce Site</title>
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background-color: #f8f9fa;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .logo-container {
                    text-align: center;
                    padding: 2rem 0 1rem 0;
                }
                .shop-logo {
                    max-height: 80px;
                    width: auto;
                }
                .registration-card {
                    max-width: 600px;
                    margin: 0 auto 3rem auto;
                    padding: 2rem;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    background: white;
                }
                .form-title {
                    color: #343a40;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    font-weight: 600;
                }
                .form-label {
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }
                .form-control {
                    padding: 0.75rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }
                .btn-register {
                    width: 100%;
                    padding: 0.75rem;
                    margin-top: 1rem;
                    font-weight: 500;
                    border-radius: 8px;
                    background-color: #28a745;
                    border: none;
                    transition: all 0.3s ease;
                }
                .btn-register:hover {
                    background-color: #218838;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
                }
                .progress-bar {
                    height: 6px;
                    background-color: #e9ecef;
                    border-radius: 3px;
                    margin-bottom: 2rem;
                    overflow: hidden;
                }
                .progress {
                    width: 50%;
                    height: 100%;
                    background-color: #0d6efd;
                    transition: width 0.3s ease;
                }
                @media (max-width: 576px) {
                    .shop-logo {
                        max-height: 60px;
                    }
                    .registration-card {
                        margin: 0 1rem 2rem 1rem;
                        padding: 1.5rem;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Logo Section -->
            <div class="container-fluid">
                <div class="logo-container">
                    <img src="https://www.freepnglogos.com/uploads/flipkart-logo-png/flipkart-logo-transparent-png-download-0.png" alt="Shop Logo" class="shop-logo">
                </div>
            </div>

            <!-- Registration Form -->
            <div class="container py-2">
                <div class="registration-card">
                    <!-- Progress Bar -->
                    <div class="progress-bar">
                        <div class="progress"></div>
                    </div>
                    
                    <h2 class="form-title">Complete Your Registration</h2>
                    <p class="text-muted text-center mb-4">Step 2 of 2 - Address Information</p>
                    
                    <form action="/register-step2" method="post">
                        <!-- Hidden fields from step 1 -->
                        <input type="hidden" name="email" value="${email}">
                        <input type="hidden" name="phone" value="${phone}">
                        <input type="hidden" name="password" value="${password}">
                        
                        <!-- Address Fields -->
                        <div class="row">
                            <div class="col-md-6">
                                <label for="state" class="form-label">State</label>
                                <input type="text" class="form-control" id="state" name="state" placeholder="Enter your state" required>
                            </div>
                            <div class="col-md-6">
                                <label for="district" class="form-label">District</label>
                                <input type="text" class="form-control" id="district" name="district" placeholder="Enter your district" required>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <label for="areaName" class="form-label">Area Name</label>
                                <input type="text" class="form-control" id="areaName" name="areaName" placeholder="Enter your area/locality" required>
                            </div>
                            <div class="col-md-6">
                                <label for="pincode" class="form-label">Pincode</label>
                                <input type="text" class="form-control" id="pincode" name="pincode" placeholder="Enter 6-digit pincode" pattern="[0-9]{6}" required>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-register">Complete Registration</button>
                    </form>
                </div>
            </div>

            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
});

app.post("/register-step2", async (req, res) => {
  const { email, phone, password, state, district, areaName, pincode } =
    req.body;

  try {
    const newUser = new User({
      email,
      phone,
      password, // Note: In production, hash the password before saving
      state,
      district,
      areaName,
      pincode,
      cart: [],
    });

    await newUser.save();
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Registration Successful</title>
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background-color: #f8f9fa;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .message-container {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .message-card {
                    max-width: 500px;
                    width: 100%;
                    padding: 2rem;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    background: white;
                    text-align: center;
                }
                .success-icon {
                    font-size: 3rem;
                    color: #28a745;
                    margin-bottom: 1rem;
                }
                .error-icon {
                    font-size: 3rem;
                    color: #dc3545;
                    margin-bottom: 1rem;
                }
                .message-title {
                    margin-bottom: 1rem;
                    font-weight: 600;
                }
                .success-title {
                    color: #28a745;
                }
                .error-title {
                    color: #dc3545;
                }
                .message-content {
                    margin-bottom: 1.5rem;
                    color: #6c757d;
                }
                .btn-action {
                    padding: 0.5rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                @media (max-width: 576px) {
                    .message-card {
                        margin: 0 1rem;
                        padding: 1.5rem;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container-fluid">
                <div class="message-container">
                    <div class="message-card">
                        <div class="success-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                            </svg>
                        </div>
                        <h2 class="message-title success-title">Registration Successful!</h2>
                        <p class="message-content">Your account has been created successfully.</p>
                        <a href="/login" class="btn btn-primary btn-action">Login Now</a>
                    </div>
                </div>
            </div>
            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
  } catch (err) {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Registration Failed</title>
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                /* Same styles as above */
            </style>
        </head>
        <body>
            <div class="container-fluid">
                <div class="message-container">
                    <div class="message-card">
                        <div class="error-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                            </svg>
                        </div>
                        <h2 class="message-title error-title">Registration Failed</h2>
                        <p class="message-content">${
                          err.message ||
                          "An error occurred during registration."
                        }</p>
                        <a href="/register" class="btn btn-primary btn-action">Try Again</a>
                    </div>
                </div>
            </div>
            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
  }
});

// Login routes
app.get("/login", (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background-color: #f8f9fa;
                }
                .login-container {
                    max-width: 400px;
                    margin: 0 auto;
                    padding: 2rem;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                    margin-top: 2rem;
                }
                .logo {
                    width: 100px;
                    height: 100px;
                    margin: 0 auto 1.5rem;
                    display: block;
                    border-radius: 50%;
                    object-fit: cover;
                    background-color: #f1f1f1;
                }
                .form-control {
                    margin-bottom: 1rem;
                }
                .btn-login {
                    width: 100%;
                    padding: 0.5rem;
                }
                .back-link {
                    display: block;
                    text-align: center;
                    margin-top: 1.5rem;
                }
                @media (max-width: 576px) {
                    .login-container {
                        margin: 1rem;
                        padding: 1.5rem;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="login-container">
                    <!-- Logo placeholder - replace with your actual logo -->
                    <img src="https://www.freepnglogos.com/uploads/flipkart-logo-png/flipkart-logo-transparent-png-download-0.png" alt="Shop Logo" class="logo" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Crect width=\"100\" height=\"100\" fill=\"%23e9ecef\" /%3E%3Ctext x=\"50%\" y=\"50%\" font-family=\"Arial\" font-size=\"16\" text-anchor=\"middle\" dominant-baseline=\"middle\" fill=\"%236c757d\"%3ELogo%3C/text%3E%3C/svg%3E'">
                    
                    <h1 class="text-center mb-4">Login</h1>
                    <form action="/login" method="post">
                        <div class="mb-3">
                            <label for="username" class="form-label">Email/Phone</label>
                            <input type="text" class="form-control" id="username" name="username" required>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" name="password" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-login">Login</button>
                    </form>
                    <a href="/" class="back-link">Back to Home</a>
                </div>
            </div>
            
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Check for admin login
  if (username === "kanna" && password === "kanna") {
    adminLoggedIn = true;
    return res.redirect("/admin");
  }

  // Regular user login
  const user = await User.findOne({
    $or: [{ email: username }, { phone: username }],
    password: password, // Note: In production, use password hashing and compare
  });

  if (user) {
    currentUser = user;
    res.redirect("/home");
  } else {
    res.send('Invalid credentials. <a href="/login">Try again</a>');
  }
});
app.get("/home", async (req, res) => {
  if (!currentUser) return res.redirect("/login");

  const searchQuery = req.query.search || "";

  let query = {};
  if (searchQuery) {
    query = {
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { brand: { $regex: searchQuery, $options: "i" } },
        { category: { $regex: searchQuery, $options: "i" } },
        { tags: { $regex: searchQuery, $options: "i" } },
      ],
    };
  }

  const products = await Product.find(query);

  if (searchQuery) {
    products.sort((a, b) => {
      const aNameMatch = a.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const bNameMatch = b.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      const aBrandMatch = a.brand
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const bBrandMatch = b.brand
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (aBrandMatch && !bBrandMatch) return -1;
      if (!aBrandMatch && bBrandMatch) return 1;

      const aCategoryMatch = a.category
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const bCategoryMatch = b.category
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (aCategoryMatch && !bCategoryMatch) return -1;
      if (!aCategoryMatch && bCategoryMatch) return 1;

      return 0;
    });
  }

  let productsHtml = "";
  products.forEach((product) => {
    productsHtml += `
            <div class="col-6 col-md-3 mb-4">
                <div class="card h-100 product-card">
                    <div class="product-image-container">
                        <img src="/uploads/${product.mainImage}" class="product-image" alt="${product.name}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <div class="price-container">
                            <span class="current-price">₹${product.price}</span>
                            <span class="original-price"><strike>₹${product.mrp}</strike></span>
                            <span class="discount">${product.discount}% off</span>
                        </div>
                        <a href="/viewproduct/${product._id}" class="btn btn-primary mt-2 w-100">View Product</a>
                    </div>
                </div>
            </div>
        `;
  });

  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Home</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                :root {
                    --primary-color: #3498db;
                    --secondary-color: #2c3e50;
                    --accent-color: #e74c3c;
                    --light-gray: #f8f9fa;
                }
                
                body {
                    background-color: var(--light-gray);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                /* Navigation Bar */
                .navbar {
                    background-color: white;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    padding: 0.5rem 0;
                }
                
                .navbar-brand img {
                    height: 40px;
                    margin-left: 10px;
                }
                
                .search-container {
                    flex-grow: 1;
                    max-width: 600px;
                    margin: 0 15px;
                }
                
                .search-form {
                    position: relative;
                }
                
                .search-input {
                    padding-right: 40px;
                    border-radius: 20px;
                }
                
                .search-btn {
                    position: absolute;
                    right: 5px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--primary-color);
                }
                
                .nav-options {
                    display: flex;
                    align-items: center;
                }
                
                .nav-link {
                    padding: 0.5rem 1rem;
                    color: var(--secondary-color);
                    font-weight: 500;
                    transition: all 0.2s;
                    border-radius: 5px;
                    margin: 0 2px;
                }
                
                .nav-link:hover {
                    background-color: var(--light-gray);
                    color: var(--primary-color);
                }
                
                .nav-link i {
                    margin-right: 5px;
                }
                
                /* Welcome Message */
                .welcome-container {
                    background: linear-gradient(135deg, var(--primary-color), #5dade2);
                    color: white;
                    padding: 2rem;
                    border-radius: 10px;
                    margin: 2rem 0;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                
                .welcome-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                
                .welcome-subtitle {
                    font-size: 1rem;
                    opacity: 0.9;
                }
                
                /* Product Cards */
                .product-card {
                    transition: transform 0.3s, box-shadow 0.3s;
                    border-radius: 10px;
                    overflow: hidden;
                    border: none;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }
                
                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }
                
                /* Improved Product Image Container */
                .product-image-container {
                    position: relative;
                    width: 100%;
                    padding-top: 100%; /* 1:1 Aspect Ratio */
                    background-color: #f8f9fa;
                    overflow: hidden;
                }
                
                .product-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    padding: 15px;
                    transition: transform 0.3s ease;
                }
                
                .product-card:hover .product-image {
                    transform: scale(1.05);
                }
                
                .card-body {
                    padding: 1.25rem;
                }
                
                .card-title {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    height: 40px;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
                
                .price-container {
                    margin: 0.75rem 0;
                }
                
                .current-price {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: var(--accent-color);
                }
                
                .original-price {
                    font-size: 0.9rem;
                    color: #6c757d;
                    margin: 0 0.5rem;
                }
                
                .discount {
                    font-size: 0.8rem;
                    background-color: #ffe6e6;
                    color: var(--accent-color);
                    padding: 0.2rem 0.5rem;
                    border-radius: 0.25rem;
                    font-weight: 600;
                }
                
                /* Modals */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1050;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s;
                }
                
                .modal-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                
                .modal-content {
                    background-color: white;
                    padding: 2rem;
                    border-radius: 10px;
                    max-width: 500px;
                    width: 90%;
                    position: relative;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
                
                .close-modal {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #6c757d;
                }
                
                /* Mobile Specific Styles */
                @media (max-width: 992px) {
                    .navbar-collapse {
                        background-color: white;
                        padding: 1rem;
                        border-radius: 0 0 10px 10px;
                        margin-top: 0.5rem;
                        box-shadow: 0 5px 10px rgba(0,0,0,0.1);
                    }
                    
                    .search-container {
                        order: -1;
                        width: 100%;
                        margin: 10px 0;
                        padding: 0 15px;
                    }
                    
                    .nav-options {
                        flex-direction: column;
                        align-items: flex-start;
                        width: 100%;
                    }
                    
                    .nav-link {
                        width: 100%;
                        margin: 2px 0;
                        padding: 0.75rem 1rem;
                    }
                    
                    .welcome-container {
                        padding: 1.5rem;
                        margin: 1.5rem 0;
                    }
                    
                    .welcome-title {
                        font-size: 1.5rem;
                    }
                }
                
                @media (max-width: 576px) {
                    .welcome-container {
                        padding: 1rem;
                    }
                    
                    .welcome-title {
                        font-size: 1.3rem;
                    }
                    
                    /* Adjust product card layout for mobile */
                    .col-6 {
                        padding-left: 5px;
                        padding-right: 5px;
                    }
                    
                    .product-card {
                        margin-bottom: 10px;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Navigation Bar -->
            <nav class="navbar navbar-expand-lg navbar-light sticky-top">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/home">
                        <img src="https://www.freepnglogos.com/uploads/flipkart-logo-png/flipkart-logo-transparent-png-download-0.png" alt="Shop Logo">
                    </a>
                    
                    <!-- Search Bar - Always Visible -->
                    <div class="search-container d-flex">
                        <form class="search-form w-100" action="/home" method="get">
                            <input 
                                class="form-control search-input" 
                                type="search" 
                                name="search" 
                                placeholder="Search products..." 
                                value="${searchQuery}"
                                aria-label="Search"
                            >
                            <button class="search-btn" type="submit">
                                <i class="fas fa-search"></i>
                            </button>
                        </form>
                    </div>
                    
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    
                    <div class="collapse navbar-collapse" id="navbarContent">
                        <div class="nav-options ms-auto">
                            <a class="nav-link" href="/cart">
                                <i class="fas fa-shopping-cart"></i> Cart
                            </a>
                            <a class="nav-link" href="#" onclick="openModal('contactModal')">
                                <i class="fas fa-envelope"></i> Contact
                            </a>
                            <a class="nav-link" href="#" onclick="openModal('serviceModal')">
                                <i class="fas fa-headset"></i> Service
                            </a>
                            <a class="nav-link" href="/logout">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
            
            <!-- Main Content -->
            <div class="container mt-3">
                <!-- Welcome Message -->
                <div class="welcome-container">
                    <h1 class="welcome-title">Welcome back, ${
                      currentUser.email.split("@")[0]
                    }!</h1>
                    <p class="welcome-subtitle">Discover amazing products tailored just for you</p>
                </div>
                
                <!-- Products Grid -->
                <div class="row" id="productsContainer">
                    ${
                      productsHtml ||
                      '<div class="col-12"><p class="text-center text-muted">No products found. Try a different search.</p></div>'
                    }
                </div>
            </div>
            
            <!-- Contact Us Modal -->
            <div id="contactModal" class="modal-overlay">
                <div class="modal-content">
                    <span class="close-modal" onclick="closeModal('contactModal')">&times;</span>
                    <h3>Contact Us</h3>
                    <div class="mt-3">
                        <p><i class="fas fa-envelope me-2"></i> contact@example.com</p>
                        <p><i class="fas fa-phone me-2"></i> +1 234 567 890</p>
                        <p><i class="fas fa-map-marker-alt me-2"></i> 123 Shop Street, City, Country</p>
                    </div>
                </div>
            </div>
            
            <!-- Customer Service Modal -->
            <div id="serviceModal" class="modal-overlay">
                <div class="modal-content">
                    <span class="close-modal" onclick="closeModal('serviceModal')">&times;</span>
                    <h3>Customer Service</h3>
                    <div class="mt-3">
                        <a href="#" class="d-block py-2 text-decoration-none"><i class="fas fa-question-circle me-2"></i> FAQs</a>
                        <a href="#" class="d-block py-2 text-decoration-none"><i class="fas fa-exchange-alt me-2"></i> Return Policy</a>
                        <a href="#" class="d-block py-2 text-decoration-none"><i class="fas fa-truck me-2"></i> Shipping Info</a>
                        <a href="#" class="d-block py-2 text-decoration-none"><i class="fas fa-comments me-2"></i> Live Chat</a>
                    </div>
                </div>
            </div>
            
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            <script>
                // Modal functions
                function openModal(id) {
                    document.getElementById(id).classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
                
                function closeModal(id) {
                    document.getElementById(id).classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
                
                // Close modal when clicking outside
                document.querySelectorAll('.modal-overlay').forEach(modal => {
                    modal.addEventListener('click', function(e) {
                        if (e.target === this) {
                            closeModal(this.id);
                        }
                    });
                });
                
                // Search functionality
                const searchInput = document.querySelector('input[name="search"]');
                
                // Search as you type with debounce
                let searchTimer;
                searchInput.addEventListener('input', function() {
                    clearTimeout(searchTimer);
                    searchTimer = setTimeout(() => {
                        this.form.submit();
                    }, 500);
                });
                
                // Also allow Enter key
                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        this.form.submit();
                    }
                });
            </script>
        </body>
        </html>
    `);
});
// View product
app.get("/viewproduct/:id", async (req, res) => {
  if (!currentUser) return res.redirect("/login");

  const product = await Product.findById(req.params.id);
  if (!product) return res.send("Product not found");

  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${product.name}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                /* Custom CSS */
                .product-main-image {
                    width: 100%;
                    height: auto;
                    cursor: zoom-in;
                    transition: transform 0.3s;
                    border-radius: 8px;
                }
                .product-main-image:hover {
                    transform: scale(1.05);
                }
                .thumbnail-image {
                    width: 80px;
                    height: 80px;
                    object-fit: cover;
                    cursor: pointer;
                    border: 2px solid transparent;
                    border-radius: 4px;
                    transition: all 0.3s;
                }
                .thumbnail-image:hover, .thumbnail-image.active {
                    border-color: #0d6efd;
                }
                .price-section {
                    font-size: 1.5rem;
                    margin: 15px 0;
                }
                .original-price {
                    text-decoration: line-through;
                    color: #6c757d;
                    font-size: 1.2rem;
                }
                .discount-badge {
                    font-size: 1rem;
                    vertical-align: super;
                }
                .product-actions-mobile {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    padding: 10px;
                    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                    display: flex;
                    z-index: 1000;
                }
                .product-actions-mobile .btn {
                    flex: 1;
                    margin: 0 5px;
                }
                .specs-list {
                    list-style-type: none;
                    padding-left: 0;
                }
                .specs-list li {
                    margin-bottom: 8px;
                }
                .specs-list li:before {
                    content: "•";
                    color: #0d6efd;
                    display: inline-block;
                    width: 1em;
                    margin-left: -1em;
                }
                @media (min-width: 768px) {
                    .product-actions-mobile {
                        display: none;
                    }
                    .product-desktop-actions {
                        display: block;
                    }
                }
                @media (max-width: 767px) {
                    .product-desktop-actions {
                        display: none;
                    }
                    .product-name {
                        font-size: 1.5rem;
                        margin-top: 10px;
                    }
                }
                .zoomable-image {
                    overflow: hidden;
                }
                .zoomable-image img {
                    transition: transform 0.5s;
                }
                .zoomable-image:hover img {
                    transform: scale(1.2);
                }
            </style>
        </head>
        <body>
            <div class="container py-4">
                <!-- Product Name (Top on all devices) -->
                <h1 class="product-name text-center text-md-start mb-4">${
                  product.name
                }</h1>
                
                <div class="row">
                    <!-- Product Images (Left column on desktop, top on mobile) -->
                    <div class="col-md-6 mb-4">
                        <div class="zoomable-image mb-3">
                            <img id="mainImage" src="/uploads/${
                              product.mainImage
                            }" class="product-main-image img-fluid border" alt="${
    product.name
  }">
                        </div>
                        <div class="d-flex flex-wrap gap-2">
                            ${product.additionalImages
                              .map(
                                (img, index) => `
                                <img src="/uploads/${img}" class="thumbnail-image ${
                                  index === 0 ? "active" : ""
                                }" 
                                     onclick="document.getElementById('mainImage').src = this.src; 
                                              document.querySelectorAll('.thumbnail-image').forEach(el => el.classList.remove('active'));
                                              this.classList.add('active');">
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                    
                    <!-- Product Details (Right column on desktop, below images on mobile) -->
                    <div class="col-md-6">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-body">
                                <div class="price-section">
                                    <span class="text-danger fw-bold">₹${
                                      product.price
                                    }</span>
                                    <span class="original-price ms-2">₹${
                                      product.mrp
                                    }</span>
                                    <span class="discount-badge badge bg-success ms-2">${
                                      product.discount
                                    }% OFF</span>
                                </div>
                                
                                <p class="${
                                  product.stock > 0
                                    ? "text-success"
                                    : "text-danger"
                                }">
                                    ${
                                      product.stock > 0
                                        ? `${product.stock} in stock`
                                        : "Out of stock"
                                    }
                                </p>
                                
                                <div class="d-flex gap-2 mb-3">
                                    <span class="badge bg-info">${
                                      product.brand
                                    }</span>
                                    <span class="badge bg-secondary">${
                                      product.category
                                    }</span>
                                </div>
                                
                                ${
                                  product.sizes.length > 0
                                    ? `
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Size</label>
                                        <select class="form-select size-select">
                                            ${product.sizes
                                              .map(
                                                (size) =>
                                                  `<option value="${size}">${size}</option>`
                                              )
                                              .join("")}
                                        </select>
                                    </div>
                                `
                                    : ""
                                }
                                
                                ${
                                  product.colors.length > 0
                                    ? `
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Color</label>
                                        <select class="form-select color-select">
                                            ${product.colors
                                              .map(
                                                (color) =>
                                                  `<option value="${color}">${color}</option>`
                                              )
                                              .join("")}
                                        </select>
                                    </div>
                                `
                                    : ""
                                }
                                
                                <div class="mb-4">
                                    <label class="form-label fw-bold">Quantity</label>
                                    <input type="number" class="form-control quantity-input" value="1" min="1" max="${
                                      product.stock
                                    }">
                                </div>
                                
                                <!-- Desktop Actions (Hidden on mobile) -->
                                <div class="product-desktop-actions d-grid gap-2 d-md-flex">
                                    <form action="/addtocart/${
                                      product._id
                                    }" method="post" class="me-md-2 w-100">
                                        ${
                                          product.sizes.length > 0
                                            ? `<input type="hidden" name="size" class="size-field">`
                                            : ""
                                        }
                                        ${
                                          product.colors.length > 0
                                            ? `<input type="hidden" name="color" class="color-field">`
                                            : ""
                                        }
                                        <input type="hidden" name="quantity" class="quantity-field">
                                        <button type="submit" class="btn btn-primary w-100 py-2">
                                            <i class="bi bi-cart-plus"></i> Add to Cart
                                        </button>
                                    </form>
                                    <form action="/buynow/${
                                      product._id
                                    }" method="post" class="w-100">
                                        ${
                                          product.sizes.length > 0
                                            ? `<input type="hidden" name="size" class="size-field">`
                                            : ""
                                        }
                                        ${
                                          product.colors.length > 0
                                            ? `<input type="hidden" name="color" class="color-field">`
                                            : ""
                                        }
                                        <input type="hidden" name="quantity" class="quantity-field">
                                        <button type="submit" class="btn btn-danger w-100 py-2">
                                            <i class="bi bi-lightning"></i> Buy Now
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Product Specifications -->
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-body">
                                <h3 class="card-title">Product Details</h3>
                                <p class="card-text">${
                                  product.fullDescription
                                }</p>
                                
                                <h3 class="card-title mt-4">Key Features</h3>
                                <ul class="specs-list">
                                    ${product.keyFeatures
                                      .map((feature) => `<li>${feature}</li>`)
                                      .join("")}
                                </ul>
                                
                                <div class="row mt-3">
                                    ${
                                      product.material
                                        ? `
                                        <div class="col-md-6">
                                            <p><strong>Material:</strong> ${product.material}</p>
                                        </div>
                                    `
                                        : ""
                                    }
                                    ${
                                      product.dimensions
                                        ? `
                                        <div class="col-md-6">
                                            <p><strong>Bank Offer:</strong> ${product.dimensions}</p>
                                        </div>
                                    `
                                        : ""
                                    }
                                    ${
                                      product.weight
                                        ? `
                                        <div class="col-md-6">
                                            <p><strong>Special Offer:</strong> ${product.weight}</p>
                                        </div>
                                    `
                                        : ""
                                    }
                                    ${
                                      product.warranty
                                        ? `
                                        <div class="col-md-6">
                                            <p><strong>Warranty:</strong> ${product.warranty}</p>
                                        </div>
                                    `
                                        : ""
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Mobile Actions (Fixed at bottom on mobile) -->
                <div class="product-actions-mobile">
                    <form action="/addtocart/${
                      product._id
                    }" method="post" class="w-100">
                        ${
                          product.sizes.length > 0
                            ? `<input type="hidden" name="size" class="size-field">`
                            : ""
                        }
                        ${
                          product.colors.length > 0
                            ? `<input type="hidden" name="color" class="color-field">`
                            : ""
                        }
                        <input type="hidden" name="quantity" class="quantity-field">
                        
                    </form>
                    <form action="/buynow/${
                      product._id
                    }" method="post" class="w-100">
                        ${
                          product.sizes.length > 0
                            ? `<input type="hidden" name="size" class="size-field">`
                            : ""
                        }
                        ${
                          product.colors.length > 0
                            ? `<input type="hidden" name="color" class="color-field">`
                            : ""
                        }
                        <input type="hidden" name="quantity" class="quantity-field">
                        
                    </form>
                </div>
            </div>
            
            <!-- Back to Home Link -->
            <div class="container mb-4">
                <a href="/home" class="btn btn-outline-secondary" style="margin-bottom: 20px">
                    <i class="bi bi-arrow-left"></i> Back to Home
                </a>
            </div>
            
            <!-- Bootstrap JS -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            <!-- Bootstrap Icons -->
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
            <!-- Custom JS -->
          <script>
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // FORM SUBMISSION HANDLER
        function setupFormHandlers() {
            try {
                document.querySelectorAll('form').forEach(form => {
                    form.addEventListener('submit', function(e) {
                        try {
                            const container = this.closest('.col-md-6');
                            if (!container) return;
                            
                            // Safely get form elements
                            const sizeSelect = container.querySelector('.size-select');
                            const colorSelect = container.querySelector('.color-select');
                            const quantityInput = container.querySelector('.quantity-input');
                            
                            // Update hidden fields if they exist
                            if (sizeSelect) {
                                const sizeField = this.querySelector('.size-field');
                                if (sizeField) sizeField.value = sizeSelect.value;
                            }
                            if (colorSelect) {
                                const colorField = this.querySelector('.color-field');
                                if (colorField) colorField.value = colorSelect.value;
                            }
                            if (quantityInput) {
                                const quantityField = this.querySelector('.quantity-field');
                                if (quantityField) {
                                    const qty = Math.max(1, Math.min(parseInt(quantityInput.value), parseInt(quantityInput.max)));
                                    quantityField.value = isNaN(qty) ? 1 : qty;
                                }
                            }
                        } catch (formError) {
                            console.error('Form submission error:', formError);
                        }
                    });
                });
            } catch (initError) {
                console.error('Form handler initialization error:', initError);
            }
        }

        // IMAGE ZOOM FUNCTIONALITY
        function initImageZoom() {
            try {
                // Only run on desktop screens
                if (window.innerWidth < 768) return;
                
                const zoomable = document.querySelector('.zoomable-image');
                if (!zoomable) {
                    console.log('Zoomable container not found');
                    return;
                }

                const img = zoomable.querySelector('img');
                if (!img) {
                    console.log('Image element not found');
                    return;
                }

                // Set initial styles
                img.style.transition = 'transform 0.3s ease';
                img.style.transformOrigin = 'center center';
                
                let lastX = 50, lastY = 50;

                const handleMouseMove = (e) => {
                    try {
                        const rect = zoomable.getBoundingClientRect();
                        if (!rect || rect.width === 0 || rect.height === 0) return;

                        // Calculate mouse position (0-1 range)
                        const x = (e.clientX - rect.left) / rect.width;
                        const y = (e.clientY - rect.top) / rect.height;

                        // Clamp values and convert to percentages (5-95% range)
                        const originX = Math.min(95, Math.max(5, x * 100));
                        const originY = Math.min(95, Math.max(5, y * 100));

                        // Only update if changed significantly (performance optimization)
                        if (Math.abs(originX - lastX) > 1 || Math.abs(originY - lastY) > 1) {
img.style.transformOrigin = originX + '% ' + originY + '%';
                            img.style.transform = 'scale(1.2)';
                            lastX = originX;
                            lastY = originY;
                        }
                    } catch (moveError) {
                        console.error('Mouse move error:', moveError);
                        img.style.transformOrigin = 'center center';
                    }
                };

                const handleMouseLeave = () => {
                    img.style.transform = 'scale(1)';
                };

                // Add event listeners
                zoomable.addEventListener('mousemove', handleMouseMove);
                zoomable.addEventListener('mouseleave', handleMouseLeave);

                // Return cleanup function
                return function() {
                    zoomable.removeEventListener('mousemove', handleMouseMove);
                    zoomable.removeEventListener('mouseleave', handleMouseLeave);
                    img.style.transform = '';
                    img.style.transformOrigin = '';
                    img.style.transition = '';
                };
                
            } catch (initError) {
                console.error('Zoom initialization error:', initError);
                return function() {}; // Return empty cleanup function
            }
        }

        // MAIN INITIALIZATION FUNCTION
        function initializeAll() {
            try {
                setupFormHandlers();
                
                // Initialize zoom and store cleanup function
                let zoomCleanup = initImageZoom();
                
                // Handle window resize
                const handleResize = () => {
                    if (zoomCleanup) zoomCleanup();
                    zoomCleanup = initImageZoom();
                };
                
                window.addEventListener('resize', handleResize);
                
                // Return cleanup function
                return function() {
                    if (zoomCleanup) zoomCleanup();
                    window.removeEventListener('resize', handleResize);
                };
                
            } catch (error) {
                console.error('Main initialization error:', error);
                return function() {}; // Return empty cleanup function
            }
        }

        // RUN INITIALIZATION
        let appCleanup = initializeAll();
        
        // Cleanup when page unloads (optional)
        window.addEventListener('beforeunload', function() {
            if (appCleanup) appCleanup();
        });
    });
</script>
        </body>
        </html>
    `);
});
// Add to cart
app.post("/addtocart/:id", async (req, res) => {
  if (!currentUser) return res.redirect("/login");

  const productId = req.params.id;
  const { quantity, size, color } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.send("Product not found");

  const user = await User.findById(currentUser._id);
  const existingItem = user.cart.find(
    (item) =>
      item.productId.toString() === productId &&
      item.size === (size || "") &&
      item.color === (color || "")
  );

  if (existingItem) {
    existingItem.quantity += parseInt(quantity);
  } else {
    user.cart.push({
      productId,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      discount: product.discount,
      mainImage: product.mainImage,
      quantity: parseInt(quantity),
      size: size || "",
      color: color || "",
      brand: product.brand,
      category: product.category,
    });
  }

  await user.save();
  currentUser = user;
  res.redirect("/cart");
});

// Cart page
app.get("/cart", async (req, res) => {
  if (!currentUser) return res.redirect("/login");

  const user = await User.findById(currentUser._id);
  let cartHtml = "";
  let total = 0;
  let totalItems = 0;

  user.cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    totalItems += item.quantity;

    cartHtml += `
      <div class="card mb-3 cart-item">
        <div class="row g-0">
          <div class="col-md-3">
            <div class="cart-item-image-container">
              <img src="/uploads/${item.mainImage}" class="img-fluid rounded-start" alt="${item.name}">
              <div class="quantity-controls">
                <button class="btn btn-sm btn-outline-secondary quantity-btn" onclick="updateQuantity('${item._id}', -1)">−</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-secondary quantity-btn" onclick="updateQuantity('${item._id}', 1)">+</button>
              </div>
            </div>
          </div>
          <div class="col-md-7">
            <div class="card-body">
              <h5 class="card-title">${item.name}</h5>
              <p class="card-text text-muted mb-1">${item.brand}</p>
              ${item.size ? `<p class="card-text mb-1"><small class="text-muted">Size: ${item.size}</small></p>` : ""}
              ${item.color ? `<p class="card-text mb-1"><small class="text-muted">Color: ${item.color}</small></p>` : ""}
              <div class="price-container mt-2">
                <span class="current-price">₹${item.price}</span>
                <span class="original-price"><strike>₹${item.mrp}</strike></span>
                <span class="discount">${item.discount}% off</span>
              </div>
            </div>
          </div>
          <div class="col-md-2 d-flex align-items-center justify-content-end">
            <div class="me-3">
              <h5 class="item-total">₹${itemTotal}</h5>
            </div>
            <a href="/removefromcart/${item._id}" class="btn btn-danger remove-btn">
              <i class="fas fa-trash-alt"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  });

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Shopping Cart</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <style>
        :root {
          --primary-color: #3498db;
          --secondary-color: #2c3e50;
          --accent-color: #e74c3c;
          --light-gray: #f8f9fa;
        }
        
        body {
          background-color: #f5f5f5;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .cart-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 15px;
        }
        
        .cart-header {
          background-color: white;
          padding: 1.5rem;
          border-radius: 10px 10px 0 0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          margin-bottom: 1px;
        }
        
        .cart-items-container {
          background-color: white;
          padding: 1.5rem;
          border-radius: 0 0 10px 10px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        
        .cart-item {
          border: none;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s;
        }
        
        .cart-item:hover {
          transform: translateY(-3px);
        }
        
        .cart-item-image-container {
          position: relative;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
          background-color: var(--light-gray);
        }
        
        .cart-item img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
        
        .quantity-controls {
          position: absolute;
          bottom: 10px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(255,255,255,0.8);
          padding: 5px;
          border-radius: 20px;
          width: 80%;
          margin: 0 auto;
        }
        
        .quantity-btn {
          width: 30px;
          height: 30px;
          border-radius: 50% !important;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .quantity-display {
          margin: 0 10px;
          font-weight: 500;
          min-width: 20px;
          text-align: center;
        }
        
        .price-container {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .current-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--accent-color);
        }
        
        .original-price {
          font-size: 0.9rem;
          color: #6c757d;
        }
        
        .discount {
          font-size: 0.8rem;
          background-color: #ffe6e6;
          color: var(--accent-color);
          padding: 0.2rem 0.5rem;
          border-radius: 0.25rem;
          font-weight: 600;
        }
        
        .item-total {
          color: var(--secondary-color);
          font-weight: 700;
          margin: 0;
        }
        
        .remove-btn {
          width: 40px;
          height: 40px;
          border-radius: 50% !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .summary-card {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          padding: 1.5rem;
          position: sticky;
          top: 20px;
        }
        
        .summary-title {
          border-bottom: 1px solid #eee;
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.8rem;
        }
        
        .summary-total {
          font-weight: 700;
          font-size: 1.2rem;
          border-top: 1px solid #eee;
          padding-top: 1rem;
          margin-top: 1rem;
        }
        
        .checkout-btn {
          width: 100%;
          padding: 12px;
          font-weight: 600;
          background-color: var(--accent-color);
          border: none;
          margin-top: 1.5rem;
        }
        
        .empty-cart {
          text-align: center;
          padding: 3rem 0;
        }
        
        .empty-cart-icon {
          font-size: 5rem;
          color: #ddd;
          margin-bottom: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .cart-item-image-container {
            height: 120px;
          }
          
          .cart-item .col-md-2 {
            margin-top: 1rem;
            justify-content: flex-start !important;
          }
        }
        
        @media (max-width: 576px) {
          .cart-item-image-container {
            height: 100px;
          }
          
          .quantity-controls {
            width: 90%;
          }
        }
      </style>
    </head>
    <body>
<div class="cart-container">
  <div class="cart-header">
    <h2><i class="fas fa-shopping-cart me-2"></i> Your Cart (${totalItems} items)</h2>
  </div>
  
  <div class="row mt-3">
    <div class="col-lg-8">
      <div class="cart-items-container">
        ${cartHtml || `
          <div class="empty-cart">
            <div class="empty-cart-icon">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything to your cart yet</p>
            <a href="/home" class="btn btn-primary">Continue Shopping</a>
          </div>
        `}
      </div>
    </div>
    
    ${cartHtml ? `
    <div class="col-lg-4 mt-3 mt-lg-0">
      <div class="summary-card">
        <h5 class="summary-title">Order Summary</h5>
        
        <div class="summary-row">
          <span>Subtotal (${totalItems} items)</span>
          <span>₹${total}</span>
        </div>
        
        <div class="summary-row">
          <span>Delivery Charges</span>
          <span>FREE</span>
        </div>
        
        <div class="summary-row summary-total">
          <span>Total Amount</span>
          <span>₹${total}</span>
        </div>
        
        <form action="/checkout" method="post">
          <button type="submit" class="btn btn-primary checkout-btn">
            Proceed to Checkout
          </button>
        </form>
        
        <div class="text-center mt-3">
          <a href="/home" class="text-decoration-none">
            <i class="fas fa-arrow-left me-2"></i>Continue Shopping
          </a>
        </div>
      </div>
    </div>
    ` : ''}
  </div>
</div>
      
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      <script>
        async function updateQuantity(productId, change) {
          try {
            const response = await fetch('/updatecart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                productId: productId,
                quantityChange: change
              })
            });
            
            if (response.ok) {
              location.reload();
            } else {
              alert('Failed to update quantity');
            }
          } catch (error) {
            console.error('Error:', error);
            alert('An error occurred');
          }
        }
      </script>
    </body>
    </html>
  `);
});
// Remove from cart
app.get("/removefromcart/:id", async (req, res) => {
  if (!currentUser) return res.redirect("/login");

  const user = await User.findById(currentUser._id);
  user.cart = user.cart.filter((item) => item._id.toString() !== req.params.id);

  await user.save();
  currentUser = user;
  res.redirect("/cart");
});

// Buy now
app.post("/buynow/:id", async (req, res) => {
  if (!currentUser) return res.redirect("/login");

  const productId = req.params.id;
  const { quantity, size, color } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.send("Product not found");

  // Create a temporary cart with just this product
  const user = await User.findById(currentUser._id);
  user.cart = [
    {
      productId,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      discount: product.discount,
      mainImage: product.mainImage,
      quantity: parseInt(quantity),
      size: size || "",
      color: color || "",
      brand: product.brand,
      category: product.category,
    },
  ];

  await user.save();
  currentUser = user;
  res.redirect("/checkout");
});

// Checkout
app.get("/checkout", async (req, res) => {
  if (!currentUser) return res.redirect("/login");

  const user = await User.findById(currentUser._id);
  let total = 0;
  let totalItems = 0;

  user.cart.forEach((item) => {
    total += item.price * item.quantity;
    totalItems += item.quantity;
  });

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Checkout</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <style>
        :root {
          --primary-color: #3498db;
          --secondary-color: #2c3e50;
          --accent-color: #e74c3c;
          --light-gray: #f8f9fa;
          --success-color: #28a745;
        }
        
        body {
          background-color: #f5f5f5;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .checkout-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 15px;
        }
        
        .checkout-header {
          background-color: white;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          margin-bottom: 2rem;
        }
        
        .checkout-steps {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          position: relative;
        }
        
        .checkout-steps::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #dee2e6;
          z-index: 1;
        }
        
        .step {
          text-align: center;
          position: relative;
          z-index: 2;
          flex: 1;
        }
        
        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          font-weight: bold;
        }
        
        .step.active .step-number {
          background-color: var(--success-color);
        }
        
        .step-title {
          font-weight: 500;
          color: var(--secondary-color);
        }
        
        .checkout-body {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }
        
        .checkout-section {
          flex: 1;
          min-width: 300px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          padding: 1.5rem;
        }
        
        .section-title {
          border-bottom: 2px solid var(--light-gray);
          padding-bottom: 0.8rem;
          margin-bottom: 1.5rem;
          color: var(--secondary-color);
        }
        
        .address-details {
          line-height: 1.8;
        }
        
        .change-address {
          margin-top: 1rem;
        }
        
        .cart-item {
          display: flex;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--light-gray);
        }
        
        .cart-item-image {
          width: 80px;
          height: 80px;
          object-fit: contain;
          margin-right: 1rem;
          background-color: var(--light-gray);
          border-radius: 5px;
          padding: 5px;
        }
        
        .cart-item-details {
          flex: 1;
        }
        
        .cart-item-name {
          font-weight: 600;
          margin-bottom: 0.3rem;
        }
        
        .cart-item-meta {
          font-size: 0.9rem;
          color: #6c757d;
        }
        
        .cart-item-price {
          font-weight: 600;
        }
        
        .order-summary {
          margin-top: 1.5rem;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.8rem;
        }
        
        .summary-total {
          font-weight: 700;
          font-size: 1.2rem;
          border-top: 1px solid var(--light-gray);
          padding-top: 1rem;
          margin-top: 1rem;
        }
        
        .payment-methods {
          margin-top: 2rem;
        }
        
        .payment-tabs {
          display: flex;
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 1.5rem;
        }
        
        .payment-tab {
          padding: 0.8rem 1.5rem;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          font-weight: 500;
        }
        
        .payment-tab.active {
          border-bottom-color: var(--primary-color);
          color: var(--primary-color);
        }
        
        .qr-container {
          text-align: center;
          padding: 1.5rem;
          background-color: var(--light-gray);
          border-radius: 10px;
          margin: 1.5rem 0;
        }
        
        .qr-code {
          max-width: 200px;
          margin: 0 auto;
        }
        
        .upi-id {
          background-color: white;
          padding: 1rem;
          border-radius: 5px;
          font-weight: 600;
          margin: 1rem 0;
          display: inline-block;
        }
        
        .transaction-form {
          margin-top: 1.5rem;
        }
        
        .form-label {
          font-weight: 500;
          margin-bottom: 0.5rem;
          display: block;
        }
        
        .form-control {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ced4da;
          border-radius: 5px;
          margin-bottom: 1rem;
        }
        
        .btn-checkout {
          width: 100%;
          padding: 1rem;
          font-weight: 600;
          background-color: var(--success-color);
          border: none;
          border-radius: 5px;
          color: white;
          margin-top: 1rem;
        }
        
        .back-link {
          display: block;
          text-align: center;
          margin-top: 2rem;
        }
        
        @media (max-width: 768px) {
          .checkout-body {
            flex-direction: column;
          }
          
          .step-title {
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 576px) {
          .checkout-steps {
            flex-wrap: wrap;
          }
          
          .step {
            flex: 0 0 50%;
            margin-bottom: 1.5rem;
          }
          
          .checkout-steps::before {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="checkout-container">
        <div class="checkout-header">
          <h1><i class="fas fa-shopping-bag me-2"></i> Checkout</h1>
          <p class="text-muted">Review your order and complete your purchase</p>
        </div>
        
        <div class="checkout-steps">
          <div class="step active">
            <div class="step-number">1</div>
            <div class="step-title">Shipping</div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-title">Payment</div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-title">Confirmation</div>
          </div>
        </div>
        
        <div class="checkout-body">
          <div class="checkout-section">
            <h3 class="section-title"><i class="fas fa-truck me-2"></i> Delivery Information</h3>
            <div class="address-details">
              <h5>${currentUser.email}</h5>
              <p>${currentUser.areaName}, ${currentUser.district}</p>
              <p>${currentUser.state} - ${currentUser.pincode}</p>
              <p>Phone: ${currentUser.phone}</p>
            </div>
         
            
            <h3 class="section-title mt-4"><i class="fas fa-box-open me-2"></i> Order Items (${totalItems})</h3>
            ${user.cart.map(item => `
              <div class="cart-item">
                <img src="/uploads/${item.mainImage}" class="cart-item-image" alt="${item.name}">
                <div class="cart-item-details">
                  <div class="cart-item-name">${item.name}</div>
                  ${item.size || item.color ? `
                  <div class="cart-item-meta">
                    ${item.size ? `<span>Size: ${item.size}</span>` : ''}
                    ${item.size && item.color ? ' • ' : ''}
                    ${item.color ? `<span>Color: ${item.color}</span>` : ''}
                  </div>
                  ` : ''}
                  <div class="cart-item-price">₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}</div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="checkout-section">
            <h3 class="section-title"><i class="fas fa-credit-card me-2"></i> Payment Method</h3>
            
            <div class="payment-methods">
              <div class="payment-tabs">
                <div class="payment-tab active">UPI Payment</div>
              </div>
              
              <div class="payment-content">
                <p>Scan the QR code below or send payment to our UPI ID</p>
                
                <div class="qr-container">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=merchant@upi&pn=E-commerce&am=${total}&cu=INR" class="qr-code" alt="UPI QR Code">
                  <div class="mt-3">
                    <p>Or send payment to:</p>
                    <div class="upi-id">
                      <i class="fas fa-wallet me-2"></i> merchant@upi
                    </div>
                  </div>
                </div>
                
                <form action="/completeorder" method="post" class="transaction-form">
                  <label for="upiId" class="form-label">Enter 12-digit UPI Transaction ID:</label>
                  <input type="text" id="upiId" name="upiId" class="form-control" pattern="[0-9]{12}" required placeholder="e.g., 123456789012">
                  <button type="submit" class="btn-checkout">
                    <i class="fas fa-lock me-2"></i> Complete Secure Payment
                  </button>
                </form>
              </div>
            </div>
            
            <div class="order-summary">
              <h3 class="section-title"><i class="fas fa-receipt me-2"></i> Order Summary</h3>
              <div class="summary-row">
                <span>Subtotal (${totalItems} items)</span>
                <span>₹${total}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div class="summary-row summary-total">
                <span>Total Amount</span>
                <span>₹${total}</span>
              </div>
            </div>
          </div>
        </div>
        
        <a href="/cart" class="back-link">
          <i class="fas fa-arrow-left me-2"></i> Back to Cart
        </a>
      </div>
      
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
  `);
});
app.post("/completeorder", async (req, res) => {
  if (!currentUser) return res.redirect("/login");

  const user = await User.findById(currentUser._id);
  let total = 0;
  const products = [];

  user.cart.forEach((item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    total += price * quantity;

    products.push({
      productId: item.productId,
      name: item.name,
      price: price,
      mrp: item.mrp,
      discount: item.discount,
      quantity: quantity,
      size: item.size,
      color: item.color,
      mainImage: item.mainImage,
      brand: item.brand,
      category: item.category,
    });
  });

  const order = new Order({
    userId: currentUser._id,
    userDetails: {
      email: currentUser.email,
      phone: currentUser.phone,
      address: {
        state: currentUser.state,
        district: currentUser.district,
        areaName: currentUser.areaName,
        pincode: currentUser.pincode,
      },
    },
    products,
    totalAmount: total,
    upiTransactionId: req.body.upiId,
  });

  await order.save();

  // Clear cart
  user.cart = [];
  await user.save();
  currentUser = user;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <style>
        :root {
          --primary-color: #3498db;
          --secondary-color: #2c3e50;
          --accent-color: #28a745;
          --light-gray: #f8f9fa;
        }
        
        body {
          background-color: #f5f5f5;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .confirmation-container {
          max-width: 1000px;
          margin: 2rem auto;
          padding: 0 15px;
        }
        
        .confirmation-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .success-icon {
          font-size: 5rem;
          color: var(--accent-color);
          margin-bottom: 1rem;
          animation: bounce 1s;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-30px);}
          60% {transform: translateY(-15px);}
        }
        
        .order-card {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .order-details {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .order-section {
          flex: 1;
          min-width: 250px;
        }
        
        .order-section-title {
          border-bottom: 2px solid var(--light-gray);
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
          color: var(--secondary-color);
        }
        
        .detail-row {
          display: flex;
          margin-bottom: 0.8rem;
        }
        
        .detail-label {
          font-weight: 600;
          min-width: 120px;
          color: var(--secondary-color);
        }
        
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        
        .product-card {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 1rem;
          transition: transform 0.3s;
        }
        
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .product-image-container {
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          background-color: var(--light-gray);
          border-radius: 5px;
        }
        
        .product-image {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
        
        .product-name {
          font-weight: 600;
          margin-bottom: 0.5rem;
          height: 40px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .product-price {
          font-weight: 700;
          color: var(--accent-color);
        }
        
        .product-meta {
          font-size: 0.9rem;
          color: #6c757d;
          margin-top: 0.5rem;
        }
        
        .continue-shopping {
          text-align: center;
          margin-top: 2rem;
        }
        
        .btn-continue {
          padding: 10px 30px;
          font-weight: 600;
        }
        
        .timeline {
          position: relative;
          padding-left: 3rem;
          margin: 2rem 0;
        }
        
        .timeline::before {
          content: '';
          position: absolute;
          left: 1.5rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: var(--primary-color);
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 2rem;
        }
        
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -3rem;
          top: 0;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: var(--primary-color);
          border: 4px solid white;
        }
        
        .timeline-item.active::before {
          background-color: var(--accent-color);
        }
        
        .timeline-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .timeline-date {
          font-size: 0.9rem;
          color: #6c757d;
        }
        
        @media (max-width: 768px) {
          .order-details {
            flex-direction: column;
            gap: 1.5rem;
          }
          
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
        }
        
        @media (max-width: 576px) {
          .confirmation-header h1 {
            font-size: 1.8rem;
          }
          
          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="confirmation-container">
        <div class="confirmation-header">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h1>Order Confirmed!</h1>
          <p class="lead">Thank you for your purchase, ${currentUser.email.split('@')[0]}!</p>
          <p>Your order #${order._id} has been placed successfully.</p>
        </div>
        
        <div class="order-card">
          <div class="order-details">
            <div class="order-section">
              <h3 class="order-section-title">Order Summary</h3>
              <div class="detail-row">
                <span class="detail-label">Order Number:</span>
                <span>${order._id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span>${new Date().toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="fw-bold">₹${total}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span>UPI (${req.body.upiId})</span>
              </div>
            </div>
            
            <div class="order-section">
              <h3 class="order-section-title">Delivery Address</h3>
              <p>${order.userDetails.address.areaName}</p>
              <p>${order.userDetails.address.district}</p>
              <p>${order.userDetails.address.state} - ${order.userDetails.address.pincode}</p>
              <p>Phone: ${order.userDetails.phone}</p>
            </div>
          </div>
          
          <div class="timeline">
            <div class="timeline-item active">
              <h4 class="timeline-title">Order Placed</h4>
              <p class="timeline-date">Today</p>
              <p>We've received your order</p>
            </div>
            <div class="timeline-item">
              <h4 class="timeline-title">Processing</h4>
              <p>Preparing your items</p>
            </div>
            <div class="timeline-item">
              <h4 class="timeline-title">Shipped</h4>
              <p>On its way to you</p>
            </div>
           
          </div>
          
          <h3 class="order-section-title">Your Items</h3>
          <div class="products-grid">
            ${order.products.map(product => `
              <div class="product-card">
                <div class="product-image-container">
                  <img src="/uploads/${product.mainImage}" class="product-image" alt="${product.name}">
                </div>
                <h5 class="product-name">${product.name}</h5>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="product-price">₹${product.price}</span>
                  <span class="text-muted">Qty: ${product.quantity}</span>
                </div>
                ${product.size || product.color ? `
                <div class="product-meta">
                  ${product.size ? `<div>Size: ${product.size}</div>` : ''}
                  ${product.color ? `<div>Color: ${product.color}</div>` : ''}
                </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="continue-shopping">
          <a href="/home" class="btn btn-primary btn-continue">
            <i class="fas fa-arrow-left me-2"></i> Continue Shopping
          </a>
        </div>
      </div>
      
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
  `);
});

// Add this route for the JavaScript search
app.get("/api/search", async (req, res) => {
  const searchQuery = req.query.q || "";

  if (!searchQuery) {
    return res.json([]);
  }

  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { brand: { $regex: searchQuery, $options: "i" } },
        { category: { $regex: searchQuery, $options: "i" } },
        { tags: { $regex: searchQuery, $options: "i" } },
      ],
    });

    // Sort by relevance
    products.sort((a, b) => {
      const aNameMatch = a.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const bNameMatch = b.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      return 0;
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// Logout
app.get("/logout", (req, res) => {
  currentUser = null;
  adminLoggedIn = false;
  res.redirect("/");
});

// Admin routes
app.get("/admin", async (req, res) => {
  if (!adminLoggedIn) return res.redirect("/login");

  try {
    // Fetch real data from database
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      recentOrders,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5),
      User.find().sort({ createdAt: -1 }).limit(5)
    ]);

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Dashboard</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
          :root {
            --primary-color: #3498db;
            --secondary-color: #2c3e50;
            --accent-color: #e74c3c;
            --success-color: #28a745;
            --light-gray: #f8f9fa;
            --sidebar-width: 250px;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
          }
          
          .dashboard-container {
            display: flex;
            min-height: 100vh;
          }
          
          .sidebar {
            width: var(--sidebar-width);
            background-color: var(--secondary-color);
            color: white;
            position: fixed;
            height: 100vh;
            transition: all 0.3s;
            z-index: 1000;
          }
          
          .sidebar-header {
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          
          .sidebar-menu {
            padding: 1rem 0;
          }
          
          .menu-item {
            padding: 0.8rem 1.5rem;
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            display: flex;
            align-items: center;
            transition: all 0.2s;
            border-left: 3px solid transparent;
          }
          
          .menu-item:hover, .menu-item.active {
            background-color: rgba(255,255,255,0.1);
            color: white;
            border-left-color: var(--primary-color);
          }
          
          .menu-item i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
          }
          
          .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: 2rem;
            transition: all 0.3s;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #eee;
          }
          
          .stats-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }
          
          .stat-card {
            background-color: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          
          .stat-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            font-size: 1.2rem;
          }
          
          .stat-icon.users {
            background-color: rgba(52, 152, 219, 0.1);
            color: var(--primary-color);
          }
          
          .stat-icon.orders {
            background-color: rgba(231, 76, 60, 0.1);
            color: var(--accent-color);
          }
          
          .stat-icon.products {
            background-color: rgba(40, 167, 69, 0.1);
            color: var(--success-color);
          }
          
          .stat-icon.revenue {
            background-color: rgba(155, 89, 182, 0.1);
            color: #9b59b6;
          }
          
          .stat-value {
            font-size: 1.8rem;
            font-weight: 700;
            margin: 0.5rem 0;
          }
          
          .stat-label {
            color: #6c757d;
            font-size: 0.9rem;
          }
          
          .recent-table {
            background-color: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            margin-bottom: 2rem;
          }
          
          .table-title {
            margin-bottom: 1.5rem;
            padding-bottom: 0.8rem;
            border-bottom: 1px solid #eee;
          }
          
          .table-responsive {
            overflow-x: auto;
          }
          
          .table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .table th, .table td {
            padding: 0.75rem;
            vertical-align: top;
            border-top: 1px solid #dee2e6;
          }
          
          .table thead th {
            vertical-align: bottom;
            border-bottom: 2px solid #dee2e6;
          }
          
          .mobile-menu-btn {
            display: none;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--secondary-color);
          }
          
          @media (max-width: 992px) {
            .sidebar {
              transform: translateX(-100%);
            }
            
            .sidebar.active {
              transform: translateX(0);
            }
            
            .main-content {
              margin-left: 0;
            }
            
            .mobile-menu-btn {
              display: block;
            }
          }
          
          @media (max-width: 576px) {
            .main-content {
              padding: 1rem;
            }
            
            .stats-cards {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="dashboard-container">
          <!-- Sidebar -->
          <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
              <h3>Admin Panel</h3>
            </div>
            <div class="sidebar-menu">
              <a href="/admin" class="menu-item active">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
              <a href="/admin/users" class="menu-item">
                <i class="fas fa-users"></i>
                <span>Users</span>
              </a>
              <a href="/admin/orders" class="menu-item">
                <i class="fas fa-shopping-bag"></i>
                <span>Orders</span>
              </a>
              <a href="/admin/products" class="menu-item">
                <i class="fas fa-box-open"></i>
                <span>Products</span>
              </a>
              <a href="/admin/addproduct" class="menu-item">
                <i class="fas fa-plus-circle"></i>
                <span>Add Product</span>
              </a>
              <a href="/logout" class="menu-item">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </a>
            </div>
          </div>
          
          <!-- Main Content -->
          <div class="main-content">
            <div class="header">
              <button class="mobile-menu-btn" id="mobileMenuBtn">
                <i class="fas fa-bars"></i>
              </button>
              <h2>Dashboard Overview</h2>
              <div class="text-muted">Welcome back, Admin</div>
            </div>
            
            <!-- Stats Cards -->
            <div class="stats-cards">
              <div class="stat-card">
                <div class="stat-icon users">
                  <i class="fas fa-users"></i>
                </div>
                <div class="stat-value">${totalUsers}</div>
                <div class="stat-label">Total Users</div>
                <a href="/admin/users" class="text-primary small">View all</a>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon orders">
                  <i class="fas fa-shopping-bag"></i>
                </div>
                <div class="stat-value">${totalOrders}</div>
                <div class="stat-label">Total Orders</div>
                <a href="/admin/orders" class="text-primary small">View all</a>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon products">
                  <i class="fas fa-box-open"></i>
                </div>
                <div class="stat-value">${totalProducts}</div>
                <div class="stat-label">Products</div>
                <a href="/admin/products" class="text-primary small">View all</a>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon revenue">
                  <i class="fas fa-rupee-sign"></i>
                </div>
                <div class="stat-value">₹${totalRevenue.toFixed(2)}</div>
                <div class="stat-label">Total Revenue</div>
                <a href="/admin/orders" class="text-primary small">View report</a>
              </div>
            </div>
            
            <!-- Recent Orders -->
            <div class="recent-table">
              <h4 class="table-title">
                <i class="fas fa-shopping-bag me-2"></i> Recent Orders
              </h4>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recentOrders.map(order => `
                      <tr>
                        <td><a href="/admin/orders/${order._id}">${order._id}</a></td>
                        <td>${order.userDetails.email}</td>
                        <td>₹${order.totalAmount.toFixed(2)}</td>
                        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                        <td><span class="badge bg-primary">Processing</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Recent Users -->
            <div class="recent-table">
              <h4 class="table-title">
                <i class="fas fa-users me-2"></i> Recent Users
              </h4>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recentUsers.map(user => `
                      <tr>
                        <td>${user.email}</td>
                        <td>${user.phone || 'N/A'}</td>
                        <td>${user.district || ''}, ${user.state || ''}</td>
                        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script>
          // Mobile menu toggle
          document.getElementById('mobileMenuBtn').addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('active');
          });
          
          // Close sidebar when clicking outside on mobile
          document.addEventListener('click', function(event) {
            const sidebar = document.getElementById('sidebar');
            const mobileBtn = document.getElementById('mobileMenuBtn');
            
            if (window.innerWidth <= 992 && 
                !sidebar.contains(event.target) && 
                event.target !== mobileBtn && 
                !mobileBtn.contains(event.target)) {
              sidebar.classList.remove('active');
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    res.status(500).send("Error loading dashboard");
  }
});
// Admin - Users
app.get("/admin/users", async (req, res) => {
  if (!adminLoggedIn) return res.redirect("/login");

  try {
    const users = await User.find().sort({ createdAt: -1 });
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastActive: { $gt: new Date(Date.now() - 30*24*60*60*1000) } });

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Management</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
          :root {
            --primary-color: #3498db;
            --secondary-color: #2c3e50;
            --accent-color: #e74c3c;
            --success-color: #28a745;
            --light-gray: #f8f9fa;
            --sidebar-width: 250px;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
          }
          
          .dashboard-container {
            display: flex;
            min-height: 100vh;
          }
          
          .sidebar {
            width: var(--sidebar-width);
            background-color: var(--secondary-color);
            color: white;
            position: fixed;
            height: 100vh;
            transition: all 0.3s;
            z-index: 1000;
          }
          
          .sidebar-header {
            padding: 1rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          
          .sidebar-menu {
            padding: 1rem 0;
            overflow-y: auto;
            height: calc(100% - 60px);
          }
          
          .menu-item {
            padding: 0.7rem 1rem;
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            display: flex;
            align-items: center;
            transition: all 0.2s;
            border-left: 3px solid transparent;
            font-size: 0.9rem;
          }
          
          .menu-item:hover, .menu-item.active {
            background-color: rgba(255,255,255,0.1);
            color: white;
            border-left-color: var(--primary-color);
          }
          
          .menu-item i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
          }
          
          .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: 1.5rem;
            transition: all 0.3s;
          }
          
          .header {
            display: flex;
            flex-direction: column;
            margin-bottom: 1.5rem;
          }
          
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
          }
          
          .stats-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          
          .stat-card {
            background-color: white;
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          }
          
          .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.5rem;
            font-size: 1rem;
          }
          
          .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0.3rem 0;
          }
          
          .stat-label {
            color: #6c757d;
            font-size: 0.8rem;
          }
          
          .user-table-container {
            background-color: white;
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            margin-bottom: 1.5rem;
            overflow-x: auto;
          }
          
          .table-title {
            display: flex;
            flex-direction: column;
            margin-bottom: 1rem;
          }
          
          .search-box {
            width: 100%;
            margin-top: 0.5rem;
          }
          
          .table {
            width: 100%;
            min-width: 600px; /* Ensures table doesn't collapse on mobile */
            border-collapse: collapse;
            font-size: 0.85rem;
          }
          
          .table th, .table td {
            padding: 0.5rem;
            vertical-align: middle;
            border-top: 1px solid #dee2e6;
          }
          
          .table thead th {
            vertical-align: bottom;
            border-bottom: 2px solid #dee2e6;
            font-weight: 600;
            color: var(--secondary-color);
            font-size: 0.8rem;
          }
          
          .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
            background-color: var(--light-gray);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-color);
            font-weight: bold;
            font-size: 0.7rem;
          }
          
          .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 50px;
            font-size: 0.7rem;
            font-weight: 600;
          }
          
          .action-btn {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 0 2px;
            font-size: 0.7rem;
          }
          
          .pagination {
            justify-content: center;
            margin-top: 1rem;
            flex-wrap: wrap;
          }
          
          .page-item .page-link {
            padding: 0.3rem 0.6rem;
            font-size: 0.8rem;
          }
          
          .mobile-menu-btn {
            display: none;
            background: none;
            border: none;
            font-size: 1.2rem;
            color: var(--secondary-color);
            padding: 0.5rem;
          }
          
          /* Mobile styles */
          @media (max-width: 992px) {
            .sidebar {
              transform: translateX(-100%);
              width: 280px;
            }
            
            .sidebar.active {
              transform: translateX(0);
            }
            
            .main-content {
              margin-left: 0;
              padding: 1rem;
            }
            
            .mobile-menu-btn {
              display: block;
            }
            
            .header h2 {
              font-size: 1.5rem;
            }
            
            .stats-cards {
              grid-template-columns: 1fr 1fr;
            }
            
            .stat-card {
              padding: 0.8rem;
            }
          }
          
          @media (max-width: 576px) {
            .stats-cards {
              grid-template-columns: 1fr;
            }
            
            .table-title h4 {
              font-size: 1.2rem;
            }
            
            .main-content {
              padding: 0.75rem;
            }
            
            .user-table-container {
              padding: 0.75rem;
            }
            
            /* Stack action buttons on mobile */
            .table td:last-child {
              white-space: nowrap;
            }
          }
        </style>
      </head>
      <body>
        <div class="dashboard-container">
          <!-- Sidebar -->
          <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
              <h3 style="font-size: 1.2rem;">Admin Panel</h3>
            </div>
            <div class="sidebar-menu">
              <a href="/admin" class="menu-item">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
              <a href="/admin/users" class="menu-item active">
                <i class="fas fa-users"></i>
                <span>Users</span>
              </a>
              <a href="/admin/orders" class="menu-item">
                <i class="fas fa-shopping-bag"></i>
                <span>Orders</span>
              </a>
              <a href="/admin/products" class="menu-item">
                <i class="fas fa-box-open"></i>
                <span>Products</span>
              </a>
              <a href="/admin/addproduct" class="menu-item">
                <i class="fas fa-plus-circle"></i>
                <span>Add Product</span>
              </a>
              <a href="/logout" class="menu-item">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </a>
            </div>
          </div>
          
          <!-- Main Content -->
          <div class="main-content">
            <div class="header">
              <div class="header-top">
                <button class="mobile-menu-btn" id="mobileMenuBtn">
                  <i class="fas fa-bars"></i>
                </button>
                <h2>User Management</h2>
              </div>
              <div class="text-muted" style="font-size: 0.9rem;">Manage all registered users</div>
            </div>
            
            <!-- Stats Cards -->
            <div class="stats-cards">
              <div class="stat-card">
                <div class="stat-icon users">
                  <i class="fas fa-users"></i>
                </div>
                <div class="stat-value">${totalUsers}</div>
                <div class="stat-label">Total Users</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon active">
                  <i class="fas fa-user-check"></i>
                </div>
                <div class="stat-value">${activeUsers}</div>
                <div class="stat-label">Active Users</div>
              </div>
            </div>
            
            <!-- Users Table -->
            <div class="user-table-container">
              <div class="table-title">
                <h4><i class="fas fa-users me-2"></i> All Users</h4>
                <div class="search-box">
                  <div class="input-group">
                    <input type="text" class="form-control" placeholder="Search users...">
                    <button class="btn btn-outline-secondary" type="button">
                      <i class="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${users.map(user => {
                      const isActive = user.lastActive && (new Date() - new Date(user.lastActive) < 30*24*60*60*1000);
                      const initials = user.email.substring(0, 2).toUpperCase();
                      return `
                        <tr>
                          <td>
                            <div class="d-flex align-items-center">
                              <div class="user-avatar me-2">
                                ${initials}
                              </div>
                              <div>
                                <div class="fw-bold" style="font-size: 0.85rem;">${user.email}</div>
                                <div class="text-muted small" style="font-size: 0.7rem;">ID: ${user._id.toString().substring(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style="font-size: 0.85rem;">${user.phone || 'N/A'}</div>
                            <div class="text-muted small" style="font-size: 0.7rem;">${new Date(user.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td>
                            <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
                              ${isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div class="d-flex">
                              <a href="/admin/userdetails/${user._id}" class="btn btn-sm btn-primary action-btn" title="View">
                                <i class="fas fa-eye"></i>
                              </a>
                              <button class="btn btn-sm btn-warning action-btn" title="Edit">
                                <i class="fas fa-edit"></i>
                              </button>
                              <button class="btn btn-sm btn-danger action-btn" title="Delete">
                                <i class="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
              
              <nav aria-label="Page navigation">
                <ul class="pagination">
                  <li class="page-item disabled">
                    <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
                  </li>
                  <li class="page-item active"><a class="page-link" href="#">1</a></li>
                  <li class="page-item"><a class="page-link" href="#">2</a></li>
                  <li class="page-item"><a class="page-link" href="#">3</a></li>
                  <li class="page-item">
                    <a class="page-link" href="#">Next</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script>
          // Mobile menu toggle
          document.getElementById('mobileMenuBtn').addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('active');
          });
          
          // Close sidebar when clicking outside on mobile
          document.addEventListener('click', function(event) {
            const sidebar = document.getElementById('sidebar');
            const mobileBtn = document.getElementById('mobileMenuBtn');
            
            if (window.innerWidth <= 992 && 
                !sidebar.contains(event.target) && 
                event.target !== mobileBtn && 
                !mobileBtn.contains(event.target)) {
              sidebar.classList.remove('active');
            }
          });
          
          // Search functionality
          document.querySelector('.search-box input').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
              const email = row.querySelector('td:nth-child(1) .fw-bold').textContent.toLowerCase();
              const phone = row.querySelector('td:nth-child(2) div').textContent.toLowerCase();
              
              if (email.includes(searchTerm) || phone.includes(searchTerm)) {
                row.style.display = '';
              } else {
                row.style.display = 'none';
              }
            });
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error loading users:", error);
    res.status(500).send("Error loading user data");
  }
});
app.get("/admin/userdetails/:id", async (req, res) => {
  if (!adminLoggedIn) return res.redirect("/login");

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");

    // Calculate user activity status
    const isActive = user.lastActive && (new Date() - new Date(user.lastActive) < 30*24*60*60*1000);
    const initials = user.email.substring(0, 2).toUpperCase();
    const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Details | Admin Panel</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary-color: #4361ee;
            --secondary-color: #3a0ca3;
            --accent-color: #f72585;
            --success-color: #4cc9f0;
            --light-gray: #f8f9fa;
            --dark-gray: #212529;
            --sidebar-width: 250px;
          }
          
          body {
            font-family: 'Poppins', sans-serif;
            background-color: #f5f7fa;
            color: var(--dark-gray);
          }
          
          .dashboard-container {
            display: flex;
            min-height: 100vh;
          }
          
          /* Sidebar styles */
          .sidebar {
            width: var(--sidebar-width);
            background-color: white;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            position: fixed;
            height: 100vh;
            transition: all 0.3s ease;
            z-index: 1000;
          }
          
          .sidebar-header {
            padding: 1.5rem;
            border-bottom: 1px solid rgba(0,0,0,0.1);
            background-color: var(--primary-color);
            color: white;
          }
          
          .sidebar-menu {
            padding: 1rem 0;
          }
          
          .menu-item {
            padding: 0.8rem 1.5rem;
            color: var(--dark-gray);
            text-decoration: none;
            display: flex;
            align-items: center;
            transition: all 0.2s;
            border-left: 3px solid transparent;
          }
          
          .menu-item:hover, .menu-item.active {
            background-color: rgba(67, 97, 238, 0.1);
            color: var(--primary-color);
            border-left-color: var(--primary-color);
          }
          
          .menu-item i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
          }
          
          /* Main content */
          .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: 2rem;
            transition: all 0.3s;
          }
          
          /* Header */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            animation: fadeInDown 0.5s ease;
          }
          
          .back-btn {
            background-color: white;
            border: 1px solid #dee2e6;
            border-radius: 50px;
            padding: 0.5rem 1rem;
            display: flex;
            align-items: center;
            transition: all 0.2s;
          }
          
          .back-btn:hover {
            background-color: var(--light-gray);
            transform: translateX(-3px);
          }
          
          /* User profile card */
          .profile-card {
            background-color: white;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            overflow: hidden;
            margin-bottom: 2rem;
            animation: fadeIn 0.6s ease;
            transition: transform 0.3s ease;
          }
          
          .profile-card:hover {
            transform: translateY(-5px);
          }
          
          .profile-header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            padding: 2rem;
            color: white;
            text-align: center;
            position: relative;
          }
          
          .profile-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background-color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary-color);
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          }
          
          .profile-status {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background-color: ${isActive ? 'var(--success-color)' : '#adb5bd'};
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 500;
            animation: pulse 2s infinite;
          }
          
          .profile-body {
            padding: 2rem;
          }
          
          .info-row {
            display: flex;
            margin-bottom: 1.5rem;
            animation: fadeInUp 0.5s ease;
          }
          
          .info-label {
            flex: 0 0 150px;
            font-weight: 500;
            color: #6c757d;
          }
          
          .info-value {
            flex: 1;
            font-weight: 500;
          }
          
          /* Stats cards */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }
          
          .stat-card {
            background-color: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 3px 10px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
            animation: fadeInUp 0.5s ease;
          }
          
          .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          }
          
          .stat-icon {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            font-size: 1.2rem;
            color: white;
          }
          
          .stat-icon.orders {
            background-color: var(--accent-color);
          }
          
          .stat-icon.value {
            background-color: var(--success-color);
          }
          
          .stat-icon.joined {
            background-color: #7209b7;
          }
          
          .stat-value {
            font-size: 1.8rem;
            font-weight: 700;
            margin: 0.5rem 0;
          }
          
          .stat-label {
            color: #6c757d;
            font-size: 0.9rem;
          }
          
          /* Action buttons */
          .action-btns {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            flex-wrap: wrap;
          }
          
          .btn-edit {
            background-color: #4cc9f0;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.8rem 1.5rem;
            display: flex;
            align-items: center;
            transition: all 0.2s;
          }
          
          .btn-delete {
            background-color: var(--accent-color);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.8rem 1.5rem;
            display: flex;
            align-items: center;
            transition: all 0.2s;
          }
          
          .btn-secondary {
            background-color: #6c757d;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.8rem 1.5rem;
            display: flex;
            align-items: center;
            transition: all 0.2s;
          }
          
          .btn-edit:hover, .btn-delete:hover, .btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          }
          
          /* Animations */
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(76, 201, 240, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(76, 201, 240, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(76, 201, 240, 0);
            }
          }
          
          /* Responsive styles */
          @media (max-width: 992px) {
            .sidebar {
              transform: translateX(-100%);
            }
            
            .sidebar.active {
              transform: translateX(0);
            }
            
            .main-content {
              margin-left: 0;
              padding: 1.5rem;
            }
            
            .mobile-menu-btn {
              display: block;
            }
            
            .info-row {
              flex-direction: column;
            }
            
            .info-label {
              flex: 1;
              margin-bottom: 0.5rem;
            }
          }
          
          @media (max-width: 768px) {
            .stats-grid {
              grid-template-columns: 1fr;
            }
            
            .profile-header {
              padding: 1.5rem;
            }
            
            .profile-body {
              padding: 1.5rem;
            }
            
            .action-btns {
              flex-direction: column;
              gap: 0.5rem;
            }
            
            .btn-edit, .btn-delete, .btn-secondary {
              width: 100%;
              justify-content: center;
            }
          }
          
          @media (max-width: 576px) {
            .main-content {
              padding: 1rem;
            }
            
            .profile-avatar {
              width: 80px;
              height: 80px;
              font-size: 1.5rem;
            }
            
            .header h2 {
              font-size: 1.5rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="dashboard-container">
          <!-- Sidebar -->
          <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
              <h3>Admin Panel</h3>
            </div>
            <div class="sidebar-menu">
              <a href="/admin" class="menu-item">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
              <a href="/admin/users" class="menu-item active">
                <i class="fas fa-users"></i>
                <span>Users</span>
              </a>
              <a href="/admin/orders" class="menu-item">
                <i class="fas fa-shopping-bag"></i>
                <span>Orders</span>
              </a>
              <a href="/admin/products" class="menu-item">
                <i class="fas fa-box-open"></i>
                <span>Products</span>
              </a>
              <a href="/admin/addproduct" class="menu-item">
                <i class="fas fa-plus-circle"></i>
                <span>Add Product</span>
              </a>
              <a href="/logout" class="menu-item">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </a>
            </div>
          </div>
          
          <!-- Main Content -->
          <div class="main-content">
            <div class="header">
              <a href="/admin/users" class="back-btn">
                <i class="fas fa-arrow-left me-2"></i> Back to Users
              </a>
              <h2>User Details</h2>
            </div>
            
            <!-- Stats Cards -->
            <div class="stats-grid">
              <div class="stat-card" style="animation-delay: 0.1s">
                <div class="stat-icon orders">
                  <i class="fas fa-shopping-bag"></i>
                </div>
                <div class="stat-value">12</div>
                <div class="stat-label">Total Orders</div>
              </div>
              
              <div class="stat-card" style="animation-delay: 0.2s">
                <div class="stat-icon value">
                  <i class="fas fa-rupee-sign"></i>
                </div>
                <div class="stat-value">₹8,450</div>
                <div class="stat-label">Total Value</div>
              </div>
              
              <div class="stat-card" style="animation-delay: 0.3s">
                <div class="stat-icon joined">
                  <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="stat-value">${joinDate}</div>
                <div class="stat-label">Joined Date</div>
              </div>
            </div>
            
            <!-- Profile Card -->
            <div class="profile-card">
              <div class="profile-header">
                <div class="profile-avatar">${initials}</div>
                <h3>${user.email}</h3>
                <div class="profile-status">${isActive ? 'Active' : 'Inactive'}</div>
              </div>
              
              <div class="profile-body">
                <div class="info-row" style="animation-delay: 0.1s">
                  <div class="info-label">Email Address</div>
                  <div class="info-value">${user.email}</div>
                </div>
                
                <div class="info-row" style="animation-delay: 0.2s">
                  <div class="info-label">Phone Number</div>
                  <div class="info-value">${user.phone || 'Not provided'}</div>
                </div>
                
                <div class="info-row" style="animation-delay: 0.3s">
                  <div class="info-label">Full Address</div>
                  <div class="info-value">
                    ${user.areaName || ''}, ${user.district || ''}<br>
                    ${user.state || ''} - ${user.pincode || ''}
                  </div>
                </div>
                
                <div class="info-row" style="animation-delay: 0.4s">
                  <div class="info-label">Account Status</div>
                  <div class="info-value">
                    <span class="badge bg-${isActive ? 'success' : 'secondary'}">
                      ${isActive ? 'Active' : 'Inactive'}
                    </span>
                    ${isActive ? '' : '<span class="text-muted ms-2">(Last active: ' + new Date(user.lastActive).toLocaleDateString() + ')</span>'}
                  </div>
                </div>
                
                <div class="info-row" style="animation-delay: 0.5s">
                  <div class="info-label">Registered On</div>
                  <div class="info-value">${new Date(user.createdAt).toLocaleString()}</div>
                </div>
                
                <div class="action-btns">
                  <button class="btn-edit">
                    <i class="fas fa-edit me-2"></i> Edit Profile
                  </button>
                  <button class="btn-delete">
                    <i class="fas fa-trash-alt me-2"></i> Delete Account
                  </button>
                  <button class="btn-secondary">
                    <i class="fas fa-envelope me-2"></i> Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script>
          // Mobile menu toggle functionality would go here
          // (same as in your users page)
          
          // Animation on scroll
          document.addEventListener('DOMContentLoaded', function() {
            const animatedElements = document.querySelectorAll('.info-row, .stat-card');
            
            function checkAnimation() {
              animatedElements.forEach(element => {
                const elementPosition = element.getBoundingClientRect().top;
                const screenPosition = window.innerHeight / 1.3;
                
                if (elementPosition < screenPosition) {
                  element.style.opacity = '1';
                  element.style.transform = 'translateY(0)';
                }
              });
            }
            
            window.addEventListener('scroll', checkAnimation);
            checkAnimation(); // Trigger on load
          });
          
          // Delete confirmation
          document.querySelector('.btn-delete').addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
              // Add your delete logic here
              alert('User account deleted successfully');
              window.location.href = '/admin/users';
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error loading user details:", error);
    res.status(500).send("Error loading user details");
  }
});
// Admin - Orders
// Admin - Orders
app.get("/admin/orders", async (req, res) => {
  if (!adminLoggedIn) return res.redirect("/login");

  const orders = await Order.find().sort({ orderDate: -1 }); // Sort by newest first
  let ordersHtml = "";

  orders.forEach((order, index) => {
    let productsHtml = order.products
      .map(
        (item) => `
            <div class="order-product d-flex mb-3 p-2 bg-light rounded">
                <img src="/uploads/${item.mainImage}" width="60" height="60" class="object-fit-cover me-3 rounded">
                <div class="product-details">
                    <h6 class="mb-1">${item.name}</h6>
                    <p class="mb-1 small">₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}</p>
                    ${item.size ? `<p class="mb-1 small">Size: ${item.size}</p>` : ""}
                    ${item.color ? `<p class="mb-0 small">Color: <span class="color-badge" style="background-color:${item.color}"></span></p>` : ""}
                </div>
            </div>
        `
      )
      .join("");

    // Status badge with different colors
    const statusColors = {
      'Pending': 'bg-warning',
      'Processing': 'bg-info',
      'Shipped': 'bg-primary',
      'Delivered': 'bg-success',
      'Cancelled': 'bg-danger'
    };
    
    const statusClass = statusColors[order.status] || 'bg-secondary';

    ordersHtml += `
            <div class="order-card card mb-4 shadow-sm animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.05}s">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Order #${order._id.toString().substring(18, 24)}</h5>
                    <span class="badge ${statusClass}">${order.status}</span>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3 mb-md-0">
                            <h6 class="text-primary">Customer Details</h6>
                            <p class="mb-1"><i class="bi bi-person-fill me-2"></i>${order.userDetails.email}</p>
                            <p class="mb-1"><i class="bi bi-telephone-fill me-2"></i>${order.userDetails.phone}</p>
                            <p class="mb-0"><i class="bi bi-geo-alt-fill me-2"></i>
                                ${order.userDetails.address.areaName}, ${order.userDetails.address.district}, 
                                ${order.userDetails.address.state} - ${order.userDetails.address.pincode}
                            </p>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-primary">Order Summary</h6>
                            <p class="mb-1"><i class="bi bi-calendar-event me-2"></i>${new Date(order.orderDate).toLocaleString()}</p>
                            <p class="mb-1"><i class="bi bi-credit-card me-2"></i>Transaction ID: ${order.upiTransactionId}</p>
                            <p class="mb-0"><i class="bi bi-cash-stack me-2"></i>Total: <strong>₹${order.totalAmount}</strong></p>
                        </div>
                    </div>
                    
                    <hr>
                    
                    <h6 class="text-primary">Products (${order.products.length})</h6>
                    <div class="order-products-container">
                        ${productsHtml}
                    </div>
                    
                    <div class="d-flex justify-content-end mt-3">
                        <button class="btn btn-sm btn-outline-primary me-2">
                            <i class="bi bi-printer"></i> Print
                        </button>
                        <button class="btn btn-sm btn-outline-success">
                            <i class="bi bi-pencil-square"></i> Update Status
                        </button>
                    </div>
                </div>
            </div>
        `;
  });

  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Orders</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            <style>
                body {
                    background-color: #f8f9fa;
                    padding-top: 20px;
                }
                .order-card {
                    transition: transform 0.3s ease;
                }
                .order-card:hover {
                    transform: translateY(-5px);
                }
                .color-badge {
                    display: inline-block;
                    width: 15px;
                    height: 15px;
                    border-radius: 50%;
                    vertical-align: middle;
                    margin-left: 5px;
                    border: 1px solid #dee2e6;
                }
                .order-product {
                    transition: background-color 0.2s ease;
                }
                .order-product:hover {
                    background-color: #e9ecef !important;
                }
                .search-box {
                    max-width: 400px;
                    margin: 0 auto 30px;
                }
                .status-filter {
                    margin-bottom: 20px;
                }
                .badge {
                    font-size: 0.8rem;
                    padding: 5px 10px;
                }
                @media (max-width: 768px) {
                    .order-product {
                        flex-direction: column;
                    }
                    .order-product img {
                        margin-bottom: 10px;
                        margin-right: 0 !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 class="h3 mb-0">
                        <i class="bi bi-cart-check me-2"></i>Order Management
                    </h1>
                    <a href="/admin" class="btn btn-outline-secondary">
                        <i class="bi bi-arrow-left"></i> Back to Admin
                    </a>
                </div>
                
                <div class="card mb-4 shadow-sm">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6 mb-3 mb-md-0">
                                <div class="input-group search-box">
                                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                                    <input type="text" id="searchInput" class="form-control" placeholder="Search orders...">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="status-filter">
                                    <div class="btn-group btn-group-sm float-md-end">
                                        <button class="btn btn-outline-primary active" data-status="all">All</button>
                                        <button class="btn btn-outline-warning" data-status="Pending">Pending</button>
                                        <button class="btn btn-outline-info" data-status="Processing">Processing</button>
                                        <button class="btn btn-outline-primary" data-status="Shipped">Shipped</button>
                                        <button class="btn btn-outline-success" data-status="Delivered">Delivered</button>
                                        <button class="btn btn-outline-danger" data-status="Cancelled">Cancelled</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="ordersContainer">
                    ${ordersHtml}
                </div>
                
                <div class="text-center mt-4 mb-5">
                    <button id="loadMore" class="btn btn-primary" style="display: none;">
                        <i class="bi bi-arrow-down-circle"></i> Load More Orders
                    </button>
                </div>
            </div>
            
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            <script>
                // Search functionality
                document.getElementById('searchInput').addEventListener('input', function() {
                    const searchTerm = this.value.toLowerCase();
                    const orderCards = document.querySelectorAll('.order-card');
                    
                    orderCards.forEach(card => {
                        const text = card.textContent.toLowerCase();
                        if (text.includes(searchTerm)) {
                            card.style.display = '';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
                
                // Status filter
                document.querySelectorAll('.status-filter button').forEach(btn => {
                    btn.addEventListener('click', function() {
                        document.querySelectorAll('.status-filter button').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        
                        const status = this.dataset.status;
                        const orderCards = document.querySelectorAll('.order-card');
                        
                        orderCards.forEach(card => {
                            const cardStatus = card.querySelector('.badge').textContent.trim();
                            if (status === 'all' || cardStatus === status) {
                                card.style.display = '';
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    });
                });
                
                // Initially show only 5 orders and implement "Load More"
                const orderCards = document.querySelectorAll('.order-card');
                const loadMoreBtn = document.getElementById('loadMore');
                let visibleCount = 5;
                
                if (orderCards.length > 5) {
                    loadMoreBtn.style.display = 'block';
                    
                    for (let i = 5; i < orderCards.length; i++) {
                        orderCards[i].style.display = 'none';
                    }
                    
                    loadMoreBtn.addEventListener('click', function() {
                        visibleCount += 5;
                        for (let i = 0; i < visibleCount && i < orderCards.length; i++) {
                            orderCards[i].style.display = '';
                        }
                        
                        if (visibleCount >= orderCards.length) {
                            loadMoreBtn.style.display = 'none';
                        }
                        
                        // Scroll to newly loaded items
                        orderCards[visibleCount - 5].scrollIntoView({ behavior: 'smooth' });
                    });
                }
            </script>
        </body>
        </html>
    `);
});
// Admin - Products
app.get("/admin/products", async (req, res) => {
  if (!adminLoggedIn) return res.redirect("/login");

  const products = await Product.find().sort({ createdAt: -1 }); // Sort by newest first
  let productsHtml = "";

  products.forEach((product, index) => {
    // Determine stock status
    const stockStatus = product.stock > 0 
      ? `<span class="badge bg-success">In Stock (${product.stock})</span>`
      : `<span class="badge bg-danger">Out of Stock</span>`;

    // Determine if product is featured
    const featuredBadge = product.featured 
      ? `<span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2">Featured</span>`
      : '';

    productsHtml += `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 animate__animated animate__fadeIn" style="animation-delay: ${index * 0.05}s">
        <div class="card product-card h-100 shadow-sm">
          <div class="position-relative">
            <img src="/uploads/${product.mainImage}" class="card-img-top product-image" alt="${product.name}">
            ${featuredBadge}
            <div class="card-img-overlay d-flex justify-content-end align-items-start p-2">
              <span class="badge bg-dark">₹${product.price}</span>
            </div>
          </div>
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text text-muted small mb-2">${product.brand}</p>
            <div class="d-flex justify-content-between align-items-center mb-3">
              ${stockStatus}
              <span class="badge bg-info">${product.category || 'Uncategorized'}</span>
            </div>
            <div class="btn-group w-100" role="group">
              <a href="/admin/editproduct/${product._id}" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-pencil-square"></i> Edit
              </a>
              <a href="/admin/deleteproduct/${product._id}" 
                 class="btn btn-sm btn-outline-danger" 
                 onclick="return confirm('Are you sure you want to delete this product?')">
                <i class="bi bi-trash"></i> Delete
              </a>
            </div>
          </div>
          <div class="card-footer bg-transparent border-top-0">
            <small class="text-muted">Added: ${new Date(product.createdAt).toLocaleDateString()}</small>
          </div>
        </div>
      </div>
    `;
  });

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Products</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
      <style>
        :root {
          --primary-color: #4361ee;
          --secondary-color: #3f37c9;
          --accent-color: #4cc9f0;
        }
        
        body {
          background-color: #f8f9fa;
          padding-top: 20px;
        }
        
        .product-card {
          transition: all 0.3s ease;
          border-radius: 10px;
          overflow: hidden;
          border: none;
        }
        
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .product-image {
          height: 180px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .product-card:hover .product-image {
          transform: scale(1.03);
        }
        
        .search-container {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          padding: 20px;
          margin-bottom: 30px;
        }
        
        .action-buttons .btn {
          transition: all 0.2s ease;
        }
        
        .action-buttons .btn:hover {
          transform: translateY(-2px);
        }
        
        .filter-btn.active {
          background-color: var(--primary-color);
          color: white;
        }
        
        @media (max-width: 768px) {
          .product-image {
            height: 120px;
          }
          
          .search-container {
            padding: 15px;
          }
        }
        
        /* Pulse animation for featured products */
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,193,7,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255,193,7,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,193,7,0); }
        }
        
        .featured-product {
          animation: pulse 2s infinite;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3 mb-0">
            <i class="bi bi-box-seam"></i> Product Management
          </h1>
          <a href="/admin" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left"></i> Back to Admin
          </a>
        </div>
        
        <div class="search-container mb-4">
          <div class="row">
            <div class="col-md-6 mb-3 mb-md-0">
              <div class="input-group">
                <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                <input type="text" id="searchInput" class="form-control" placeholder="Search products...">
              </div>
            </div>
            <div class="col-md-6">
              <div class="d-flex justify-content-md-end">
                <a href="/admin/addproduct" class="btn btn-primary">
                  <i class="bi bi-plus-circle"></i> Add New Product
                </a>
              </div>
            </div>
          </div>
          
          <div class="row mt-3">
            <div class="col-12">
              <div class="btn-group btn-group-sm" role="group">
                <button type="button" class="btn btn-outline-secondary filter-btn active" data-filter="all">All</button>
                <button type="button" class="btn btn-outline-secondary filter-btn" data-filter="in-stock">In Stock</button>
                <button type="button" class="btn btn-outline-secondary filter-btn" data-filter="out-of-stock">Out of Stock</button>
                <button type="button" class="btn btn-outline-secondary filter-btn" data-filter="featured">Featured</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row" id="productsContainer">
          ${productsHtml}
        </div>
        
        <div class="text-center mt-4">
          <button id="loadMore" class="btn btn-primary" style="display: none;">
            <i class="bi bi-arrow-down-circle"></i> Load More Products
          </button>
        </div>
      </div>
      
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      <script>
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', function() {
          const searchTerm = this.value.toLowerCase();
          const productCards = document.querySelectorAll('.product-card');
          
          productCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.parentElement.style.display = text.includes(searchTerm) ? '' : 'none';
          });
        });
        
        // Filter functionality
        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            const productCards = document.querySelectorAll('.product-card');
            
            productCards.forEach(card => {
              const stockBadge = card.querySelector('.badge.bg-success');
              const featuredBadge = card.querySelector('.badge.bg-warning');
              
              if (filter === 'all') {
                card.parentElement.style.display = '';
              } 
              else if (filter === 'in-stock') {
                card.parentElement.style.display = stockBadge ? '' : 'none';
              }
              else if (filter === 'out-of-stock') {
                card.parentElement.style.display = !stockBadge ? '' : 'none';
              }
              else if (filter === 'featured') {
                card.parentElement.style.display = featuredBadge ? '' : 'none';
              }
            });
          });
        });
        
        // Load more functionality
        const productCards = document.querySelectorAll('.col-12.col-sm-6.col-md-4.col-lg-3');
        const loadMoreBtn = document.getElementById('loadMore');
        let visibleCount = 8;
        
        if (productCards.length > 8) {
          loadMoreBtn.style.display = 'inline-flex';
          
          for (let i = 8; i < productCards.length; i++) {
            productCards[i].style.display = 'none';
          }
          
          loadMoreBtn.addEventListener('click', function() {
            visibleCount += 8;
            for (let i = 0; i < visibleCount && i < productCards.length; i++) {
              productCards[i].style.display = '';
            }
            
            if (visibleCount >= productCards.length) {
              loadMoreBtn.style.display = 'none';
            }
            
            // Smooth scroll to newly loaded items
            productCards[visibleCount - 8].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
        }
      </script>
    </body>
    </html>
  `);
});
// Admin - Add Product
app.get("/admin/addproduct", (req, res) => {
  if (!adminLoggedIn) return res.redirect("/login");

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Add Product</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body {
          background-color: #f8f9fa;
          padding: 20px;
        }
        .form-container {
          background-color: white;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 0 15px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        .form-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .form-section:last-child {
          border-bottom: none;
        }
        .form-section h2 {
          color: #0d6efd;
          font-size: 1.4rem;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        .form-label {
          font-weight: 500;
        }
        .btn-submit {
          width: 100%;
          padding: 10px;
          font-size: 1.1rem;
        }
        @media (max-width: 768px) {
          .form-container {
            padding: 15px;
          }
          .form-section h2 {
            font-size: 1.2rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-10">
            <div class="form-container">
              <h1 class="text-center mb-4">Add Product</h1>
              
              <form action="/admin/addproduct" method="post" enctype="multipart/form-data">
                <div class="form-section">
                  <h2>Basic Product Information</h2>
                  <div class="mb-3">
                    <label for="name" class="form-label">Product Name</label>
                    <input type="text" class="form-control" id="name" name="name" required>
                  </div>
                  <div class="mb-3">
                    <label for="category" class="form-label">Category</label>
                    <input type="text" class="form-control" id="category" name="category" required>
                  </div>
                  <div class="mb-3">
                    <label for="brand" class="form-label">Brand</label>
                    <input type="text" class="form-control" id="brand" name="brand" required>
                  </div>
                </div>

                <div class="form-section">
                  <h2>💰 Pricing & Availability</h2>
                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <label for="price" class="form-label">Price</label>
                      <input type="number" step="0.01" class="form-control" id="price" name="price" required>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="mrp" class="form-label">MRP</label>
                      <input type="number" step="0.01" class="form-control" id="mrp" name="mrp" required>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="discount" class="form-label">Discount (%)</label>
                      <input type="number" class="form-control" id="discount" name="discount" required>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="stock" class="form-label">Stock Quantity</label>
                      <input type="number" class="form-control" id="stock" name="stock" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="lowStockAlert" class="form-label">Low Stock Alert</label>
                      <input type="number" class="form-control" id="lowStockAlert" name="lowStockAlert">
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="deliveryCharge" class="form-label">Delivery Charge</label>
                      <input type="number" step="0.01" class="form-control" id="deliveryCharge" name="deliveryCharge" value="0">
                    </div>
                    <div class="col-md-6 mb-3 d-flex align-items-end">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="freeDelivery" name="freeDelivery">
                        <label class="form-check-label" for="freeDelivery">Free Delivery</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-section">
                  <h2>📦 Product Variants</h2>
                  <div class="mb-3">
                    <label for="sizes" class="form-label">Available Sizes (comma separated)</label>
                    <input type="text" class="form-control" id="sizes" name="sizes" placeholder="S, M, L, XL">
                  </div>
                  <div class="mb-3">
                    <label for="colors" class="form-label">Available Colors (comma separated)</label>
                    <input type="text" class="form-control" id="colors" name="colors" placeholder="Red, Blue, Green">
                  </div>
                </div>

                <div class="form-section">
                  <h2>🖼️ Images</h2>
                  <div class="mb-3">
                    <label for="mainImage" class="form-label">Main Product Image</label>
                    <input type="file" class="form-control" id="mainImage" name="mainImage" required>
                  </div>
                  <div class="mb-3">
                    <label for="additionalImages" class="form-label">Additional Images</label>
                    <input type="file" class="form-control" id="additionalImages" name="additionalImages" multiple>
                    <div class="form-text">You can select multiple images</div>
                  </div>
                </div>

                <div class="form-section">
                  <h2>📃 Description & Specifications</h2>
                  <div class="mb-3">
                    <label for="shortDescription" class="form-label">Short Description</label>
                    <textarea class="form-control" id="shortDescription" name="shortDescription" rows="3" required></textarea>
                  </div>
                  <div class="mb-3">
                    <label for="fullDescription" class="form-label">Full Description</label>
                    <textarea class="form-control" id="fullDescription" name="fullDescription" rows="5" required></textarea>
                  </div>
                  <div class="mb-3">
                    <label for="material" class="form-label">Material</label>
                    <input type="text" class="form-control" id="material" name="material">
                  </div>
                  <div class="mb-3">
                    <label for="dimensions" class="form-label">Bank Offer</label>
                    <input type="text" class="form-control" id="dimensions" name="dimensions" placeholder="10x5x3 inches">
                  </div>
                  <div class="mb-3">
                    <label for="weight" class="form-label">Special Offer</label>
                    <input type="text" class="form-control" id="weight" name="weight" placeholder="0.5 kg">
                  </div>
                  <div class="mb-3">
                    <label for="warranty" class="form-label">Warranty</label>
                    <input type="text" class="form-control" id="warranty" name="warranty" placeholder="1 year manufacturer warranty">
                  </div>
                </div>

                <div class="form-section">
                  <h2>🔧 Additional Information</h2>
                  <div class="mb-3">
                    <label for="status" class="form-label">Product Status</label>
                    <select class="form-select" id="status" name="status">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="returnPolicy" class="form-label">Return Policy</label>
                    <input type="text" class="form-control" id="returnPolicy" name="returnPolicy">
                  </div>
                  <div class="mb-3">
                    <label for="bankOffers" class="form-label">Bank Offers</label>
                    <input type="text" class="form-control" id="bankOffers" name="bankOffers">
                  </div>
                  <div class="mb-3">
                    <label for="specialOffer" class="form-label">Special Offer</label>
                    <input type="text" class="form-control" id="specialOffer" name="specialOffer">
                  </div>
                </div>

                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary btn-submit">Add Product</button>
                </div>
              </form>
              
              <div class="text-center mt-3">
                <a href="/admin/products" class="btn btn-outline-secondary">Back to Products</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
  `);
});

app.post(
  "/admin/addproduct",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  async (req, res) => {
    if (!adminLoggedIn) return res.redirect("/login");

    try {
      const {
        name,
        category,
        brand,
        price,
        mrp,
        discount,
        stock,
        lowStockAlert,
        deliveryCharge,
        freeDelivery,
        sizes,
        colors,
        shortDescription,
        fullDescription,
        material,
        dimensions,
        weight,
        warranty,
        status,
        returnPolicy,
        bankOffers,
        specialOffer,
      } = req.body;

      // Process additional images
      let additionalImages = [];
      if (req.files.additionalImages) {
        additionalImages = req.files.additionalImages.map(
          (file) => file.filename
        );
      }

      const newProduct = new Product({
        name,
        category,
        brand,
        price: parseFloat(price),
        mrp: parseFloat(mrp),
        discount: parseFloat(discount),
        stock: parseInt(stock),
        lowStockAlert: lowStockAlert ? parseInt(lowStockAlert) : 0,
        deliveryCharge: parseFloat(deliveryCharge || 0),
        freeDelivery: freeDelivery === "on",
        sizes: sizes ? sizes.split(",").map((s) => s.trim()) : [],
        colors: colors ? colors.split(",").map((c) => c.trim()) : [],
        mainImage: req.files.mainImage[0].filename,
        additionalImages,
        shortDescription,
        fullDescription,
        material,
        dimensions,
        weight,
        warranty,
        status: status || "Active",
        returnPolicy,
        bankOffers,
        specialOffer,
      });

      await newProduct.save();
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      res.send(`
        <div class="alert alert-danger">
          Error adding product. <a href="/admin/addproduct" class="alert-link">Try again</a>
        </div>
      `);
    }
  }
);
// Admin - Edit Product
app.get("/admin/editproduct/:id", async (req, res) => {
  if (!adminLoggedIn) return res.redirect("/login");

  const product = await Product.findById(req.params.id);
  if (!product) return res.send("Product not found");

  res.send(`
        <h1>Edit Product</h1>
        <form action="/admin/updateproduct/${
          product._id
        }" method="post" enctype="multipart/form-data">
            <h2>Basic Product Information</h2>
            Product Name: <input type="text" name="name" value="${
              product.name
            }" required><br>
            Category: <input type="text" name="category" value="${
              product.category
            }" required><br>
            Brand: <input type="text" name="brand" value="${
              product.brand
            }" required><br>
            SKU/ID: <input type="text" name="sku" value="${
              product.sku
            }" required><br>
            Product Code: <input type="text" name="productCode" value="${
              product.productCode || ""
            }"><br>
            
            <h2>💰 Pricing & Availability</h2>
            Price: <input type="number" name="price" value="${
              product.price
            }" required><br>
            MRP: <input type="number" name="mrp" value="${
              product.mrp
            }" required><br>
            Discount: <input type="number" name="discount" value="${
              product.discount
            }" required><br>
            Stock Quantity: <input type="number" name="stock" value="${
              product.stock
            }" required><br>
            Low Stock Alert: <input type="number" name="lowStockAlert" value="${
              product.lowStockAlert || 0
            }"><br>
            Delivery Charge: <input type="number" name="deliveryCharge" value="${
              product.deliveryCharge || 0
            }"><br>
            Free Delivery: <input type="checkbox" name="freeDelivery" ${
              product.freeDelivery ? "checked" : ""
            }><br>
            
            <h2>📦 Product Variants</h2>
            Available Sizes: <input type="text" name="sizes" value="${product.sizes.join(
              ", "
            )}"><br>
            Available Colors: <input type="text" name="colors" value="${product.colors.join(
              ", "
            )}"><br>
            Other Variants: <input type="text" name="variants" value="${product.variants.join(
              ", "
            )}"><br>
            
            <h2>🖼️ Images</h2>
            Current Main Image: <img src="/uploads/${
              product.mainImage
            }" width="50"><br>
            Change Main Image: <input type="file" name="mainImage"><br>
            Current Additional Images: ${product.additionalImages
              .map((img) => `<img src="/uploads/${img}" width="30">`)
              .join("")}<br>
            Add More Images: <input type="file" name="additionalImages" multiple><br>
            
            <h2>📃 Description & Specifications</h2>
            Short Description: <textarea name="shortDescription" required>${
              product.shortDescription
            }</textarea><br>
            Full Description: <textarea name="fullDescription" required>${
              product.fullDescription
            }</textarea><br>
            Key Features: <textarea name="keyFeatures" required>${product.keyFeatures.join(
              ", "
            )}</textarea><br>
            Material: <input type="text" name="material" value="${
              product.material || ""
            }"><br>
            Dimensions: <input type="text" name="dimensions" value="${
              product.dimensions || ""
            }"><br>
            Weight: <input type="text" name="weight" value="${
              product.weight || ""
            }"><br>
            Warranty Info: <input type="text" name="warranty" value="${
              product.warranty || ""
            }"><br>
            
            <h2>🔧 Additional Information (Optional)</h2>
            Tags: <input type="text" name="tags" value="${product.tags.join(
              ", "
            )}"><br>
            Product Status: <select name="status">
                <option value="Active" ${
                  product.status === "Active" ? "selected" : ""
                }>Active</option>
                <option value="Inactive" ${
                  product.status === "Inactive" ? "selected" : ""
                }>Inactive</option>
            </select><br>
            Launch Date: <input type="date" name="launchDate" value="${
              product.launchDate
                ? product.launchDate.toISOString().split("T")[0]
                : ""
            }"><br>
            Return Policy: <input type="text" name="returnPolicy" value="${
              product.returnPolicy || ""
            }"><br>
            Bank Offers: <input type="text" name="bankOffers" value="${
              product.bankOffers || ""
            }"><br>
            Special Offer: <input type="text" name="specialOffer" value="${
              product.specialOffer || ""
            }"><br>
            
            <button type="submit">Update Product</button>
        </form>
        <a href="/admin/products">Back to Products</a>
    `);
});

app.post(
  "/admin/updateproduct/:id",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  async (req, res) => {
    if (!adminLoggedIn) return res.redirect("/login");

    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.send("Product not found");

      const {
        name,
        category,
        brand,
        sku,
        productCode,
        price,
        mrp,
        discount,
        stock,
        lowStockAlert,
        deliveryCharge,
        freeDelivery,
        sizes,
        colors,
        variants,
        shortDescription,
        fullDescription,
        keyFeatures,
        material,
        dimensions,
        weight,
        warranty,
        tags,
        status,
        launchDate,
        returnPolicy,
        bankOffers,
        specialOffer,
      } = req.body;

      // Update product fields
      product.name = name;
      product.category = category;
      product.brand = brand;
      product.sku = sku;
      product.productCode = productCode;
      product.price = parseFloat(price);
      product.mrp = parseFloat(mrp);
      product.discount = parseFloat(discount);
      product.stock = parseInt(stock);
      product.lowStockAlert = lowStockAlert ? parseInt(lowStockAlert) : 0;
      product.deliveryCharge = parseFloat(deliveryCharge || 0);
      product.freeDelivery = freeDelivery === "on";
      product.sizes = sizes ? sizes.split(",").map((s) => s.trim()) : [];
      product.colors = colors ? colors.split(",").map((c) => c.trim()) : [];
      product.variants = variants
        ? variants.split(",").map((v) => v.trim())
        : [];
      product.shortDescription = shortDescription;
      product.fullDescription = fullDescription;
      product.keyFeatures = keyFeatures.split(",").map((f) => f.trim());
      product.material = material;
      product.dimensions = dimensions;
      product.weight = weight;
      product.warranty = warranty;
      product.tags = tags ? tags.split(",").map((t) => t.trim()) : [];
      product.status = status || "Active";
      product.launchDate = launchDate ? new Date(launchDate) : null;
      product.returnPolicy = returnPolicy;
      product.bankOffers = bankOffers;
      product.specialOffer = specialOffer;

      // Update images if new ones are uploaded
      if (req.files.mainImage) {
        product.mainImage = req.files.mainImage[0].filename;
      }
      if (req.files.additionalImages) {
        product.additionalImages = product.additionalImages.concat(
          req.files.additionalImages.map((file) => file.filename)
        );
      }

      await product.save();
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      res.send(
        'Error updating product. <a href="/admin/products">Back to products</a>'
      );
    }
  }
);

// Admin - Delete Product
app.get("/admin/deleteproduct/:id", async (req, res) => {
  if (!adminLoggedIn) return res.redirect("/login");

  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    res.send(
      'Error deleting product. <a href="/admin/products">Back to products</a>'
    );
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
