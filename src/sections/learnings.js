export function renderLearnings(container, data) {
  if (!container || !data) return;

  const learnings = data.learnings || [];

  if (learnings.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: hsl(var(--text-muted)); font-family: var(--font-mono); font-size: 0.9rem;">
        No learnings entries recorded. Add them using the CMS panel.
      </div>
    `;
    return;
  }

  // Sort learnings by year descending, then order
  const sorted = [...learnings].sort((a, b) => {
    const yrA = a.learned_year || 0;
    const yrB = b.learned_year || 0;
    if (yrB !== yrA) return yrB - yrA;
    return (a.display_order || 0) - (b.display_order || 0);
  });

  // Group by year
  const groupedByYear = {};
  sorted.forEach(l => {
    const yr = l.learned_year || 'Ongoing';
    if (!groupedByYear[yr]) groupedByYear[yr] = [];
    groupedByYear[yr].push(l);
  });

  container.innerHTML = `
    <div class="reveal reveal-active">
      <h2 class="section-title" style="margin-bottom: 2rem;">
        <i class="fas fa-brain" style="color: hsl(var(--accent-cyan)); margin-right: 0.5rem;"></i>
        Continuous Education & Core Learnings
      </h2>
      
      <div class="timeline">
        ${Object.entries(groupedByYear).map(([year, list]) => `
          <div class="timeline-item">
            <span class="timeline-dot" style="border-color: hsl(var(--accent-cyan)); box-shadow: 0 0 8px hsl(var(--accent-cyan));"></span>
            
            <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 700; color: hsl(var(--accent-cyan)); margin-bottom: 0.75rem;">
              [ ${year} ]
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${list.map(item => `
                <div class="timeline-card">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; flex-wrap: wrap;">
                    <h3 class="timeline-title">${item.title}</h3>
                    ${item.source ? `<span class="timeline-source">${item.source}</span>` : ''}
                  </div>
                  <p class="timeline-desc" style="margin-top: 0.5rem;">${item.description}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
