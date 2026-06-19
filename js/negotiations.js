async function renderNegoc(){
  let {data:appts}=await DB.agendamentos().select('*').order('data');
  appts=(appts||[]).filter(a=>a.modelo||a.valor||a.pgto||a.obs);
  if(CU.role==='vendedor')appts=appts.filter(a=>a.vnd===CU.nome);
  const totalVal=appts.reduce((s,a)=>{
    const n=parseFloat((a.valor||'').replace(/[^0-9,.]/g,'').replace(',','.'));
    return s+(isNaN(n)?0:n);
  },0);
  const el=document.getElementById('v-negoc');
  el.innerHTML=`
    <div class="stats">
      <div class="stat-c"><div class="sv">${appts.length}</div><div class="sl">Negociações</div></div>
      <div class="stat-c"><div class="sv" style="color:var(--grn)">R$ ${Math.round(totalVal).toLocaleString('pt-BR')}</div><div class="sl">Potencial total</div></div>
      <div class="stat-c"><div class="sv" style="color:var(--amb)">${appts.filter(a=>a.pgto==='À vista').length}</div><div class="sl">À vista</div></div>
      <div class="stat-c"><div class="sv">${appts.filter(a=>(a.pgto||'').includes('financ')).length}</div><div class="sl">Financiamento</div></div>
    </div>
    <div class="sec-lbl">Em andamento</div>
    ${appts.length?`<div class="appt-list">${appts.map(a=>apptCard(a)).join('')}</div>`:
    `<div class="empty-st"><i class="ti ti-handshake"></i><p>Nenhuma negociação registrada.<br>Preencha os campos ao criar ou editar um agendamento.</p></div>`}`;
}

window.renderNegoc=renderNegoc;
