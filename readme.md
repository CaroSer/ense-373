# MediLocate  

**MediLocate** is a web application designed to simplify the process of finding doctors, booking appointments, and managing schedules. Built using **Node.js**, it incorporates modern web technologies for a seamless user experience.

---

## **Features**  
- **Doctor Search**: Find doctors by specialization or location.  
- **Appointment Management**: Book, reschedule, or cancel appointments.  
- **User Authentication**: Secure login for patients and medical staff using sessions and tokens.  
- **File Uploads**: Handle profile pictures or document uploads with Multer.  

---

## **Technologies**  
- **Backend**: Node.js with Express.js  
- **Database**: MongoDB (via Mongoose)  
- **Frontend**: EJS templating engine with jQuery integration  
- **Authentication**: Passport.js with JSON Web Tokens (JWT)  

---

## **Setup Instructions**  

### **1. Prerequisites**  
Before starting, ensure you have the following installed:  
- **Node.js** (LTS version recommended)  
- **MongoDB** (local or cloud instance)  

---

### **2. Clone the Repository**  
```bash
git clone https://github.com/your-username/medilocate.git
cd medilocate
```

---

### **3. Install Dependencies**  
Run the following command to install all necessary packages after going to the App folder:  
```bash
npm install
```

---

### **4. Run the Application**  
Start the app with the following command:  
```bash
node server.js
```

The app will run on `http://localhost:3000` by default.

---

## **Dependencies**  
Here are the main packages used in this project:  
- **bcrypt**: For hashing passwords securely.  
- **body-parser**: For parsing incoming request bodies.  
- **dotenv**: For environment variable management.  
- **ejs**: For templating HTML views.  
- **express**: The web framework.  
- **express-session**: For managing user sessions.  
- **jquery**: For frontend interactivity.  
- **mongoose**: For MongoDB object modeling.  
- **multer**: For handling file uploads.  
- **passport**: For authentication middleware.  
- **passport-local**: For local user authentication strategy.  

---

## **Usage**  
- **Patients**:  
   - Register, log in, and book appointments with ease.  
   - Manage existing bookings directly from your dashboard.  

- **Medical Staff**:  
   - Log in to update schedules and manage patient appointments.  
