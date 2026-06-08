async function loadParty(){
let d=await api('/api/party/'+POST_ID);
let p=d.post,me=d.me,mem=d.membership;

$('#partyTitle').textContent=p.title;
$('#partyDesc').textContent=p.description||'';
$('#partyMode').textContent=p.game_mode||'';
$('#partyRank').textContent=p.rank_requirement||'';
$('#partyRegion').textContent=p.region||'';
$('#partyCount').textContent=p.current_players+'/'+p.max_players;

$('#members').innerHTML=d.members.map(m=>`
<div class="member">
<span class="avatar">${esc(m.avatar)}</span>
<div>
<b>${esc(m.username)}</b>
<small>${m.role}${me&&m.id===me.id?' • You':''} • ${esc(m.rank)}</small>
</div>
${mem&&mem.role==='owner'&&m.id!==me.id?`<button onclick="kick(${m.id})">Kick</button>`:''}
</div>
`).join('');

// 🔥 FIX IS HERE (IMPORTANT)
let isMember = mem && typeof mem === 'object' && mem.role;
let isOwner = isMember && mem.role === 'owner';

const full = p.current_players >= p.max_players;

// BUTTON FIX
$('#joinBtn').style.display = (!isMember && !full) ? 'block' : 'none';

$('#joinBtn').textContent =
isMember ? 'View Party' :
full ? 'Party Full' :
'Join Party';

$('#joinBtn').disabled = full;

$('#leaveBtn').style.display = (isMember && !isOwner) ? 'block' : 'none';

$('#ownerControls').innerHTML = isOwner
? '<button class="ghost danger" onclick="closeParty()">Close Party</button>'
: '';

if(isMember){
$('#chatLog').innerHTML=d.messages.map(m=>`
<div class="msg ${me&&m.user_id===me.id?'me':''}">
<b>${esc(m.username)}</b>
<p>${esc(m.body)}</p>
<small>${ago(m.created_at)}</small>
</div>
`).join('');

if(d.messages.length!==lastCount){
$('#chatLog').scrollTop=$('#chatLog').scrollHeight;
lastCount=d.messages.length;
}
}else{
$('#chatLog').innerHTML='<p class="notice">Join the party to view chat.</p>';
}
}
