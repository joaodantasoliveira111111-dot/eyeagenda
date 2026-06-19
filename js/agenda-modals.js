async function openAppt(id){
  const vnds=vendedores();
  document.getElementById('a-vnd').innerHTML=`<option value="">Selecione…</option>${vnds.map(v=>`<option value="${v.nome}">${v.nome}</option>`).join('')}`;
  const today=new Date().toISOString().split('T')[0];
  if(id){
    const {data:a}=await DB.agendamentos().select('*').eq('id',id).single();
    if(!a)return;
    document.getElementById('appt-modal-title').textContent='Editar agendamento';
    document.getElementById('appt-id').value=a.id;
    document.getElementById('a-cli').value=a.cli||'';
    document.getElementById('a-tel').value=a.tel||'';
    document.getElementById('a-data').value=a.data||today;
    document.getElementById('a-hora').value=a.hora||'';
    document.getElementById('a-vnd').value=a.vnd||'';
    document.getElementById('a-orig').value=a.orig||'';
    document.getElementById('a-status').value=a.status||'pendente';
    document.getElementById('a-modelo').value=a.modelo||'';
    document.getElementById('a-valor').value=a.valor||'';
    document.getElementById('a-pgto').value=a.pgto||'';
    document.getElementById('a-obs').value=a.obs||'';
    document.getElementById('a-prox').value=a.prox||'';
  }else{
    document.getElementById('appt-modal-title').textContent='Novo lead / agendamento';
    document.getElementById('appt-id').value='';
    ['a-cli','a-tel','a-hora','a-modelo','a-valor','a-obs','a-prox'].forEach(k=>document.getElementById(k).value='');
    document.getElementById('a-data').value=today;
    document.getElementById('a-vnd').value='';
    document.getElementById('a-orig').value='';
    document.getElementById('a-status').value='agendado';
    document.getElementById('a-pgto').value='';
    if(CU.role==='vendedor')document.getElementById('a-vnd').value=CU.nome;
  }
  document.getElementById('ov-appt').classList.add('on');
}
function closeAppt(){document.getElementById('ov-appt').classList.remove('on');}

async function saveAppt(){
  const cli=document.getElementById('a-cli').value.trim();
  const data=document.getElementById('a-data').value;
  const vnd=document.getElementById('a-vnd').value;
  const orig=document.getElementById('a-orig').value;
  if(!cli||!data||!vnd||!orig){toast('Preencha: cliente, data, vendedor e origem','err');return;}
  const eid=document.getElementById('appt-id').value;
  const obj={
    cli,
    tel:document.getElementById('a-tel').value.trim(),
    data,
    hora:document.getElementById('a-hora').value,
    vnd,
    orig,
    status:document.getElementById('a-status').value||'agendado',
    modelo:document.getElementById('a-modelo').value.trim(),
    valor:document.getElementById('a-valor').value.trim(),
    pgto:document.getElementById('a-pgto').value,
    obs:document.getElementById('a-obs').value.trim(),
    prox:document.getElementById('a-prox').value.trim(),
    criado_por:CU.id,
  };
  if(eid){
    const {error}=await DB.agendamentos().update(obj).eq('id',eid);
    if(error){toast('Erro ao atualizar: '+error.message,'err');return;}
  }else{
    const {error}=await DB.agendamentos().insert(obj);
    if(error){toast('Erro ao criar: '+error.message,'err');return;}
  }
  closeAppt();
  toast(eid?'Agendamento atualizado':'Lead criado com sucesso');
  refreshAll();
}

async function openNeg(id){
  const {data:a}=await DB.agendamentos().select('*').eq('id',id).single();
  if(!a)return;
  document.getElementById('neg-modal-title').textContent='Negociação · '+a.cli;
  document.getElementById('neg-id').value=id;
  document.getElementById('n-status').value=a.status||'agendado';
  document.getElementById('n-modelo').value=a.modelo||'';
  document.getElementById('n-valor').value=a.valor||'';
  document.getElementById('n-pgto').value=a.pgto||'';
  document.getElementById('n-obs').value=a.obs||'';
  document.getElementById('n-prox').value=a.prox||'';
  document.getElementById('ov-neg').classList.add('on');
}
function closeNeg(){document.getElementById('ov-neg').classList.remove('on');}

async function saveNeg(){
  const id=document.getElementById('neg-id').value;
  const obj={
    status:document.getElementById('n-status').value,
    modelo:document.getElementById('n-modelo').value.trim(),
    valor:document.getElementById('n-valor').value.trim(),
    pgto:document.getElementById('n-pgto').value,
    obs:document.getElementById('n-obs').value.trim(),
    prox:document.getElementById('n-prox').value.trim(),
  };
  const {error}=await DB.agendamentos().update(obj).eq('id',id);
  if(error){toast('Erro ao salvar: '+error.message,'err');return;}
  closeNeg();
  toast('Negociação atualizada');
  refreshAll();
}

async function delAppt(id){
  if(!confirm('Excluir este agendamento?'))return;
  const {error}=await DB.agendamentos().delete().eq('id',id);
  if(error){toast('Erro ao excluir: '+error.message,'err');return;}
  toast('Agendamento excluído','warn');
  refreshAll();
}

window.openAppt=openAppt;window.closeAppt=closeAppt;window.saveAppt=saveAppt;
window.openNeg=openNeg;window.closeNeg=closeNeg;window.saveNeg=saveNeg;
window.delAppt=delAppt;
