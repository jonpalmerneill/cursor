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

    var ALLOWED_FONTS = ["Work Sans", "Open Sans", "Lora", "Merriweather", "Playfair Display", "Roboto", "Source Sans 3", "Inter", "Poppins", "Nunito"];
    var loadedFonts = { "Work Sans": true };

    function ensureGoogleFontLoaded(fontFamily) {
      if (!fontFamily || loadedFonts[fontFamily]) return;
      if (ALLOWED_FONTS.indexOf(fontFamily) === -1) return;
      loadedFonts[fontFamily] = true;
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(fontFamily).replace(/%20/g, "+") + ":wght@400;600;700&display=swap";
      document.head.appendChild(link);
    }

    function luminanceHex(hex) {
      var m = hex.replace(/^#/, "").match(/(.{2})/g);
      if (!m || (m.length !== 3 && m.length !== 1)) return 0.5;
      if (m.length === 1) m = [m[0] + m[0], m[0] + m[0], m[0] + m[0]];
      var r = parseInt(m[0], 16) / 255, g = parseInt(m[1], 16) / 255, b = parseInt(m[2], 16) / 255;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

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
        if (c.background_color && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(c.background_color)) {
          item.classList.add("comment-item-custom");
          item.style.backgroundColor = c.background_color;
          item.style.color = luminanceHex(c.background_color) > 0.5 ? "#0a0a0a" : "#fff";
        }
        if (c.font_family && ALLOWED_FONTS.indexOf(c.font_family) !== -1) {
          ensureGoogleFontLoaded(c.font_family);
          item.style.fontFamily = '"' + c.font_family.replace(/"/g, "") + '", sans-serif';
        }
        var name = escapeText(c.author_name || "Anonymous");
        var bodyHtml = linkify(c.body || "");
        var formatted = formatCommentDate(c.created_at);
        var firstUrl = getFirstUrl(c.body);
        var linkPreviewHtml = firstUrl
          ? '<a class="link-preview" href="' + escapeText(firstUrl) + '" target="_blank" rel="noopener noreferrer"></a>'
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
      var Motion = window.Motion;
      if (Motion && Motion.animate) {
        var items = listEl.querySelectorAll(".comment-item");
        if (items.length) {
          var opts = { duration: 0.45, ease: "easeOut" };
          if (Motion.stagger) opts.delay = Motion.stagger(0.06, { start: 0 });
          Motion.animate(items, { opacity: [0, 1], y: [24, 0] }, opts);
        }
      }
    }

    function loadComments() {
      function onResult(_ref2) {
        var data = _ref2.data;
        var err = _ref2.error;
        if (err) return err;
        renderComments(data || []);
        return null;
      }

      supabase
        .from("comments")
        .select("id, author_name, body, created_at, background_color, font_family")
        .order("created_at", { ascending: false })
        .then(function (ref) {
          var err = onResult(ref);
          if (!err) return;
          var msg = (err.message || "").toLowerCase();
          var isColumnError = err.code === "42703" || msg.indexOf("column") !== -1 || msg.indexOf("background_color") !== -1 || msg.indexOf("font_family") !== -1;
          if (isColumnError) {
            supabase
              .from("comments")
              .select("id, author_name, body, created_at")
              .order("created_at", { ascending: false })
              .then(function (ref2) {
                if (ref2.error) {
                  listEl.innerHTML = "<p class=\"comments-error\">Could not load comments.</p>";
                  return;
                }
                renderComments(ref2.data || []);
              });
            return;
          }
          listEl.innerHTML = "<p class=\"comments-error\">Could not load comments.</p>";
        });
    }

    loadComments();

    var bgColorEl = document.getElementById("comment-bg-color");
    var fontEl = document.getElementById("comment-font");

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

        var bgColor = (bgColorEl && bgColorEl.value) ? bgColorEl.value : null;
        var fontFamily = (fontEl && fontEl.value && ALLOWED_FONTS.indexOf(fontEl.value) !== -1) ? fontEl.value : null;
        if (bgColor && !/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(bgColor)) bgColor = null;

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

          var payload = {
            user_id: user.id,
            author_name: authorName,
            author_avatar_url: authorAvatar,
            body: body,
            section_id: "main"
          };
          if (bgColor) payload.background_color = bgColor;
          if (fontFamily) payload.font_family = fontFamily;

          supabase
            .from("comments")
            .insert(payload)
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
      var signedIn = !!(session && session.user);
      var formEl = document.getElementById("comment-form");
      var textarea = document.getElementById("comment-body");
      var submitBtn = document.getElementById("comment-submit");
      if (textarea) textarea.disabled = !signedIn;
      if (submitBtn) submitBtn.disabled = !signedIn;
      if (!formEl) return;
      var Motion = window.Motion;
      if (signedIn) {
        formEl.style.display = "flex";
        formEl.style.opacity = "0";
        formEl.style.transform = "translateY(8px)";
        if (Motion && Motion.animate) {
          Motion.animate(formEl, { opacity: 1, y: 0 }, { duration: 0.35, ease: "easeOut" });
        } else {
          formEl.style.opacity = "1";
          formEl.style.transform = "";
        }
      } else {
        if (Motion && Motion.animate) {
          Motion.animate(formEl, { opacity: 0, y: -6 }, { duration: 0.2, ease: "easeIn" }).then(function () {
            formEl.style.display = "none";
            formEl.style.opacity = "";
            formEl.style.transform = "";
          });
        } else {
          formEl.style.display = "none";
        }
      }
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
