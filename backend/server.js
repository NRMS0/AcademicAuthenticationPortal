require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const uploadRoutes = require('./routes/uploadRoutes');

//Importing routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes'); 
const newsEventsRoutes = require('./routes/newsEvents');
const systemHealthRoutes = require('./routes/systemHealthRoutes'); 
const gradeRoutes = require('./routes/gradeRoutes'); 
const twoFARoutes = require('./routes/2faRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

//trust frontend
const app = express();
app.set('trust proxy', 1); 

const frontendOrigin = `http://localhost:5173`;

console.log("✅ Allowing frontend origin:", frontendOrigin);

app.use(cors({
  origin: frontendOrigin,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json()); 
app.use(session({
    secret: process.env.SESSION_SECRET || 'mysecretkey123',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,         
      httpOnly: true,
      sameSite: 'None',     
    },
  }));


app.use('/api/2fa', twoFARoutes);

// Debugging: Log route registrations
console.log("✅ Routes Registered:");
console.log("➡️  /api/auth");
console.log("➡️  /api/courses");
console.log("➡️  /api/assignments");
console.log("➡️  /api/submissions"); 
console.log("➡️  /api/users");
console.log("➡️  /api/news-events"); 
console.log("➡️  /api/system-health"); 
console.log("➡️  /api/grades");
console.log("➡️  /api/auth");
console.log("➡️  /api/profile");

// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes); 
app.use('/api', userRoutes); 
app.use('/api/news-events', newsEventsRoutes); 
app.use('/api/system-health', systemHealthRoutes);
app.use('/api/grades', gradeRoutes); 
app.use('/api/uploads', uploadRoutes);
app.use('/api/users', userRoutes);

// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Connect to MongoDB & Start Server
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing in .env file!");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("MongoDB is Connected");
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    })
    .catch(err => {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    });