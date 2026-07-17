/**
 * Dynamically updates document SEO, OpenGraph properties, 
 * and injects Structured Data JSON-LD for rich snippets.
 */
export function updateSEO(profile) {
  if (!profile) return;

  const titleText = `${profile.name} | ${profile.title}`;
  const descText = profile.bio || 'Personal Operating System and Portfolio Page.';
  const currentUrl = window.location.href;
  const imageUrl = profile.avatar_url ? new URL(profile.avatar_url, window.location.origin).href : '';

  // 1. Page Title
  document.title = titleText;

  // 2. Helper to set/update meta tag
  const setMeta = (nameAttr, valueAttr, content) => {
    let el = document.querySelector(`meta[${nameAttr}="${valueAttr}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(nameAttr, valueAttr);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard Meta
  setMeta('name', 'description', descText);

  // OpenGraph Meta
  setMeta('property', 'og:title', titleText);
  setMeta('property', 'og:description', descText);
  setMeta('property', 'og:type', 'profile');
  setMeta('property', 'og:url', currentUrl);
  if (imageUrl) {
    setMeta('property', 'og:image', imageUrl);
  }

  // Twitter Card Meta
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', titleText);
  setMeta('name', 'twitter:description', descText);
  if (imageUrl) {
    setMeta('name', 'twitter:image', imageUrl);
  }

  // 3. Inject Schema JSON-LD Structured Data
  let schemaScript = document.getElementById('seo-json-ld');
  if (schemaScript) {
    schemaScript.remove();
  }

  schemaScript = document.createElement('script');
  schemaScript.id = 'seo-json-ld';
  schemaScript.type = 'application/ld+json';

  const socialLinks = [
    profile.github_url,
    profile.linkedin_url,
    profile.x_url,
    profile.website_url
  ].filter(link => link && link.trim() !== '' && link !== '#');

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': profile.name,
    'jobTitle': profile.title,
    'description': profile.bio,
    'email': profile.email || undefined,
    'address': profile.location ? {
      '@type': 'PostalAddress',
      'addressLocality': profile.location
    } : undefined,
    'url': currentUrl,
    'image': imageUrl || undefined,
    'sameAs': socialLinks
  };

  schemaScript.text = JSON.stringify(personSchema, null, 2);
  document.head.appendChild(schemaScript);
}
