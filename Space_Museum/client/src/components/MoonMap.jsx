import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MoonMap.css";
import { AGENCY_COLORS, AGENCY_NAMES, MAP_CREDITS, MAP_TILES, MOON_TIMELINE } from "../data/moonTimeline";

const WORLD = L.latLngBounds([-90, -180], [90, 180]);

function formatDate(item) {
  if (!item.date) return item.label ?? "";
  return new Date(`${item.date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatCoords(site) {
  const lat = `${Math.abs(site.lat).toFixed(2)}° ${site.lat >= 0 ? "N" : "S"}`;
  const lon = `${Math.abs(site.lon).toFixed(2)}° ${site.lon >= 0 ? "E" : "W"}`;
  return `${lat}, ${lon}`;
}

function yearOf(item) {
  return item.date ? item.date.slice(0, 4) : item.label;
}

function MoonMap({ onClose }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const markers = useRef({});
  const trackRef = useRef(null);
  const itemRefs = useRef({});
  const firstRun = useRef(true);
  const closeBtn = useRef(null);

  const [selectedId, setSelectedId] = useState("apollo-11");
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | nasa | fallback

  const index = useMemo(() => MOON_TIMELINE.findIndex((m) => m.id === selectedId), [selectedId]);
  const item = MOON_TIMELINE[index];
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const select = useCallback((id) => setSelectedId(id), []);
  const step = useCallback(
    (dir) => {
      const n = MOON_TIMELINE.length;
      setSelectedId(MOON_TIMELINE[(index + dir + n) % n].id);
    },
    [index]
  );

  /* page behaviour: lock the page behind, close with Escape */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  /* build the map once */
  useEffect(() => {
    const el = mapEl.current;
    const map = L.map(el, {
      crs: L.CRS.EPSG4326, // the Moon map is a flat lat/long (equirectangular) picture
      zoomSnap: 0.25,
      maxBoundsViscosity: 1,
      worldCopyJump: false,
      attributionControl: true,
    });
    mapRef.current = map;
    map.fitBounds(WORLD);
    map.setMinZoom(map.getZoom());
    map.setMaxZoom(7);
    map.setMaxBounds(WORLD);

    // real NASA imagery: LRO Wide Angle Camera mosaic from NASA Moon Trek
    const nasa = L.tileLayer(MAP_TILES.url, {
      tileSize: 256,
      noWrap: true,
      bounds: WORLD,
      minZoom: 0,
      maxNativeZoom: 5,
      maxZoom: 7,
      attribution: MAP_TILES.attribution,
    }).addTo(map);

    let loaded = 0;
    let failed = 0;
    let fellBack = false;
    nasa.on("tileload", () => {
      loaded += 1;
      if (loaded === 1) setStatus("nasa");
    });
    nasa.on("tileerror", () => {
      failed += 1;
      // if no NASA tile ever arrives (offline, or the server is down), use the Moon photo bundled with the site
      if (!loaded && failed >= 3 && !fellBack) {
        fellBack = true;
        L.imageOverlay(MAP_TILES.fallbackImage, WORLD).addTo(map);
        setStatus("fallback");
      }
    });

    // one pin per landing site
    MOON_TIMELINE.forEach((m) => {
      if (!m.site) return;
      const icon = L.divIcon({
        className: "mm-pin-wrap",
        html: `<span class="mm-pin" style="--c:${AGENCY_COLORS[m.agency]}"></span>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      const marker = L.marker([m.site.lat, m.site.lon], { icon, title: m.name, riseOnHover: true }).addTo(map);
      marker.bindTooltip(`${m.name} · ${yearOf(m)}`, { direction: "top", offset: [0, -10] });
      marker.on("click", () => select(m.id));
      markers.current[m.id] = marker;
    });

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    const t = setTimeout(() => map.invalidateSize(), 120);

    return () => {
      clearTimeout(t);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markers.current = {};
    };
  }, [select]);

  /* highlight the selected pin and glide to it */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.entries(markers.current).forEach(([id, m]) => {
      m.getElement()?.classList.toggle("is-active", id === selectedId);
      m.setZIndexOffset(id === selectedId ? 1000 : 0);
    });
    const it = MOON_TIMELINE.find((m) => m.id === selectedId);
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (it?.site) {
      const zoom = Math.max(map.getZoom(), 3);
      if (reduce) map.setView([it.site.lat, it.site.lon], zoom);
      else map.flyTo([it.site.lat, it.site.lon], zoom, { duration: 1.1 });
    }
  }, [selectedId, reduce]);

  /* keep the chosen timeline stop in view */
  useEffect(() => {
    const track = trackRef.current;
    const node = itemRefs.current[selectedId];
    if (!track || !node) return;
    track.scrollTo({
      left: node.offsetLeft - track.clientWidth / 2 + node.clientWidth / 2,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [selectedId, reduce]);

  /* auto-play through history */
  useEffect(() => {
    if (!playing) return undefined;
    const id = setTimeout(() => {
      if (index >= MOON_TIMELINE.length - 1) setPlaying(false);
      else setSelectedId(MOON_TIMELINE[index + 1].id);
    }, 4500);
    return () => clearTimeout(id);
  }, [playing, index]);

  const togglePlay = () => {
    if (!playing && index >= MOON_TIMELINE.length - 1) setSelectedId(MOON_TIMELINE[0].id);
    setPlaying((p) => !p);
  };

  const statusText =
    status === "nasa"
      ? "NASA LRO MOON MOSAIC"
      : status === "fallback"
        ? "OFFLINE MOON PHOTO · NASA"
        : "LOADING NASA IMAGERY…";

  return (
    <div className="mm-overlay" role="dialog" aria-modal="true" aria-labelledby="mm-title">
      <div className="mm-stars" aria-hidden="true" />

      <div className="mm-inner">
        <div className="mm-top">
          <button type="button" className="mm-close" onClick={onClose} ref={closeBtn}>
            ← BACK TO EXPLORE
          </button>
          <span className="mm-crumb">SPACE MUSEUM / THE MOON / MAP</span>
        </div>

        <header className="mm-head">
          <p className="mm-eyebrow">SIXTY-SEVEN YEARS OF VISITORS</p>
          <h2 id="mm-title">
            THE <span>MOON MAP</span>
          </h2>
          <p className="mm-sub">
            Every pin is a place we reached. Pick a mission on the timeline, or tap a pin on the map. Drag to move
            around, scroll to zoom.
          </p>
        </header>

        <div className="mm-stage">
          <div className="mm-mapcard">
            <div className="mm-chip">{statusText}</div>
            <div className="mm-map" ref={mapEl} role="application" aria-label="Interactive map of the Moon" />
            <ul className="mm-legend" aria-label="Map legend">
              {Object.keys(AGENCY_COLORS).map((a) => (
                <li key={a}>
                  <span style={{ background: AGENCY_COLORS[a] }} />
                  {AGENCY_NAMES[a]}
                </li>
              ))}
            </ul>
          </div>

          <aside className="mm-detail" aria-live="polite" key={item.id}>
            <div className="mm-badges">
              <span className="mm-badge" style={{ "--c": AGENCY_COLORS[item.agency] }}>
                {AGENCY_NAMES[item.agency].toUpperCase()}
              </span>
              <span className="mm-badge mm-badge-ghost">{item.type.toUpperCase()}</span>
            </div>
            <p className="mm-date">{formatDate(item)}</p>
            <h3>{item.name.toUpperCase()}</h3>
            <p className="mm-text">{item.text}</p>
            {item.fact && <p className="mm-fact">{item.fact}</p>}

            <dl className="mm-meta">
              <div>
                <dt>SITE</dt>
                <dd>{item.site ? item.site.label : "No landing, seen from space"}</dd>
              </div>
              {item.site && (
                <div>
                  <dt>COORDINATES</dt>
                  <dd>{formatCoords(item.site)}</dd>
                </div>
              )}
            </dl>

            <a
              className="mm-link"
              href={`https://images.nasa.gov/search?q=${encodeURIComponent(item.search)}`}
              target="_blank"
              rel="noreferrer"
            >
              NASA PHOTOS &amp; VIDEO ↗
            </a>

            <div className="mm-controls">
              <button type="button" onClick={() => step(-1)} aria-label="Previous mission">
                ◂ PREV
              </button>
              <button type="button" className="mm-play" onClick={togglePlay} aria-pressed={playing}>
                {playing ? "❚❚ PAUSE" : "▶ PLAY TIMELINE"}
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next mission">
                NEXT ▸
              </button>
            </div>
          </aside>
        </div>

        <section className="mm-timeline" aria-label="Moon exploration timeline">
          <div className="mm-track" ref={trackRef}>
            <ol>
              {MOON_TIMELINE.map((m) => (
                <li key={m.id} ref={(n) => {
                    itemRefs.current[m.id] = n;
                  }}>
                  <button
                    type="button"
                    className={`mm-stop${m.id === selectedId ? " active" : ""}`}
                    onClick={() => {
                      setPlaying(false);
                      select(m.id);
                    }}
                    aria-current={m.id === selectedId ? "true" : undefined}
                    style={{ "--c": AGENCY_COLORS[m.agency] }}
                  >
                    <span className="mm-stop-year">{yearOf(m)}</span>
                    <span className="mm-stop-dot" />
                    <span className="mm-stop-name">{m.name}</span>
                    <span className="mm-stop-type">{m.type}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <p className="mm-note">
          Pin positions are approximate. Missions without a pin only orbited or flew past the Moon.
        </p>
        <footer className="mm-credits">
          <span>SOURCES</span>
          {MAP_CREDITS.map((c) => (
            <a key={c.label} href={c.url} target="_blank" rel="noreferrer">
              {c.label} ↗
            </a>
          ))}
          <p>NASA does not endorse this project.</p>
        </footer>
      </div>
    </div>
  );
}

export default MoonMap;
