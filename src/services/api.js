import { supabase, isSupabaseConfigured } from '../config/supabase';
import fallbackData from '../config/fallback_data.json';

// Global cache object
let portfolioCache = null;
let connectionStatus = 'offline'; // 'connected' or 'offline'

export const getConnectionStatus = () => connectionStatus;

/**
 * Robust helper to fetch a table, returning null on failure instead of throwing
 */
async function fetchTable(tableName, queryBuilder) {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await queryBuilder;
    if (error) {
      console.warn(`[Supabase API] Error fetching table '${tableName}':`, error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`[Supabase API] Failed to fetch table '${tableName}':`, err);
    return null;
  }
}

/**
 * Loads all portfolio data in parallel. Integrates per-table fallbacks
 * so a single missing table or error doesn't break the entire dashboard.
 */
export async function getPortfolioData(forceRefresh = false) {
  if (portfolioCache && !forceRefresh) {
    return portfolioCache;
  }

  // 1. Initialize cache with fallback JSON as the baseline
  const data = JSON.parse(JSON.stringify(fallbackData));

  if (!isSupabaseConfigured) {
    console.info('[Supabase API] Supabase credentials not configured. Using mock fallback data.');
    connectionStatus = 'offline';
    portfolioCache = data;
    return data;
  }

  try {
    console.info('[Supabase API] Connecting to Supabase and fetching database tables...');
    
    // Execute all queries in parallel
    const [
      profileData,
      skillsData,
      projectsData,
      experienceData,
      educationData,
      certificationsData,
      learningsData,
      blogData
    ] = await Promise.all([
      fetchTable('profile', supabase.from('profile').select('*').limit(1).maybeSingle()),
      fetchTable('skills', supabase.from('skills').select('*').order('display_order', { ascending: true })),
      fetchTable('projects', supabase.from('projects').select('*').order('display_order', { ascending: true })),
      fetchTable('experience', supabase.from('experience').select('*').order('display_order', { ascending: true })),
      fetchTable('education', supabase.from('education').select('*').order('display_order', { ascending: true })),
      fetchTable('certifications', supabase.from('certifications').select('*').order('display_order', { ascending: true })),
      fetchTable('learnings', supabase.from('learnings').select('*').order('display_order', { ascending: true })),
      fetchTable('blog', supabase.from('blog').select('*').order('published_at', { ascending: false }))
    ]);

    // Track if any database read succeeded
    let hasLoadedFromSupabase = false;

    if (profileData) {
      data.profile = profileData;
      hasLoadedFromSupabase = true;
    }
    if (skillsData && skillsData.length > 0) {
      data.skills = skillsData;
      hasLoadedFromSupabase = true;
    }
    if (projectsData && projectsData.length > 0) {
      data.projects = projectsData;
      hasLoadedFromSupabase = true;
    }
    if (experienceData && experienceData.length > 0) {
      data.experience = experienceData;
      hasLoadedFromSupabase = true;
    }
    if (educationData && educationData.length > 0) {
      data.education = educationData;
      hasLoadedFromSupabase = true;
    }
    if (certificationsData && certificationsData.length > 0) {
      data.certifications = certificationsData;
      hasLoadedFromSupabase = true;
    }
    if (learningsData && learningsData.length > 0) {
      data.learnings = learningsData;
      hasLoadedFromSupabase = true;
    }
    if (blogData && blogData.length > 0) {
      data.blog = blogData;
      hasLoadedFromSupabase = true;
    }

    connectionStatus = hasLoadedFromSupabase ? 'connected' : 'offline';
    console.info(`[Supabase API] Finished fetching. Connection status: ${connectionStatus}`);

  } catch (error) {
    console.error('[Supabase API] Failed parallel table fetch operations. Using fallback caches.', error);
    connectionStatus = 'offline';
  }

  portfolioCache = data;
  return data;
}

/**
 * Submits contact form data to Supabase contact_submissions table,
 * falling back to local storage cache if database is offline.
 */
export async function submitContactForm(name, email, message) {
  const payload = { name, email, message, created_at: new Date().toISOString() };
  
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('contact_submissions').insert([payload]);
      if (!error) {
        return { success: true, message: 'Message sent successfully to database!' };
      }
      console.warn('[Supabase API] Submissions table write failed. Storing in local cache:', error.message);
    } catch (err) {
      console.warn('[Supabase API] Error writing contact form submission. Storing in local cache:', err);
    }
  }

  // Fallback to saving in localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
    existing.push(payload);
    localStorage.setItem('contact_submissions', JSON.stringify(existing));
    return { success: true, message: 'Saved successfully to offline local storage cache!' };
  } catch (e) {
    return { success: false, message: 'Failed to cache message. Please try again.' };
  }
}
