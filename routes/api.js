const express = require('express');
const router = express.Router();
const { protectAdmin } = require('./auth');
const { getOfflineStatus } = require('../config/db');

// Database Models
const Project = require('../models/Project');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const Achievement = require('../models/Achievement');

// In-Memory Fallbacks for Autonomous Sandbox Mode
let memoryProjects = [
  {
    _id: 'mem_p1',
    title: 'Windows 11 Clone',
    description: 'A fully functional web-based Windows 11 replica built from scratch using HTML, CSS, and Vanilla JavaScript. Features resizable, draggable apps, a fully interactive file explorer, customized notepad, terminal simulator, and smooth glassmorphic taskbar widgets.',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Glassmorphism'],
    githubLink: 'https://github.com/gaurvit-tiwati/windows11-clone',
    demoLink: 'https://win11.gaurvit.tech',
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80',
    featured: true,
    order: 1
  },
  {
    _id: 'mem_p2',
    title: 'Node.js Todo App',
    description: 'An advanced, secure Todo and workflow scheduler running on Express.js with automated user JWT login systems, state machine progress tracking, calendar integration, and interactive alert frameworks.',
    tags: ['Node.js', 'Express.js', 'EJS', 'JWT'],
    githubLink: 'https://github.com/gaurvit-tiwati/nodejs-todo',
    demoLink: 'https://todo.gaurvit.tech',
    image: 'https://images.unsplash.com/photo-1540350390157-c7403a7df3df?auto=format&fit=crop&w=800&q=80',
    featured: false,
    order: 2
  },
  {
    _id: 'mem_p3',
    title: 'High-Performance CRUD API',
    description: 'Enterprise-grade RESTful API backend handling dynamic model indexing, query filtering, pagination, advanced logging, rate limiting, and complete Swagger automated documentation API metrics.',
    tags: ['Express.js', 'MongoDB', 'Node.js', 'APIs'],
    githubLink: 'https://github.com/gaurvit-tiwati/crud-api-backend',
    demoLink: 'https://api.gaurvit.tech/docs',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    featured: true,
    order: 3
  },
  {
    _id: 'mem_p4',
    title: '3D Anime Portfolio Website',
    description: 'This ultra-premium web portfolio featuring 3D tilt effects, customized audio layers, fully-integrated chatbot console system, achievements mechanics, and mouse-trailing canvas elements.',
    tags: ['HTML5', 'CSS3', 'Web Audio API', 'Canvas'],
    githubLink: 'https://github.com/gaurvit-tiwati/anime-portfolio',
    demoLink: 'https://gaurvit.tech',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    featured: true,
    order: 4
  },
  {
    _id: 'mem_p5',
    title: 'MongoDB Schema Studio',
    description: 'A schema manager UI to visualize MongoDB schemas, build dynamic validators, automatically export Mongoose Models, and mock seeding scripts for testing clusters.',
    tags: ['MongoDB', 'Mongoose', 'Express.js', 'Data Modeling'],
    githubLink: 'https://github.com/gaurvit-tiwati/mongodb-studio',
    demoLink: 'https://studio.gaurvit.tech',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    featured: false,
    order: 5
  }
];

