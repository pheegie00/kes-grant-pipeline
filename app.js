function days(d){if(!d)return null;const x=new Date(d);return Math.round((x-today)/864e5);}
function dlCell(d,status){
  if(!d)return '<span class="dl">'+(status||'—')+'</span>';
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

const RELATIONSHIPS=[
  {
    name:"Simons Foundation",
    type:"Private Foundation",
    focus:"Autism research, SFARI; largest private autism funder in the US",
    contact:"",
    contactTitle:"",
    status:"cold",
    lastTouch:"",
    nextStep:"Identify program officer in SFARI Autism Research division; find mutual connection",
    potential:"$500K+",
    link:"https://www.simonsfoundation.org/funding-opportunities/"
  },
  {
    name:"Pritzker Family Foundation",
    type:"Private Foundation",
    focus:"Early childhood, education, disability, equity in Illinois and nationally",
    contact:"",
    contactTitle:"",
    status:"cold",
    lastTouch:"",
    nextStep:"Research current grantees in autism/disability space; find warm intro path",
    potential:"$250K+",
    link:"https://www.pritzkerfamilyfoundation.org"
  },
  {
    name:"Walton Family Foundation",
    type:"Private Foundation",
    focus:"K-12 education reform, ed-tech, family economic opportunity",
    contact:"",
    contactTitle:"",
    status:"cold",
    lastTouch:"",
    nextStep:"Target K-12 or Home Region program; find program officer via LinkedIn",
    potential:"$250K+",
    link:"https://www.waltonfamilyfoundation.org"
  },
  {
    name:"Bill & Melinda Gates Foundation",
    type:"Private Foundation",
    focus:"Ed-tech, K-12, global health; no unsolicited proposals",
    contact:"",
    contactTitle:"",
    status:"cold",
    lastTouch:"",
    nextStep:"Build credibility and visibility first; target 2028+ or via fiscal sponsor intermediary",
    potential:"$1M+",
    link:"https://www.gatesfoundation.org"
  },
  {
    name:"Autism Science Foundation",
    type:"Private Foundation",
    focus:"Autism research and family support; community grants",
    contact:"",
    contactTitle:"",
    status:"cold",
    lastTouch:"",
    nextStep:"Review current grant programs; check for family support funding track",
    potential:"$50K–$150K",
    link:"https://autismsciencefoundation.org"
  },
  {
    name:"Google.org",
    type:"Corporate Foundation",
    focus:"AI for underserved populations, education, knowledge access",
    contact:"",
    contactTitle:"Program Officer",
    status:"researching",
    lastTouch:"2026-06-19",
    nextStep:"Apply to AI Opportunity Fund; watch for Generative AI Accelerator cohort 3 announcement",
    potential:"$100K–$1.5M",
    link:"https://www.google.org/"
  },
  {
    name:"NEXT for AUTISM",
    type:"Nonprofit Funder",
    focus:"Autism community-based programs; explicit equity + marginalized communities criterion",
    contact:"",
    contactTitle:"",
    status:"researching",
    lastTouch:"2026-06-19",
    nextStep:"Watch for 2026-27 cycle opening (typically fall); prepare narrative now",
    potential:"$25K–$100K",
    link:"https://nextforautism.org"
  },
  {
    name:"USDA NIFA AgrAbility — UMD Extension / Morgan State Extension",
    type:"Federal Partnership (indirect)",
    focus:"Assistive Technology for Farmers with Disabilities (ALN 10.500). TKF cannot lead — SRAPs must be led by a 1862/1890 Land-grant Cooperative Extension Service. TKF's role is the required nonprofit disability org subcontractor. Maryland Land-grant leads: University of Maryland (1862) or Morgan State University (1890). Target: build the partnership this year, submit together for FY2027.",
    contact:"",
    contactTitle:"Extension Program Director",
    status:"cold",
    lastTouch:"2026-06-20",
    nextStep:"Identify AgrAbility Extension contact at UMD or Morgan State; pitch TKF as disability org partner for FY2027 SRAP. Angle: autism/neurodevelopmental gap in AgrAbility (historically skews physical injury); Black/Brown farm family equity gap; accessible education for farm families with disabled children.",
    potential:"$150K–$200K/year as subcontractor (4-year SRAP)",
    link:"https://nifa.usda.gov/grants/programs/agrability"
  },
  {
    name:"Verizon Foundation",
    type:"Corporate Foundation",
    focus:"Digital inclusion, education, STEM",
    contact:"",
    contactTitle:"",
    status:"cold",
    lastTouch:"",
    nextStep:"Invitation only — need warm intro from Verizon employee or current grantee",
    potential:"$100K+",
    link:"https://www.verizon.com/about/responsibility/foundation"
  }
];

const APPLIED=[
  {
    status:"rejected",
    title:"Thinking Machines Lab — Interactive Learning Research Grant",
    funder:"Thinking Machines Lab (TML)",
    applied:"2026-06-17",
    amount:"$100,000",
    decision:"",
    link:"",
    notes:"19-page proposal (TM-Interactivity-Grant-Application.pdf). Positions Superpowers as purpose-built accessible educational media with TML adaptive interaction model as differentiator. Covers children ages 2–5, minimally verbal autistic learners.",contact:"Solomon Kim · solomon@thinkingmachines.ai · linkedin.com/in/solomon-kim-7393ab154"
  },
  {
    status:"submitted",
    title:"OSEP Accessible Education Video Projects (ALN 84.327C)",
    funder:"Dept of Education — OSERS/OSEP",
    applied:"2026-06-25",
    amount:"$1,050,000",
    decision:"",
    link:"https://apply07.grants.gov/apply/login.faces?cleanSession=1",
    notes:"Grants.gov: GRANT14688572 · Agency tracking: H327C260008 · Opportunity: ED-GRANTS-042726-001 · AOR: Phedra Arthur · UEI: N8MRHAVEBEA7",
    contact:"OSEP · ED-GRANTS-042726-001"
  }
];


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