import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });

    // Cliente admin com service_role
    const adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verificar sessão do chamador
    const userClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return res.status(401).json({ error: 'Sessão inválida' });

    // Verificar role gerencia
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'gerencia') {
      return res.status(403).json({ error: 'Acesso negado. Apenas gerência pode criar usuários.' });
    }

    const { email, password, nome, login, role, cor } = req.body;
    if (!email || !password || !nome || !login || !role) {
      return res.status(400).json({ error: 'Campos obrigatórios: email, password, nome, login, role' });
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome, login, role, cor: cor || '#5B6EFF' },
    });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ user: data.user });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
};
