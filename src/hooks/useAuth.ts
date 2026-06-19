import { createSignal, createEffect, onCleanup } from 'solid-js';
import { sb } from '@/lib/supabase';
import type { Profile, CurrentUser } from '@/lib/supabase';

interface AuthState {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = createSignal<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const [profiles, setProfiles] = createSignal<Profile[]>([]);

  async function loadProfile(uid: string): Promise<Profile | null> {
    const { data, error } = await sb.from('profiles').select('*').eq('id', uid).single();
    if (error) {
      console.error('loadProfile error:', error);
      return null;
    }
    return data;
  }

  async function loadAllProfiles(): Promise<void> {
    const { data, error } = await sb.from('profiles').select('*').order('nome');
    if (!error && data) {
      setProfiles(data);
    } else if (error) {
      console.error('loadAllProfiles error:', error);
    }
  }

  async function checkSession(): Promise<void> {
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        if (profile) {
          setState({ user: { id: session.user.id, ...profile }, loading: false, error: null });
          await loadAllProfiles();
          return;
        }
      }
    } catch (e) {
      console.error('checkSession error:', e);
    }
    setState({ user: null, loading: false, error: null });
  }

  async function login(email: string, senha: string): Promise<{ success: boolean; error?: string }> {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { data, error } = await sb.auth.signInWithPassword({ email, senha });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message || 'Login ou senha incorretos.' }));
      return { success: false, error: error.message };
    }

    const profile = await loadProfile(data.user.id);
    if (!profile) {
      await sb.auth.signOut();
      setState({ user: null, loading: false, error: 'Perfil não encontrado. Contate o administrador.' });
      return { success: false, error: 'Perfil não encontrado.' };
    }

    setState({ user: { id: data.user.id, ...profile }, loading: false, error: null });
    await loadAllProfiles();
    return { success: true };
  }

  async function logout(): Promise<void> {
    await sb.auth.signOut();
    setState({ user: null, loading: false, error: null });
  }

  createEffect(() => {
    checkSession();

    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await loadProfile(session.user.id);
        if (profile) {
          setState({ user: { id: session.user.id, ...profile }, loading: false, error: null });
          await loadAllProfiles();
        }
      } else if (event === 'SIGNED_OUT') {
        setState({ user: null, loading: false, error: null });
      }
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return {
    get user() { return state().user; },
    get loading() { return state().loading; },
    get error() { return state().error; },
    get profiles() { return profiles(); },
    login,
    logout,
    refreshProfiles: loadAllProfiles,
  };
}