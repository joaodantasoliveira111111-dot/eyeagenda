let calYear=new Date().getFullYear(), calMonth=new Date().getMonth(), calSelDay=null;

async function renderCal(){
  const el=document.getElementById('v-cal');
  el.innerHTML=`<div class="cal-wrap"><div class="cal-box" id="cal-grid-box"></div><div class="cal-detail" id="cal-detail-box"></div></div>`;
  await drawCalGrid();
  const today=new Date();
  calSelDay=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  await drawCalDetail(calSelDay);
}

async function drawCalGrid(){
  let {data:appts}=await DB.agendamentos().select('data,vnd');
  if(CU.role==='vendedor')appts=(appts||[]).filter(a=>a.vnd===CU.nome);
  const daysWithAppts=new Set((appts||[]).map(a=>a.data));
  const months=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const firstDay=new Date(calYear,calMonth,1).getDay();
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
  const today=new Date();
  const todayStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  let cells='';
  for(let i=0;i<firstDay;i++)cells+=`<div class="cal-day empty"></div>`;
  for(let d=1;d<=daysInMonth;d++){
    const ds=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday=ds===todayStr;
    const isSel=ds===calSelDay;
    const hasAp=daysWithAppts.has(ds);
    cells+=`<div class="cal-day${isToday?' today':''}${isSel?' sel':''}${hasAp?' has-ap':''}" onclick="selectCalDay('${ds}')">${d}</div>`;
  }
  document.getElementById('cal-grid-box').innerHTML=`
    <div class="cal-header">
      <button class="cal-nav-btn" onclick="calNav(-1)"><i class="ti ti-chevron-left"></i></button>
      <h3>${months[calMonth]} ${calYear}</h3>
      <button class="cal-nav-btn" onclick="calNav(1)"><i class="ti ti-chevron-right"></i></button>
    </div>
    <div class="cal-dow"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div>
    <div class="cal-grid">${cells}</div>`;
}

function calNav(dir){
  calMonth+=dir;
  if(calMonth>11){calMonth=0;calYear++;}
  if(calMonth<0){calMonth=11;calYear--;}
  drawCalGrid();
}

async function selectCalDay(ds){
  calSelDay=ds;
  drawCalGrid();
  await drawCalDetail(ds);
}

async function drawCalDetail(ds){
  let {data:appts}=await DB.agendamentos().select('*').eq('data',ds).order('hora');
  if(CU.role==='vendedor')appts=(appts||[]).filter(a=>a.vnd===CU.nome);
  appts=appts||[];
  const [y,m,d]=ds.split('-');
  const det=document.getElementById('cal-detail-box');
  det.innerHTML=`<div class="cal-detail-head">${d}/${m}/${y} &middot; ${appts.length} agendamento${appts.length!==1?'s':''}</div>
    <div class="cal-detail-body">
      ${appts.length?appts.map(a=>{
        const sm=fmtStatus(a.status);
        const ac=userColor(a.vnd);
        return`<div class="cal-appt-mini" style="--c:${sm.c}" onclick="openNeg('${a.id}')">
          <div class="cam-time">${a.hora||'—'} &middot; <span class="tag ${sm.cls}" style="font-size:10px;">${sm.l}</span></div>
          <div class="cam-name">${a.cli}</div>
          <div class="cam-sub"><span style="color:${ac};font-weight:600;">${a.vnd}</span>${a.modelo?' &middot; '+a.modelo:''}</div>
        </div>`;
      }).join(''):`<div class="cal-empty"><i class="ti ti-calendar-off" style="font-size:28px;display:block;margin-bottom:8px;opacity:.4;"></i>Sem agendamentos neste dia</div>`}
    </div>`;
}

window.renderCal=renderCal;window.calNav=calNav;window.selectCalDay=selectCalDay;