let memoryBlogs = [
  {
    _id: 'mem_b1',
    title: 'Mastering CSS Grid and Cyberpunk Aesthetics',
    slug: 'mastering-css-grid-cyberpunk',
    markdownContent: `## Tapping the Grid: Retro-Future Layouts

Cyberpunk aesthetics aren't just about glowing neon shadows (though those look absolutely amazing). It's about structure. Using **CSS Grid**, we can construct complex, asymmetrical dashboard lines that feel like a spaceship HUD.

### Designing the Neo-Grid

Here's a layout that splits the screen into a tactical console:
\`\`\`css
.console-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 1.5rem;
}
\`\`\`

By adding low-opacity grid backgrounds, corner elements, and terminal indicators, your portfolio will immediately feel advanced. Try placing borders using HSL values with custom alpha values:
\`\`\`css
border: 1px solid hsla(320, 100%, 60%, 0.3);
box-shadow: 0 0 15px hsla(320, 100%, 50%, 0.1);
\`\`\`

What's your favorite cyberpunk color accent? Let us know in the comments below!`,
    excerpt: 'Step-by-step blueprint to build gorgeous HUD layouts, scanline meshes, and glowing shadows using vanilla CSS grid.',
    tags: ['CSS3', 'Design', 'Cyberpunk'],
    comments: [
      { author: 'Sasuke Uchiha', email: 'sasuke@uchiha.com', content: 'This visual aesthetic exceeds my Sharingan capabilities.', createdAt: new Date() }
    ],
    status: 'published',
    createdAt: new Date()
  },
  {
    _id: 'mem_b2',
    title: 'How to Secure Express APIs in Node.js',
    slug: 'securing-express-apis',
    markdownContent: `## The Shield: Defensive API Architectures

Deploying an API into the wild web is like opening a portal into your database. Without standard filters, security cracks will develop. Let us implement absolute protective layers on our Express backend.

### 1. JSON Web Tokens and HTTP-Only Cookies
Avoid storing active JWT tokens inside localStorage! It exposes tokens to cross-site scripting (XSS) vectors. Instead, pack tokens securely:
\`\`\`js
res.cookie('jwt_token', token, { 
  httpOnly: true, 
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000 
});
\`\`\`

### 2. Rate Limiting
Prevent Denial-of-Service constraints using robust middleware trackers like \`express-rate-limit\`. That guarantees the API stays responsive. Keep coding securely!`,
    excerpt: 'Deep-dive security guidelines covering cryptographic salt hashing, JWT validation cookie management, and CORS rules.',
    tags: ['Node.js', 'Express.js', 'Security'],
    comments: [],
    status: 'published',
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    _id: 'mem_b3',
    title: 'Web Audio API: Synthesizing Interactive Sounds',
    slug: 'web-audio-api-synth',
    markdownContent: `## Crafting the Soundtrack

Websites should have voices. In this post, we explore how to generate retro gaming and synthwave sweeps using standard **Web Audio API** oscillators, without downloading bulky audio tracks.

### Oscillating the Grid

We can instantiate a sound synthesizer in a couple of lines:
\`\`\`js
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const osc = audioCtx.createOscillator();
const gain = audioCtx.createGain();

osc.type = 'sawtooth';
osc.frequency.setValueAtTime(440, audioCtx.currentTime); // Standard A4 note

osc.connect(gain);
gain.connect(audioCtx.destination);
osc.start();
osc.stop(audioCtx.currentTime + 0.15); // Dynamic blip
\`\`\`

This provides zero-bandwidth sound effects for user clicks, hovering nodes, and unlocked badges!`,
    excerpt: 'Create real-time synth sweeps, sci-fi hums, and gaming badge unlock soundwaves using pure JavaScript.',
    tags: ['JavaScript', 'Web Audio API', 'Music'],
    comments: [],
    status: 'published',
    createdAt: new Date(Date.now() - 172800000)
  }
];

let memoryContacts = [
  { _id: 'mem_c1', name: 'Saitama', email: 'saitama@hero.org', subject: 'One Punch Dev', message: 'Can you build a site that loads in one millisecond? Urgent!', read: false, createdAt: new Date() }
];

let memoryAchievements = [
  { _id: 'mem_a1', title: 'System Bootup', description: 'Initiated Gaurvit\'s Cyber-Portfolio ecosystem.', badgeId: 'badge_bootup', rarity: 'Common', unlockedAt: new Date() }
];

// Helper to check DB mode and route query/mutation
const isOffline = () => getOfflineStatus();

// ==========================================
// 1. PROJECTS API
// ==========================================

