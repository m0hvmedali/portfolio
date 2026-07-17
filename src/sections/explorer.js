export function renderExplorer(container, data) {
  if (!container || !data) return;

  const allProjects = data.projects || [];
  
  // Find featured project
  const featuredProject = allProjects.find(p => p.featured);
  const gridProjects = allProjects.filter(p => p.slug !== (featuredProject ? featuredProject.slug : null));

  // Extract all unique technology tags for filtering
  const allTechs = new Set();
  allProjects.forEach(p => {
    if (p.technologies) {
      p.technologies.forEach(t => allTechs.add(t));
    }
  });
  
  // Choose top 5 technologies to show as quick filters
  const quickFilters = Array.from(allTechs).slice(0, 5);

  container.innerHTML = `
    <div class="reveal reveal-active">
      <h2 class="section-title" style="margin-bottom: 2rem;">
        <i class="fas fa-folder-open" style="color: hsl(var(--accent-cyan)); margin-right: 0.5rem;"></i>
        Project Repository Explorer
      </h2>

      

      <!-- 2. SEARCH & FILTER CONTROLS -->
      <div class="explorer-controls">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input type="text" id="project-search" class="search-input" placeholder="Search files, directories, stacks..." aria-label="Search Projects">
        </div>
        
        <div class="filter-tags" id="project-filters">
          <button class="filter-btn active" data-filter="all">All Items</button>
          ${quickFilters.map(tech => `
            <button class="filter-btn" data-filter="${tech}">${tech}</button>
          `).join('')}
        </div>
      </div>

      <!-- 3. PROJECT GRID -->
      <div class="projects-grid" id="explorer-grid">
        <!-- Project cards injected dynamically -->
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#project-search');
  const filtersContainer = container.querySelector('#project-filters');
  const gridContainer = container.querySelector('#explorer-grid');

  // Initial render of grid projects
  renderProjectCards(gridProjects, gridContainer);

  // Search Input listener
  let activeFilter = 'all';
  
  const handleFilterSearchChange = () => {
    const query = searchInput.value.toLowerCase().trim();
    
    const filtered = gridProjects.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(query) || 
        p.short_description.toLowerCase().includes(query) ||
        (p.technologies && p.technologies.some(t => t.toLowerCase().includes(query)));
        
      const matchesFilter = 
        activeFilter === 'all' || 
        (p.technologies && p.technologies.includes(activeFilter));
        
      return matchesSearch && matchesFilter;
    });
    
    renderProjectCards(filtered, gridContainer);
  };

  searchInput.addEventListener('input', handleFilterSearchChange);

  // Filter Buttons listener
  const filterBtns = filtersContainer.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      handleFilterSearchChange();
    });
  });
}

function renderProjectCards(projects, targetContainer) {
  if (projects.length === 0) {
    targetContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: hsl(var(--bg-secondary)); border: 1px dashed hsl(var(--border-primary)); border-radius: var(--radius-md); color: hsl(var(--text-muted)); font-family: var(--font-mono); font-size: 0.85rem;">
        NO FILES MATCHED SEARCH CRITERIA
      </div>
    `;
    return;
  }

  targetContainer.innerHTML = projects.map(p => `
    <article class="glow-card project-card">
      <div class="project-image-box">
        <img src="${p.cover_image || '/assets/project_mockup.png'}" alt="${p.title} preview" class="project-image" loading="lazy">
      </div>
      <div class="project-card-body">
        <div>
          <div class="project-title-row">
            <h4 class="project-title">${p.title}</h4>
            <span class="project-year">${p.year || ''}</span>
          </div>
          <p class="project-desc" style="margin-top: 0.5rem;">${p.short_description}</p>
        </div>
        
        <div>
          <div class="tag-container" style="margin-bottom: 1rem;">
            ${p.technologies ? p.technologies.map(t => `<span class="tech-tag" style="font-size: 0.7rem; padding: 0.1rem 0.35rem;">${t}</span>`).join('') : ''}
          </div>
          
          <div class="project-footer">
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: hsl(var(--text-muted))">
              STATUS: ${p.status}
            </span>
            <div class="project-links">
              ${p.github_url ? `
                <a href="${p.github_url}" target="_blank" rel="noopener noreferrer" class="project-link-icon" title="View Source Code" aria-label="GitHub Repository">
                  <i class="fab fa-github"></i>
                </a>
              ` : ''}
              ${p.live_url ? `
                <a href="${p.live_url}" target="_blank" rel="noopener noreferrer" class="project-link-icon" title="Open Application Link" aria-label="Live Demo Website">
                  <i class="fas fa-external-link-alt"></i>
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}
