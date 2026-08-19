// ===== Auth Abstraction Layer =====
// Switches between localStorage (demo) and Supabase (production) automatically.
// All auth operations go through this module.

const Auth = {

  // ── Current User ──────────────────────────────────────────────
  async getCurrentUser() {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (!client) return null;
      const { data: { user }, error } = await client.auth.getUser();
      if (error || !user) return null;
      return {
        id: user.id,
        name: user.user_metadata?.name || user.email.split('@')[0],
        email: user.email,
      };
    }

    // localStorage fallback
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  },

  // ── Sign Up ───────────────────────────────────────────────────
  async signUp({ name, email, password }) {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw new Error(error.message);
      return { user: { name, email } };
    }

    // localStorage fallback
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
      throw new Error('An account with this email already exists.');
    }
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    const user = { name, email };
    localStorage.setItem('currentUser', JSON.stringify(user));
    ActivityStore.add('Account created', 'green');
    return { user };
  },

  // ── Sign In ───────────────────────────────────────────────────
  async signIn({ email, password }) {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw new Error('Invalid email or password.');
      return {
        user: {
          name: data.user.user_metadata?.name || email.split('@')[0],
          email: data.user.email,
        },
      };
    }

    // localStorage fallback
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password.');
    const session = { name: user.name, email: user.email };
    localStorage.setItem('currentUser', JSON.stringify(session));
    ActivityStore.add('Signed in', '');
    return { user: session };
  },

  // ── Sign Out ──────────────────────────────────────────────────
  async signOut() {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      await client.auth.signOut();
      return;
    }

    ActivityStore.add('Signed out', 'red');
    localStorage.removeItem('currentUser');
  },

  // ── Listen for auth changes (Supabase only) ──────────────────
  onAuthStateChange(callback) {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (!client) return () => {};
      const { data: { subscription } } = client.auth.onAuthStateChange(callback);
      return () => subscription.unsubscribe();
    }
    return () => {};
  },
};

// ===== Activity Store (localStorage only, demo feature) =====
const ActivityStore = {
  _key: 'activities',

  getAll() {
    return JSON.parse(localStorage.getItem(this._key) || '[]');
  },

  add(text, color) {
    const acts = this.getAll();
    acts.unshift({ text, color: color || '', time: 'Just now' });
    if (acts.length > 20) acts.pop();
    localStorage.setItem(this._key, JSON.stringify(acts));
  },

  clear() {
    localStorage.removeItem(this._key);
  },
};
