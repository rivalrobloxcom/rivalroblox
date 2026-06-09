const POST_ID = new URLSearchParams(location.search).get('id');

if(!POST_ID){
  uiAlert('Missing party','Error','⚠️')
  .then(()=>location.href='find-players.html');
}

let last = 0;

async function loadParty(){
  try{
    const d = await api('/api/party/'+POST_ID);
    const p = d.post;
    const me = d.me;

    const member = d.members.find(m=>m.id===me.id);
    const isOwner = member && member.role==='owner';
    const isMember = !!member;

    $('#partyTitle').textContent = p.title;
    $('#partyDesc').textContent = p.description || '';
    $('#partyMode').textContent = p.game_mode || '';
    $('#partyRank').textContent = p.rank_requirement || '';
    $('#partyRegion').textContent = p.region || '';
    $('#partyCount').textContent = `${p.current_players}/${p.max_players}`;

    $('#members').innerHTML = d.members.map(m=>`
      <div class="member">
        <span>${esc(m.avatar)}</span>
        <b>${esc(m.username)}</b>
        ${isOwner && m.id!==me.id ? `<button onclick="kick(${m.id})">Kick</button>`:''}
      </div>
    `).join('');

    $('#joinBtn').style.display = (!isMember && p.current_players < p.max_players) ? 'block' : 'none';
    $('#leaveBtn').style.display = (isMember && !isOwner) ? 'block' : 'none';

    $('#ownerControls').innerHTML = isOwner
      ? `<button onclick="closeParty()">Close Party</button>`
      : '';

    if(isMember){
      $('#chatLog').innerHTML = d.messages.map(m=>`
        <div class="msg">
          <b>${esc(m.username)}</b>: ${esc(m.body)}
        </div>
      `).join('');

      if(d.messages.length !== last){
        $('#chatLog').scrollTop = $('#chatLog').scrollHeight;
        last = d.messages.length;
      }
    }else{
      $('#chatLog').innerHTML = '<p>Join to view chat</p>';
    }

  }catch(e){
    console.error(e);
  }
}

$('#joinBtn').onclick = async ()=>{
  await api('/api/party/'+POST_ID+'/join',{method:'POST'});
  loadParty();
};

$('#leaveBtn').onclick = async ()=>{
  if(await uiConfirm('Leave party?')){
    await api('/api/party/'+POST_ID+'/leave',{method:'POST'});
    location.href='find-players.html';
  }
};

$('#send').onclick = async ()=>{
  const body = $('#msg').value.trim();
  if(!body) return;

  await api('/api/party/'+POST_ID+'/messages',{
    method:'POST',
    body:JSON.stringify({body})
  });

  $('#msg').value='';
  loadParty();
};

async function kick(id){
  if(await uiConfirm('Kick user?')){
    await api('/api/party/'+POST_ID+'/kick',{
      method:'POST',
      body:JSON.stringify({user_id:id})
    });
    loadParty();
  }
}

async function closeParty(){
  if(await uiConfirm('Close party?','Close','🔒')){
    const r = await api('/api/party/'+POST_ID+'/close',{method:'POST'});
    location.href = r.redirect;
  }
}

setInterval(loadParty,2000);
loadParty();
