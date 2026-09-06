(function () {
  const KEY_USER = "invitia_user";
  const KEY_INVITES = "invitia_invites";

  function uid() {
    return "inv_" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(KEY_USER) || "null"); } catch { return null; }
  }
  function setUser(u) { localStorage.setItem(KEY_USER, JSON.stringify(u)); }

  function allInvites() {
    try { return JSON.parse(localStorage.getItem(KEY_INVITES) || "[]"); } catch { return []; }
  }
  function saveInvites(list) { localStorage.setItem(KEY_INVITES, JSON.stringify(list)); }

  function myInvites() {
    const u = getUser();
    if (!u) return [];
    return allInvites().filter((i) => i.owner === u.email);
  }

  function getInvite(id) {
    return allInvites().find((i) => i.id === id) || null;
  }

  function upsertInvite(data) {
    const list = allInvites();
    const idx = list.findIndex((i) => i.id === data.id);
    data.updatedAt = new Date().toISOString();
    if (idx >= 0) list[idx] = data;
    else {
      data.createdAt = data.createdAt || new Date().toISOString();
      list.push(data);
    }
    saveInvites(list);
    return data;
  }

  function defaultInvite() {
    return {
      id: uid(),
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
      message: "Alături de familiile noastre, vă așteptăm să sărbătorim începutul unei povești.",
      schedule: "16:00 Cununia religioasă\n18:00 Recepția\n00:00 Tortul",
      rsvpLabel: "Confirmă prezența",
      rsvpPhone: "",
      videoUrl: "",
      musicNote: "",
      dresscode: "Elegant",
      published: false,
      owner: (getUser() && getUser().email) || "guest",
    };
  }

  window.Invitia = {
    uid, getUser, setUser, allInvites, myInvites, getInvite, upsertInvite, defaultInvite,
    logout() { localStorage.removeItem(KEY_USER); },
  };

  document.querySelectorAll("[data-mobile-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("mobile-nav")?.classList.toggle("hidden");
    });
  });
})();
