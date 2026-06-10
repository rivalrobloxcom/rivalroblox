// =======================
// GLOBAL DOM HELPERS
// =======================
window.$ = (s) => document.querySelector(s);
window.$$ = (s) => [...document.querySelectorAll(s)];

// =======================
// ESCAPE HTML
// =======================
function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[m]));
}

// =======================
// API HANDLER
// =======================
function apiTarget(url){
  const base = (window.RIVALS_API_BASE_URL ||
    localStorage.getItem('RIVALS_API_BASE_URL') ||
    'https://rivalroblox.pythonanywhere.com').replace(/\/$/, '');

  if (url.startsWith('http')) return url;
  if (!url.startsWith('/')) url = '/' + url;
  return base + url;
}

async function api(url, opts = {}){
  const r = await fetch(apiTarget(url), {
    credentials: 'include',
    headers: {'Content-Type':'application/json'},
    ...opts
  });

  const j = await r.json().catch(()=>({}));

  if (!r.ok) {
    const err = new Error(j.error || 'Request failed');
    err.status = r.status;
    throw err;
  }

  return j;
}

// =======================
// UI MODALS
// =======================
function uiAlert(msg, title='Notice', icon='⚡'){
  return new Promise(resolve=>{
    const m = document.createElement('div');
    m.className = 'ui-modal open';
    m.innerHTML = `
      <div class="ui-modal-card">
        <div class="ui-modal-icon">${icon}</div>
        <h3>${title}</h3>
        <p>${msg}</p>
        <button class="primary">OK</button>
      </div>
    `;
    document.body.appendChild(m);
    m.onclick = () => { m.remove(); resolve(); };
  });
}

function uiConfirm(msg, title='Confirm', icon='⚠️'){
  return new Promise(resolve=>{
    const m = document.createElement('div');
    m.className = 'ui-modal open';
    m.innerHTML = `
      <div class="ui-modal-card">
        <div class="ui-modal-icon">${icon}</div>
        <h3>${title}</h3>
        <p>${msg}</p>
        <div class="ui-modal-actions">
          <button id="no">Cancel</button>
          <button id="yes">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(m);

    m.querySelector('#no').onclick = () => { m.remove(); resolve(false); };
    m.querySelector('#yes').onclick = () => { m.remove(); resolve(true); };
  });
}
