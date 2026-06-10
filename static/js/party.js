let POST_ID = null;
let last = 0;

function initParty(){
  const p = new URLSearchParams(location.search);
  POST_ID = p.get('pid') || p.get('id');

  if(!POST_ID){
    uiAlert('Missing party ID','Error','⚠️')
      .then(()=>location.href='find-players.html');
    return;
  }

  loadParty();
}

function bindButtons(){
  const joinBtn = $('#joinBtn');
  const leaveBtn = $('#leaveBtn');
  const sendBtn = $('#send');

  if(joinBtn && !joinBtn.dataset.bound){
    joinBtn.dataset.bound = "1";
    joinBtn.onclick = async ()=>{
      await api(`/api/party/${POST_ID}/join`, {method:'POST'});
      loadParty();
    };
  }

  if(leaveBtn && !leaveBtn.dataset.bound){
    leaveBtn.dataset.bound = "1";
    leaveBtn.onclick = async ()=>{
      await api(`/api/party/${POST_ID}/leave`, {method:'POST'});
      location.href='find-players.html';
    };
  }

  if(sendBtn && !sendBtn.dataset.bound){
    sendBtn.dataset.bound = "1";
    sendBtn.onclick = async ()=>{
      const input = $('#msg');
      if(!input?.value.trim()) return;

      await api(`/api/party/${POST_ID}/message`, {
        method:'POST',
        body: JSON.stringify({message: input.value})
      });

      input.value='';
      loadParty();
    };
  }
}

async function loadParty(){
  const d = await api(`/api/party/${POST_ID}`);

  const p = d.post;
  const me = d.me;
  const members = d.members || [];
  const messages = d.messages || [];

  const member = members.find(m => m.id === me?.id);
  const isOwner = member?.role === 'owner';
  const isMember = !!member;

  $('#partyTitle').textContent = p.title;
  $('#partyDesc').textContent = p.description;
  $('#partyMode').textContent = p.game_mode;
  $('#partyRank').textContent = p.rank_requirement;
  $('#partyRegion').textContent = p.region;
  $('#partyCount').textContent =
    `${p.current_players}/${p.max_players}`;

  $('#members').innerHTML = members.map(m => `
    <div class="member">
      <span>${esc(m.avatar||'😎')}</span>
      <b>${esc(m.username)}</b>
      ${isOwner && m.id !== me?.id ? `<button onclick="kick(${m.id})">Kick</button>` : ''}
      ${m.role==='owner' ? '<span>Owner</span>' : ''}
    </div>
  `).join('');

  $('#joinBtn').style.display = (!isMember ? 'block':'none');
  $('#leaveBtn').style.display = (isMember && !isOwner ? 'block':'none');

  $('#ownerControls').innerHTML =
    isOwner ? `<button onclick="closeParty()">Close Party</button>` : '';

  $('#chatLog').innerHTML = isMember
    ? messages.map(m=>`<div><b>${esc(m.username)}</b>: ${esc(m.body)}</div>`).join('')
    : '<p>Join to view chat</p>';

  bindButtons();
}

/* FIXED BACKEND FIELD NAME */
window.kick = async (id)=>{
  await api(`/api/party/${POST_ID}/kick`, {
    method:'POST',
    body: JSON.stringify({user_id:id})
  });
  loadParty();
};

window.closeParty = async ()=>{
  await api(`/api/party/${POST_ID}/close`, {method:'POST'});
  location.href='find-players.html';
};

window.addEventListener('load', initParty);
setInterval(()=>POST_ID && loadParty(), 2500);
