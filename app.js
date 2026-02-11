(function () {
  "use strict";

  if (typeof window.__SUPABASE_URL__ === "undefined") window.__SUPABASE_URL__ = "";
  if (typeof window.__SUPABASE_ANON_KEY__ === "undefined") window.__SUPABASE_ANON_KEY__ = "";
  if (typeof window.__TURNSTILE_SITE_KEY__ === "undefined") window.__TURNSTILE_SITE_KEY__ = "";

  var SUPABASE_URL = window.__SUPABASE_URL__;
  var SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__;
  var TURNSTILE_SITE_KEY = (window.__TURNSTILE_SITE_KEY__ || "").trim();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase config missing. Copy config.example.js to config.js and add your project URL and anon key.");
    renderAuthUI(null, null);
    return;
  }

  var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function renderAuthUI(user, client) {
    var container = document.getElementById("auth-ui");
    if (!container) return;
    var sb = client || supabase;

    if (user) {
      var name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Signed in";
      container.innerHTML =
        '<span class="auth-user">' + escapeHtml(name) + "</span> " +
        '<button type="button" class="btn secondary-btn auth-sign-out" aria-label="Sign out">Sign out</button>';
      container.querySelector(".auth-sign-out").addEventListener("click", function () {
        if (sb) sb.auth.signOut().then(function () { window.location.reload(); });
      });
    } else {
      container.innerHTML =
        '<button type="button" class="btn primary-btn auth-sign-in-google" aria-label="Sign in with Google">Sign in with Google</button>';
      container.querySelector(".auth-sign-in-google").addEventListener("click", function () {
        if (!sb) {
          console.error("Sign-in failed: Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel.");
          return;
        }
        sb.auth.signInWithOAuth({ provider: "google" });
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

  function initComments() {
    var listEl = document.getElementById("comments-list");
    var formEl = document.getElementById("comment-form");
    var textarea = document.getElementById("comment-body");
    var submitBtn = document.getElementById("comment-submit");

    if (!listEl) return;

    var turnstileWidgetId = null;
    var turnstileToken = null;

    if (!TURNSTILE_SITE_KEY) {
      var tw = document.getElementById("turnstile-widget");
      if (tw) tw.style.display = "none";
    }

    function initTurnstile() {
      if (!TURNSTILE_SITE_KEY || typeof window.turnstile !== "object") return;
      var container = document.getElementById("turnstile-widget");
      if (!container || container.children.length > 0) return;
      try {
        turnstileWidgetId = window.turnstile.render(container, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "light",
          callback: function (token) {
            turnstileToken = token;
          },
          "expired-callback": function () {
            turnstileToken = null;
          },
          "error-callback": function () {
            turnstileToken = null;
          }
        });
      } catch (err) {
        console.warn("Turnstile render failed", err);
      }
    }

    function tryInitTurnstile(attempt) {
      attempt = attempt || 0;
      if (window.turnstile && TURNSTILE_SITE_KEY) {
        initTurnstile();
        return;
      }
      if (attempt < 50) setTimeout(function () { tryInitTurnstile(attempt + 1); }, 100);
    }

    tryInitTurnstile();

    function escapeText(str) {
      if (!str) return "";
      var d = document.createElement("div");
      d.textContent = str;
      return d.innerHTML;
    }

    function linkify(str) {
      var urlRe = /(https?:\/\/[^\s]+)/gi;
      return escapeText(str).replace(urlRe, function (url) {
        return '<a href="' + escapeText(url) + '" target="_blank" rel="noopener noreferrer">' + escapeText(url) + "</a>";
      });
    }

    function getFirstUrl(str) {
      var match = (str || "").match(/(https?:\/\/[^\s]+)/i);
      return match ? match[1].replace(/[.,;:!?)]+$/, "") : null;
    }

    function fetchLinkPreview(url, container) {
      var apiUrl = "https://api.microlink.io?url=" + encodeURIComponent(url) + "&screenshot=false";
      fetch(apiUrl)
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res || !res.data || !container) return;
          var wrap = container.querySelector(".link-preview");
          if (!wrap) return;
          var data = res.data;
          var imgUrl = data.image;
          if (imgUrl && typeof imgUrl === "object" && imgUrl.url) imgUrl = imgUrl.url;
          if (typeof imgUrl === "string" && imgUrl) {
            var img = document.createElement("img");
            img.className = "link-preview-img";
            img.src = imgUrl;
            img.alt = "";
            img.loading = "lazy";
            wrap.insertBefore(img, wrap.firstChild);
          }
          var titleEl = wrap.querySelector(".link-preview-title");
          var descEl = wrap.querySelector(".link-preview-desc");
          if (titleEl && data.title) titleEl.textContent = data.title;
          if (descEl && data.description) descEl.textContent = data.description;
        })
        .catch(function () {});
    }

    function renderComments(comments) {
      listEl.innerHTML = "";
      if (!comments || comments.length === 0) {
        listEl.innerHTML = "<p class=\"comments-empty\">No comments yet.</p>";
        return;
      }
      function formatCommentDate(iso) {
        if (!iso) return { date: "", time: "" };
        var d = new Date(iso);
        var dateStr = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
        var timeStr = d.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit", hour12: true }) + " EST";
        return { date: dateStr, time: timeStr };
      }

      comments.forEach(function (c) {
        var item = document.createElement("div");
        item.className = "comment-item";
        var name = escapeText(c.author_name || "Anonymous");
        var bodyHtml = linkify(c.body || "");
        var formatted = formatCommentDate(c.created_at);
        var firstUrl = getFirstUrl(c.body);
        var linkPreviewHtml = firstUrl
          ? '<a class="link-preview" href="' + escapeText(firstUrl) + '" target="_blank" rel="noopener noreferrer">' +
            '<span class="link-preview-content"><span class="link-preview-title"></span><span class="link-preview-desc"></span></span></a>'
          : "";
        var metaLabel = escapeText(formatted.date) + " · " + escapeText(formatted.time);
        item.innerHTML =
          "<div class=\"comment-content\">" +
          "<p class=\"comment-body\">" + bodyHtml + "</p>" +
          "<span class=\"comment-meta\">" +
          "<strong class=\"comment-author\">" + name + "</strong> · " +
          "<span class=\"comment-meta-label\">" + metaLabel + "</span>" +
          "</span>" +
          "</div>" +
          linkPreviewHtml;
        listEl.appendChild(item);
        if (firstUrl) fetchLinkPreview(firstUrl, item);
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

        if (TURNSTILE_SITE_KEY && !turnstileToken) {
          return;
        }

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
              if (TURNSTILE_SITE_KEY && turnstileWidgetId != null && window.turnstile) {
                try {
                  window.turnstile.reset(turnstileWidgetId);
                } catch (r) {}
                turnstileToken = null;
              }
              loadComments();
            });
        });
      });
    }
  }

  function updateCommentFormVisibility() {
    supabase.auth.getSession().then(function (_ref5) {
      var session = _ref5.data.session;
      var textarea = document.getElementById("comment-body");
      var submitBtn = document.getElementById("comment-submit");
      var signedIn = !!(session && session.user);
      if (textarea) textarea.disabled = !signedIn;
      if (submitBtn) submitBtn.disabled = !signedIn;
    });
  }

  initAuth();

  document.addEventListener("DOMContentLoaded", function () {
    updateCommentFormVisibility();
    supabase.auth.onAuthStateChange(function (_event, session) {
      updateCommentFormVisibility();
    });
    initComments();
  });
})();
