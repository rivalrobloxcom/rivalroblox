let POST_ID = null;
let last = 0;

function initParty() {
    const urlParams = new URLSearchParams(window.location.search);

    POST_ID = urlParams.get('pid') || urlParams.get('id');

    if (!POST_ID || POST_ID === 'null' || POST_ID === 'undefined' || POST_ID.trim() === '') {
        console.error('Invalid party ID:', POST_ID);

        uiAlert(
            'Missing or invalid party ID in URL',
            'Error',
            '⚠️'
        ).then(() => {
            location.href = 'find-players.html';
        });

        return;
    }

    console.log('Loading party:', POST_ID);

    loadParty();
}

function bindButtons() {
    const joinBtn = $('#joinBtn');
    const leaveBtn = $('#leaveBtn');
    const sendBtn = $('#send');

    if (joinBtn && !joinBtn.dataset.bound) {
        joinBtn.dataset.bound = "1";

        joinBtn.onclick = async () => {
            try {
                await api(`/api/party/${encodeURIComponent(POST_ID)}/join`, {
                    method: "POST"
                });

                loadParty();
            } catch (e) {
                console.error("Join failed", e);
            }
        };
    }

    if (leaveBtn && !leaveBtn.dataset.bound) {
        leaveBtn.dataset.bound = "1";

        leaveBtn.onclick = async () => {
            try {
                await api(`/api/party/${encodeURIComponent(POST_ID)}/leave`, {
                    method: "POST"
                });

                location.href = 'find-players.html';
            } catch (e) {
                console.error("Leave failed", e);
            }
        };
    }

    if (sendBtn && !sendBtn.dataset.bound) {
        sendBtn.dataset.bound = "1";

        sendBtn.onclick = async () => {
            const input = $('#msg');
            if (!input || !input.value.trim()) return;

            try {
                await api(`/api/party/${encodeURIComponent(POST_ID)}/message`, {
                    method: "POST",
                    body: JSON.stringify({ message: input.value })
                });

                input.value = '';
                loadParty();
            } catch (e) {
                console.error("Message failed", e);
            }
        };
    }
}

async function loadParty() {
    if (!POST_ID || POST_ID === 'null' || POST_ID === 'undefined') return;

    try {
        const d = await api(`/api/party/${encodeURIComponent(POST_ID)}`);

        const p = d.post;
        const me = d.me;
        const members = d.members || [];
        const messages = d.messages || [];

        const member = members.find(m => m.id === me?.id);
        const isOwner = member && member.role === 'owner';
        const isMember = !!member;

        $('#partyTitle').textContent = p.title || 'Party';
        $('#partyDesc').textContent = p.description || '';
        $('#partyMode').textContent = p.game_mode || '';
        $('#partyRank').textContent = p.rank_requirement || '';
        $('#partyRegion').textContent = p.region || '';
        $('#partyCount').textContent =
            `${p.current_players || members.length}/${p.max_players || 2}`;

        $('#members').innerHTML = members.map(m => `
            <div class="member">
                <span>${esc(m.avatar || '😎')}</span>
                <b>${esc(m.username)}</b>
                ${isOwner && m.id !== me?.id ? `<button onclick="kick(${m.id})">Kick</button>` : ''}
                ${m.role === 'owner' ? '<span class="owner-badge">Owner</span>' : ''}
            </div>
        `).join('');

        const canJoin =
            !isMember &&
            (p.current_players || members.length) < (p.max_players || 2);

        $('#joinBtn').style.display = canJoin ? 'block' : 'none';
        $('#leaveBtn').style.display = (isMember && !isOwner) ? 'block' : 'none';

        $('#ownerControls').innerHTML = isOwner
            ? `<button onclick="closeParty()">Close Party</button>`
            : '';

        if (isMember) {
            $('#chatLog').innerHTML = messages.map(m => `
                <div class="msg">
                    <b>${esc(m.username)}</b>: ${esc(m.body)}
                    <small>${new Date((m.created_at || 0) * 1000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</small>
                </div>
            `).join('');

            if (messages.length !== last) {
                const chat = $('#chatLog');
                if (chat) chat.scrollTop = chat.scrollHeight;
                last = messages.length;
            }
        } else {
            $('#chatLog').innerHTML = '<p>Join to view chat</p>';
        }

        bindButtons();

    } catch (e) {
        console.error('Party load failed:', e);

        if (e.status === 404) {
            uiAlert(
                'Party not found or has been closed',
                'Error',
                '⚠️'
            ).then(() => {
                location.href = 'find-players.html';
            });
        }
    }
}

window.addEventListener('load', initParty);

setInterval(() => {
    if (POST_ID) loadParty();
}, 2500);
