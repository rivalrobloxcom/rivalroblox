async function loadMe(){
  try{
    const res = await api('/api/me');
    const u = res.user;

    const btn = document.getElementById('profileBtn');
    if(btn) btn.textContent = u.username;

    const name = document.getElementById('profileName');
    if(name) name.textContent = u.username;

    const meta = document.getElementById('profileMeta');
    if(meta) meta.textContent = `${u.rank} • ${u.region}`;
  }catch(e){}
}

async function loadNotifs(){
  try{
    const res = await api('/api/notifications');
    const wrap = document.getElementById('notifyContent');
    const bell = document.getElementById('bell');

    if(!wrap) return;

    wrap.innerHTML = res.notifications.map(n =>
      `<div class="notif">${n.message}</div>`
    ).join('');

    if(bell){
      if(res.notifications.length > 0){
        bell.classList.add('has-alert');
      } else {
        bell.classList.remove('has-alert');
      }
    }
  }catch(e){}
}

function initBell(){
  const bell = document.getElementById('bell');
  const panel = document.getElementById('notifyPanel');
  const close = document.getElementById('closeNotify');

  if(!bell || !panel) return;

  bell.onclick = () => panel.classList.toggle('open');
  close.onclick = () => panel.classList.remove('open');
}

window.addEventListener('load', ()=>{
  loadMe();
  loadNotifs();
  initBell();

  setInterval(loadNotifs, 4000);
});
