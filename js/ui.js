function show(id){
  document.querySelectorAll('.screen').forEach(s=>{s.classList.remove('on');s.style.display='none';});
  const el=document.getElementById(id);
  el.classList.add('on');el.style.display='flex';
}

function showApp(){
  show('s-app');
  document.getElementById('top-username').textContent=CU.nome;
  const rb=document.getElementById('top-role-badge');
  rb.textContent=ROLE_LABELS[CU.role]||CU.role;
  rb.className='top-role-badge '+(CU.role==='gerencia'?'rb-ger':CU.role==='sdr'?'rb-sdr':'rb-vnd');
  buildNav();
  goTab('agenda');
}

function tabs(){
  const base=[{id:'agenda',icon:'ti-calendar',label:'Agenda'},{id:'cal',icon:'ti-calendar-month',label:'Calendário'}];
  if(CU.role==='gerencia'||CU.role==='sdr')
    base.push({id:'origem',icon:'ti-chart-pie',label:'Origens'},{id:'negoc',icon:'ti-handshake',label:'Negociações'});
  if(CU.role==='gerencia')
    base.push({id:'users',icon:'ti-users-group',label:'Usuários'});
  return base;
}

function buildNav(){
  const ts=tabs();
  document.getElementById('tab-nav').innerHTML=ts.map(t=>`<button onclick="goTab('${t.id}',this)" data-t="${t.id}"><i class="ti ${t.icon}"></i>${t.label}</button>`).join('');
  document.getElementById('mob-nav').innerHTML=ts.map(t=>`<button onclick="goTab('${t.id}',this)" data-t="${t.id}"><i class="ti ${t.icon}"></i>${t.label}</button>`).join('');
}

function goTab(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
  const v=document.getElementById('v-'+id);
  if(v)v.classList.add('on');
  document.querySelectorAll('[data-t]').forEach(b=>b.classList.remove('on'));
  document.querySelectorAll(`[data-t="${id}"]`).forEach(b=>b.classList.add('on'));
  const renders={agenda:renderAgenda,cal:renderCal,origem:renderOrigem,negoc:renderNegoc,users:renderUsers};
  if(renders[id])renders[id]();
}

function toast(msg,type){
  const t=document.getElementById('toast');
  const ic=document.getElementById('toast-ic');
  ic.className='ti '+(type==='err'?'ti-alert-circle':type==='warn'?'ti-alert-triangle':'ti-circle-check');
  ic.style.color=type==='err'?'var(--red)':type==='warn'?'var(--amb)':'var(--grn)';
  document.getElementById('toast-msg').textContent=msg;
  t.style.display='flex';
  clearTimeout(t._t);t._t=setTimeout(()=>t.style.display='none',2800);
}

async function refreshAll(){
  const active=document.querySelector('.view.on');
  if(!active)return;
  const id=active.id.replace('v-','');
  const renders={agenda:renderAgenda,cal:renderCal,origem:renderOrigem,negoc:renderNegoc};
  if(renders[id])renders[id]();
}

window.show=show;window.showApp=showApp;window.tabs=tabs;
window.buildNav=buildNav;window.goTab=goTab;
window.toast=toast;window.refreshAll=refreshAll;
