function apptCard(a,opts={}){
  const sm=fmtStatus(a.status);
  const ac=userColor(a.vnd);
  const hasNeg=a.modelo||a.valor||a.pgto;
  const hasObs=a.obs||a.prox;
  const safeCli=(a.cli||'').replace(/</g,'<').replace(/>/g,'>');
  const safeObs=(a.obs||'').replace(/</g,'<').replace(/>/g,'>');
  const safeProx=(a.prox||'').replace(/</g,'<').replace(/>/g,'>');
  return`<div class="ac" style="--c:${sm.c}">
    <div class="ac-head">
      <div class="ac-av" style="background:${ac}">${initials(a.vnd)}</div>
      <div class="ac-info">
        <div class="ac-name">${safeCli}<span class="tag ${sm.cls}">${sm.l}</span></div>
        <div class="ac-sub">
          <span><i class="ti ti-calendar"></i>${fmtDate(a.data)}${a.hora?' &middot; '+a.hora:''}</span>
          <span><i class="ti ti-user"></i>${a.vnd||'—'}</span>
          ${a.orig?`<span><i class="ti ti-map-pin"></i>${a.orig}</span>`:''}
          ${a.tel?`<span><i class="ti ti-phone"></i><a href="https://wa.me/55${a.tel.replace(/\D/g,'')}" target="_blank" rel="noopener">${a.tel}</a></span>`:''}
        </div>
      </div>
    </div>
    ${hasNeg?`<div class="ac-fields">
      ${a.modelo?`<div class="af"><div class="afl">Modelo</div><div class="afv">${a.modelo}</div></div>`:''}
      ${a.valor?`<div class="af"><div class="afl">Valor</div><div class="afv" style="color:var(--grn)">${a.valor}</div></div>`:''}
      ${a.pgto?`<div class="af"><div class="afl">Pagamento</div><div class="afv">${a.pgto}</div></div>`:''}
    </div>`:''}
    ${hasObs?`<div class="ac-neg">
      <div class="neg-lbl">Negociação</div>
      ${a.obs?`<div>${safeObs}</div>`:''}
      ${a.prox?`<div class="next"><i class="ti ti-arrow-right" style="font-size:12px;vertical-align:-1px;"></i> ${safeProx}</div>`:''}
    </div>`:''}
    ${opts.noActs?'':canEdit(a)?`<div class="ac-acts">
      <button class="btn-s p" onclick="openNeg('${a.id}')"><i class="ti ti-pencil"></i>${CU.role==='vendedor'?'Atualizar':'Negociação'}</button>
      ${CU.role!=='vendedor'?`<button class="btn-s" onclick="openAppt('${a.id}')"><i class="ti ti-edit"></i>Editar</button>`:''}
      ${CU.role==='gerencia'?`<button class="btn-s d" onclick="delAppt('${a.id}')"><i class="ti ti-trash"></i></button>`:''}
    </div>`:''}
  </div>`;
}

window.apptCard=apptCard;
