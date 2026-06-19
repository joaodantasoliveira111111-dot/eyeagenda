async function initRealtime(){
  sb.channel('eye-agenda-changes')
    .on('postgres_changes',{event:'*',schema:'public',table:'agendamentos'},()=>{
      refreshAll();
    })
    .on('postgres_changes',{event:'*',schema:'public',table:'profiles'},async()=>{
      await loadAllProfiles();
      const active=document.querySelector('.view.on');
      if(active&&active.id==='v-users')renderUsers();
    })
    .subscribe();
}

window.initRealtime=initRealtime;
