/* ==========================================================================
   ADMIN CONSOLE CONTROL INTERFACE & AJAX PORTALS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initDashboardTabs();
  initDashboardCRUD();
  initLogoutHandler();
});

// ==========================================
// 1. DASHBOARD NAVIGATION TABS
// ==========================================
function initDashboardTabs() {
  const tabs = document.querySelectorAll('.admin-tab-btn');
  const panels = document.querySelectorAll('.admin-console-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-pane');
      
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      const targetPane = document.getElementById(`pane-${target}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      // Play soft tech click blip
      if (window.playSynthNote) {
        window.playSynthNote(500, 'sine', 0.08);
      }
    });
  });
}

// ==========================================
// 2. DASHBOARD CRUD MANAGEMENT SYSTEM
// ==========================================
function initDashboardCRUD() {
  // Modals Toggles
  const modals = document.querySelectorAll('.cyber-admin-modal');
  const closeModalBtns = document.querySelectorAll('.modal-close-btn');

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modals.forEach(m => m.classList.remove('visible'));
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(m => m.classList.remove('visible'));
    }
  });

  // ------------------------------------------
  // A. PROJECTS ACTIONS
  // ------------------------------------------
  const projectModal = document.getElementById('project-modal');
  const projectForm = document.getElementById('project-crud-form');
  const addProjectBtn = document.getElementById('btn-add-project');
  const projectTitle = document.getElementById('modal-project-title');
  const projectIdField = document.getElementById('field-project-id');

  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
      projectTitle.innerText = 'ADD PORTFOLIO PROJECT';
      projectIdField.value = '';
      projectForm.reset();
      projectModal.classList.add('visible');
    });
  }

  // Edit Project AJAX Hook
  document.querySelectorAll('.btn-edit-project').forEach(btn => {
    btn.addEventListener('click', () => {
      const proj = JSON.parse(btn.getAttribute('data-project'));
      projectTitle.innerText = 'UPDATE PORTFOLIO PROJECT';
      
      projectIdField.value = proj._id;
      document.getElementById('field-project-title').value = proj.title;
      document.getElementById('field-project-tags').value = proj.tags.join(', ');
      document.getElementById('field-project-github').value = proj.githubLink;
      document.getElementById('field-project-demo').value = proj.demoLink;
      document.getElementById('field-project-image').value = proj.image;
      document.getElementById('field-project-desc').value = proj.description;
      document.getElementById('field-project-featured').checked = proj.featured;
      document.getElementById('field-project-order').value = proj.order || 0;
      
      projectModal.classList.add('visible');
    });
  });

  // Submit Project Form
  if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const projId = projectIdField.value;
      const url = projId ? `/api/projects/${projId}` : '/api/projects';
      const method = projId ? 'PUT' : 'POST';
      
      const payload = {
        title: document.getElementById('field-project-title').value,
        description: document.getElementById('field-project-desc').value,
        tags: document.getElementById('field-project-tags').value.split(',').map(t => t.trim()),
        githubLink: document.getElementById('field-project-github').value,
        demoLink: document.getElementById('field-project-demo').value,
        image: document.getElementById('field-project-image').value,
        featured: document.getElementById('field-project-featured').checked,
        order: parseInt(document.getElementById('field-project-order').value) || 0
      };

      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const res = await response.json();
        
        if (res.success) {
          projectModal.classList.remove('visible');
          alert('Project transaction processed successfully.');
          window.location.reload();
        } else {
          alert(`Core Error: ${res.message}`);
        }
      } catch (err) {
        alert('Server Connection exception.');
      }
    });
  }

  // Delete Project Hook
  document.querySelectorAll('.btn-delete-project').forEach(btn => {
    btn.addEventListener('click', async () => {
      const projId = btn.getAttribute('data-id');
      if (!confirm('Are you absolutely sure you want to purge this project record from mainframe database?')) return;
      
      try {
        const response = await fetch(`/api/projects/${projId}`, { method: 'DELETE' });
        const res = await response.json();
        if (res.success) {
          alert('Project record purged successfully.');
          window.location.reload();
        } else {
          alert(`Core Error: ${res.message}`);
        }
      } catch (err) {
        alert('Connection error.');
      }
    });
  });

  // ------------------------------------------
  // B. BLOGS ACTIONS
  // ------------------------------------------
  const blogModal = document.getElementById('blog-modal');
  const blogForm = document.getElementById('blog-crud-form');
  const addBlogBtn = document.getElementById('btn-add-blog');
  const blogTitle = document.getElementById('modal-blog-title');
  const blogIdField = document.getElementById('field-blog-id');

  if (addBlogBtn) {
    addBlogBtn.addEventListener('click', () => {
      blogTitle.innerText = 'ADD BLOG POST RECORD';
      blogIdField.value = '';
      blogForm.reset();
      blogModal.classList.add('visible');
    });
  }

  // Edit Blog Hook
  document.querySelectorAll('.btn-edit-blog').forEach(btn => {
    btn.addEventListener('click', () => {
      const blog = JSON.parse(btn.getAttribute('data-blog'));
      blogTitle.innerText = 'UPDATE BLOG POST RECORD';
      
      blogIdField.value = blog._id;
      document.getElementById('field-blog-title').value = blog.title;
      document.getElementById('field-blog-tags').value = blog.tags.join(', ');
      document.getElementById('field-blog-excerpt').value = blog.excerpt;
      document.getElementById('field-blog-content').value = blog.markdownContent;
      document.getElementById('field-blog-status').value = blog.status;
      
      blogModal.classList.add('visible');
    });
  });

  // Submit Blog Form
  if (blogForm) {
    blogForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const blogId = blogIdField.value;
      const url = blogId ? `/api/blogs/${blogId}` : '/api/blogs';
      const method = blogId ? 'PUT' : 'POST';

      const payload = {
        title: document.getElementById('field-blog-title').value,
        tags: document.getElementById('field-blog-tags').value.split(',').map(t => t.trim()),
        excerpt: document.getElementById('field-blog-excerpt').value,
        markdownContent: document.getElementById('field-blog-content').value,
        status: document.getElementById('field-blog-status').value
      };

      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const res = await response.json();
        
        if (res.success) {
          blogModal.classList.remove('visible');
          alert('Blog transaction processed successfully.');
          window.location.reload();
        } else {
          alert(`Core Error: ${res.message}`);
        }
      } catch (err) {
        alert('Server Exception.');
      }
    });
  }

  // Delete Blog Hook
  document.querySelectorAll('.btn-delete-blog').forEach(btn => {
    btn.addEventListener('click', async () => {
      const blogId = btn.getAttribute('data-id');
      if (!confirm('Purge this markdown post record? Comments will be lost.')) return;
      
      try {
        const response = await fetch(`/api/blogs/${blogId}`, { method: 'DELETE' });
        const res = await response.json();
        if (res.success) {
          alert('Blog purged.');
          window.location.reload();
        } else {
          alert(`Core Error: ${res.message}`);
        }
      } catch (err) {
        alert('Connection error.');
      }
    });
  });

  // ------------------------------------------
  // C. CONTACT MESSAGES ACTIONS
  // ------------------------------------------
  const messageModal = document.getElementById('message-modal');

  // View Message Details Hook
  document.querySelectorAll('.btn-view-msg').forEach(btn => {
    btn.addEventListener('click', async () => {
      const msg = JSON.parse(btn.getAttribute('data-message'));
      
      document.getElementById('msg-sender').innerText = msg.name;
      document.getElementById('msg-email').innerText = msg.email;
      document.getElementById('msg-subject').innerText = msg.subject;
      document.getElementById('msg-date').innerText = new Date(msg.createdAt).toLocaleString();
      document.getElementById('msg-body').innerText = msg.message;
      
      messageModal.classList.add('visible');

      // If message is unread, automatically mark as read inside database!
      if (!msg.read) {
        try {
          const response = await fetch(`/api/contacts/${msg._id}/read`, { method: 'PUT' });
          const res = await response.json();
          if (res.success) {
            // Update row styles asynchronously
            btn.closest('tr').querySelector('.status-pill').className = 'status-pill read';
            btn.closest('tr').querySelector('.status-pill').innerText = 'READ';
          }
        } catch (e) {}
      }
    });
  });

  // Delete Message Hook
  document.querySelectorAll('.btn-delete-msg').forEach(btn => {
    btn.addEventListener('click', async () => {
      const msgId = btn.getAttribute('data-id');
      if (!confirm('Purge this client contact record message permanently?')) return;
      
      try {
        const response = await fetch(`/api/contacts/${msgId}`, { method: 'DELETE' });
        const res = await response.json();
        if (res.success) {
          alert('Message purged.');
          window.location.reload();
        } else {
          alert(`Core Error: ${res.message}`);
        }
      } catch (err) {
        alert('Connection error.');
      }
    });
  });
}

// ==========================================
// 3. SECURE DECRYPTION LOGOUT KEY
// ==========================================
function initLogoutHandler() {
  const logoutBtn = document.getElementById('btn-admin-logout');
  if (!logoutBtn) return;
  
  logoutBtn.addEventListener('click', async () => {
    if (!confirm('Clear cyber-admin session keys and lock mainframe console?')) return;
    
    try {
      const response = await fetch('/auth/logout', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        alert('Session secure. Mainframe locked.');
        window.location.href = '/login';
      }
    } catch (err) {
      alert('Error signing out.');
    }
  });
}
