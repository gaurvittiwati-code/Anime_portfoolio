const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB, getOfflineStatus } = require('./config/db');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const viewRoutes = require('./routes/views');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB().then(() => {
  // If MongoDB runs successfully, ensure default projects/blogs/users are seeded
  seedDatabase();
});

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Folder setup
app.use(express.static(path.join(__dirname, 'public')));

// Set View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Mount Routes
app.use('/auth', authRoutes.router);
app.use('/api', apiRoutes.router);
app.use('/', viewRoutes);

// Error Handling Middleware for nice page responses
app.use((req, res, next) => {
  res.status(404).render('index', {
    title: '404 Grid Disconnected | Gaurvit Tiwati',
    developer_name: 'Gaurvit Tiwati',
    projects: [],
    blogs: [],
    achievements: [],
    isOffline: getOfflineStatus(),
    currentPage: '404'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 ANIME DEVELOPER PORTFOLIO - MAIN TERMINAL BOOTED`);
  console.log(`⚡ Cyber-Grid URL: http://localhost:${PORT}`);
  console.log(`🌸 Developer Identity: Gaurvit Tiwati`);
  console.log(`⚙️  Operational Mode: ${getOfflineStatus() ? 'SANDBOX (Local Offline)' : 'HYPERLINK (MongoDB Connected)'}`);
  console.log(`======================================================\n`);
});

// Seed Initial Admin and Database Content if running in live mode
async function seedDatabase() {
  if (getOfflineStatus()) return;

  const User = require('./models/User');
  const Project = require('./models/Project');
  const Blog = require('./models/Blog');

  try {
    // 1. Seed Admin User
    const adminCount = await User.countDocuments();
    if (adminCount === 0) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const password = process.env.ADMIN_PASSWORD || 'admin123';
      const newAdmin = new User({ username, password });
      await newAdmin.save();
      console.log('✅ Mainframe Security Setup: Seeded Admin credential keys.');
    }

    // 2. Seed Projects
    const projCount = await Project.countDocuments();
    if (projCount === 0) {
      const defaultProjects = apiRoutes.memoryProjects.map(p => {
        const { _id, ...rest } = p;
        return rest;
      });
      await Project.insertMany(defaultProjects);
      console.log('✅ Content Seeding: Populated default portfolio projects.');
    }

    // 3. Seed Blogs
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      const defaultBlogs = apiRoutes.memoryBlogs.map(b => {
        const { _id, ...rest } = b;
        return rest;
      });
      await Blog.insertMany(defaultBlogs);
      console.log('✅ Content Seeding: Populated initial markdown logs.');
    }
  } catch (err) {
    console.error('❌ Data Seeding Core Exception:', err);
  }
}
