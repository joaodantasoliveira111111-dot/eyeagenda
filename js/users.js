// Chama as Vercel Serverless Functions em /api/
async function callEdgeFn(path, body) {
  const { data: { session } } = await sb.auth.getSession();
  const token = session?.access_token;
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro na função');
  return json;
}

function openUser(id) {
  if (id) {
    const u = (window._allProfiles || []).find(x => x.id === id);
    if (!u) return;
    document.getElementById('user-modal-title').textContent = 'Editar usuário';
    document.getElementById('u-id').value = u.id;
    document.getElementById('u-nome').value = u.nome;
    document.getElementById('u-login').value = u.login;
    document.getElementById('u-email').value = u.email || `${u.login}@eyeagenda.app`;
    document.getElementById('u-senha').value = '';
    document.getElementById('u-role').value = u.role;
    document.getElementById('u-cor').value = u.cor;
    // esconder campo email na edição (não pode mudar)
    document.getElementById('u-email-group').style.display = 'none';
  } else {
    document.getElementById('user-modal-title').textContent = 'Novo usuário';
    ['u-id', 'u-nome', 'u-login', 'u-senha', 'u-email'].forEach(i => document.getElementById(i).value = '');
    document.getElementById('u-role').value = 'vendedor';
    document.getElementById('u-cor').value = '#5B6EFF';
    document.getElementById('u-email-group').style.display = '';
  }
  document.getElementById('ov-user').classList.add('on');
}

function closeUser() { document.getElementById('ov-user').classList.remove('on'); }

async function saveUser() {
  const nome = document.getElementById('u-nome').value.trim();
  const login = document.getElementById('u-login').value.trim().toLowerCase().replace(/\s/g, '');
  const senha = document.getElementById('u-senha').value;
  const role = document.getElementById('u-role').value;
  const cor = document.getElementById('u-cor').value;
  const eid = document.getElementById('u-id').value;

  if (!nome || !login) { toast('Preencha nome e login', 'err'); return; }

  if (eid) {
    // Editar: atualizar profile
    const updateObj = { nome, login, role, cor };
    const { error } = await DB.profiles().update(updateObj).eq('id', eid);
    if (error) { toast('Erro ao atualizar: ' + error.message, 'err'); return; }

    // Atualizar senha via Edge Function se informada
    if (senha) {
      if (senha.length < 6) { toast('Senha mínimo 6 caracteres', 'err'); return; }
      try {
        await callEdgeFn('update-password', { user_id: eid, password: senha });
      } catch (e) {
        toast('Perfil atualizado, mas senha não alterada: ' + e.message, 'warn');
      }
    }
  } else {
    // Criar novo usuário
    if (!senha) { toast('Defina uma senha', 'err'); return; }
    if (senha.length < 6) { toast('Senha mínimo 6 caracteres', 'err'); return; }

    // Email: usa campo ou gera automático
    let emailInput = document.getElementById('u-email').value.trim();
    const email = emailInput || `${login}@eyeagenda.app`;

    try {
      await callEdgeFn('create-user', { email, password: senha, nome, login, role, cor });
    } catch (e) {
      toast('Erro ao criar usuário: ' + e.message, 'err');
      return;
    }
  }

  closeUser();
  toast(eid ? 'Usuário atualizado' : 'Usuário criado com sucesso!');
  await loadAllProfiles();
  renderUsers();
}

async function delUser(id) {
  if (!confirm('Excluir este usuário permanentemente?')) return;
  try {
    await callEdgeFn('delete-user', { user_id: id });
    toast('Usuário removido', 'warn');
  } catch (e) {
    // Tenta remover só o profile se a function falhar
    const { error } = await DB.profiles().delete().eq('id', id);
    if (error) { toast('Erro ao excluir: ' + error.message, 'err'); return; }
    toast('Usuário removido (apenas profile)', 'warn');
  }
  await loadAllProfiles();
  renderUsers();
}

async function renderUsers() {
  await loadAllProfiles();
  const users = window._allProfiles || [];
  const el = document.getElementById('v-users');
  el.innerHTML = `
    <div class="filters"><button class="btn-new" onclick="openUser()"><i class="ti ti-user-plus"></i>Novo usuário</button></div>
    <div class="sec-lbl">Usuários cadastrados<span>${users.length} no total</span></div>
    <div class="user-table">
      ${users.map(u => `
        <div class="user-row">
          <div class="ur-av" style="background:${u.cor}">${initials(u.nome)}</div>
          <div class="ur-info">
            <b>${u.nome}</b>
            <div class="ur-login">@${u.login} &middot; <span class="tag ${u.role === 'gerencia' ? 's-rl' : u.role === 'sdr' ? 's-cf' : 's-ag'}">${ROLE_LABELS[u.role]}</span></div>
          </div>
          <div class="ur-acts">
            ${u.id !== CU.id ? `<button class="btn-s" onclick="openUser('${u.id}')"><i class="ti ti-edit"></i>Editar</button>` : '<span style="font-size:11px;color:var(--txt3)">Você</span>'}
            ${u.id !== CU.id ? `<button class="btn-s d" onclick="delUser('${u.id}')"><i class="ti ti-trash"></i></button>` : ''}
          </div>
        </div>`).join('')}
    </div>`;
}

window.openUser = openUser; window.closeUser = closeUser;
window.saveUser = saveUser; window.delUser = delUser; window.renderUsers = renderUsers;
