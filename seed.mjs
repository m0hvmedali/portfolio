/**
 * Supabase Seed Script
 * Run: node seed.mjs
 * Uploads all data from fallback_data.json into your Supabase project.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ── Credentials ──────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://pawwqdaiucbvohsgmtop.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhd3dxZGFpdWNidm9oc2dtdG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTQ5MDgsImV4cCI6MjA3ODc5MDkwOH0.EuNNd8Cj9TBxJvmPARhhR1J1KPwoS3X46msX-MhriRk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Load local data ───────────────────────────────────────────────────────────
const raw = readFileSync('./src/config/fallback_data.json', 'utf-8');
const data = JSON.parse(raw);

// ── Helpers ───────────────────────────────────────────────────────────────────
async function upsert(table, rows, conflictColumn = 'id') {
  if (!rows || rows.length === 0) {
    console.log(`  ⚠  ${table}: no rows to insert, skipping.`);
    return;
  }
  const { error } = await supabase.from(table).upsert(rows, {
    onConflict: conflictColumn,
    ignoreDuplicates: false,
  });
  if (error) {
    console.error(`  ✗  ${table}: ${error.message}`);
  } else {
    console.log(`  ✓  ${table}: ${rows.length} row(s) inserted/updated.`);
  }
}

// ── Seed Functions ────────────────────────────────────────────────────────────

async function seedProfile() {
  console.log('\n[1/8] Seeding profile...');
  const p = data.profile;
  const row = {
    name:          p.name,
    title:         p.title,
    bio:           p.bio,
    avatar_url:    p.avatar_url,
    email:         p.email,
    github_url:    p.github_url,
    whatsapp_url:  p.whatsapp_url  ?? null,
    linkedin_url:  p.linkedin_url  ?? null,
    x_url:         p.x_url         ?? null,
    website_url:   p.website_url   ?? null,
    resume_url:    p.resume_url    ?? null,
    location:      p.location,
    status:        p.status,
  };

  // Try insert first; if conflict on id, upsert won't help without an id.
  // So we do a delete-then-insert pattern for the single profile row.
  await supabase.from('profile').delete().not('id', 'is', null); // wipe existing
  const { error } = await supabase.from('profile').insert([row]);
  if (error) {
    console.error('  ✗  profile:', error.message);
  } else {
    console.log('  ✓  profile: 1 row inserted.');
  }
}

async function seedSkills() {
  console.log('\n[2/8] Seeding skills...');
  const rows = data.skills.map((s, i) => ({
    name:                s.name,
    group_name:          s.group_name,
    proficiency:         s.proficiency,
    color:               s.color,
    icon:                s.icon,
    years_of_experience: s.years_of_experience,
    display_order:       i,
  }));
  // Wipe then insert (no natural conflict key)
  await supabase.from('skills').delete().not('id', 'is', null);
  const { error } = await supabase.from('skills').insert(rows);
  if (error) console.error('  ✗  skills:', error.message);
  else       console.log(`  ✓  skills: ${rows.length} row(s) inserted.`);
}

async function seedProjects() {
  console.log('\n[3/8] Seeding projects...');
  if (!data.projects || data.projects.length === 0) {
    console.log('  ⚠  projects: empty, skipping.');
    return;
  }
  const rows = data.projects.map((p, i) => ({
    title:             p.title,
    slug:              p.slug,
    short_description: p.short_description,
    full_description:  p.full_description,
    cover_image:       p.cover_image,
    gallery:           p.gallery      ?? [],
    status:            p.status,
    featured:          p.featured     ?? false,
    github_url:        p.github_url   ?? null,
    live_url:          p.live_url     ?? null,
    technologies:      p.technologies ?? [],
    year:              p.year,
    display_order:     i,
  }));
  await supabase.from('projects').delete().not('id', 'is', null);
  const { error } = await supabase.from('projects').insert(rows);
  if (error) console.error('  ✗  projects:', error.message);
  else       console.log(`  ✓  projects: ${rows.length} row(s) inserted.`);
}

async function seedExperience() {
  console.log('\n[4/8] Seeding experience...');
  if (!data.experience || data.experience.length === 0) {
    console.log('  ⚠  experience: empty, skipping.');
    return;
  }
  const rows = data.experience.map((e, i) => ({
    company:       e.company,
    role:          e.role,
    description:   e.description,
    start_date:    e.start_date,
    end_date:      e.end_date       ?? null,
    is_current:    e.is_current     ?? false,
    type:          e.type           ?? null,
    technologies:  e.technologies   ?? [],
    location:      e.location       ?? null,
    display_order: i,
  }));
  await supabase.from('experience').delete().not('id', 'is', null);
  const { error } = await supabase.from('experience').insert(rows);
  if (error) console.error('  ✗  experience:', error.message);
  else       console.log(`  ✓  experience: ${rows.length} row(s) inserted.`);
}

async function seedEducation() {
  console.log('\n[5/8] Seeding education...');
  if (!data.education || data.education.length === 0) {
    console.log('  ⚠  education: empty, skipping.');
    return;
  }
  const rows = data.education.map((e, i) => ({
    institution:    e.institution,
    degree:         e.degree,
    field_of_study: e.field_of_study,
    start_date:     e.start_date,
    end_date:       e.end_date      ?? null,
    is_current:     e.is_current    ?? false,
    gpa:            e.gpa           ?? null,
    description:    e.description   ?? null,
    display_order:  i,
  }));
  await supabase.from('education').delete().not('id', 'is', null);
  const { error } = await supabase.from('education').insert(rows);
  if (error) console.error('  ✗  education:', error.message);
  else       console.log(`  ✓  education: ${rows.length} row(s) inserted.`);
}

async function seedCertifications() {
  console.log('\n[6/8] Seeding certifications...');
  if (!data.certifications || data.certifications.length === 0) {
    console.log('  ⚠  certifications: empty, skipping.');
    return;
  }
  const rows = data.certifications.map((c, i) => ({
    title:          c.title,
    issuer:         c.issuer,
    issue_date:     c.issue_date,
    expires_at:     c.expires_at    ?? null,
    credential_id:  c.credential_id ?? null,
    credential_url: c.credential_url ?? null,
    image_url:      c.image_url     ?? null,
    display_order:  i,
  }));
  await supabase.from('certifications').delete().not('id', 'is', null);
  const { error } = await supabase.from('certifications').insert(rows);
  if (error) console.error('  ✗  certifications:', error.message);
  else       console.log(`  ✓  certifications: ${rows.length} row(s) inserted.`);
}

async function seedLearnings() {
  console.log('\n[7/8] Seeding learnings...');
  if (!data.learnings || data.learnings.length === 0) {
    console.log('  ⚠  learnings: empty, skipping.');
    return;
  }
  const rows = data.learnings.map((l, i) => ({
    title:         l.title,
    description:   l.description,
    source:        l.source        ?? null,
    learned_year:  l.learned_year  ?? null,
    display_order: i,
  }));
  await supabase.from('learnings').delete().not('id', 'is', null);
  const { error } = await supabase.from('learnings').insert(rows);
  if (error) console.error('  ✗  learnings:', error.message);
  else       console.log(`  ✓  learnings: ${rows.length} row(s) inserted.`);
}

async function seedBlog() {
  console.log('\n[8/8] Seeding blog...');
  if (!data.blog || data.blog.length === 0) {
    console.log('  ⚠  blog: empty, skipping.');
    return;
  }
  const rows = data.blog.map((b) => ({
    title:        b.title,
    slug:         b.slug,
    summary:      b.summary,
    content:      b.content       ?? null,
    cover_image:  b.cover_image   ?? null,
    tags:         b.tags          ?? [],
    published_at: b.published_at  ?? new Date().toISOString(),
  }));
  await supabase.from('blog').delete().not('id', 'is', null);
  const { error } = await supabase.from('blog').insert(rows);
  if (error) console.error('  ✗  blog:', error.message);
  else       console.log(`  ✓  blog: ${rows.length} row(s) inserted.`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('   Supabase Portfolio Seed Script');
  console.log('═══════════════════════════════════════════');
  console.log(`  Project: ${SUPABASE_URL}`);

  await seedProfile();
  await seedSkills();
  await seedProjects();
  await seedExperience();
  await seedEducation();
  await seedCertifications();
  await seedLearnings();
  await seedBlog();

  console.log('\n═══════════════════════════════════════════');
  console.log('   ✅  Seed complete! Check your Supabase dashboard.');
  console.log('═══════════════════════════════════════════\n');
}

main().catch(console.error);
