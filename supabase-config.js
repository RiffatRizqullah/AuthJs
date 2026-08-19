// ===== Supabase Client Configuration =====
// Replace these values with your Supabase project credentials.
// Get them from: https://supabase.com/dashboard → Project Settings → API

const SUPABASE_URL = 'https://aldmjtxzeqegrghnrsnl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gUjF088zQEtl46vu2NqfAA_FiiQm1Uf';

// Lazy-initialized client — only created when actually needed
let _client = null;

function getSupabaseClient() {
  if (_client) return _client;

  if (typeof supabase === 'undefined') {
    console.warn('[supabase.js] Supabase JS library not loaded. Using localStorage fallback.');
    return null;
  }

  _client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _client;
}

function isSupabaseConfigured() {
  return SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co' && SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY';
}
