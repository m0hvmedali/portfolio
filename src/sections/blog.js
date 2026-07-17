import { formatDate } from '../utils/date';

export function renderBlog(container, data) {
  if (!container || !data) return;

  const posts = data.blog || [];

  if (posts.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: hsl(var(--text-muted)); font-family: var(--font-mono); font-size: 0.9rem;">
        No blog entries found. Create one using the database.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="reveal reveal-active">
      <h2 class="section-title" style="margin-bottom: 2rem;">
        <i class="fas fa-book-bookmark" style="color: hsl(var(--accent-violet)); margin-right: 0.5rem;"></i>
        Logs, Research & Technical Notes
      </h2>
      
      <div class="blog-grid">
        ${posts.map(post => `
          <article class="glow-card blog-card">
            <img src="${post.cover_image || '/assets/project_mockup.png'}" alt="${post.title} cover" class="blog-image" loading="lazy">
            <div class="blog-content">
              <div class="blog-meta-row">
                <span>${formatDate(post.published_at)}</span>
                <span style="color: hsl(var(--accent-cyan));">${post.tags && post.tags.length > 0 ? post.tags[0] : 'General'}</span>
              </div>
              <h3 class="blog-title">${post.title}</h3>
              <p class="blog-summary">${post.summary}</p>
              
              <button class="blog-read-more" data-slug="${post.slug}" aria-label="Read complete note ${post.title}">
                Access Log <i class="fas fa-chevron-right" style="font-size: 0.75rem;"></i>
              </button>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;

  // Bind article clicks to show overlay modal
  const readButtons = container.querySelectorAll('.blog-read-more');
  readButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-slug');
      const post = posts.find(p => p.slug === slug);
      if (post) {
        showArticleModal(post);
      }
    });
  });
}

function showArticleModal(post) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'blog-modal';
  
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 style="font-size: 1.25rem; font-weight: 700;">System Log Reader</h3>
        <button class="modal-close-btn" id="modal-close" aria-label="Close Note Modal">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
      <div class="modal-body">
        <img src="${post.cover_image || '/assets/project_mockup.png'}" alt="" class="modal-cover">
        
        <h2 style="font-size: 2rem; margin-bottom: 0.5rem; line-height: 1.2;">${post.title}</h2>
        
        <div class="modal-meta">
          <div><i class="far fa-calendar-days"></i> ${formatDate(post.published_at)}</div>
          <div><i class="fas fa-tags"></i> ${post.tags ? post.tags.join(', ') : 'General'}</div>
        </div>
        
        <hr style="border: 0; border-top: 1px solid hsl(var(--border-primary)); margin: 1.5rem 0;">
        
        <div class="modal-content">
          ${compileMarkdown(post.content)}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden'; // Lock background scrolling

  // Event handlers to close modal
  const closeModal = () => {
    modal.remove();
    document.body.style.overflow = '';
    window.removeEventListener('keydown', handleEsc);
  };

  const handleEsc = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  modal.querySelector('#modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', handleEsc);
}

/**
 * Super lightweight markdown-to-HTML parser/compiler.
 */
function compileMarkdown(md) {
  if (!md) return '';
  
  // Clean inputs
  let html = md.trim();
  
  // Replace Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Replace Code blocks (e.g. ```css ... ```)
  html = html.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
  });
  
  // Replace Inline code tags `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Replace bold & italics text
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Handle lists (bullets)
  html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li>$1</li>');
  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  
  // Replace paragraph double breaks
  html = html.split(/\n\n+/).map(p => {
    if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<ul') || p.startsWith('<li>')) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');
  
  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
