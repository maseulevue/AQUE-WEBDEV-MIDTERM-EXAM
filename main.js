/* 
  Commonplace | Vanilla JavaScript
  --------------------------------
  This file is shared by every page. Each HTML page tells us which screen it is
  using data-page, so we can keep one readable script instead of duplicating logic.

  Important: this is a browser-only class prototype. localStorage is convenient
  for demonstrating persistence, but it is not a secure database or login system.
*/

(() => {
  "use strict";

  const page = document.body.dataset.page;
  const root = document.body.dataset.root || ".";
  const STORAGE = {
    profile: "commonplace.profile",
    posts: "commonplace.posts",
    session: "commonplace.session"
  };

  const starterPosts = [
    {
      id: "welcome-note",
      author: "Mira Santos",
      handle: "@mira.makes",
      initials: "M",
      text: "A small reminder that you don't have to turn every part of your life into content. Some moments can just belong to you. 🌱",
      time: "A little while ago",
      likes: 8,
      liked: false,
      owner: false
    },
    {
      id: "slow-internet",
      author: "Noah Reyes",
      handle: "@noahreads",
      initials: "N",
      text: "What if a social feed felt more like a community bulletin board and less like a slot machine? Just people sharing things because they want to.",
      time: "Earlier today",
      likes: 12,
      liked: false,
      owner: false
    },
    {
      id: "learning-note",
      author: "Hannah Aque",
      handle: "@hannah",
      initials: "H",
      text: "Trying to build things I can actually explain, line by line. Understanding the why feels just as important as making it work.",
      time: "Yesterday",
      likes: 5,
      liked: false,
      owner: false
    }
  ];

  // Keep storage access in one place. If the browser blocks storage, the app can
  // still show the page; it simply won't remember changes after refresh.
  function readStorage(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
      console.warn("Commonplace could not read local storage:", error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Commonplace could not save local storage:", error);
      showToast("Your browser could not save that change.");
      return false;
    }
  }

  function getProfile() {
    return readStorage(STORAGE.profile, {
      displayName: "Hannah Aque",
      username: "hannah",
      bio: "Learning, unlearning, and leaving room for better questions."
    });
  }

  function getPosts() {
    const posts = readStorage(STORAGE.posts, null);
    return Array.isArray(posts) ? posts : [...starterPosts];
  }

  function savePosts(posts) {
    return writeStorage(STORAGE.posts, posts);
  }

  function currentHandle(profile = getProfile()) {
    return "@" + (profile.username || "hannah");
  }

  // Escape user text before inserting it into HTML. This is a small but
  // important habit: post content should be treated as text, never trusted markup.
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function showToast(message) {
    const toast = document.querySelector("[data-toast]");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    // A short timeout is enough for feedback and doesn't need a library.
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function updateSharedIdentity() {
    const profile = getProfile();
    document.querySelectorAll("[data-display-name]").forEach((node) => {
      node.textContent = profile.displayName;
    });
    document.querySelectorAll("[data-handle]").forEach((node) => {
      node.textContent = currentHandle(profile);
    });
    document.querySelectorAll("[data-avatar]").forEach((node) => {
      node.textContent = (profile.displayName || "H").trim().charAt(0).toUpperCase();
    });
  }

  function makePostCard(post) {
    const article = document.createElement("article");
    article.className = "post-card panel";
    article.dataset.postId = post.id;
    const avatarLetter = escapeHTML(post.initials || post.author.charAt(0));
    const safeAuthor = escapeHTML(post.author);
    const safeHandle = escapeHTML(post.handle);
    const safeText = escapeHTML(post.text);
    const likedClass = post.liked ? " is-liked" : "";
    const likedLabel = post.liked ? "Unlike this post" : "Like this post";

    article.innerHTML = `
      <div class="post-header">
        <span class="avatar">${avatarLetter}</span>
        <div class="post-author"><strong>${safeAuthor}</strong><span>${safeHandle}</span></div>
        <span class="post-time">${escapeHTML(post.time || "Just now")}</span>
      </div>
      <p class="post-copy">${safeText.replace(/\n/g, "<br>")}</p>
      <div class="post-footer">
        <button class="post-action${likedClass}" type="button" data-like aria-label="${likedLabel}">
          <span aria-hidden="true">${post.liked ? "♥" : "♡"}</span> <span data-like-count>${post.likes || 0}</span>
        </button>
        <span class="post-local-note">⌑ Saved in this browser</span>
        ${post.owner ? '<button class="post-delete" type="button" data-delete>Delete</button>' : ""}
      </div>`;
    return article;
  }

  function renderFeed() {
    const list = document.querySelector("[data-feed-list]");
    if (!list) return;

    const profile = getProfile();
    const filter = document.querySelector("[data-feed-filter]")?.value || "all";
    let posts = getPosts();

    // Seed the example feed only once. After the first change, the saved version
    // is the source of truth, so new posts and likes survive a page refresh.
    if (!readStorage(STORAGE.posts, null)) savePosts(posts);

    if (filter === "mine") {
      posts = posts.filter((post) => post.handle === currentHandle(profile));
    }
    posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    list.replaceChildren();

    if (posts.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state panel";
      empty.innerHTML = '<span>✿</span><h3>A little quiet here.</h3><p>Your next post can start the conversation.</p>';
      list.append(empty);
      return;
    }

    posts.forEach((post) => list.append(makePostCard(post)));
  }

  function renderProfilePosts() {
    const list = document.querySelector("[data-profile-posts]");
    if (!list) return;
    const profile = getProfile();
    const posts = getPosts().filter((post) => post.handle === currentHandle(profile));
    const count = document.querySelector("[data-post-count]");
    if (count) count.textContent = String(posts.length);
    list.replaceChildren();

    if (!posts.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state panel";
      empty.innerHTML = '<span>✿</span><h3>Your page starts here.</h3><p>Share a thought from the feed and it will show up here.</p><a class="arrow-link" href="../index.html#post-content">Write your first post ↗</a>';
      list.append(empty);
      return;
    }
    posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    posts.forEach((post) => list.append(makePostCard(post)));
  }

  function publishPost() {
    const input = document.querySelector("[data-post-input]");
    const message = document.querySelector("[data-composer-message]");
    if (!input || !message) return;
    const text = input.value.trim();

    if (!text) {
      message.textContent = "Write a little something first.";
      input.focus();
      return;
    }

    const profile = getProfile();
    const posts = getPosts();
    posts.push({
      id: "post-" + Date.now(),
      author: profile.displayName,
      handle: currentHandle(profile),
      initials: profile.displayName.charAt(0).toUpperCase(),
      text,
      time: "Just now",
      createdAt: Date.now(),
      likes: 0,
      liked: false,
      owner: true
    });

    if (savePosts(posts)) {
      input.value = "";
      updateCharCount();
      message.textContent = "";
      renderFeed();
      showToast("Your note is on the feed.");
    }
  }

  function updateCharCount() {
    const input = document.querySelector("[data-post-input]");
    const count = document.querySelector("[data-char-count]");
    if (input && count) count.textContent = `${input.value.length} / 500`;
  }

  function handlePostAction(event) {
    const likeButton = event.target.closest("[data-like]");
    const deleteButton = event.target.closest("[data-delete]");
    const card = event.target.closest("[data-post-id]");
    if (!card) return;

    const posts = getPosts();
    const post = posts.find((item) => item.id === card.dataset.postId);
    if (!post) return;

    if (likeButton) {
      // A like is just a local toggle. No engagement signal leaves this browser.
      post.liked = !post.liked;
      post.likes = Math.max(0, (post.likes || 0) + (post.liked ? 1 : -1));
      if (savePosts(posts)) {
        renderFeed();
        renderProfilePosts();
      }
    }

    if (deleteButton && post.owner) {
      if (!window.confirm("Delete this post from this browser?")) return;
      savePosts(posts.filter((item) => item.id !== post.id));
      renderFeed();
      renderProfilePosts();
      showToast("Post removed from local storage.");
    }
  }

  function setupLogin() {
    const form = document.querySelector("[data-login-form]");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = new FormData(form).get("username").trim().replace(/^@/, "");
      const message = document.querySelector("[data-auth-message]");
      if (!username) {
        message.textContent = "Please enter a username.";
        return;
      }

      const profile = getProfile();
      // This is a demo session, not authentication. We only remember a name.
      profile.username = username;
      if (!profile.displayName || profile.displayName === "Hannah Aque") {
        profile.displayName = username.charAt(0).toUpperCase() + username.slice(1);
      }
      writeStorage(STORAGE.profile, profile);
      writeStorage(STORAGE.session, { username });
      window.location.href = "../index.html";
    });
  }

  function setupSignup() {
    const form = document.querySelector("[data-signup-form]");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = new FormData(form);
      const displayName = values.get("displayName").trim();
      const username = values.get("username").trim().toLowerCase();
      const password = values.get("password");
      const message = document.querySelector("[data-auth-message]");

      if (!displayName || !username || password.length < 4) {
        message.textContent = "Please check the fields above and try again.";
        return;
      }

      // We deliberately do not save the password. A real account system needs
      // server-side authentication and proper password handling.
      writeStorage(STORAGE.profile, {
        displayName,
        username,
        bio: "Learning, unlearning, and leaving room for better questions."
      });
      writeStorage(STORAGE.session, { username });
      window.location.href = "../index.html";
    });
  }

  function setupProfileEditor() {
    const form = document.querySelector("[data-profile-form]");
    if (!form) return;
    const editButton = document.querySelector("[data-edit-profile]");
    const cancelButton = document.querySelector("[data-cancel-edit]");
    const nameInput = form.elements.displayName;
    const bioInput = form.elements.bio;

    editButton.addEventListener("click", () => {
      const profile = getProfile();
      nameInput.value = profile.displayName;
      bioInput.value = profile.bio || "";
      form.classList.remove("hidden");
      nameInput.focus();
    });

    cancelButton.addEventListener("click", () => form.classList.add("hidden"));

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const profile = getProfile();
      profile.displayName = nameInput.value.trim() || profile.displayName;
      profile.bio = bioInput.value.trim();
      writeStorage(STORAGE.profile, profile);
      updateSharedIdentity();
      const bio = document.querySelector("[data-bio]");
      if (bio) bio.textContent = profile.bio || "Keeping a little room for whatever comes next.";
      form.classList.add("hidden");
      renderProfilePosts();
      showToast("Profile updated on this device.");
    });
  }

  function setupClearData() {
    const button = document.querySelector("[data-clear-data]");
    if (!button) return;
    button.addEventListener("click", () => {
      const agreed = window.confirm("Clear your profile, posts, and demo session from this browser? This cannot be undone.");
      if (!agreed) return;
      Object.values(STORAGE).forEach((key) => localStorage.removeItem(key));
      showToast("Local demo data cleared. Returning to the feed…");
      window.setTimeout(() => window.location.href = "../index.html", 900);
    });
  }

  function setupLogout() {
    document.querySelectorAll("[data-logout]").forEach((button) => {
      button.addEventListener("click", () => {
        localStorage.removeItem(STORAGE.session);
        showToast("Demo session ended.");
        window.setTimeout(() => window.location.href = root + "/pages/login.html", 450);
      });
    });
  }

  function start() {
    updateSharedIdentity();
    setupLogout();
    setupLogin();
    setupSignup();
    setupProfileEditor();
    setupClearData();

    const publish = document.querySelector("[data-publish]");
    if (publish) publish.addEventListener("click", publishPost);

    const input = document.querySelector("[data-post-input]");
    if (input) {
      input.addEventListener("input", updateCharCount);
      input.addEventListener("keydown", (event) => {
        // Ctrl/Cmd + Enter is a handy keyboard shortcut, while Enter alone
        // remains available for writing multi-line posts.
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") publishPost();
      });
    }

    const filter = document.querySelector("[data-feed-filter]");
    if (filter) filter.addEventListener("change", renderFeed);

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-like], [data-delete]")) handlePostAction(event);
    });

    if (page === "feed") renderFeed();
    if (page === "profile") {
      const profile = getProfile();
      const bio = document.querySelector("[data-bio]");
      if (bio) bio.textContent = profile.bio || "Keeping a little room for whatever comes next.";
      renderProfilePosts();
    }
  }

  // Waiting for DOMContentLoaded means all page elements exist before we query
  // them. defer also helps, but this keeps the setup function safe if moved later.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();