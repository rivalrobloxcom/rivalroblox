let POST_ID=null;
let last=0;

function init(){
  const p=new URLSearchParams(location.search);
  POST_ID=p.get('pid')||p.get('id');

  if(!POST_ID){
    uiAlert('Missing party ID');
    return;
  }

  load();
}

async function load(){
  const d=await api(`/api/party/${POST_ID}`);

  const p=d.post;
  const me=d.me;
  const members=d.members||[];
  const messages=d.messages||[];

  const isMember=members.some(m=>m.id===me?.id);
  const isOwner=members.find(m=>m.id===me?.id)?.role==='owner';

  $('#partyTitle').textContent=p.title;
  $('#partyDesc').textContent=p.description;

  $('#members').innerHTML=members.map(m=>`
    <div>
      <b>${esc(m.username)}</b>
      ${isOwner&&m.id!==me?.id?`<button onclick="kick(${m.id})">Kick</button>`:''}
    </div>
  `).join('');

  $('#joinBtn').style.display=isMember?'none':'block';
  $('#leaveBtn').style.display=isMember?'block':'none';

  $('#chatLog').innerHTML=isMember
    ? messages.map(m=>`<div><b>${esc(m.username)}</b>: ${esc(m.body)}</div>`).join('')
    : '<p>Join to chat</p>';

  bind();
}

function bind(){
  $('#joinBtn').onclick=async()=>{
    await api(`/api/party/${POST_ID}/join`,{method:'POST'});
    load();
  };

  $('#leaveBtn').onclick=async()=>{
    await api(`/api/party/${POST_ID}/leave`,{method:'POST'});
    location.href='find-players.html';
  };

  $('#send').onclick=async()=>{
    const i=$('#msg');
    if(!i.value.trim())return;

    await api(`/api/party/${POST_ID}/messages`,{
      method:'POST',
      body:JSON.stringify({message:i.value})
    });

    i.value='';
    load();
  };
}

window.kick=async(id)=>{
  await api(`/api/party/${POST_ID}/kick`,{
    method:'POST',
    body:JSON.stringify({user_id:id})
  });
  load();
};

window.addEventListener('load',init);
setInterval(()=>POST_ID&&load(),3000);
