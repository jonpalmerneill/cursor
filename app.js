(function () {
  "use strict";

  if (typeof window.__SUPABASE_URL__ === "undefined") window.__SUPABASE_URL__ = "";
  if (typeof window.__SUPABASE_ANON_KEY__ === "undefined") window.__SUPABASE_ANON_KEY__ = "";

  var SUPABASE_URL = window.__SUPABASE_URL__;
  var SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase config missing. Copy config.example.js to config.js and add your project URL and anon key.");
    renderAuthUI(null);
    return;
  }

  var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function renderAuthUI(user) {
    var container = document.getElementById("auth-ui");
    if (!container) return;

    if (user) {
      var name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Signed in";
      container.innerHTML =
        '<span class="auth-user">' + escapeHtml(name) + "</span> " +
        '<button type="button" class="btn secondary-btn auth-sign-out" aria-label="Sign out">Sign out</button>';
      container.querySelector(".auth-sign-out").addEventListener("click", function () {
        supabase.auth.signOut().then(function () {
          window.location.reload();
        });
      });
    } else {
      container.innerHTML =
        '<button type="button" class="btn primary-btn auth-sign-in-google" aria-label="Sign in with Google">Sign in with Google</button>';
      container.querySelector(".auth-sign-in-google").addEventListener("click", function () {
        supabase.auth.signInWithOAuth({ provider: "google" });
      });
    }
  }

  function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function initAuth() {
    supabase.auth.getSession().then(function (_ref) {
      var data = _ref.data;
      renderAuthUI(data.session ? data.session.user : null);
    });

    supabase.auth.onAuthStateChange(function (_event, session) {
      renderAuthUI(session ? session.user : null);
    });
  }

  function initChat() {
    var toggleBtn = document.getElementById("chat-toggle");
    var panel = document.getElementById("chat-panel");
    var closeBtn = document.getElementById("chat-close");
    var form = document.getElementById("chat-form");
    var input = document.getElementById("chat-input");
    var messagesEl = document.getElementById("chat-messages");

    if (!toggleBtn || !panel || !form || !input || !messagesEl) return;

    function openChat() {
      panel.classList.add("chat-panel-open");
    }

    function closeChat() {
      panel.classList.remove("chat-panel-open");
    }

    toggleBtn.addEventListener("click", openChat);
    if (closeBtn) closeBtn.addEventListener("click", closeChat);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = (input.value || "").trim();
      if (!text) return;

      var msgDiv = document.createElement("div");
      msgDiv.className = "chat-message chat-message-user";
      msgDiv.textContent = text;
      messagesEl.appendChild(msgDiv);

      var assistantDiv = document.createElement("div");
      assistantDiv.className = "chat-message chat-message-assistant";
      assistantDiv.textContent = "…";
      messagesEl.appendChild(assistantDiv);

      input.value = "";
      messagesEl.scrollTop = messagesEl.scrollHeight;

      supabase.functions
        .invoke("chat", { body: { message: text } })
        .then(function (res) {
          if (res.error) {
            console.error("Chat function error:", res.error);
            console.error("Chat response (full):", res);
            if (res.data && typeof res.data === "object" && res.data.error) {
              console.error("Server message:", res.data.error);
            }
            assistantDiv.textContent = "Sorry, something went wrong. Try again.";
            return;
          }
          assistantDiv.textContent = (res.data && res.data.reply) ? res.data.reply : "No reply.";
          messagesEl.scrollTop = messagesEl.scrollHeight;
        })
        .catch(function (err) {
          console.error("Chat request failed:", err);
          assistantDiv.textContent = "Sorry, something went wrong. Try again.";
        });
    });
  }

  function initComments() {
    var listEl = document.getElementById("comments-list");
    var formEl = document.getElementById("comment-form");
    var textarea = document.getElementById("comment-body");
    var submitBtn = document.getElementById("comment-submit");

    if (!listEl) return;

    function escapeText(str) {
      if (!str) return "";
      var d = document.createElement("div");
      d.textContent = str;
      return d.innerHTML;
    }

    function renderComments(comments) {
      listEl.innerHTML = "";
      if (!comments || comments.length === 0) {
        listEl.innerHTML = "<p class=\"comments-empty\">No comments yet.</p>";
        return;
      }
      comments.forEach(function (c) {
        var item = document.createElement("div");
        item.className = "comment-item";
        var name = escapeText(c.author_name || "Anonymous");
        var body = escapeText(c.body);
        var date = c.created_at ? new Date(c.created_at).toLocaleDateString() : "";
        item.innerHTML =
          "<strong class=\"comment-author\">" + name + "</strong> " +
          "<span class=\"comment-date\">" + escapeText(date) + "</span>" +
          "<p class=\"comment-body\">" + body + "</p>";
        listEl.appendChild(item);
      });
    }

    function loadComments() {
      supabase
        .from("comments")
        .select("id, author_name, body, created_at")
        .order("created_at", { ascending: false })
        .then(function (_ref2) {
          var data = _ref2.data;
          var err = _ref2.error;
          if (err) {
            listEl.innerHTML = "<p class=\"comments-error\">Could not load comments.</p>";
            return;
          }
          renderComments(data || []);
        });
    }

    loadComments();

    if (formEl && textarea && submitBtn) {
      formEl.addEventListener("submit", function (e) {
        e.preventDefault();
        var body = (textarea.value || "").trim();
        if (body.length > 2000) {
          body = body.slice(0, 2000);
        }
        if (!body) return;

        submitBtn.disabled = true;

        supabase.auth.getSession().then(function (_ref3) {
          var session = _ref3.data.session;
          if (!session || !session.user) {
            submitBtn.disabled = false;
            return;
          }
          var user = session.user;
          var authorName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Anonymous";
          var authorAvatar = user.user_metadata?.avatar_url || null;

          supabase
            .from("comments")
            .insert({
              user_id: user.id,
              author_name: authorName,
              author_avatar_url: authorAvatar,
              body: body,
              section_id: "main"
            })
            .select()
            .then(function (_ref4) {
              var err = _ref4.error;
              submitBtn.disabled = false;
              if (err) {
                return;
              }
              textarea.value = "";
              loadComments();
            });
        });
      });
    }
  }

  function updateCommentFormVisibility() {
    supabase.auth.getSession().then(function (_ref5) {
      var session = _ref5.data.session;
      var formWrap = document.getElementById("comment-form-wrap");
      if (formWrap) {
        formWrap.style.display = session && session.user ? "block" : "none";
      }
    });
  }

  initAuth();

  document.addEventListener("DOMContentLoaded", function () {
    updateCommentFormVisibility();
    supabase.auth.onAuthStateChange(function (_event, session) {
      updateCommentFormVisibility();
    });
    initChat();
    initComments();
  });
})();
