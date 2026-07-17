import { formatPeriod } from '../utils/date';

export function renderExperience(container, data) {
  if (!container || !data) return;

  const experiences = data.experience || [];

  if (experiences.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: hsl(var(--text-muted)); font-family: var(--font-mono); font-size: 0.9rem;">
        No experience entries recorded. Add them using the CMS panel.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="reveal reveal-active">
      <h2 class="section-title" style="margin-bottom: 2rem;">
        <i class="fas fa-briefcase" style="color: hsl(var(--accent-violet)); margin-right: 0.5rem;"></i>
        Professional Milestones & Engagements
      </h2>
      
      <div class="timeline">
        ${experiences.map(exp => `
          <div class="timeline-item">
            <span class="timeline-dot"></span>
            <div class="timeline-card">
              <div class="timeline-meta">
                <div>
                  <h3 class="timeline-title">${exp.role}</h3>
                  <span class="timeline-subtitle">${exp.company}</span>
                  ${exp.location ? `<span style="font-size: 0.75rem; color: hsl(var(--text-muted)); margin-left: 0.5rem;"><i class="fas fa-map-marker-alt"></i> ${exp.location}</span>` : ''}
                </div>
                <div>
                  <span class="timeline-date">${formatPeriod(exp.start_date, exp.end_date, exp.is_current)}</span>
                  <div style="text-align: right; margin-top: 0.25rem;">
                    <span class="timeline-source" style="background: hsla(var(--accent-cyan), 0.1); color: hsl(var(--accent-cyan));">${exp.type}</span>
                  </div>
                </div>
              </div>
              
              <p class="timeline-desc">${exp.description}</p>
              
              ${exp.technologies && exp.technologies.length > 0 ? `
                <div class="tag-container" style="margin-top: 1rem;">
                  ${exp.technologies.map(tech => `<span class="tech-tag" style="font-size: 0.7rem;">${tech}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
