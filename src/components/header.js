import { getConnectionStatus } from '../services/api';
import { getTheme, setTheme } from '../services/theme';

export function renderHeader(container) {
  const status = getConnectionStatus();
  const activeTheme = getTheme();
  
  const statusClass = status === 'connected' ? '' : 'offline';
  const statusText = status === 'connected' ? 'DB: ONLINE' : 'DB: OFFLINE CACHE';

  container.innerHTML = `
    <header class="os-header">
      <div class="os-brand">
        <img src="/src/assets/profile_avatar.png" alt="Logo" class="brand-avatar" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid hsl(var(--accent-cyan));margin-right:0.4rem;" />
        <span>Personal<span style="color:hsl(var(--accent-cyan));">OS</span></span>
      </div>
      
      <div class="os-status">
        <div class="supabase-indicator ${statusClass}" id="db-indicator" title="Supabase Database Connection Status">
          <i class="fas ${status === 'connected' ? 'fa-link' : 'fa-link-slash'}"></i>
          <span>${statusText}</span>
        </div>
        
        <div class="os-theme-toggle">
          <button class="theme-btn ${activeTheme === 'light' ? 'active' : ''}" data-theme-val="light" title="Light Theme" aria-label="Switch to Light Theme">
            <i class="fas fa-sun"></i>
          </button>
          <button class="theme-btn ${activeTheme === 'dark' ? 'active' : ''}" data-theme-val="dark" title="Dark Theme" aria-label="Switch to Dark Theme">
            <i class="fas fa-moon"></i>
          </button>
          <button class="theme-btn ${activeTheme === 'system' ? 'active' : ''}" data-theme-val="system" title="System Theme" aria-label="Switch to System Theme">
            <i class="fas fa-laptop"></i>
          </button>
        </div>
        
        <div class="os-clock" id="os-clock" aria-live="off">--:--:--</div>
      </div>
    </header>
  `;

  // Start Live Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Hook Theme Change click listeners
  const themeButtons = container.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const themeVal = btn.getAttribute('data-theme-val');
      setTheme(themeVal);
      
      // Update UI active states
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function updateClock() {
  const clockEl = document.getElementById('os-clock');
  if (!clockEl) return;
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
