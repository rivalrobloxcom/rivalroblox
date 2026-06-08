let posts=[];
let filters={modeFilter:'All Modes',rankFilter:'All Ranks',regionFilter:'All Regions',langFilter:'All Languages'};
function short(m){if(m.includes('5v5'))return'5v5';if(m.includes('3v3'))return'3v3';if(m.includes('1v1'))return'1v1';return'2v2'}
function filterLabel(text){return String(text||'').replace(/^[^A-Za-z0-9]+\s*/,'').trim()}
function setupFilterDropdowns(){
  $$('.filter-select').forEach(sel=>{
    const selected=sel.querySelector('.selected')||sel.querySelector('button');
    sel.dataset.label=selected?selected.textContent.trim():sel.dataset.default;
    sel.addEventListener('click',e=>{
      e.stopPropagation();
      if(e.target.tagName==='BUTTON'){
        sel.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
        e.target.classList.add('selected');
        sel.dataset.label=e.target.textContent.trim();
        filters[sel.dataset.name]=filterLabel(e.target.dataset.value||e.target.textContent);
        sel.classList.remove('open');
        render();
        return;
      }
      $$('.filter-select').forEach(s=>{if(s!==sel)s.classList.remove('open')});
      sel.classList.toggle('open');
    });
  });
  document.addEventListener('click',()=>$$('.filter-select').forEach(s=>s.classList.remove('open')));
}
function render(){
  let q=$('#search').value.toLowerCase();
  let mf=filters.modeFilter,rf=filters.rankFilter,reg=filters.regionFilter,lf=filters.langFilter;
  let list=posts.filter(p=>{
    let hay=[p.title,p.description,p.game_mode,p.rank_requirement,p.region,p.language,p.owner?.username,(p.tags||[]).join(' ')].join(' ').toLowerCase();
    return(!q||hay.includes(q))&&(mf==='All Modes'||p.game_mode===mf)&&(rf==='All Ranks'||p.rank_requirement===rf)&&(reg==='All Regions'||p.region===reg)&&(lf==='All Languages'||p.language===lf)
  });
  $('#postsList').innerHTML=list.length?list.map(p=>`<div class="post-card"><div class="mode-badge">${short(p.game_mode)}</div><div><h3>${esc(p.title)}</h3><div>${(p.tags||[]).map(t=>`<span class="pill ${t==='Mic Required'?'green':''}">${esc(t)}</span>`).join(' ')} <span class="pill rank-pill">${rankIconHTML(p.rank_requirement,'rank-icon tiny')}${esc(p.rank_requirement)}</span></div><p>${esc(p.description)}</p></div><div class="hostchip"><span class="avatar">${esc(p.owner?.avatar||'😎')}</span><div><b>${esc(p.owner?.username||'Unknown')}</b><small>${rankIconHTML(p.owner?.rank||p.rank_requirement,'rank-icon micro')}${esc(p.owner?.rank||'')} • ${esc(p.region)}</small></div></div><div><b>${p.current_players} / ${p.max_players}</b><small>${ago(p.created_at)}</small></div><button class="primary joinstate" onclick="join(${p.id})">View</button></div>`).join(''):'<p>No posts found.</p>'
}
async function join(id){location.href='party.html?id='+id}
$('#search').addEventListener('input',render);
setupFilterDropdowns();
api('/api/posts').then(d=>{posts=d;render()});
