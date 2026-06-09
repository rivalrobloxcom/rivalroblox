const POST_ID = new URLSearchParams(location.search).get('id') || window.POST_ID;

if(!POST_ID){
document.addEventListener('DOMContentLoaded',()=>{
uiAlert('No party selected.','Missing party','⚠️')
.then(()=>location.href='find-players.html');
});
}

let lastCount = 0;

async function loadParty(){
let d=await api('/api/party/'+POST_ID);
let p=d.post,me=d.me,mem=d.membership;
let d = await api('/api/party/' + POST_ID);
let p = d.post;
let me = d.me;

$('#partyTitle').textContent=p.title;
$('#partyDesc').textContent=p.description||'';
$('#partyMode').textContent=p.game_mode||'';
$('#partyRank').textContent=p.rank_requirement||'';
$('#partyRegion').textContent=p.region||'';
$('#partyCount').textContent=p.current_players+'/'+p.max_players;
let isMember = d.members.some(m => m.id === me.id);
let isOwner = d.members.some(m => m.id === me.id && m.role === 'owner');

$('#members').innerHTML=d.members.map(m=>`
$('#partyTitle').textContent = p.title;
$('#partyDesc').textContent = p.description || '';
$('#partyMode').textContent = p.game_mode || '';
$('#partyRank').textContent = p.rank_requirement || '';
$('#partyRegion').textContent = p.region || '';
$('#partyCount').textContent = p.current_players + '/' + p.max_players;

$('#members').innerHTML = d.members.map(m => `
<div class="member">
<span class="avatar">${esc(m.avatar)}</span>
<div>
<b>${esc(m.username)}</b>
<small>${m.role}${me&&m.id===me.id?' • You':''} • ${esc(m.rank)}</small>
<small>${m.role} • ${esc(m.rank)}</small>
</div>
${mem&&mem.role==='owner'&&m.id!==me.id?`<button onclick="kick(${m.id})">Kick</button>`:''}
${isOwner && m.id !== me.id ? `<button onclick="kick(${m.id})">Kick</button>` : ''}
</div>
`).join('');

// 🔥 FIX IS HERE (IMPORTANT)
let isMember = mem && typeof mem === 'object' && mem.role;
let isOwner = isMember && mem.role === 'owner';

const full = p.current_players >= p.max_players;

// BUTTON FIX
$('#joinBtn').style.display = (!isMember && !full) ? 'block' : 'none';

$('#joinBtn').textContent =
@@ -43,19 +53,92 @@ $('#ownerControls').innerHTML = isOwner
: '';

if(isMember){
$('#chatLog').innerHTML=d.messages.map(m=>`
<div class="msg ${me&&m.user_id===me.id?'me':''}">
$('#chatLog').innerHTML = d.messages.map(m => `
<div class="msg ${m.user_id === me.id ? 'me' : ''}">
<b>${esc(m.username)}</b>
<p>${esc(m.body)}</p>
<small>${ago(m.created_at)}</small>
</div>
`).join('');

if(d.messages.length!==lastCount){
$('#chatLog').scrollTop=$('#chatLog').scrollHeight;
lastCount=d.messages.length;
if(d.messages.length !== lastCount){
$('#chatLog').scrollTop = $('#chatLog').scrollHeight;
lastCount = d.messages.length;
}
}else{
$('#chatLog').innerHTML='<p class="notice">Join the party to view chat.</p>';
$('#chatLog').innerHTML = '<p class="notice">Join the party to view chat.</p>';
}
}

$('#joinBtn').onclick = async () => {
if($('#joinBtn').disabled)
return uiAlert('This party is full. Try another party.','Party full','🚫');

try{
let r = await api('/api/party/' + POST_ID + '/join', {method:'POST'});
location.href = (r.redirect || '').replace('/party/', 'party.html?id=').replace('/lfg','find-players.html');
}catch(e){
uiAlert(e.message,'Could not join','⚠️');
}
};

$('#leaveBtn').onclick = async () => {
if(await uiConfirm('Leave this party?','Leave party','🚪')){
try{
let r = await api('/api/party/' + POST_ID + '/leave', {method:'POST'});
location.href = (r.redirect || '').replace('/party/', 'party.html?id=').replace('/lfg','find-players.html');
}catch(e){
uiAlert(e.message,'Could not leave','⚠️');
}
}
};

$('#send').onclick = async () => {
let body = $('#msg').value.trim();
if(!body) return;

try{
await api('/api/party/' + POST_ID + '/messages', {
method:'POST',
body: JSON.stringify({body})
});
$('#msg').value = '';
loadParty();
refreshBell();
}catch(e){
uiAlert(e.message,'Message not sent','💬');
}
};

$('#msg').addEventListener('keydown', e => {
if(e.key === 'Enter') $('#send').click();
});

async function kick(id){
if(await uiConfirm('Kick this member?','Kick member','🥾')){
try{
await api('/api/party/' + POST_ID + '/kick', {
method:'POST',
body: JSON.stringify({user_id:id})
});
uiAlert('Member kicked.','Success','✅');
loadParty();
}catch(e){
uiAlert(e.message,'Kick failed','⚠️');
}
}
}

async function closeParty(){
if(await uiConfirm('Close this party?','Close party','🔒')){
try{
let r = await api('/api/party/' + POST_ID + '/close', {method:'POST'});
location.href = (r.redirect || '').replace('/party/', 'party.html?id=').replace('/lfg','find-players.html');
}catch(e){
uiAlert(e.message,'Close failed','⚠️');
}
}
}

loadParty();
setInterval(loadParty, 2500);
