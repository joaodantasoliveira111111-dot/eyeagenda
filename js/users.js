function openUser(id){
  if(id){
    const u=(window._allProfiles||[]).find(x=>x.id===id);if(!u)return;
    document.getElementById('user-modal-title').textContent='Editar usuário';
    document.getElementById('u-id').value=u.id;
    document.getElementById('u-nome').value=u.nome;
    document.getElementById('u-login').value=u.login;
    document.getElementById('u-senha').value='';
    document.getElementById('u-role').value=u.role;
    document.getElementById('u-cor').value=u.cor;
  }else{
    document.getElementById('user-modal-title').textContent='Novo usuário';
    ['u-id','u-nome','u-login','u-senha'].forEach(i=>document.getElementById(i).value='');
    document.getElementById('u-role').value='vendedor';
    document.getElementById('u-cor').value='#5B6EFF';
  }
  document.getElementById('ov-user').classList.add('on');
}
function closeUser(){document.getElementById('ov-user').classList.remove('on');}

async function saveUser(){
  const nome=document.getElementById('u-nome').value.trim();
  const login=document.getElementById('u-login').value.trim();
  const senha=document.getElementById('u-senha').value;
  const role=document.getElementById('u-role').value;
  const cor=document.getElementById('u-cor').value;
  if(!nome||!login){toast('Preencha nome e login','err');return;}

  const eid=document.getElementById('u-id').value;

  if(eid){
    const updateObj={nome,login,role,cor};
    const {error}=await DB.profiles().update(updateObj).eq('id',eid);
    if(error){toast('Erro ao atualizar: '+error.message,'err');return;}
    if(senha){
      const {error:authErr}=await sb.auth.admin.updateUserById(eid,{password:senha});
      if(authErr)toast('Perfil atualizado, mas senha não alterada: '+authErr.message,'warn');
    }
  }else{
    if(!senha){toast('Defina uma senha','err');return;}
    const email=`${login}@eyeagenda.app`;
    const {data,error}=await sb.auth.admin.createUser({
      email,
      password:senha,
      email_confirm:true,
      user_metadata:{nome,login,role,cor}
    });
    if(error){
      toast('Erro ao criar usuário: '+error.message,'err');
      return;
    }
  }
  closeUser();
  toast(eid?'Usuário atualizado':'Usuário criado');
  await loadAllProfiles();
  renderUsers();
}

async function delUser(id){
  if(!confirm('Excluir este usuário?'))return;
  const {error}=await DB.profiles().delete().eq('id',id);
  if(error){toast('Erro ao excluir: '+error.message,'err');return;}
  try{await sb.auth.admin.deleteUser(id);}catch(e){}
  toast('Usuário removido','warn');
  await loadAllProfiles();
  renderUsers();
}

async function renderUsers(){
  await loadAllProfiles();
  const users=window._allProfiles||[];
  const el=document.getElementById('v-users');
  el.innerHTML=`
    <div class="filters"><button class="btn-new" onclick="openUser()"><i class="ti ti-user-plus"></i>Novo usuário</button></div>
    <div class="sec-lbl">Usuários cadastrados<span>${users.length} no total</span></div>
    <div class="user-table">
      ${users.map(u=>`
        <div class="user-row">
          <div class="ur-av" style="background:${u.cor}">${initials(u.nome)}</div>
          <div class="ur-info">
            <b>${u.nome}</b>
            <div class="ur-login">@${u.login} &middot; <span class="tag ${u.role==='gerencia'?'s-rl':u.role==='sdr'?'s-cf':'s-ag'}">${ROLE_LABELS[u.role]}</span></div>
          </div>
          <div class="ur-acts">
            ${u.id!==CU.id?`<button class="btn-s" onclick="openUser('${u.id}')"><i class="ti ti-edit"></i>Editar</button>`:''}
            ${u.id!==CU.id?`<button class="btn-s d" onclick="delUser('${u.id}')"><i class="ti ti-trash"></i></button>`:''}
          </div>
        </div>`).join('')}
    </div>`;
}

window.openUser=openUser;window.closeUser=closeUser;
window.saveUser=saveUser;window.delUser=delUser;window.renderUsers=renderUsers;
