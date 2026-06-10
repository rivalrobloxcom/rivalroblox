const POST_ID = new URLSearchParams(location.search).get('pid') || new URLSearchParams(location.search).get('id');
if(!POST_ID){
  uiAlert('Missing party ID in URL','Error','⚠️').then(()=>location.href='find-players.html');
  throw new Error('Missing party ID');
}

let last = 0;

async function loadParty(){
  try{
    const d = await api('/api/party/'+POST_ID);
    const p = d.post;
    const me = d.me;
    const members = d.members || [];
    const messages = d.messages || [];
    const member = members.find(m=>m.id===me.id);
    const isOwner = member && member.role==='owner';
    const isMember = !!member;

    $('#partyTitle').textContent = p.title || 'Party';
    $('#partyDesc').textContent = p.description || '';
    $('#partyMode').textContent = p.game_mode || '';
    $('#partyRank').textContent = p.rank_requirement || '';
    $('#partyRegion').textContent = p.region || '';
    $('#partyCount').textContent = `${p.current_players || members.length}/${p.max_players || 2}`;

    $('#members').innerHTML = members.map(m=>`
      <div class="member">
        <span>${esc(m.avatar||'😎')}</span>
        <b>${esc(m.username)}</b>
        ${isOwner && m.id!==me.id ? `<button onclick="kick(${m.id})">Kick</button>`:''}
        ${m.role==='owner' ? '<span class="owner-badge">Owner</span>' : ''}
      </div>
    `).join('');

    $('#joinBtn').style.display = (!isMember && (p.current_players || members.length) < (p.max_players || 2)) ? 'block' : 'none';
    $('#leaveBtn').style.display = (isMember && !isOwner) ? 'block' : 'none';
    $('#ownerControls').innerHTML = isOwner ? `<button onclick="closeParty()">Close Party</button>` : '';

    if(isMember){
      $('#chatLog').innerHTML = messages.map(m=>`
        <div class="msg">
          <b>${esc(m.username)}</b>: ${esc(m.body)}
          <small>${new Date((m.created_at||0)*1000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</small>
        </div>
      `).join('');
      if(messages.length !== last){
        const chat = $('#chatLog');
        chat.scrollTop = chat.scrollHeight;
        last = messages.length;
      }
    }else{
      $('#chatLog').innerHTML = '<p>Join to view chat</p>';
    }
  }catch(e){
    console.error(e);
    if(e.status === 404){
      uiAlert('Party not found or closed','Error');
    }
  }
}

$('#joinBtn').onclick = async ()=>{
  try{
    await api('/api/party/'+POST_ID+'/join',{method:'POST'});
    loadParty();
  }catch(e){
    alert(e.message || 'Failed to join');
  }
};

$('#leaveBtn').onclick = async ()=>{
  if(await uiConfirm('Leave party?')){
    try{
      await api('/api/party/'+POST_ID+'/leave',{method:'POST'});
      location.href='find-players.html';
    }catch(e){
      alert('Failed to leave');
    }
  }
};

$('#send').onclick = async ()=>{
  const body = $('#msg').value.trim();
  if(!body) return;
  try{
    await api('/api/party/'+POST_ID+'/messages',{
      method:'POST',
      body:JSON.stringify({body})
    });
    $('#msg').value='';
    loadParty();
  }catch(e){
    alert('Failed to send message');
  }
};

async function kick(id){
  if(await uiConfirm('Kick this user?')){
    try{
      await api('/api/party/'+POST_ID+'/kick',{
        method:'POST',
        body:JSON.stringify({user_id:id})
      });
      loadParty();
    }catch(e){
      alert('Failed to kick');
    }
  }
}

async function closeParty(){
  if(await uiConfirm('Close party?','Close','🔒')){
    try{
      const r = await api('/api/party/'+POST_ID+'/close',{method:'POST'});
      location.href = r.redirect || 'find-players.html';
    }catch(e){
      alert('Failed to close party');
    }
  }
}

setInterval(loadParty, 2500);
loadParty();
