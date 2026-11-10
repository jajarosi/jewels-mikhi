// Pinat kodesh — paracha de la semaine, horaires de Chabbat (API Hebcal) et
// phrase de moussar du jour. Tout est recalculé à chaque visite : la paracha
// et les horaires suivent la semaine en cours, et basculent sur la semaine
// suivante dès la sortie de Chabbat.
(function () {
  "use strict";

  const root = document.getElementById("kadosh");
  if (!root) return;

  const $ = (id) => document.getElementById(id);
  const CITY_KEY = "kadoshCity";
  const DEFAULT_CITY = "281184"; // Jérusalem

  // --- Phrases de moussar (une par jour, en rotation) ----------------------
  const QUOTES = [
    ["איזהו עשיר? השמח בחלקו", "פרקי אבות ד, א"],
    ["איזהו חכם? הלומד מכל אדם", "פרקי אבות ד, א"],
    ["איזהו גיבור? הכובש את יצרו", "פרקי אבות ד, א"],
    ["אם אין אני לי, מי לי? וכשאני לעצמי, מה אני? ואם לא עכשיו, אימתי?", "פרקי אבות א, יד"],
    ["הוי מקבל את כל האדם בסבר פנים יפות", "פרקי אבות א, טו"],
    ["אמור מעט ועשה הרבה", "פרקי אבות א, טו"],
    ["לא המדרש הוא העיקר, אלא המעשה", "פרקי אבות א, יז"],
    ["אל תדין את חברך עד שתגיע למקומו", "פרקי אבות ב, ד"],
    ["לא עליך המלאכה לגמור, ולא אתה בן חורין להיבטל ממנה", "פרקי אבות ב, טז"],
    ["דע מאין באת ולאן אתה הולך", "פרקי אבות ג, א"],
    ["הוי מקדים בשלום כל אדם", "פרקי אבות ד, טו"],
    ["אל תסתכל בקנקן, אלא במה שיש בו", "פרקי אבות ד, כ"],
    ["לפום צערא אגרא", "פרקי אבות ה, כג"],
    ["ואהבת לרעך כמוך", "ויקרא יט, יח"],
    ["מצוה גדולה להיות בשמחה תמיד", "רבי נחמן מברסלב"],
    ["כל העולם כולו גשר צר מאוד, והעיקר לא לפחד כלל", "רבי נחמן מברסלב"],
    ["תחשוב טוב – יהיה טוב", "הצמח צדק"],
  ];

  function dayIndex(d) {
    const start = Date.UTC(d.getFullYear(), 0, 0);
    const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.floor((now - start) / 86400000) + d.getFullYear() * 366;
  }

  function renderQuote() {
    const [text, src] = QUOTES[dayIndex(new Date()) % QUOTES.length];
    $("kadoshQuoteText").textContent = `״${text}״`;
    $("kadoshQuoteSrc").textContent = src;
  }

  // --- Date hébraïque en lettres (ל׳ בחשוון תשפ״ז) -------------------------
  function gematria(n) {
    const letters = [
      [400, "ת"], [300, "ש"], [200, "ר"], [100, "ק"], [90, "צ"], [80, "פ"],
      [70, "ע"], [60, "ס"], [50, "נ"], [40, "מ"], [30, "ל"], [20, "כ"],
      [10, "י"], [9, "ט"], [8, "ח"], [7, "ז"], [6, "ו"], [5, "ה"], [4, "ד"],
      [3, "ג"], [2, "ב"], [1, "א"],
    ];
    let out = "";
    while (n > 0) {
      if (n === 15) { out += "טו"; break; }
      if (n === 16) { out += "טז"; break; }
      const [v, l] = letters.find(([v]) => v <= n);
      out += l;
      n -= v;
    }
    return out.length === 1 ? out + "׳" : out.slice(0, -1) + "״" + out.slice(-1);
  }

  function renderHebrewDate() {
    try {
      const parts = new Intl.DateTimeFormat("he-u-ca-hebrew", {
        day: "numeric", month: "long", year: "numeric",
      }).formatToParts(new Date());
      const get = (t) => (parts.find((p) => p.type === t) || {}).value;
      const day = parseInt(get("day"), 10);
      const year = parseInt(get("year"), 10);
      const month = get("month");
      if (!day || !year || !month) return;
      $("kadoshHdate").textContent = `${gematria(day)} ${month} ${gematria(year % 1000)}`;
    } catch (_) {
      /* navigateur sans calendrier hébraïque : on n'affiche pas la date */
    }
  }

  // --- Paracha + horaires (Hebcal) ------------------------------------------
  function getCity() {
    try {
      const v = localStorage.getItem(CITY_KEY);
      if (v && $("kadoshCity").querySelector(`option[value="${v}"]`)) return v;
    } catch (_) {}
    return DEFAULT_CITY;
  }

  function saveCity(v) {
    try { localStorage.setItem(CITY_KEY, v); } catch (_) {}
  }

  // --- Calendrier (Hebcal) ---------------------------------------------------
  // Un seul appel couvre hier → J+9 : paracha, allumage / havdala (Chabbat ET
  // fêtes), fêtes, Roch 'Hodech, bougies de 'Hanouka. Rechargé à chaque visite,
  // donc tout suit la semaine en cours sans intervention.
  const TZ = "Asia/Jerusalem";
  let events = [];

  const dayStr = (d) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    }).format(d);
  const shiftDay = (s, n) => {
    const d = new Date(s + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const weekday = (s) => new Date(s + "T12:00:00Z").getUTCDay();
  const dayOf = (i) => i.date.slice(0, 10);
  const at = (i) => new Date(i.date);
  // "2026-11-13T16:00:00+02:00" → "16:00" (heure locale de la ville)
  const hhmm = (iso) => (iso && iso.length >= 16 ? iso.slice(11, 16) : "--:--");

  async function fetchEvents(geonameid) {
    const today = dayStr(new Date());
    const params = new URLSearchParams({
      v: "1", cfg: "json", lg: "he", i: "on",
      maj: "on", min: "on", mod: "off", nx: "off", ss: "off", mf: "off",
      s: "on", c: "on", geonameid,
      start: shiftDay(today, -1), end: shiftDay(today, 9),
    });
    const res = await fetch(`https://www.hebcal.com/hebcal?${params}`);
    if (!res.ok) throw new Error(`Hebcal ${res.status}`);
    const data = await res.json();
    return data.items || [];
  }

  // Prochain Chabbat (bascule sur la semaine suivante dès la havdala).
  function renderWeek(now) {
    const hav = events.find(
      (i) => i.category === "havdalah" && weekday(dayOf(i)) === 6 && at(i) > now
    );
    if (!hav) {
      root.classList.add("kadosh--offline");
      return;
    }
    const sat = dayOf(hav);
    const fri = shiftDay(sat, -1);
    const candles = events.find((i) => i.category === "candles" && dayOf(i) === fri);
    const parasha = events.find((i) => i.category === "parashat" && i.date === sat);
    // Chabbat de fête sans paracha (ex. Pessah) : on affiche le nom de la fête.
    const holiday = events.find(
      (i) => i.category === "holiday" && i.date === sat && i.subcat === "major"
    );

    $("kadoshParasha").textContent =
      (parasha && parasha.title) || (holiday && holiday.title) || "שבת שלום";
    $("kadoshCandles").textContent = hhmm(candles && candles.date);
    $("kadoshHavdalah").textContent = hhmm(hav.date);
    root.classList.remove("kadosh--offline");

    const today = dayStr(now);
    root.classList.toggle("kadosh--shabbat", today === fri || today === sat);
  }

  // --- Messages de fête ------------------------------------------------------
  function greetingFor(i) {
    const t = i.title_orig || "";
    const he = i.hebrew || i.title;

    if (i.category === "roshchodesh") return ["חודש טוב", he];
    if (i.category !== "holiday") return null;

    if (/^Chanukah: \d Candles?$/.test(t)) {
      return ["חנוכה שמח", `הדלקה הערב: ${he.replace(/^חנוכה:\s*/, "")} · ${hhmm(i.date)}`];
    }
    if (t === "Chanukah: 8th Day") return ["חנוכה שמח", "זאת חנוכה"];
    if (/Tish'a B'Av/.test(t)) return null; // pas de vœux le 9 Av
    if (i.subcat === "fast") return ["צום קל ומועיל", he];
    if (/LaBehemot|Katan|Sheni/.test(t)) return null;
    if (/Rosh Hashana/.test(t)) return ["שנה טובה ומתוקה", he];
    if (/Yom Kippur/.test(t)) return ["גמר חתימה טובה", he];
    if (/Purim/.test(t)) return ["פורים שמח", he];
    if (/CH''M/.test(t)) return ["מועדים לשמחה", he];
    if (/^Erev Pesach/.test(t)) return ["חג כשר ושמח", he];
    if (/Pesach|Sukkot|Shmini Atzeret|Simchat Torah|Shavuot/.test(t)) return ["חג שמח", he];
    if (/^(Tu BiShvat|Lag BaOmer|Tu B'Av)$/.test(t)) return [`${he} שמח`, ""];
    return null;
  }

  function renderGreetings(now) {
    const today = dayStr(now);
    const box = $("kadoshFest");
    box.textContent = "";
    const seen = new Set();
    events
      .filter((i) => dayOf(i) === today)
      .map(greetingFor)
      .filter((g) => g && !seen.has(g[0] + g[1]) && seen.add(g[0] + g[1]))
      .slice(0, 2)
      .forEach(([greet, sub]) => {
        const item = document.createElement("div");
        item.className = "kadosh-fest-item";
        const strong = document.createElement("strong");
        strong.textContent = greet;
        item.appendChild(strong);
        if (sub) {
          const span = document.createElement("span");
          span.textContent = sub;
          item.appendChild(span);
        }
        box.appendChild(item);
      });
    box.hidden = !box.children.length;
  }

  // --- Site fermé pendant Chabbat et les fêtes ------------------------------
  // Fermé entre un allumage et la havdala qui le suit (couvre aussi les fêtes
  // de deux jours et une fête qui enchaîne sur Chabbat).
  function closingEnd(now) {
    const lit = events.filter((i) => i.category === "candles" && at(i) <= now).pop();
    if (!lit) return null;
    const end = events.find((i) => i.category === "havdalah" && at(i) > at(lit));
    return end && at(end) > now ? end : null;
  }

  function renderClosure(now) {
    const end = closingEnd(now);
    document.body.classList.toggle("site-closed", !!end);
    const panel = $("shabbatClosed");
    if (!panel) return;
    panel.hidden = !end;
    if (!end) return;

    const isShabbat = weekday(dayOf(end)) === 6;
    const fest = $("kadoshFest").querySelector("strong");
    $("closedKicker").textContent = isShabbat ? "שבת שלום" : (fest ? fest.textContent : "חג שמח");
    $("closedTitle").textContent = isShabbat ? "האתר שומר שבת" : "האתר סגור לרגל החג";
    $("closedText").textContent =
      `נשמח לעמוד לשירותכם ${isShabbat ? "במוצאי שבת" : "במוצאי החג"}, החל מהשעה ${hhmm(end.date)}.`;
  }

  function renderAll() {
    const now = new Date();
    renderWeek(now);
    renderGreetings(now);
    renderClosure(now);
  }

  async function load() {
    try {
      events = await fetchEvents($("kadoshCity").value);
      renderAll();
    } catch (err) {
      console.error("[Kadosh] Hebcal indisponible :", err);
      // On garde la phrase et la date ; horaires masqués, site laissé ouvert.
      events = [];
      root.classList.add("kadosh--offline");
      $("kadoshFest").hidden = true;
      renderClosure(new Date());
    }
  }

  const select = $("kadoshCity");
  select.value = getCity();
  select.addEventListener("change", () => {
    saveCity(select.value);
    load();
  });

  renderQuote();
  renderHebrewDate();
  load();
  // Page restée ouverte : on réévalue chaque minute (entrée / sortie de Chabbat).
  setInterval(renderAll, 60 * 1000);
})();
