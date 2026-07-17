import { initTerminal } from '../components/terminal';

export function renderHero(container, data) {
  if (!container || !data) return;

  const profile = data.profile;
  const projectCount = data.projects ? data.projects.length : 0;
  const skillsCount = data.skills ? data.skills.length : 0;
  
  // Calculate years of experience
  const yearsExp = data.experience && data.experience.length > 0 
    ? Math.max(...data.experience.map(e => {
        const start = new Date(e.start_date);
        const end = e.end_date ? new Date(e.end_date) : new Date();
        return (end - start) / (1000 * 60 * 60 * 24 * 365.25);
      })).toFixed(0)
    : '5';

  container.innerHTML = `
    <div class="reveal reveal-active" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
      
      <!-- Profile Avatar -->
      <div class="hero-image-wrapper">
        <div class="hero-image-glow"></div>
        <img src="${profile.avatar_url}" alt="${profile.name} Portrait Avatar" class="hero-avatar" loading="eager">
      </div>

      <!-- Bio Info -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-top: 1rem; width: 100%; max-width: 750px;">
        ${profile.status ? `
          <div class="hero-status-tag">
            <span class="status-dot"></span>
            <span>SYSTEM STATE: ${profile.status}</span>
          </div>
        ` : ''}
        
        <h1 class="hero-name"><span class="text-gradient-cyan">${profile.name}</span></h1>
        <h2 class="hero-title">${profile.title}</h2>
        <p class="hero-bio">${profile.bio}</p>
        
        <!-- Stats Panel -->
        <div style="display: flex; gap: 3rem; margin: 1.5rem 0; font-family: var(--font-mono); font-size: 0.85rem; color: hsl(var(--text-secondary)); justify-content: center; width: 100%;">
          <div>
            <strong style="color: hsl(var(--accent-cyan)); font-size: 1.75rem; font-weight: 700;">${projectCount}</strong>
            <div style="margin-top: 0.25rem;">Projects Built</div>
          </div>
          <div>
            <strong style="color: hsl(var(--accent-violet)); font-size: 1.75rem; font-weight: 700;">${skillsCount}</strong>
            <div style="margin-top: 0.25rem;">Expertise Tags</div>
          </div>
          <div>
            <strong style="color: hsl(var(--accent-green)); font-size: 1.75rem; font-weight: 700;">${yearsExp}+</strong>
            <div style="margin-top: 0.25rem;">Years Experience</div>
          </div>
        </div>
        
        <!-- CTA Binders -->
        <div class="hero-ctas">
          <a href="#contact" class="btn-primary" id="hero-contact-cta" aria-label="Go to Contact Section">
            Initialize Connection
          </a>
          ${profile.resume_url && profile.resume_url !== '#' ? `
            <a href="${profile.resume_url}" target="_blank" rel="noopener noreferrer" class="btn-secondary" aria-label="Download PDF resume file">
              <i class="fas fa-file-pdf" style="margin-right: 0.5rem;"></i> Download Resume
            </a>
          ` : ''}
        </div>
      </div>
      
      <!-- CLI Terminal mount centered -->
      <div style="margin-top: 4rem; width: 100%; max-width: 800px; text-align: left;" id="terminal-mount"></div>
      
    </div>
  `;

  // Bind smooth scroll action to Hero contact CTA link
  const ctaBtn = container.querySelector('#hero-contact-cta');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const offset = 100;
        const position = contactSection.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: position, behavior: 'smooth' });
      }
    });
  }

  // Mount Terminal Console
  const terminalMount = container.querySelector('#terminal-mount');
  if (terminalMount) {
    initTerminal(terminalMount, data);
  }
}
