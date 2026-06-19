async function renderOrigem(){
  let {data:appts}=await DB.agendamentos().select('*').order('data');
  if(CU.role==='vendedor')appts=(appts||[]).filter(a=>a.vnd===CU.nome);
  appts=appts||[];
  const total=appts.length||1;
  const origins=Object.keys(ORIGINS);
  const el=document.getElementById('v-origem');
  const grid=origins.map(o=>{
    const c=appts.filter(a=>a.orig===o).length;
    const pct=Math.round(c/total*100);
    return`<div class="origin-c"><div class="oi">${ORIGINS[o]}</div><div class="on2">${o}</div><div class="ov">${c}</div><div class="obar"><i style="width:${pct}%"></i></div></div>`;
  }).join('');
  const byOrig={};
  appts.forEach(a=>{const k=a.orig||'Outros';if(!byOrig[k])byOrig[k]=[];byOrig[k].push(a);});
  el.innerHTML=`<div class="origin-grid">${grid}</div>
    ${Object.entries(byOrig).map(([o,arr])=>`
      <div class="sec-lbl" style="margin-top:18px">${ORIGINS[o]||'📌'} ${o}<span>${arr.length}</span></div>
      <div class="appt-list">${arr.map(a=>apptCard(a,{noActs:true})).join('')}</div>`).join('')}`;
}

window.renderOrigem=renderOrigem;
