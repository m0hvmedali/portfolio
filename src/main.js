// Main entry point for Simple Single-Page Portfolio SPA
import { initTheme } from './services/theme';
import { getPortfolioData } from './services/api';
import { updateSEO } from './utils/seo';
import { observeScrollAnimations } from './utils/animations';

// Import UI components
import { renderHeader } from './components/header';
import { showAdminModal } from './components/admin';

// Import Views / Sections
import { renderHero } from './sections/hero';
import { renderExplorer } from './sections/explorer';
import { renderStack } from './sections/stack';
import { renderExperience } from './sections/experience';
import { renderEducation } from './sections/education';
import { renderLearnings } from './sections/learnings';
import { renderBlog } from './sections/blog';
import { renderContact } from './sections/contact';

// App state store
let portfolioData = null;

async function initializeApp() {
  // 1. Setup Theme Manager
  initTheme();

  // 2. Fetch API Data (Parallel Supabase fetch with cached fallbacks)
  const rootViewport = document.getElementById('projects');
  try {
    portfolioData = await getPortfolioData();
  } catch (err) {
    console.error('Core OS initialization crash:', err);
    if (rootViewport) {
      rootViewport.innerHTML = `
        <div class="flex-center" style="height: 100vh; flex-direction: column; gap: 1rem; color: hsl(var(--accent-yellow)); font-family: var(--font-mono);">
          <i class="fas fa-triangle-exclamation" style="font-size: 2.5rem;"></i>
          <span>OS SHELL RUNTIME FAILURE. LOAD ATTEMPT BLOCKED.</span>
        </div>
      `;
    }
    return;
  }

  // 3. Dynamic SEO and metadata injection
  updateSEO(portfolioData.profile);

  // 4. Mount Header Status Bar
  const headerMount = document.getElementById('os-header-mount');
  if (headerMount) {
    renderHeader(headerMount);
  }

  // 5. Render All Sections in Parallel on the Single Page
  renderAllSections();

  // 6. Setup Sticky Navigation Scroll highlight coordinates
  initStickyNavigation();

  // 7. Setup Admin Panel Modal trigger in footer
  initAdminTrigger();

  // 8. Populate Footer static details dynamically
  updateFooterDetails();

  // 9. Initial scroll observations trigger
  setTimeout(observeScrollAnimations, 200);
}

/**
 * Renders all page sections sequentially down the scroll column
 */
function renderAllSections() {
  renderHero(document.getElementById('hero-mount'), portfolioData);
  renderExplorer(document.getElementById('projects'), portfolioData);
  renderStack(document.getElementById('skills'), portfolioData);
  renderExperience(document.getElementById('experience'), portfolioData);
  renderEducation(document.getElementById('education'), portfolioData);
  renderLearnings(document.getElementById('learnings'), portfolioData);
  renderBlog(document.getElementById('blog'), portfolioData);
  renderContact(document.getElementById('contact'), portfolioData);
}

/**
 * Updates footer values based on retrieved profile details
 */
function updateFooterDetails() {
  const yearEl = document.getElementById('footer-year');
  const nameEl = document.getElementById('footer-name');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  if (nameEl && portfolioData.profile) nameEl.textContent = portfolioData.profile.name;
}

/**
 * Smoothly scrolls to targeted section on nav link click,
 * and tracks scroll view intersections to highlight active tags.
 */
function initStickyNavigation() {
  const navLinks = document.querySelectorAll('.sticky-nav-link');
  const sections = document.querySelectorAll('section');

  // Handle smooth scroll clicks
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const offset = 100; // Sticks offset height to compensate for header + nav bar
        const elementPosition = targetSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Track intersections to highlight matching navbar link
  const observerOptions = {
    root: null,
    rootMargin: '-120px 0px -40% 0px', // Compensate for sticky headers
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}

/**
 * Binds CMS admin panel launch click triggers
 */
function initAdminTrigger() {
  const btn = document.getElementById('admin-trigger-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      showAdminModal(handleCMSDataUpdate);
    });
  }
}

/**
 * Refreshes dataset on CMS updates and dynamically re-renders lists
 */
async function handleCMSDataUpdate() {
  // Re-fetch database elements
  portfolioData = await getPortfolioData(true);
  
  // Re-run renders for dynamic sections
  updateSEO(portfolioData.profile);
  updateFooterDetails();
  
  renderAllSections();
  
  // Trigger animation observers for any newly added items
  observeScrollAnimations();
}

// Bootstrap application on DOM load
window.addEventListener('DOMContentLoaded', initializeApp);
