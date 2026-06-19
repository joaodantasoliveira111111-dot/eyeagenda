let CU = null;

async function doLogin(){
  const email = document.getElementById('li-user').value.trim();
  const senha = document.getElementById('li-pass').value;
  const errEl = document.getElementById('li-err');

  if(!email||!senha){errEl.textContent='Preencha login e senha.';errEl.style.display='block';return;}

  errEl.style.display='none';

  const {data,error} = await sb.auth.signInWithPassword({email,senha});

  if(error){
    errEl.textContent=error.message||'Login ou senha incorretos.';
    errEl.style.display='block';
    return;
  }

  const profile = await loadProfile(data.user.id);
  if(!profile){
    errEl.textContent='Perfil não encontrado. Contate o administrador.';
    errEl.style.display='block';
    await sb.auth.signOut();
    return;
  }

  CU={id:data.user.id,...profile};
  await loadAllProfiles();
  showApp();
}

async function doLogout(){
  await sb.auth.signOut();
  CU=null;
  document.getElementById('li-user').value='';
  document.getElementById('li-pass').value='';
  show('s-login');
}

async function loadProfile(uid){
  const {data,error}=await DB.profiles().select('*').eq('id',uid).single();
  if(error){console.error('loadProfile error:',error);return null;}
  return data;
}

async function loadAllProfiles(){
  const {data,error}=await DB.profiles().select('*').order('nome');
  if(!error)window._allProfiles=data;
  else console.error('loadAllProfiles error:',error);
}

async function checkSession(){
  const {data:{session}}=await sb.auth.getSession();
  if(session&&session.user){
    const profile=await loadProfile(session.user.id);
    if(profile){
      CU={id:session.user.id,...profile};
      await loadAllProfiles();
      showApp();
      return;
    }
  }
  show('s-login');
}

window.CU=CU;
window.doLogin=doLogin;
window.doLogout=doLogout;
window.loadProfile=loadProfile;
window.loadAllProfiles=loadAllProfiles;
