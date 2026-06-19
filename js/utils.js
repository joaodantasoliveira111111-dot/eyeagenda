function initials(n){return(n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();}
function fmtDate(d){if(!d)return'—';const p=d.split('-');if(p.length===3)return`${p[2]}/${p[1]}/${p[0]}`;return d;}
function fmtStatus(s){return STATUS_MAP[s]||STATUS_MAP.pendente;}
function userColor(nome){const u=(window._allProfiles||[]).find(x=>x.nome===nome);return u?u.cor:'#5B6EFF';}
function canEdit(a){return CU.role==='gerencia'||CU.role==='sdr'||a.vnd===CU.nome;}
function vendedores(){return(window._allProfiles||[]).filter(u=>u.role==='vendedor');}
function formatDateISO(d){if(!d)return'';if(d.includes('-'))return d;const p=d.split('/');if(p.length===3)return`${p[2]}-${p[1]}-${p[0]}`;return d;}

window.initials=initials;
window.fmtDate=fmtDate;
window.fmtStatus=fmtStatus;
window.userColor=userColor;
window.canEdit=canEdit;
window.vendedores=vendedores;
window.formatDateISO=formatDateISO;
