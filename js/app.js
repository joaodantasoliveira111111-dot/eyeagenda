async function init(){
  await checkSession();
  if(CU)initRealtime();
  document.getElementById('loading').style.display='none';
}

window.addEventListener('DOMContentLoaded',init);
