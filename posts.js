/*
  Shared posts file for Rivals LFG.
  This is the ONLY place that stores/loads post data.
  Later, when you add a backend, replace the localStorage functions here.
*/

const RIVALS_POSTS_KEY = "rivals_lfg_posts";

const RIVALS_DEFAULT_POSTS = [
  {
    id: "default-1",
    title: "Ranked 2v2 - Diamond+",
    description: "Looking for a consistent duo to grind Ranked 2v2. Need good comms and aim.",
    gameMode: "Ranked 2v2",
    rank: "Diamond+",
    region: "NA East",
    mic: "Yes",
    language: "English",
    playersNeeded: 1,
    maxPlayers: 2,
    tags: ["Competitive", "Ranked"],
    host: "VoidZx 💙",
    hostRank: "Diamond I",
    createdAt: Date.now() - 1000 * 60 * 2
  },
  {
    id: "default-2",
    title: "1v1 Box Fights",
    description: "Warming up, anyone down for some 1v1 Box Fights?",
    gameMode: "1v1 Box Fights",
    rank: "Any Rank",
    region: "NA West",
    mic: "Preferred",
    language: "English",
    playersNeeded: 1,
    maxPlayers: 2,
    tags: ["Chill"],
    host: "Clxutcher",
    hostRank: "Gold II",
    createdAt: Date.now() - 1000 * 60 * 5
  },
  {
    id: "default-3",
    title: "3v3 Ranked - Push to Radiant",
    description: "Need one for our 3v3 grind. Must have game sense and be active.",
    gameMode: "3v3 Ranked",
    rank: "Diamond+",
    region: "EU",
    mic: "Yes",
    language: "English",
    playersNeeded: 1,
    maxPlayers: 3,
    tags: ["Competitive", "Ranked"],
    host: "ItzNova 💙",
    hostRank: "Diamond II",
    createdAt: Date.now() - 1000 * 60 * 8
  }
];

function getPosts() {
  const saved = localStorage.getItem(RIVALS_POSTS_KEY);

  if (!saved) {
    localStorage.setItem(RIVALS_POSTS_KEY, JSON.stringify(RIVALS_DEFAULT_POSTS));
    return RIVALS_DEFAULT_POSTS;
  }

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.setItem(RIVALS_POSTS_KEY, JSON.stringify(RIVALS_DEFAULT_POSTS));
    return RIVALS_DEFAULT_POSTS;
  }
}

function savePosts(posts) {
  localStorage.setItem(RIVALS_POSTS_KEY, JSON.stringify(posts));
}

function addPost(post) {
  const posts = getPosts();
  posts.unshift(post);
  savePosts(posts);
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.max(1, Math.floor(diff / 60000));

  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getMaxPlayers(gameMode) {
  if (gameMode.includes("3v3")) return 3;
  if (gameMode.includes("5v5")) return 5;
  return 2;
}
