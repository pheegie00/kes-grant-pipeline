
const today=new Date();
let active={Strong:1,Possible:1,Watch:1,Skip:0};
let sortKey="score", openOnly=false, q="";
const tierRank={Strong:0,Possible:1,Watch:2,Skip:3};
function days(d){if(!d)return null;const x=new Date(d);return Math.round((x-today)/864e5);}
function dlCell(d,status){
  if(!d)return '<span class="dl">'+(status||'—')+'</span>';
  if((status||'').toUpperCase().startsWith('APPLIED'))return '<span class="dl ok">'+d+' · applied</span>';
  const n=days(d);
  let cls=n<0?'closed':n<21?'soon':'ok';
  let tag=n<0?'closed':(n+'d left');
  return '<span class="dl '+cls+'">'+d+' · '+tag+'</span>';
}
function render(){
  let rows=DATA.filter(r=>active[r.tier]);
  if(openOnly)rows=rows.filter(r=>!(r.status||'').includes('CLOSED') && !(r.deadline&&days(r.deadline)<0));
  if(q){const s=q.toLowerCase();rows=rows.filter(r=>(r.title+' '+r.agency+' '+r.why+' '+r.category+' '+r.elig).toLowerCase().includes(s));}
  rows.sort((a,b)=>{
    if(sortKey==='score')return b.score-a.score;
    if(sortKey==='tier')return tierRank[a.tier]-tierRank[b.tier]||b.score-a.score;
    if(sortKey==='deadline'){const da=days(a.deadline),db=days(b.deadline);
      if(da===null)return 1;if(db===null)return -1;
      const fa=da<0?1e6+(-da):da, fb=db<0?1e6+(-db):db;return fa-fb;}
    return 0;
  });
  document.getElementById('count').textContent=rows.length+' shown';
  // update chip counts from live data
  ['Strong','Possible','Watch','Skip'].forEach(t=>{
    const el=document.getElementById('ct-'+t);
    if(el)el.textContent=DATA.filter(d=>d.tier===t).length;
  });
  document.getElementById('tb').innerHTML=rows.map(r=>{
    const elig=(r.elig||'').replace(/✓/g,'<span class="good">✓</span>');
    const ttl=r.link?'<a href="'+r.link+'" target="_blank" rel="noopener">'+esc(r.title)+'</a>':esc(r.title);
    return '<tr><td><span class="tier '+r.tier+'">'+r.tier+'</span></td>'
      +'<td class="sc">'+r.score+'</td>'
      +'<td class="ttl">'+ttl+'<div class="meta hideSm" style="display:none"></div></td>'
      +'<td class="hideSm meta">'+esc(r.agency)+'</td>'
      +'<td>'+dlCell(r.deadline,r.status)+'</td>'
      +'<td class="hideSm meta">'+esc(r.award||'—')+'</td>'
      +'<td class="hideSm why">'+esc(r.why)+'</td>'
      +'<td class="hideSm elig">'+elig+'</td></tr>';
  }).join('');
}
function esc(s){return (s||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
document.getElementById('chips').addEventListener('click',e=>{
  const c=e.target.closest('.chip');if(!c)return;const t=c.dataset.t;
  active[t]=!active[t];c.classList.toggle('off',!active[t]);render();
});
document.getElementById('q').addEventListener('input',e=>{q=e.target.value;render();});
document.getElementById('sort').addEventListener('change',e=>{sortKey=e.target.value;render();});
document.getElementById('openOnly').addEventListener('change',e=>{openOnly=e.target.checked;render();});
document.querySelectorAll('th[data-s]').forEach(th=>th.addEventListener('click',()=>{
  sortKey=th.dataset.s;document.getElementById('sort').value=['score','deadline','tier'].includes(sortKey)?sortKey:'score';render();
}));
render();
renderAlert();

function renderAlert(){
  const cutoff=14;
  const urgent=DATA.filter(r=>{
    if(r.tier==='Skip'||r.tier==='Missed')return false;
    const d=days(r.deadline);
    return d!==null && d>=0 && d<=cutoff;
  }).sort((a,b)=>days(a.deadline)-days(b.deadline));
  const el=document.getElementById('deadline-alert');
  const rows=document.getElementById('alert-rows');
  if(!urgent.length){el.classList.remove('has-items');return;}
  el.classList.add('has-items');
  rows.innerHTML=urgent.map(r=>{
    const d=days(r.deadline);
    const label=d===0?'TODAY':d===1?'1 day':d+'d';
    return `<div class="alert-row">
      <span class="alert-days">${label}</span>
      <span class="alert-title"><a href="${r.link}" target="_blank" rel="noopener">${r.title}</a></span>
      <span class="alert-tier ${r.tier}">${r.tier}</span>
    </div>`;
  }).join('');
}

function renderRelationships(){
  const el=document.getElementById('rel-cards');
  if(!el||el.innerHTML)return;
  const statusLabel={cold:'Cold',researching:'Researching',warm:'Warm',active:'Active'};
  el.innerHTML=RELATIONSHIPS.map(r=>`
    <div class="rel-card">
      <div class="rel-name"><a href="${r.link}" target="_blank" rel="noopener">${r.name}</a></div>
      <span class="rel-type">${r.type}</span>
      <div class="rel-focus">${r.focus}</div>
      <div class="rel-next"><b>Next step</b>${r.nextStep}</div>
      <div class="rel-meta">
        <span>Potential: <b>${r.potential}</b></span>
        <span>Status: <b class="status-${r.status}">${statusLabel[r.status]||r.status}</b></span>
        ${r.contact?`<span>Contact: <b>${r.contact}</b>${r.contactTitle?' · '+r.contactTitle:''}</span>`:''}
        ${r.lastTouch?`<span>Last touch: <b>${r.lastTouch}</b></span>`:''}
      </div>
    </div>`).join('');
}
function renderMissed(){
  const tb=document.getElementById('missed-tb');
  if(!tb)return;
  tb.innerHTML=MISSED.map(r=>`<tr>
    <td><span style="font-family:'JetBrains Mono',monospace;font-size:11px">${r.score}</span></td>
    <td><a href="${r.link}" target="_blank" rel="noopener" style="color:var(--ink);text-decoration:none;font-weight:500">${r.title}</a></td>
    <td style="color:var(--ink2);font-size:13px">${r.agency||''}</td>
    <td style="font-family:'JetBrains Mono',monospace;font-size:11px;white-space:nowrap;color:var(--rose)">${r.deadline}</td>
    <td style="font-size:12px;white-space:nowrap">${r.award||'—'}</td>
    <td class="hideSm" style="font-size:12px;color:var(--ink2)">${r.why||''}</td>
  </tr>`).join('');
}
function renderApplied(){
  const statusLabel={submitted:"Submitted",reviewing:"Under Review",awarded:"Awarded",rejected:"Not Funded"};
  const total=APPLIED.reduce((s,r)=>{const m=(r.amount||'').replace(/[$,]/g,'').match(/[\d]+/);return s+(m?parseInt(m[0],10):0);},0);
  document.getElementById('a-total').innerHTML='<strong>Total requested:</strong> $'+total.toLocaleString()+' across '+APPLIED.length+' application'+(APPLIED.length!==1?'s':'');
  document.getElementById('a-tb').innerHTML=APPLIED.map(r=>{
    const ttl=r.link?'<a href="'+r.link+'" target="_blank" rel="noopener">'+esc(r.title)+'</a>':esc(r.title);
    return '<tr>'
      +'<td><span class="a-status '+r.status+'">'+statusLabel[r.status]+'</span></td>'
      +'<td class="ttl">'+ttl+'<div class="meta" style="margin-top:3px;font-size:12px;color:var(--ink3)">'+esc(r.funder)+'</div></td>'
      +'<td class="dl">'+r.applied+'</td>'
      +'<td class="meta">'+esc(r.amount)+'</td>'
      +'<td class="dl">'+(r.decision||'—')+'</td>'
      +'<td class="hideSm why">'+esc(r.notes)+(r.contact?'<div style="margin-top:6px;font-size:11.5px;color:var(--ink3)">'+esc(r.contact)+'</div>':'')+'</td>'
      +'</tr>';
  }).join('');
}
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('show'));
  t.classList.add('active');
  document.getElementById('view-'+t.dataset.view).classList.add('show');
  if(t.dataset.view==='applied')renderApplied();
  if(t.dataset.view==='missed')renderMissed();
  if(t.dataset.view==='relationships')renderRelationships();
}));
