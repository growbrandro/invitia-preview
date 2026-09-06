(function () {
  const params = new URLSearchParams(location.search);
  const editId = params.get("id");

  const state = editId && window.Invitia.getInvite(editId)
    ? { ...window.Invitia.getInvite(editId) }
    : window.Invitia.defaultInvite();

  const formIds = [
    "eventType", "template", "titleLine", "names", "date", "time",
    "venue", "city", "address", "mapsUrl", "message", "schedule",
    "rsvpLabel", "rsvpPhone", "videoUrl", "dresscode"
  ];

  function $(id) { return document.getElementById(id); }

  function bindForm() {
    formIds.forEach((k) => {
      const el = $(k);
      if (!el) return;
      if (state[k] != null) el.value = state[k];
      el.addEventListener("input", () => {
        state[k] = el.value;
        renderPreview();
      });
    });
  }

  function formatDateRO(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  function templateClass(t) {
    return {
      classic: "invite-classic",
      modern: "invite-modern",
      rustic: "invite-rustic",
      botez: "invite-botez",
      botanic: "invite-botanic",
      luxury: "invite-luxury",
    }[t] || "invite-classic";
  }

  function renderPreview() {
    const root = $("preview-card");
    if (!root) return;
    root.className = "invite-card " + templateClass(state.template);
    const dateNice = formatDateRO(state.date);
    const videoBlock = state.videoUrl
      ? '<div class="mt-3 text-[10px] tracking-widest uppercase opacity-80">▸ Video de la noi</div>'
      : "";

    root.innerHTML = `
      <div class="grain"></div>
      <div class="relative h-full flex flex-col items-center justify-between text-center px-5 py-8">
        <div>
          <div class="ornament font-display">✦</div>
          <p class="font-sans text-[10px] tracking-[0.28em] uppercase mt-3 opacity-80">${escapeHtml(state.titleLine || "")}</p>
        </div>
        <div>
          <h2 class="font-display text-[1.85rem] leading-tight">${escapeHtml(state.names || "")}</h2>
          <div class="gold-line w-16 mx-auto my-3"></div>
          <p class="font-sans text-xs capitalize">${escapeHtml(dateNice)}</p>
          <p class="font-sans text-xs mt-1">${escapeHtml(state.time || "")}</p>
        </div>
        <div class="font-sans text-[11px] leading-relaxed opacity-90">
          <p class="font-medium">${escapeHtml(state.venue || "")}</p>
          <p>${escapeHtml(state.city || "")}</p>
          ${videoBlock}
        </div>
      </div>`;

    const videoStatus = $("video-status");
    if (videoStatus) {
      if (!state.videoUrl) {
        videoStatus.innerHTML = '<span class="text-muted">Niciun video adăugat încă.</span>';
      } else {
        const parsed = window.InvitiaVideo.parseCloudVideo(state.videoUrl);
        if (parsed && parsed.error) {
          videoStatus.innerHTML = '<span class="text-red-700">' + parsed.error + "</span>";
        } else {
          videoStatus.innerHTML = '<span class="text-emerald-800">Video recunoscut: ' +
            (parsed.provider || "") + ". " + (parsed.note || "") + "</span>";
        }
      }
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function persist(publish) {
    const user = window.Invitia.getUser();
    if (!user) {
      sessionStorage.setItem("invitia_draft", JSON.stringify(state));
      location.href = "register.html?next=builder.html";
      return;
    }
    state.owner = user.email;
    if (publish) state.published = true;
    window.Invitia.upsertInvite(state);
    if (publish) {
      location.href = "dashboard.html?published=" + encodeURIComponent(state.id);
    } else {
      const toast = $("save-toast");
      if (toast) {
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 2200);
      }
    }
  }

  window.InvitiaBuilder = {
    state,
    saveDraft() { persist(false); },
    publish() { persist(true); },
    openFullPreview() {
      sessionStorage.setItem("invitia_preview", JSON.stringify(state));
      window.open("invitatie.html?preview=1", "_blank");
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const draft = sessionStorage.getItem("invitia_draft");
    if (draft && !editId) {
      try { Object.assign(state, JSON.parse(draft)); sessionStorage.removeItem("invitia_draft"); } catch {}
    }
    bindForm();
    renderPreview();
    $("btn-save")?.addEventListener("click", () => persist(false));
    $("btn-publish")?.addEventListener("click", () => persist(true));
    $("btn-preview")?.addEventListener("click", () => window.InvitiaBuilder.openFullPreview());
  });
})();
