// Interactive Terminal CLI Component

const HELP_TEXT = `Available Commands:
  about       - Display biography profile
  projects    - List projects and links
  skills      - Show technical skills matrix
  learnings   - List recent topics studied
  neofetch    - Show system details & profile ASCII art
  contact     - Display contact options & socials
  clear       - Clear console logs
  help        - Show this menu`;

const ASCII_ART = `
   /\\_/\\
  ( o.o )  AlexMercerOS v1.0.0
   > ^ <   -------------------
`;

export function initTerminal(container, portfolioData) {
  if (!container) return;

  const sessionStartTime = Date.now();

  container.innerHTML = `
    <div class="terminal-window">
      <div class="terminal-header">
        <div class="terminal-buttons">
          <span class="t-btn t-close"></span>
          <span class="t-btn t-minimize"></span>
          <span class="t-btn t-maximize"></span>
        </div>
        <span class="terminal-title">guest@alexmercer.dev: ~</span>
        <div style="width: 36px;"></div> <!-- Spacer to match buttons balance -->
      </div>
      <div class="terminal-body" id="t-body">
        <div class="terminal-output" id="t-output">
          <div class="t-line t-muted">Type 'help' to view available system instructions.</div>
        </div>
        <div class="t-command-input">
          <span class="t-prompt">guest@alexmercer.dev:~$</span>
          <div class="t-input-wrapper">
            <input type="text" class="t-input-field" id="t-input" autofocus autocomplete="off" spellcheck="false" aria-label="Terminal Command Input">
            <span class="t-cursor" id="t-cursor"></span>
          </div>
        </div>
      </div>
    </div>
  `;

  const inputEl = container.querySelector('#t-input');
  const outputEl = container.querySelector('#t-output');
  const bodyEl = container.querySelector('#t-body');

  // Focus input on container click
  bodyEl.addEventListener('click', () => {
    inputEl.focus();
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const fullCmd = inputEl.value.trim();
      const cmd = fullCmd.toLowerCase().split(' ')[0];
      inputEl.value = '';

      if (fullCmd) {
        appendLine(`guest@alexmercer.dev:~$ ${fullCmd}`, 't-cyan');
        executeCommand(cmd, portfolioData, sessionStartTime, outputEl);
        bodyEl.scrollTop = bodyEl.scrollHeight;
      }
    }
  });
}

function appendLine(text, className = '', container = document.getElementById('t-output')) {
  if (!container) return;
  const line = document.createElement('div');
  line.className = `t-line ${className}`;
  line.textContent = text;
  container.appendChild(line);
}

function appendHtml(html, container = document.getElementById('t-output')) {
  if (!container) return;
  const block = document.createElement('div');
  block.className = 't-line';
  block.innerHTML = html;
  container.appendChild(block);
}

function executeCommand(cmd, data, sessionStartTime, outputEl) {
  switch (cmd) {
    case 'help':
      appendLine(HELP_TEXT);
      break;

    case 'clear':
      outputEl.innerHTML = '';
      break;

    case 'about':
      appendLine(data.profile.bio || 'No biography details loaded.');
      break;

    case 'projects':
      if (data.projects && data.projects.length > 0) {
        appendLine('--- Core Projects ---', 't-violet');
        data.projects.forEach(p => {
          let line = `• ${p.title} (${p.year || 'N/A'}) - ${p.short_description}`;
          if (p.live_url) line += ` | Live: ${p.live_url}`;
          if (p.github_url) line += ` | Code: ${p.github_url}`;
          appendLine(line);
        });
      } else {
        appendLine('No projects found in database.', 't-yellow');
      }
      break;

    case 'skills':
      if (data.skills && data.skills.length > 0) {
        appendLine('--- Technical Expertise ---', 't-violet');
        // Group skills by group_name
        const groups = {};
        data.skills.forEach(s => {
          if (!groups[s.group_name]) groups[s.group_name] = [];
          groups[s.group_name].push(`${s.name} (${s.proficiency}%)`);
        });
        Object.entries(groups).forEach(([name, skillsList]) => {
          appendLine(`[${name}]: ${skillsList.join(', ')}`);
        });
      } else {
        appendLine('No skills found in database.', 't-yellow');
      }
      break;

    case 'learnings':
      if (data.learnings && data.learnings.length > 0) {
        appendLine('--- What I\'ve Learned ---', 't-violet');
        data.learnings.forEach(l => {
          appendLine(`• [${l.source || 'Study'}] ${l.title} - ${l.description}`);
        });
      } else {
        appendLine('No learnings found in database.', 't-yellow');
      }
      break;

    case 'contact':
      appendLine('Contact channels available:', 't-violet');
      appendLine(`• Email: ${data.profile.email || 'N/A'}`);
      appendLine(`• Location: ${data.profile.location || 'N/A'}`);
      appendLine(`• GitHub: ${data.profile.github_url || 'N/A'}`);
      appendLine(`• LinkedIn: ${data.profile.linkedin_url || 'N/A'}`);
      appendLine(`• X/Twitter: ${data.profile.x_url || 'N/A'}`);
      break;

    case 'neofetch':
      const uptimeSec = Math.floor((Date.now() - sessionStartTime) / 1000);
      const uptimeStr = uptimeSec > 60 
        ? `${Math.floor(uptimeSec / 60)}m ${uptimeSec % 60}s`
        : `${uptimeSec}s`;

      const neofetchHtml = `
        <div style="display: flex; gap: 1.5rem; align-items: center; font-family: var(--font-mono)">
          <pre class="t-ascii" style="margin: 0">${ASCII_ART}</pre>
          <div style="font-size: 0.75rem;">
            <div class="t-cyan" style="font-weight: 700;">guest@${data.profile.name.toLowerCase().replace(/\s+/g, '')}</div>
            <div>------------------------</div>
            <div><span class="t-violet">OS:</span> PersonalOS v1.0.0 (Web)</div>
            <div><span class="t-violet">Host:</span> browser environment</div>
            <div><span class="t-violet">Uptime:</span> ${uptimeStr}</div>
            <div><span class="t-violet">Shell:</span> custom javascript-cli</div>
            <div><span class="t-violet">Resolution:</span> ${window.screen.width}x${window.screen.height}</div>
            <div><span class="t-violet">Status:</span> ${data.profile.status || 'Active'}</div>
          </div>
        </div>
      `;
      appendHtml(neofetchHtml);
      break;

    default:
      appendLine(`command not found: ${cmd}. Type 'help' to list commands.`, 't-yellow');
      break;
  }
}
