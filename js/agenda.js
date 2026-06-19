async function renderAgenda(){
  const el=document.getElementById('v-agenda');
  let {data:appts,error}=await DB.agendamentos().select('*').order('data').order('hora');
  if(error){appts=[];console.error(error);}
  if(CU.role==='vendedor')appts=appts.filter(a=>a.vnd===CU.nome);
  const all=appts;

  const filtersHTML=`
    <div class="stats">
      <div class="stat-c"><div class="sv" style="color:var(--ind2)">${all.length}</div><div class="sl">Total</div></div>
      <div class="stat-c"><div class="sv">${all.filter(a=>a.status==='agendado').length}</div><div class="sl">Agendados</div></div>
      <div class="stat-c"><div class="sv" style="color:var(--grn)">${all.filter(a=>a.status==='confirmado').length}</div><div class="sl">Confirmados</div></div>
      <div class="stat-c"><div class="sv" style="color:var(--amb)">${all.filter(a=>a.status==='realizado').length}</div><div class="sl">Realizados</div></div>
      <div class="stat-c"><div class="sv" style="color:var(--red)">${all.filter(a=>a.status==='nao_compareceu').length}</div><div class="sl">Não compareceu</div></div>
    </div>
    <div class="filters">
      <input class="fi fi-search" id="ag-q" placeholder="Buscar cliente, modelo…" oninput="_filterAgenda()">
      <select class="fi fi-sel" id="ag-st" onchange="_filterAgenda()">
        <option value="">Todos os status</option>
        ${Object.entries(STATUS_MAP).map(([k,v])=>`<option value="${k}">${v.l}</option>`).join('')}
      </select>
      ${CU.role!=='vendedor'?`<select class="fi fi-sel" id="ag-vnd" onchange="_filterAgenda()">
        <option value="">Todos os vendedores</option>
        ${vendedores().map(v=>`<option>${v.nome}</option>`).join('')}
      </select>`:''}
      <select class="fi fi-sel" id="ag-orig" onchange="_filterAgenda()">
        <option value="">Todas as origens</option>
        ${Object.keys(ORIGINS).map(o=>`<option>${o}</option>`).join('')}
      </select>
    </div>
    <div id="ag-list"></div>`;
  el.innerHTML=filtersHTML;
  window._agendaAll=all;
  _filterAgenda();
}

function _filterAgenda(){
  let appts=window._agendaAll||[];
  const q=(document.getElementById('ag-q')?.value||'').toLowerCase();
  const st=document.getElementById('ag-st')?.value||'';
  const vnd=document.getElementById('ag-vnd')?.value||'';
  const orig=document.getElementById('ag-orig')?.value||'';
  if(q)appts=appts.filter(a=>(a.cli+a.vnd+(a.modelo||'')).toLowerCase().includes(q));
  if(st)appts=appts.filter(a=>a.status===st);
  if(vnd)appts=appts.filter(a=>a.vnd===vnd);
  if(orig)appts=appts.filter(a=>a.orig===orig);
  const el=document.getElementById('ag-list');
  if(!appts.length){el.innerHTML=`<div class="empty-st"><i class="ti ti-calendar-off"></i><p>Nenhum agendamento encontrado.<br>Clique em "Novo lead" para criar o primeiro.</p></div>`;return;}
  const byDate={};
  appts.forEach(a=>{if(!byDate[a.data])byDate[a.data]=[];byDate[a.data].push(a);});
  el.innerHTML=Object.entries(byDate).map(([d,arr])=>`
    <div class="sec-lbl" style="margin-top:18px">${fmtDate(d)}<span>${arr.length} agendamento${arr.length!==1?'s':''}</span></div>
    <div class="appt-list">${arr.map(a=>apptCard(a)).join('')}</div>`).join('');
}

window.renderAgenda=renderAgenda;
