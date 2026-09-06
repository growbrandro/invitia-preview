(function (global) {
  function extractDriveId(url) {
    const patterns = [
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  function parseCloudVideo(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return null;
    const url = rawUrl.trim();
    if (!url) return null;

    if (/drive\.google\.com|docs\.google\.com/.test(url)) {
      const id = extractDriveId(url);
      if (!id) return { error: "Linkul Google Drive nu conține un ID valid." };
      return {
        provider: "gdrive",
        type: "iframe",
        src: "https://drive.google.com/file/d/" + id + "/preview",
        note: "Asigură-te că fișierul e partajat: Oricine are linkul → Vizualizator.",
      };
    }

    if (/dropbox\.com|dropboxusercontent\.com/.test(url)) {
      let src = url
        .replace("www.dropbox.com", "dl.dropboxusercontent.com")
        .replace("?dl=0", "?raw=1")
        .replace("&dl=0", "&raw=1")
        .replace("?dl=1", "?raw=1")
        .replace("&dl=1", "&raw=1");
      if (!/[?&]raw=1/.test(src) && /dropbox/.test(src)) {
        src += (src.includes("?") ? "&" : "?") + "raw=1";
      }
      return {
        provider: "dropbox",
        type: "video",
        src,
        note: "Linkul trebuie să fie public (Anyone with the link).",
      };
    }

    if (/mega\.nz/.test(url)) {
      let src = url;
      src = src.replace("/file/", "/embed/");
      src = src.replace("/#!", "/embed/");
      if (!/\/embed\//.test(src) && /mega\.nz\/[#!]/.test(src)) {
        src = src.replace("mega.nz/", "mega.nz/embed/");
      }
      return {
        provider: "mega",
        type: "iframe",
        src,
        note: "Mega oferă player propriu. Folosește linkul de fișier sau Embed code.",
      };
    }

    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/);
    if (yt) {
      return {
        provider: "youtube",
        type: "iframe",
        src: "https://www.youtube.com/embed/" + yt[1] + "?rel=0",
      };
    }
    const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) {
      return {
        provider: "vimeo",
        type: "iframe",
        src: "https://player.vimeo.com/video/" + vm[1],
      };
    }

    return { error: "Serviciu nesuportat. Folosește Google Drive, Dropbox, Mega, YouTube sau Vimeo." };
  }

  function renderPlayer(parsed, options) {
    options = options || {};
    const wrapClass = options.wrapClass || "relative w-full overflow-hidden rounded-xl bg-black";
    const ratio = options.ratio || "56.25%";
    if (!parsed || parsed.error) {
      return '<div class="p-4 text-sm text-red-700 bg-red-50 rounded-xl">' +
        (parsed && parsed.error ? parsed.error : "Link invalid") + "</div>";
    }
    if (parsed.type === "video") {
      return (
        '<div class="' + wrapClass + '" style="padding-bottom:' + ratio + ';height:0;">' +
        '<video class="absolute inset-0 w-full h-full object-contain bg-black" controls playsinline preload="metadata">' +
        '<source src="' + parsed.src.replace(/"/g, "") + '" type="video/mp4">' +
        "Browserul nu poate reda videoclipul." +
        "</video></div>"
      );
    }
    return (
      '<div class="' + wrapClass + '" style="padding-bottom:' + ratio + ';height:0;">' +
      '<iframe class="absolute inset-0 w-full h-full" src="' + parsed.src.replace(/"/g, "") +
      '" allow="autoplay; fullscreen; encrypted-media" allowfullscreen loading="lazy" title="Video eveniment"></iframe>' +
      "</div>"
    );
  }

  global.InvitiaVideo = { parseCloudVideo, renderPlayer };
})(window);
