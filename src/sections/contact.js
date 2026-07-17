import { submitContactForm } from '../services/api';

export function renderContact(container, data) {
  if (!container || !data) return;

  const profile = data.profile;

  container.innerHTML = `
    <div class="reveal reveal-active">
      <h2 class="section-title" style="margin-bottom: 2rem;">
        <i class="fas fa-satellite-dish" style="color: hsl(var(--accent-cyan)); margin-right: 0.5rem;"></i>
        Establish Connection
      </h2>
      
      <div class="contact-wrapper">
        <!-- 1. LEFT SIDE CHANNELS -->
        <div class="contact-info">
          
          ${profile.email ? `
            <div class="glow-card contact-card">
              <div class="contact-icon"><i class="fas fa-envelope"></i></div>
              <div class="contact-details">
                <h4>Email</h4>
                <p><a href="mailto:${profile.email}" class="text-gradient-cyan" aria-label="Send email to ${profile.email}">${profile.email}</a></p>
              </div>
            </div>
          ` : ''}

          ${profile.whatsapp_url ? `
            <div class="glow-card contact-card">
              <div class="contact-icon" style="color: #25d366;"><i class="fab fa-whatsapp"></i></div>
              <div class="contact-details">
                <h4>WhatsApp</h4>
                <p><a href="${profile.whatsapp_url}" target="_blank" rel="noopener noreferrer" class="text-gradient-cyan" aria-label="Chat on WhatsApp">+20 128 132 0192</a></p>
              </div>
            </div>
          ` : ''}

          ${profile.location ? `
            <div class="glow-card contact-card">
              <div class="contact-icon"><i class="fas fa-compass"></i></div>
              <div class="contact-details">
                <h4>Location</h4>
                <p>${profile.location}</p>
              </div>
            </div>
          ` : ''}

          <div class="glow-card contact-card" style="flex-direction: column; align-items: flex-start; gap: 1rem;">
            <h4 style="font-size: 0.8rem; font-weight: 700; color: hsl(var(--text-muted)); text-transform: uppercase;">Find Me Online</h4>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${profile.github_url ? `
                <a href="${profile.github_url}" target="_blank" rel="noopener noreferrer" class="btn-icon-link" aria-label="GitHub Developer Profile">
                  <i class="fab fa-github"></i> GitHub
                </a>
              ` : ''}
              ${profile.whatsapp_url ? `
                <a href="${profile.whatsapp_url}" target="_blank" rel="noopener noreferrer" class="btn-icon-link" style="border-color: hsla(142, 71%, 45%, 0.4); color: #25d366;" aria-label="WhatsApp Chat">
                  <i class="fab fa-whatsapp"></i> WhatsApp
                </a>
              ` : ''}
            </div>

        </div>

        <!-- 2. RIGHT SIDE CONTACT FORM -->
        <div class="glow-card contact-form-container">
          <h3 class="form-title">Transmit Message Payload</h3>
          
          <form id="os-contact-form">
            <div class="form-group">
              <label for="c-name">Identity (Name)</label>
              <input type="text" id="c-name" class="form-control" placeholder="Agent Name" required autocomplete="name">
            </div>
            <div class="form-group">
              <label for="c-email">Return Node (Email)</label>
              <input type="email" id="c-email" class="form-control" placeholder="agent@network.com" required autocomplete="email">
            </div>
            <div class="form-group">
              <label for="c-message">Payload (Message)</label>
              <textarea id="c-message" class="form-control" placeholder="Enter transmission details..." required></textarea>
            </div>
            
            <button type="submit" class="btn-primary" id="c-submit" style="width: 100%; margin-top: 1rem;" aria-label="Transmit form data">
              Send Payload
            </button>
            
            <div class="form-status" id="c-status"></div>
          </form>
        </div>

      </div>
    </div>
  `;

  // Bind Submit event listener
  const form = container.querySelector('#os-contact-form');
  const submitBtn = container.querySelector('#c-submit');
  const statusEl = container.querySelector('#c-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable inputs
    submitBtn.disabled = true;
    submitBtn.textContent = 'Transmitting...';
    statusEl.style.display = 'none';
    statusEl.className = 'form-status';

    const name = form.querySelector('#c-name').value;
    const email = form.querySelector('#c-email').value;
    const message = form.querySelector('#c-message').value;

    const result = await submitContactForm(name, email, message);
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Payload';
    statusEl.textContent = result.message;
    statusEl.style.display = 'block';

    if (result.success) {
      statusEl.classList.add('success');
      form.reset();
    } else {
      statusEl.classList.add('error');
    }
  });
}
