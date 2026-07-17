import { supabase, isSupabaseConfigured } from '../config/supabase';
import { getPortfolioData } from '../services/api';

let isLoggedIn = false;
let currentSubTab = 'project'; // 'project', 'skill', 'cert'

/**
 * Creates and displays the Admin Control Panel Modal overlay
 */
export function showAdminModal(onDataChange) {
  // Check if modal is already open
  if (document.getElementById('admin-modal')) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'admin-modal';
  
  modal.innerHTML = `
    <div class="modal-card" style="max-width: 650px;">
      <div class="modal-header">
        <h3 style="font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-gears" style="color: hsl(var(--accent-violet));"></i>
          OS Admin Control Panel
        </h3>
        <button class="modal-close-btn" id="admin-modal-close" aria-label="Close Admin Modal">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
      <div class="modal-body" id="admin-modal-body" style="padding: 2rem;">
        <!-- Dynamic Login / CMS forms mounted here -->
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden'; // prevent background scrolling

  const bodyContainer = modal.querySelector('#admin-modal-body');
  
  // Close triggers
  const closeModal = () => {
    modal.remove();
    document.body.style.overflow = '';
    window.removeEventListener('keydown', handleEsc);
  };
  
  const handleEsc = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  modal.querySelector('#admin-modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', handleEsc);

  // Initialize view state
  const savedAuth = sessionStorage.getItem('admin_authenticated');
  if (savedAuth === 'true') {
    isLoggedIn = true;
  }

  const handleStateChange = () => {
    if (!isLoggedIn) {
      renderLoginView(bodyContainer, handleStateChange, onDataChange);
    } else {
      renderCMSView(bodyContainer, handleStateChange, onDataChange);
    }
  };

  handleStateChange();
}

function renderLoginView(container, onStateChange, onDataChange) {
  const isOnline = isSupabaseConfigured;

  container.innerHTML = `
    <form id="admin-login-form" style="max-width: 420px; margin: 0 auto;">
      <p style="font-size: 0.85rem; color: hsl(var(--text-secondary)); margin-bottom: 1.5rem; text-align: center;">
        Sign in to make dynamic edits to projects, skills, and certifications.
      </p>
      
      <div class="form-group">
        <label for="login-email">Email Address</label>
        <input type="email" id="login-email" class="form-control" placeholder="developer@email.com" required>
      </div>
      <div class="form-group">
        <label for="login-password">System Password</label>
        <input type="password" id="login-password" class="form-control" placeholder="••••••••" required>
      </div>
      
      <button type="submit" class="btn-primary" style="width: 100%; margin-top: 1rem;">
        Authenticate Session
      </button>
      
      <div class="form-status" id="login-status"></div>
      
      <div style="margin-top: 1.5rem; padding: 0.75rem; background: hsl(var(--bg-tertiary)); border-radius: var(--radius-sm); border: 1px dashed hsl(var(--border-primary)); font-size: 0.75rem; color: hsl(var(--text-secondary));">
        <strong>Credentials Mode:</strong><br>
        ${isOnline 
          ? 'Connect using your Supabase project\'s auth email and password.' 
          : 'Offline fallback mode active. Authenticate with: <br><code style="font-family: monospace; color: hsl(var(--accent-cyan));">admin@dev.io</code> and password <code style="font-family: monospace; color: hsl(var(--accent-cyan));">admin</code>.'}
      </div>
    </form>
  `;

  const form = container.querySelector('#admin-login-form');
  const statusEl = container.querySelector('#login-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = container.querySelector('#login-email').value;
    const password = container.querySelector('#login-password').value;

    statusEl.textContent = 'Processing request...';
    statusEl.className = 'form-status';
    statusEl.style.display = 'block';

    if (isOnline && supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        sessionStorage.setItem('admin_authenticated', 'true');
        isLoggedIn = true;
        onStateChange();
      } catch (err) {
        statusEl.textContent = `Auth error: ${err.message || err}`;
        statusEl.classList.add('error');
      }
    } else {
      if (email === 'admin@dev.io' && password === 'admin') {
        sessionStorage.setItem('admin_authenticated', 'true');
        isLoggedIn = true;
        onStateChange();
      } else {
        statusEl.textContent = 'Invalid credentials for local offline session.';
        statusEl.classList.add('error');
      }
    }
  });
}

function renderCMSView(container, onStateChange, onDataChange) {
  container.innerHTML = `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <span style="font-family: var(--font-mono); font-size: 0.75rem; color: hsl(var(--accent-green));">
          <i class="fas fa-circle-nodes"></i> SESSION_SECURED
        </span>
        <button id="admin-logout-btn" class="admin-link-btn" style="font-size: 0.75rem;">
          <i class="fas fa-sign-out-alt"></i> Logout Session
        </button>
      </div>

      <div class="explorer-controls" style="margin-bottom: 1.5rem; padding: 0.4rem 0.75rem; justify-content: flex-start; gap: 0.5rem;">
        <button class="filter-btn ${currentSubTab === 'project' ? 'active' : ''}" data-subtab="project">Add Project</button>
        <button class="filter-btn ${currentSubTab === 'skill' ? 'active' : ''}" data-subtab="skill">Add Skill</button>
        <button class="filter-btn ${currentSubTab === 'cert' ? 'active' : ''}" data-subtab="cert">Add Cert</button>
      </div>

      <div id="cms-form-viewport">
        <!-- Form elements injected dynamically -->
      </div>
    </div>
  `;

  // Logout Binders
  container.querySelector('#admin-logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('admin_authenticated');
    isLoggedIn = false;
    onStateChange();
  });

  const formsContainer = container.querySelector('#cms-form-viewport');
  const tabs = container.querySelectorAll('.filter-btn');

  const switchTab = (tabName) => {
    currentSubTab = tabName;
    tabs.forEach(t => t.classList.remove('active'));
    container.querySelector(`[data-subtab="${tabName}"]`).classList.add('active');
    
    if (tabName === 'project') renderProjectForm(formsContainer, onDataChange);
    if (tabName === 'skill') renderSkillForm(formsContainer, onDataChange);
    if (tabName === 'cert') renderCertForm(formsContainer, onDataChange);
  };

  tabs.forEach(t => {
    t.addEventListener('click', () => {
      switchTab(t.getAttribute('data-subtab'));
    });
  });

  switchTab(currentSubTab);
}

function renderProjectForm(container, onDataChange) {
  container.innerHTML = `
    <form id="cms-project-form">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="proj-title">Project Title</label>
          <input type="text" id="proj-title" class="form-control" required placeholder="AuraOS System">
        </div>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="proj-slug">Slug</label>
          <input type="text" id="proj-slug" class="form-control" required placeholder="auraos-system">
        </div>
      </div>
      
      <div class="form-group" style="margin-bottom: 0.75rem;">
        <label for="proj-short">Summary</label>
        <input type="text" id="proj-short" class="form-control" required placeholder="A developer dashboard terminal layout.">
      </div>
      
      <div class="form-group" style="margin-bottom: 0.75rem;">
        <label for="proj-desc">Detailed Case Study</label>
        <textarea id="proj-desc" class="form-control" placeholder="Detail the construction path..."></textarea>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="proj-tech">Technologies (Comma-separated)</label>
          <input type="text" id="proj-tech" class="form-control" placeholder="React, Go, WebAssembly">
        </div>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="proj-year">Year</label>
          <input type="number" id="proj-year" class="form-control" value="2026" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="proj-github">GitHub Code URL</label>
          <input type="url" id="proj-github" class="form-control" placeholder="https://github.com">
        </div>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="proj-live">Live Demo URL</label>
          <input type="url" id="proj-live" class="form-control" placeholder="https://demo.com">
        </div>
      </div>

      <button type="submit" class="btn-primary" style="margin-top: 1rem; width: 100%;">
        Save Project
      </button>
      
      <div class="form-status" id="cms-status"></div>
    </form>
  `;

  bindFormSubmit(container.querySelector('#cms-project-form'), 'projects', (form) => {
    return {
      title: form.querySelector('#proj-title').value,
      slug: form.querySelector('#proj-slug').value,
      short_description: form.querySelector('#proj-short').value,
      full_description: form.querySelector('#proj-desc').value,
      technologies: form.querySelector('#proj-tech').value.split(',').map(t => t.trim()).filter(Boolean),
      year: parseInt(form.querySelector('#proj-year').value) || 2026,
      github_url: form.querySelector('#proj-github').value,
      live_url: form.querySelector('#proj-live').value,
      cover_image: '/assets/project_mockup.png',
      status: 'Completed',
      display_order: 10
    };
  }, onDataChange);
}

function renderSkillForm(container, onDataChange) {
  container.innerHTML = `
    <form id="cms-skill-form">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="skill-name">Skill Name</label>
          <input type="text" id="skill-name" class="form-control" required placeholder="Python">
        </div>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="skill-group">Skill Category</label>
          <select id="skill-group" class="form-control" required>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Tools">Tools / DevOps</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="skill-prof">Proficiency Level (0 - 100%)</label>
          <input type="number" id="skill-prof" class="form-control" min="0" max="100" value="85" required>
        </div>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="skill-exp">Years of Experience</label>
          <input type="number" step="0.5" id="skill-exp" class="form-control" value="3.5" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="skill-icon">Icon Identifier</label>
          <input type="text" id="skill-icon" class="form-control" placeholder="code" value="code">
        </div>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="skill-color">Accent Color</label>
          <input type="text" id="skill-color" class="form-control" placeholder="#8b5cf6" value="#8b5cf6">
        </div>
      </div>

      <button type="submit" class="btn-primary" style="margin-top: 1rem; width: 100%;">
        Save Skill
      </button>
      
      <div class="form-status" id="cms-status"></div>
    </form>
  `;

  bindFormSubmit(container.querySelector('#cms-skill-form'), 'skills', (form) => {
    return {
      name: form.querySelector('#skill-name').value,
      group_name: form.querySelector('#skill-group').value,
      proficiency: parseInt(form.querySelector('#skill-prof').value) || 80,
      years_of_experience: parseFloat(form.querySelector('#skill-exp').value) || 1.0,
      icon: form.querySelector('#skill-icon').value,
      color: form.querySelector('#skill-color').value,
      display_order: 10
    };
  }, onDataChange);
}

function renderCertForm(container, onDataChange) {
  container.innerHTML = `
    <form id="cms-cert-form">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="cert-title">Certificate Name</label>
          <input type="text" id="cert-title" class="form-control" required placeholder="AWS SysOps Associate">
        </div>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="cert-issuer">Issuer</label>
          <input type="text" id="cert-issuer" class="form-control" required placeholder="Amazon Web Services">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="cert-issue">Issue Date</label>
          <input type="date" id="cert-issue" class="form-control" required>
        </div>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="cert-expire">Expiry Date</label>
          <input type="date" id="cert-expire" class="form-control">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="cert-id">Credential ID</label>
          <input type="text" id="cert-id" class="form-control" placeholder="AWS-SYSOPS-8893">
        </div>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label for="cert-url">Verification URL</label>
          <input type="url" id="cert-url" class="form-control" placeholder="https://aws.amazon.com">
        </div>
      </div>

      <button type="submit" class="btn-primary" style="margin-top: 1rem; width: 100%;">
        Save Certification
      </button>
      
      <div class="form-status" id="cms-status"></div>
    </form>
  `;

  bindFormSubmit(container.querySelector('#cms-cert-form'), 'certifications', (form) => {
    return {
      title: form.querySelector('#cert-title').value,
      issuer: form.querySelector('#cert-issuer').value,
      issue_date: form.querySelector('#cert-issue').value,
      expires_at: form.querySelector('#cert-expire').value || null,
      credential_id: form.querySelector('#cert-id').value,
      credential_url: form.querySelector('#cert-url').value,
      image_url: '',
      display_order: 10
    };
  }, onDataChange);
}

function bindFormSubmit(form, tableName, payloadGenerator, onDataChange) {
  const statusEl = form.querySelector('#cms-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Writing entry to system database...';
    statusEl.className = 'form-status';
    statusEl.style.display = 'block';

    const payload = payloadGenerator(form);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from(tableName).insert([payload]);
        if (error) throw error;
        
        statusEl.textContent = 'Successfully saved entry to Supabase!';
        statusEl.classList.add('success');
        form.reset();
        
        // Refresh cached data state in client
        await getPortfolioData(true);
        if (onDataChange) onDataChange();
      } catch (err) {
        statusEl.textContent = `Write failed: ${err.message || err}`;
        statusEl.classList.add('error');
      }
    } else {
      // Local storage simulations
      try {
        const customDb = JSON.parse(localStorage.getItem('offline_custom_db') || '{}');
        if (!customDb[tableName]) customDb[tableName] = [];
        
        payload.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        payload.created_at = new Date().toISOString();
        
        customDb[tableName].push(payload);
        localStorage.setItem('offline_custom_db', JSON.stringify(customDb));

        statusEl.textContent = 'Saved to local browser cache (localStorage)!';
        statusEl.classList.add('success');
        form.reset();

        // Call memory refreshes
        if (onDataChange) onDataChange();
      } catch (err) {
        statusEl.textContent = `Write failed: ${err}`;
        statusEl.classList.add('error');
      }
    }
  });
}
