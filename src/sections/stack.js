export function renderStack(container, data) {
  if (!container || !data) return;

  const skills = data.skills || [];

  if (skills.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: hsl(var(--text-muted)); font-family: var(--font-mono); font-size: 0.9rem;">
        No skill entries recorded. Add them using the CMS panel.
      </div>
    `;
    return;
  }

  // Group skills by group_name
  const groupedSkills = {};
  skills.forEach(s => {
    const group = s.group_name || 'General';
    if (!groupedSkills[group]) {
      groupedSkills[group] = [];
    }
    groupedSkills[group].push(s);
  });

  container.innerHTML = `
    <div class="reveal reveal-active">
      <h2 class="section-title" style="margin-bottom: 2rem;">
        <i class="fas fa-cubes" style="color: hsl(var(--accent-cyan)); margin-right: 0.5rem;"></i>
        Core Competencies & Technology Matrix
      </h2>
      
      <div class="skills-container">
        ${Object.entries(groupedSkills).map(([groupName, groupList]) => `
          <div class="skill-category-card glow-card">
            <h3 class="category-title">
              <i class="fas ${getGroupIcon(groupName)}" style="color: hsl(var(--accent-violet));"></i>
              ${groupName}
            </h3>
            
            <div class="skills-list">
              ${groupList.map(skill => {
                const accentColor = skill.color || 'hsl(var(--accent-cyan))';
                const yoeText = skill.years_of_experience 
                  ? `${skill.years_of_experience} yr${skill.years_of_experience > 1 ? 's' : ''}` 
                  : '';
                
                return `
                  <div class="skill-item">
                    <div class="skill-header">
                      <span class="skill-name">${skill.name}</span>
                      <span class="skill-experience">${yoeText}</span>
                    </div>
                    <div class="skill-bar-wrapper">
                      <div class="skill-bar-fill" 
                           style="width: 0%; background-color: ${accentColor}; box-shadow: 0 0 8px ${accentColor};" 
                           data-target-width="${skill.proficiency || 80}%">
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Animate skill bars width in on delay to look super premium
  setTimeout(() => {
    const fills = container.querySelectorAll('.skill-bar-fill');
    fills.forEach(fill => {
      const targetWidth = fill.getAttribute('data-target-width');
      fill.style.width = targetWidth;
    });
  }, 100);
}

function getGroupIcon(groupName) {
  const norm = groupName.toLowerCase();
  if (norm.includes('front')) return 'fa-laptop-code';
  if (norm.includes('back')) return 'fa-server';
  if (norm.includes('tool') || norm.includes('devops')) return 'fa-screwdriver-wrench';
  return 'fa-code';
}
