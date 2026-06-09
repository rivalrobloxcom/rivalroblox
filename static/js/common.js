const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function apiTarget(url){
  const base = (window.RIVALS_API_BASE_URL ||
    localStorage.getItem("RIVALS_API_BASE_URL") ||
    "https://rivalroblox.pythonanywhere.com"
  ).replace(/\/$/, "");

  if (/^https?:\/\//i.test(url)) return url;
  if (!url.startsWith("/")) url = "/" + url;
  return base + url;
}

async function api(url, opts = {}) {
  const method = opts.method || "GET";

  const r = await fetch(apiTarget(url), {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: method === "GET" ? undefined : JSON.stringify(opts.body || {})
  });

  const j = await r.json().catch(() => ({}));

  if (!r.ok) throw new Error(j.error || "Request failed");
  return j;
}

async function loadMe(){
  try{
    const d = await api("/api/me");
    const u = d.user;

    const btn = $("#profileBtn");
    const name = $("#profileName");
    const meta = $("#profileMeta");

    if(!u){
      btn.textContent = "Guest";
      name.textContent = "Guest";
      meta.textContent = "No session";
      return;
    }

    btn.textContent = u.username;
    name.textContent = u.username;
    meta.textContent = u.rank + " • " + u.region;
  }catch(e){}
}

function ensureBell(){
  const bell = $("#bell");
  const panel = $("#notifyPanel");

  if(!bell || !panel) return;

  bell.onclick = async () => {
    panel.classList.toggle("open");

    if(panel.classList.contains("open")){
      try{
        const d = await api("/api/notifications");
        const wrap = $("#notifyContent");
        wrap.innerHTML = "";

        (d.notifications || []).forEach(n => {
          const div = document.createElement("div");
          div.className = "notif";
          div.textContent = n.message;
          wrap.appendChild(div);
        });

      }catch(e){}
    }
  };

  $("#closeNotify")?.addEventListener("click", () => {
    panel.classList.remove("open");
  });
}

loadMe();
ensureBell();
