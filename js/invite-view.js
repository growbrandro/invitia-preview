(function () {
  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({
      "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;"
    }[c]));
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
  function isDark(t) { return t === "modern" || t === "luxury"; }

  function loadData() {
    const q = new URLSearchParams(location.search);
    if (q.get("preview") === "1") {
      try { return JSON.parse(sessionStorage.getItem("invitia_preview") || "null"); } catch { return null; }
    }
    const id = q.get("id");
    if (id && window.Invitia) return window.Invitia.getInvite(id);
    return null;
  }

  function demo() {
    return {
      template: "classic",
      eventType: "nunta",
      titleLine: "Cu drag vă invităm",
      names: "Elena & Andrei",
      date: "2027-06-12",
      time: "16:00",
      venue: "Conacul din Vii",
      city: "Prahova",
      address: "Str. Vieilor 12",
      mapsUrl: "",
      message: "Alături de familiile noastre, vă așteptăm să sărbătorim începutul unei povești care începe cu voi alături.",
      schedule: "16:00 Cununia religioasă\n18:00 Recepția\n00:00 Tortul",
      rsvpLabel: "Confirmă prezența",
      rsvpPhone: "07xx xxx xxx",
      videoUrl: "",
      dresscode: "Elegant",
      published: true,
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const data = loadData() || demo();
    document.body.classList.toggle("bg-ink", isDark(data.template));
    const shell = document.getElementById("invite-shell");
    if (shell) shell.className = "min-h-screen " + templateClass(data.template);

    document.getElementById("i-title").textContent = data.titleLine || "";
    document.getElementById("i-names").textContent = data.names || "";
    document.getElementById("i-date").textContent = formatDateRO(data.date);
    document.getElementById("i-time").textContent = data.time || "";
    document.getElementById("i-venue").textContent = data.venue || "";
    document.getElementById("i-city").textContent = [data.address, data.city].filter(Boolean).join(" · ");
    document.getElementById("i-message").textContent = data.message || "";
    document.getElementById("i-dress").textContent = data.dresscode ? "Dress code: " + data.dresscode : "";

    const sched = document.getElementById("i-schedule");
    if (sched) {
      sched.innerHTML = (data.schedule || "")
        .split("\n")
        .filter(Boolean)
        .map((l) => "<li>" + escapeHtml(l) + "</li>")
        .join("");
    }

    const maps = document.getElementById("i-maps");
    if (maps) {
      if (data.mapsUrl) {
        maps.href = data.mapsUrl;
        maps.classList.remove("hidden");
      } else if (data.venue || data.city) {
        maps.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((data.venue || "") + " " + (data.city || ""));
        maps.classList.remove("hidden");
      }
    }

    const rsvp = document.getElementById("i-rsvp");
    if (rsvp) {
      const label = data.rsvpLabel || "Confirmă prezența";
      if (data.rsvpPhone) {
        rsvp.href = "https://wa.me/" + String(data.rsvpPhone).replace(/\D/g, "");
        rsvp.textContent = label + " pe WhatsApp";
      } else {
        rsvp.href = "#form-rsvp";
        rsvp.textContent = label;
      }
    }

    const videoMount = document.getElementById("i-video");
    const videoSection = document.getElementById("video-section");
    if (data.videoUrl && window.InvitiaVideo && videoMount) {
      const parsed = window.InvitiaVideo.parseCloudVideo(data.videoUrl);
      if (parsed && !parsed.error) {
        videoSection?.classList.remove("hidden");
        videoMount.innerHTML = window.InvitiaVideo.renderPlayer(parsed);
      }
    }

    document.getElementById("form-rsvp")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const box = document.getElementById("rsvp-ok");
      if (box) box.classList.remove("hidden");
      e.target.reset();
    });
  });
})();