// GET all projects
router.get('/projects', async (req, res) => {
  try {
    if (isOffline()) {
      return res.json({ success: true, count: memoryProjects.length, data: [...memoryProjects].sort((a, b) => a.order - b.order) });
    }
    const projects = await Project.find().sort({ order: 1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE dynamic project
router.post('/projects', protectAdmin, async (req, res) => {
  try {
    if (isOffline()) {
      const newProj = {
        _id: 'mem_' + Date.now(),
        ...req.body,
        tags: Array.isArray(req.body.tags) ? req.body.tags : req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
        createdAt: new Date()
      };
      memoryProjects.push(newProj);
      return res.status(201).json({ success: true, data: newProj });
    }
    
    const project = new Project(req.body);
    await project.save();
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// UPDATE project
router.put('/projects/:id', protectAdmin, async (req, res) => {
  try {
    if (isOffline()) {
      const idx = memoryProjects.findIndex(p => p._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Project not found.' });
      
      memoryProjects[idx] = {
        ...memoryProjects[idx],
        ...req.body,
        tags: Array.isArray(req.body.tags) ? req.body.tags : req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : memoryProjects[idx].tags
      };
      return res.json({ success: true, data: memoryProjects[idx] });
    }

    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE project
router.delete('/projects/:id', protectAdmin, async (req, res) => {
  try {
    if (isOffline()) {
      const idx = memoryProjects.findIndex(p => p._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Project not found.' });
      memoryProjects.splice(idx, 1);
      return res.json({ success: true, message: 'Project purged from sandboxed memory.' });
    }

    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, message: 'Project purged from database system.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. BLOGS API
// ==========================================

// GET all blogs
router.get('/blogs', async (req, res) => {
  try {
    if (isOffline()) {
      return res.json({ success: true, count: memoryBlogs.length, data: memoryBlogs });
    }
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, count: blogs.length, data: blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE blog
router.post('/blogs', protectAdmin, async (req, res) => {
  try {
    if (isOffline()) {
      const newBlog = {
        _id: 'mem_' + Date.now(),
        ...req.body,
        slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        tags: Array.isArray(req.body.tags) ? req.body.tags : req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
        comments: [],
        createdAt: new Date()
      };
      memoryBlogs.push(newBlog);
      return res.status(201).json({ success: true, data: newBlog });
    }

    const slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const blog = new Blog({ ...req.body, slug });
    await blog.save();
    res.status(201).json({ success: true, data: blog });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// UPDATE blog
router.put('/blogs/:id', protectAdmin, async (req, res) => {
  try {
    if (isOffline()) {
      const idx = memoryBlogs.findIndex(b => b._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Blog not found.' });

      let slug = memoryBlogs[idx].slug;
      if (req.body.title) {
        slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }

      memoryBlogs[idx] = {
        ...memoryBlogs[idx],
        ...req.body,
        slug,
        tags: Array.isArray(req.body.tags) ? req.body.tags : req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : memoryBlogs[idx].tags
      };
      return res.json({ success: true, data: memoryBlogs[idx] });
    }

    let updates = { ...req.body };
    if (updates.title) {
      updates.slug = updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE blog
router.delete('/blogs/:id', protectAdmin, async (req, res) => {
  try {
    if (isOffline()) {
      const idx = memoryBlogs.findIndex(b => b._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Blog not found.' });
      memoryBlogs.splice(idx, 1);
      return res.json({ success: true, message: 'Blog purged from sandboxed memory.' });
    }

    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
    res.json({ success: true, message: 'Blog purged from database system.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// SUBMIT comment to blog
router.post('/blogs/:slug/comments', async (req, res) => {
  const { author, email, content } = req.body;
  if (!author || !email || !content) {
    return res.status(400).json({ success: false, message: 'All comment fields are required.' });
  }

  try {
    if (isOffline()) {
      const blog = memoryBlogs.find(b => b.slug === req.params.slug);
      if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found.' });

      const comment = { author, email, content, createdAt: new Date() };
      blog.comments.push(comment);
      return res.status(201).json({ success: true, data: comment });
    }

    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found.' });

    const comment = { author, email, content };
    blog.comments.push(comment);
    await blog.save();

    res.status(201).json({ success: true, data: blog.comments[blog.comments.length - 1] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. CONTACT API
// ==========================================

// SEND contact message
router.post('/contacts', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All mandatory contact fields are required.' });
  }

  try {
    if (isOffline()) {
      const msg = {
        _id: 'mem_' + Date.now(),
        name,
        email,
        subject: subject || 'General Inquiry',
        message,
        read: false,
        createdAt: new Date()
      };
      memoryContacts.push(msg);
      return res.status(201).json({ success: true, message: 'Data packet sent! Gaurvit Tiwati will respond shortly.' });
    }

    const msg = new Contact({ name, email, subject, message });
    await msg.save();
    res.status(201).json({ success: true, message: 'Data packet sent! Gaurvit Tiwati will respond shortly.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET all contact messages (Admin protected)
router.get('/contacts', protectAdmin, async (req, res) => {
  try {
    if (isOffline()) {
      return res.json({ success: true, count: memoryContacts.length, data: memoryContacts });
    }
    const msgs = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, count: msgs.length, data: msgs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// TOGGLE read status (Admin protected)
router.put('/contacts/:id/read', protectAdmin, async (req, res) => {
  try {
    if (isOffline()) {
      const idx = memoryContacts.findIndex(c => c._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Message not found.' });
      memoryContacts[idx].read = !memoryContacts[idx].read;
      return res.json({ success: true, data: memoryContacts[idx] });
    }

    const msg = await Contact.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });

    msg.read = !msg.read;
    await msg.save();
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE contact message (Admin protected)
router.delete('/contacts/:id', protectAdmin, async (req, res) => {
  try {
    if (isOffline()) {
      const idx = memoryContacts.findIndex(c => c._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Message not found.' });
      memoryContacts.splice(idx, 1);
      return res.json({ success: true, message: 'Message purged.' });
    }

    const msg = await Contact.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, message: 'Message purged.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. ACHIEVEMENTS API
// ==========================================

// GET all achievements
router.get('/achievements', async (req, res) => {
  try {
    if (isOffline()) {
      return res.json({ success: true, count: memoryAchievements.length, data: memoryAchievements });
    }
    const achs = await Achievement.find().sort({ unlockedAt: -1 });
    res.json({ success: true, count: achs.length, data: achs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST dynamic unlock achievement
router.post('/achievements/unlock', async (req, res) => {
  const { title, description, badgeId, rarity } = req.body;
  if (!title || !badgeId || !description) {
    return res.status(400).json({ success: false, message: 'Missing parameters.' });
  }

  try {
    if (isOffline()) {
      const exists = memoryAchievements.find(a => a.badgeId === badgeId);
      if (exists) return res.json({ success: true, message: 'Achievement already unlocked previously.', data: exists, newlyUnlocked: false });

      const newAch = { _id: 'mem_a_' + Date.now(), title, description, badgeId, rarity: rarity || 'Common', unlockedAt: new Date() };
      memoryAchievements.push(newAch);
      return res.json({ success: true, message: 'Achievement unlocked successfully!', data: newAch, newlyUnlocked: true });
    }

    const exists = await Achievement.findOne({ badgeId });
    if (exists) {
      return res.json({ success: true, message: 'Achievement already unlocked.', data: exists, newlyUnlocked: false });
    }

    const ach = new Achievement({ title, description, badgeId, rarity });
    await ach.save();
    res.json({ success: true, message: 'Achievement unlocked successfully!', data: ach, newlyUnlocked: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. CHATBOT AND STATS API
// ==========================================

// Custom AI companion answers
router.post('/chatbot', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "My sensors detect an empty data packet... Say something, partner!" });

  const msg = message.toLowerCase();
  let reply = "";

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    reply = "Konnichiwa! I am Yuki, Gaurvit's neural AI assistant. Type 'commands' or ask me about his projects, skillsets, or achievements!";
  } else if (msg.includes('project')) {
    reply = "Gaurvit has deployed several legendary systems including a realistic 'Windows 11 Clone', complex 'Node.js Todo Engines', enterprise CRUD APIs, and deep MongoDB Schema Visualizers. Tap 'Projects' to view them!";
  } else if (msg.includes('skill') || msg.includes('tech') || msg.includes('languages')) {
    reply = "He is fully spec'd into the full-stack arts: JavaScript, Node.js, Express, MongoDB, EJS, and vanilla CSS styling. He also optimizes workflows for systems on AWS, Render, and Vercel!";
  } else if (msg.includes('contact') || msg.includes('hire') || msg.includes('email')) {
    reply = "Access the Contact terminal below! Fill in your data, and I'll route it straight into Gaurvit's MongoDB server.";
  } else if (msg.includes('music') || msg.includes('song')) {
    reply = "Tapped into the mainframe audio network! You can click the cyber-tape icon at the top header to synthesize real-time synthwave frequencies directly on your browser!";
  } else if (msg.includes('achievement')) {
    reply = "Unlock achievements by exploring! Try typing commands in the command terminal (press '~' or click terminal) or toggling through system visual themes!";
  } else {
    reply = "Data queried! Gaurvit is a skilled Node.js Full-Stack Cyber-Developer. You can inspect his coding roadmap, view certificates, or send a ping down in the contact console.";
  }

  res.json({ reply });
});

// Mock stats for LeetCode & GitHub integration to make them fast and rate-limit proof
router.get('/stats/developer', (req, res) => {
  res.json({
    github: {
      contributionsCount: 842,
      longestStreak: 45,
      currentStreak: 12,
      reposCount: 28,
      starsCount: 154
    },
    leetcode: {
      solved: 342,
      total: 3100,
      easy: 150,
      medium: 160,
      hard: 32,
      ranking: 85420
    },
    peerlist: {
      verified: true,
      credentialsCount: 8,
      viewsThisMonth: 1240
    }
  });
});

module.exports = {
  router,
  memoryProjects,
  memoryBlogs,
  memoryContacts,
  memoryAchievements
};
