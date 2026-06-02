const express = require('express');
const router = express.Router();
const { protectAdmin } = require('./auth');
const { getOfflineStatus } = require('../config/db');
const { marked } = require('marked');

// Import Database Models
const Project = require('../models/Project');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const Achievement = require('../models/Achievement');

// Import In-Memory Datasets
const apiRoutes = require('./api');

const isOffline = () => getOfflineStatus();

// Helper to compile/render Markdown cleanly
const renderMarkdown = (md) => {
  return marked.parse(md || '');
};

// 1. Home / Index Page
router.get('/', async (req, res) => {
  try {
    let projects = [];
    let blogs = [];
    let achievements = [];
    
    if (isOffline()) {
      projects = [...apiRoutes.memoryProjects].sort((a, b) => a.order - b.order);
      blogs = [...apiRoutes.memoryBlogs].slice(0, 3);
      achievements = [...apiRoutes.memoryAchievements];
    } else {
      projects = await Project.find().sort({ order: 1 });
      blogs = await Blog.find({ status: 'published' }).sort({ createdAt: -1 }).limit(3);
      achievements = await Achievement.find().sort({ unlockedAt: -1 });
    }

    res.render('index', {
      title: 'Gaurvit Tiwati | Cyber-Anime Portfolio',
      developer_name: 'Gaurvit Tiwati',
      projects,
      blogs,
      achievements,
      isOffline: isOffline(),
      currentPage: 'home'
    });
  } catch (err) {
    console.error('Render Home Error:', err);
    res.status(500).send('Core Systems Failure: Unable to render main layout.');
  }
});

// 2. Blog List Page
router.get('/blog', async (req, res) => {
  try {
    let blogs = [];
    if (isOffline()) {
      blogs = [...apiRoutes.memoryBlogs];
    } else {
      blogs = await Blog.find({ status: 'published' }).sort({ createdAt: -1 });
    }
    
    res.render('blog', {
      title: 'Neural Logs | Gaurvit Tiwati Blog',
      blogs,
      isOffline: isOffline(),
      currentPage: 'blog'
    });
  } catch (err) {
    console.error('Render Blog Error:', err);
    res.status(500).send('Core Systems Failure: Unable to render blog logs.');
  }
});

// 3. Blog Post Details Page
router.get('/blog/:slug', async (req, res) => {
  try {
    let blog = null;
    if (isOffline()) {
      blog = apiRoutes.memoryBlogs.find(b => b.slug === req.params.slug);
    } else {
      blog = await Blog.findOne({ slug: req.params.slug });
    }

    if (!blog) {
      return res.status(404).send('Data Link Broken: Log file not found in mainframe database.');
    }

    // Compile Markdown content to HTML
    const compiledContent = renderMarkdown(blog.markdownContent);

    res.render('blog-post', {
      title: `${blog.title} | Neural Logs`,
      blog,
      compiledContent,
      isOffline: isOffline(),
      currentPage: 'blog'
    });
  } catch (err) {
    console.error('Render Blog Post Error:', err);
    res.status(500).send('Core Systems Failure: Unable to parse log parameters.');
  }
});

// 4. Admin Login Page
router.get('/login', (req, res) => {
  const token = req.cookies.jwt_token;
  if (token) {
    return res.redirect('/admin');
  }
  res.render('login', {
    title: 'Decrypt Mainframe Credentials | Admin Console',
    isOffline: isOffline(),
    currentPage: 'login'
  });
});

// 5. Admin Dashboard Page
router.get('/admin', protectAdmin, async (req, res) => {
  try {
    let projects = [];
    let blogs = [];
    let contacts = [];
    let achievements = [];

    if (isOffline()) {
      projects = [...apiRoutes.memoryProjects].sort((a, b) => a.order - b.order);
      blogs = [...apiRoutes.memoryBlogs];
      contacts = [...apiRoutes.memoryContacts];
      achievements = [...apiRoutes.memoryAchievements];
    } else {
      projects = await Project.find().sort({ order: 1 });
      blogs = await Blog.find().sort({ createdAt: -1 });
      contacts = await Contact.find().sort({ createdAt: -1 });
      achievements = await Achievement.find().sort({ unlockedAt: -1 });
    }

    res.render('admin', {
      title: 'Console Dashboard | Gaurvit Tiwati Admin',
      projects,
      blogs,
      contacts,
      achievements,
      isOffline: isOffline(),
      currentPage: 'admin'
    });
  } catch (err) {
    console.error('Render Admin Error:', err);
    res.status(500).send('Core Systems Failure: Access credentials correct but dashboard grid failed to compile.');
  }
});

module.exports = router;
