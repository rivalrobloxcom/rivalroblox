const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function esc(s){return String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]))}
function ago(t){let d=Math.floor(Date.now()/1000-t);if(d<60)return'Just now';let m=Math.floor(d/60);if(m<60)return m+'m ago';let h=Math.floor(m/60);if(h<24)return h+'h ago';return Math.floor(h/24)+'d ago'}
function apiTarget(url){
  const base = (window.RIVALS_API_BASE_URL ||
                localStorage.getItem('RIVALS_API_BASE_URL') ||
                'https://rivalroblox.pythonanywhere.com')
                .replace(/\/$/,'');

  if (/^https?:\/\//i.test(url)) return url;
  if (!url.startsWith('/')) url = '/' + url;
  return base + url;
}
function apiTarget(url){const base=(window.RIVALS_API_BASE_URL||localStorage.getItem('RIVALS_API_BASE_URL')||'https://rivalroblox.pythonanywhere.com').replace(/\/$/,'');if(/^https?:\/\//i.test(url))return url;if(!url.startsWith('/'))url='/'+url;return base+url}
async function api(url,opts={}){let r=await fetch(apiTarget(url),{credentials:'include',headers:{'Content-Type':'application/json'},...opts});let j=await r.json().catch(()=>({}));if(!r.ok){let err=new Error(j.error||'Request failed');err.status=r.status;throw err}return j}
function ensureUiModal(){let modal=$('#uiModal');if(modal)return modal;document.body.insertAdjacentHTML('beforeend',`<div id="uiModal" class="ui-modal"><div class="ui-modal-card"><button class="ui-modal-x" type="button">×</button><div class="ui-modal-icon">⚡</div><h3 id="uiModalTitle">Notice</h3><p id="uiModalText"></p><div id="uiModalActions" class="ui-modal-actions"></div></div></div>`);modal=$('#uiModal');modal.querySelector('.ui-modal-x').onclick=()=>modal.classList.remove('open');modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});return modal}
function uiAlert(message,title='Notice',icon='⚡'){let modal=ensureUiModal();$('#uiModalTitle').textContent=title;$('#uiModalText').textContent=message;$('.ui-modal-icon').textContent=icon;$('#uiModalActions').innerHTML='<button class="primary" type="button" data-ok>Okay</button>';modal.classList.add('open');return new Promise(resolve=>{$('[data-ok]').onclick=()=>{modal.classList.remove('open');resolve(true)}})}
