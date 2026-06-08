const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[m]));
}

function ago(t) {
  let d = Math.floor(Date.now() / 1000 - t);
  if (d < 60) return 'Just now';
  let m = Math.floor(d / 60);
  if (m < 60) return m + 'm ago';
  let h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

function apiTarget(url) {
  const base = (
    window.RIVALS_API_BASE_URL ||
    localStorage.getItem('RIVALS_API_BASE_URL') ||
    'https://rivalroblox.pythonanywhere.com'
  ).replace(/\/$/, '');

  if (/^https?:\/\//i.test(url)) return url;
  if (!url.startsWith('/')) url = '/' + url;
  return base + url;
}

async function api(url, opts = {}) {
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...(opts.headers || {})
  };

  const r = await fetch(apiTarget(url), {
    ...opts,
    credentials: 'include',
    headers: finalHeaders
  });

  const j = await r.json().catch(() => ({}));

  if (!r.ok) {
    const err = new Error(j.error || 'Request failed');
    err.status = r.status;
    throw err;
  }

  return j;
}

/* ================= UI MODAL ================= */

function ensureUiModal() {
  let modal = $('#uiModal');
  if (modal) return modal;

  document.body.insertAdjacentHTML(
    'beforeend',
    `<div id="uiModal" class="ui-modal">
      <div class="ui-modal-card">
        <button class="ui-modal-x" type="button">×</button>
        <div class="ui-modal-icon">⚡</div>
        <h3 id="uiModalTitle">Notice</h3>
        <p id="uiModalText"></p>
        <div id="uiModalActions" class="ui-modal-actions"></div>
      </div>
    </div>`
  );

  modal = $('#uiModal');

  modal.querySelector('.ui-modal-x').onclick =
    () => modal.classList.remove('open');

  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('open');
  });

  return modal;
}

function uiAlert(message, title = 'Notice', icon = '⚡') {
  let modal = ensureUiModal();
  $('#uiModalTitle').textContent = title;
  $('#uiModalText').textContent = message;
  $('.ui-modal-icon').textContent = icon;

  $('#uiModalActions').innerHTML =
    '<button class="primary" type="button" data-ok>Okay</button>';

  modal.classList.add('open');

  return new Promise(resolve => {
    $('[data-ok]').onclick = () => {
      modal.classList.remove('open');
      resolve(true);
    };
  });
}

function uiConfirm(message, title = 'Confirm', icon = '⚠️') {
  let modal = ensureUiModal();
  $('#uiModalTitle').textContent = title;
  $('#uiModalText').textContent = message;
  $('.ui-modal-icon').textContent = icon;

  $('#uiModalActions').innerHTML =
    '<button class="ghost" type="button" data-cancel>Cancel</button><button class="primary" type="button" data-confirm>Confirm</button>';

  modal.classList.add('open');

  return new Promise(resolve => {
    $('[data-cancel]').onclick = () => {
      modal.classList.remove('open');
      resolve(false);
    };
    $('[data-confirm]').onclick = () => {
      modal.classList.remove('open');
      resolve(true);
    };
  });
}

/* ================= NOTIFICATIONS ================= */

function setBellBadge(count) {
  let bell = $('#bell');
  if (!bell) return;

  let span = bell.querySelector('span');

  if (count > 0) {
    bell.classList.add('has-alert');
    if (!span) {
      span = document.createElement('span');
      bell.appendChild(span);
    }
    span.textContent = count;
  } else {
    bell.classList.remove('has-alert');
    span?.remove();
  }
}

async function refreshBell() {
  try {
    let d = await api('/api/notifications/count');
    setBellBadge(d.unread);
  } catch (e) {}
}

/* ================= NOTIFY PANEL ================= */

const bell = $('#bell'),
  panel = $('#notifyPanel'),
  content = $('#notifyContent');

