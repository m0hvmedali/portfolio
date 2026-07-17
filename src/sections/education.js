import { formatDate } from '../utils/date';

export function renderEducation(container, data) {
  if (!container || !data) return;

  const educationList = data.education || [];
  const certsList = data.certifications || [];

  container.innerHTML = `
    <div class="reveal reveal-active">
      <div style="display: grid; grid-template-columns: 1fr; gap: 3rem;">
        
        <!-- 1. EDUCATION SECTION -->
        <div>
          <h2 class="section-title" style="margin-bottom: 2rem;">
            <i class="fas fa-graduation-cap" style="color: hsl(var(--accent-cyan)); margin-right: 0.5rem;"></i>
            Academic History
          </h2>
          
          ${educationList.length === 0 ? `
            <p style="color: hsl(var(--text-muted)); font-family: var(--font-mono); font-size: 0.85rem;">No academic records found.</p>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              ${educationList.map(edu => `
                <div class="glow-card" style="padding: 1.5rem;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;">
                    <div>
                      <h3 style="font-size: 1.2rem; font-weight: 700;">${edu.degree}</h3>
                      <div style="font-weight: 600; color: hsl(var(--accent-violet)); margin-top: 0.25rem;">${edu.institution}</div>
                      ${edu.field_of_study ? `<div style="font-size: 0.9rem; color: hsl(var(--text-secondary));">${edu.field_of_study}</div>` : ''}
                    </div>
                    <span style="font-family: var(--font-mono); font-size: 0.8rem; color: hsl(var(--text-muted));">
                      ${formatDate(edu.start_date)} — ${edu.end_date ? formatDate(edu.end_date) : 'Present'}
                    </span>
                  </div>
                  ${edu.description ? `<p style="margin-top: 1rem; font-size: 0.85rem; color: hsl(var(--text-secondary));">${edu.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- 2. CERTIFICATIONS SECTION -->
        <div>
          <h2 class="section-title" style="margin-bottom: 2rem;">
            <i class="fas fa-certificate" style="color: hsl(var(--accent-violet)); margin-right: 0.5rem;"></i>
            Professional Certifications
          </h2>
          
          ${certsList.length === 0 ? `
            <p style="color: hsl(var(--text-muted)); font-family: var(--font-mono); font-size: 0.85rem;">No certifications found.</p>
          ` : `
            <div class="certs-grid">
              ${certsList.map(cert => `
                <div class="glow-card cert-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    ${cert.image_url ? `
                      <div class="cert-image-box" style="height: 140px; overflow: hidden; border-radius: var(--radius-sm); background: hsl(var(--bg-tertiary)); margin-bottom: 0.75rem; border: 1px solid hsl(var(--border-primary)); cursor: pointer;" data-img-src="${cert.image_url}" data-img-title="${cert.title}">
                        <img src="${cert.image_url}" alt="${cert.title} preview" style="width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-fast);" class="cert-thumb-img">
                      </div>
                    ` : ''}
                    <div class="cert-issuer">${cert.issuer}</div>
                    <h3 class="cert-title" style="margin-top: 0.25rem;">${cert.title}</h3>
                    <div class="cert-date" style="margin-top: 0.25rem;">Issued: ${formatDate(cert.issue_date)} ${cert.expires_at ? `| Expires: ${formatDate(cert.expires_at)}` : ''}</div>
                    ${cert.credential_id ? `<div class="cert-id" style="margin-top: 0.25rem;">Credential ID: <code style="font-family: var(--font-mono); color: hsl(var(--accent-cyan));">${cert.credential_id}</code></div>` : ''}
                  </div>
                  
                  ${cert.credential_url ? `
                    <a href="${cert.credential_url}" target="_blank" rel="noopener noreferrer" class="btn-icon-link" style="margin-top: 1rem; text-align: center; justify-content: center; font-size: 0.75rem; padding: 0.35rem 0.5rem;">
                      <i class="fas fa-shield-halved"></i> Verify Credential
                    </a>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>

      </div>
    </div>
  `;

  // Bind certificate thumbnail clicks to full screen preview modal
  const thumbnails = container.querySelectorAll('.cert-image-box');
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const src = thumb.getAttribute('data-img-src');
      const title = thumb.getAttribute('data-img-title');
      if (src) showCertPreviewModal(src, title);
    });
  });
}

function showCertPreviewModal(src, title) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.zIndex = '200';
  modal.innerHTML = `
    <div class="modal-card" style="max-width: 900px; background: transparent; border: none; box-shadow: none;">
      <div style="text-align: right; margin-bottom: 0.5rem;">
        <button id="cert-modal-close" style="font-size: 2rem; color: #fff; cursor: pointer; background: none; border: none;">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
      <img src="${src}" alt="${title}" style="max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: var(--radius-md); box-shadow: 0 10px 40px rgba(0,0,0,0.8); border: 1px solid hsl(var(--border-primary));">
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const close = () => {
    modal.remove();
    document.body.style.overflow = '';
  };

  modal.querySelector('#cert-modal-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}
