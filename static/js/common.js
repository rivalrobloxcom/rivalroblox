const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

function esc(s){
  return String(s??'').replace(/[&<>\"]/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'
  }[m]))
}

function apiTarget(url){
  const base=(window.RIVALS_API_BASE_URL||
    localStorage.getItem('RIVALS_API_BASE_URL')||
    'https://rivalroblox.pythonanywhere.com').replace(/\/$/,'');

  if(/^https?:\/\//i.test(url))return url;
  if(!url.startsWith('/'))url='/'+url;
  return base+url;
}

async function api(url,opts={}){
  let r=await fetch(apiTarget(url),{
    credentials:'include',
    headers:{'Content-Type':'application/json'},
    ...opts
  });

  let j=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j.error||'Request failed');
  return j;
}

async function loadUser(){
  try{
    const u=(await api('/api/me')).user;
    $('#profileBtn').textContent=u.username;
    $('#profileName').textContent=u.username;
    $('#profileMeta').textContent=`${u.rank} • ${u.region}`;
  }catch(e){}
}

async function loadNotifications(){
  try{
    const r=await api('/api/notifications/count');
    const b=$('#bell');
    if(!b) return;

    if(r.unread>0){
      b.classList.add('has');
      b.setAttribute('data-count',r.unread);
    }else{
      b.classList.remove('has');
    }
  }catch(e){}
}

async function loadNotificationPanel(){
  try{
    const r=await api('/api/notifications');
    const box=$('#notifyContent');
    if(!box) return;

    box.innerHTML=r.notifications.length?
      r.notifications.map(n=>`
        <div>${esc(n.message)}</div>
      `).join(''):
      '<p>No notifications</p>';
  }catch(e){}
}

$('#bell').onclick=async()=>{
  $('#notifyPanel').classList.toggle('open');
  await loadNotificationPanel();
};

$('#closeNotify').onclick=()=>{
  $('#notifyPanel').classList.remove('open');
};

loadUser();
loadNotifications();
setInterval(loadNotifications,5000);
