/**
 * Lightweight Intersection Observer helper for scroll animations.
 * Finds all elements with the 'reveal' class and animates them in
 * once they enter the visible viewport.
 */
export function observeScrollAnimations() {
  const options = {
    root: null, // relative to document viewport
    rootMargin: '0px 0px -50px 0px', // triggers slightly before elements enter full view
    threshold: 0.1 // triggers when 10% of element is visible
  };

  const observer = new IntersectionObserver((entries, self) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        self.unobserve(entry.target); // Stop observing once animated in
      }
    });
  }, options);

  // Search document for any target animations
  const elements = document.querySelectorAll('.reveal');
  elements.forEach(el => observer.observe(el));
}