if (bell) {
  bell.onclick = async () => {
    try {
      let d = await api('/api/notifications');
      panel.classList.add('open');

      setBellBadge(
        d.notifications.filter(n => !n.is_read).length
      );

      content.innerHTML =
        '<h4>Notifications</h4>' +
        (!d.notifications.length
          ? '<p>No notifications.</p>'
          : d.notifications
              .map(
                n => `<a class="notif ${n.is_read ? '' : 'unread'}"
                href="${n.post_id ? 'party.html?id=' + n.post_id : '#'}">
                <b>${esc(n.message)}</b>
                <small>${ago(n.created_at)}</small>
              </a>`
              )
              .join('')) +
        '<button class="ghost mark-all" type="button">Mark all read</button>';

      $('.mark-all')?.addEventListener('click', async () => {
        await api('/api/notifications/read-all', { method: 'POST' });
        setBellBadge(0);
        panel.classList.remove('open');
      });
    } catch (e) {
      uiAlert('Could not load notifications.', 'Notifications', '🔔');
    }
  };
}

$('#closeNotify')?.addEventListener('click', () =>
  panel.classList.remove('open')
);

refreshBell();
setInterval(refreshBell, 5000);

/* ================= NAV ================= */

function markActiveNav() {
  let page = location.pathname.split('/').pop() || 'index.html';

  let key = page.includes('create-post')
    ? 'posts'
    : page.includes('find-players') || page.includes('lfg')
    ? 'lfg'
    : 'home';

  document.querySelectorAll('[data-nav]').forEach(a =>
    a.classList.toggle('active', a.dataset.nav === key)
  );
}

markActiveNav();

/* ================= PROFILE ================= */

async function loadCurrentProfile() {
  try {
    let d = await api('/api/me');

    if (d.user) {
      $('#profileBtn') &&
        ($('#profileBtn').textContent = d.user.username);

      $('#profileName') &&
        ($('#profileName').textContent = d.user.username);

      $('#profileMeta') &&
        ($('#profileMeta').textContent =
          (d.user.rank || '') + ' • ' + (d.user.region || ''));
    }
  } catch (e) {}
}

$('#profileParties')?.addEventListener('click', e => {
  e.preventDefault();
  $('#bell')?.click();
});

/* SAFE logout fallback (no backend dependency) */
$('#resetSession')?.addEventListener('click', e => {
  e.preventDefault();
  localStorage.clear();
  location.href = 'index.html';
});

loadCurrentProfile();

/* ================= RANK ICONS ================= */

const RANK_ICON_URLS = {
  Unranked: '',
  Bronze:
    'https://static.wikia.nocookie.net/robloxrivals/images/c/c5/BronzeRank.png',
  Silver:
    'https://static.wikia.nocookie.net/robloxrivals/images/f/fa/SilverRank.png',
  Gold:
    'https://static.wikia.nocookie.net/robloxrivals/images/6/68/GoldRank.png',
  Platinum:
    'https://static.wikia.nocookie.net/robloxrivals/images/c/c4/PlatinumRank.png',
  Diamond:
    'https://static.wikia.nocookie.net/robloxrivals/images/9/9a/DiamondRank.png',
  Onyx:
    'https://static.wikia.nocookie.net/robloxrivals/images/9/9b/OnyxRank.png',
  Nemesis:
    'https://static.wikia.nocookie.net/robloxrivals/images/b/b6/NemisisRank.png',
  Archnemesis:
    'https://static.wikia.nocookie.net/robloxrivals/images/f/f3/Archnemesis.png'
};

function rankBase(rank) {
  return String(rank || '')
    .replace(/\+/g, '')
    .replace(/\s+[I]{1,3}$/, '')
    .trim();
}

function rankIconSrc(rank) {
  return RANK_ICON_URLS[rankBase(rank)] || '';
}

function rankIconHTML(rank, cls = 'rank-icon') {
  let src = rankIconSrc(rank);
  return src
    ? `<img class="${cls}" src="${src}" alt="${esc(
        rankBase(rank)
      )} rank icon">`
    : `<span class="${cls} rank-fallback">✦</span>`;
}
