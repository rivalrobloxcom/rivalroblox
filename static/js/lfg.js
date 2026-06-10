let posts=[];
let filters={
  modeFilter:'All Modes',
  rankFilter:'All Ranks',
  regionFilter:'All Regions',
  langFilter:'All Languages'
};

function short(m){
  if(m.includes('5v5'))return'5v5';
  if(m.includes('3v3'))return'3v3';
  if(m.includes('1v1'))return'1v1';
  return'2v2';
}

function filterLabel(t){
  return String(t||'').replace(/^[^A-Za-z0-9]+\s*/,'').trim();
}

function setupFilterDropdowns(){
  $$('.filter-select').forEach(sel=>{
    sel.addEventListener('click',e=>{
      e.stopPropagation();

      if(e.target.tagName==='BUTTON'){
        sel.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
        e.target.classList.add('selected');

        filters[sel.dataset.name]=filterLabel(e.target.dataset.value);

        sel.classList.remove('open');
        render();
        return;
      }

      $$('.filter-select').forEach(s=>{
        if(s!==sel) s.classList.remove('open');
      });

      sel.classList.toggle('open');
    });
  });

  document.addEventListener('click',()=>{
    $$('.filter-select').forEach(s=>s.classList.remove('open'));
  });
}

function rankIcon(rank){
  const i={
    Unranked:'⚪',Bronze:'🥉',Silver:'🥈',Gold:'🥇',
    Platinum:'🔷',Diamond:'💎',Onyx:'⚫',
    Nemesis:'☠️',Archnemesis:'👑'
  };
  return i[rank]||'🏆';
}

function ago(t){
  if(!t) return '';
  const s=Math.floor(Date.now()/1000)-t;
  if(s<60)return s+'s';
  if(s<3600)return Math.floor(s/60)+'m';
  if(s<86400)return Math.floor(s/3600)+'h';
  return Math.floor(s/86400)+'d';
}

function render(){
  const q=$('#search').value.toLowerCase();

  const list=posts.filter(p=>{
    const hay=[
      p.title,p.description,p.game_mode,
      p.rank_requirement,p.region,p.language,
      p.owner?.username,(p.tags||[]).join(' ')
    ].join(' ').toLowerCase();

    return !q||hay.includes(q);
  });

  $('#postsList').innerHTML=list.length
    ? list.map(p=>`
      <div class="post-card">
        <div class="mode-badge">${short(p.game_mode)}</div>

        <div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>

          <div>
            ${(p.tags||[]).map(t=>
              `<span class="pill">${esc(t)}</span>`
            ).join(' ')}

            <span class="pill">
              ${rankIcon(p.rank_requirement)} ${esc(p.rank_requirement)}
            </span>
          </div>
        </div>

        <div>
          <b>${p.current_players}/${p.max_players}</b>
          <small>${ago(p.created_at)}</small>
        </div>

        <button onclick="join(${p.id})">View</button>
      </div>
    `).join('')
    : '<p>No posts found.</p>';
}

function join(id){
  location.href='party.html?pid='+id;
}

$('#search').addEventListener('input',render);

setupFilterDropdowns();

api('/api/posts')
  .then(d=>{posts=d;render();})
  .catch(()=>$('#postsList').innerHTML='<p>Error loading posts</p>');
