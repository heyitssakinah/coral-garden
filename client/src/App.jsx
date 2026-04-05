import { useState, useEffect, useCallback } from "react";
import OceanDive from "./components/OceanDive";
import DrawingStudio from "./components/DrawingStudio";
import { ChevronDown } from "lucide-react";

// Total Z-depth of the ocean tunnel
const OCEAN_DEPTH = 8000;
// How many px of scroll maps to the full depth
const SCROLL_RANGE = 4000;

export default function App() {
  const [corals, setCorals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [viewportH, setViewportH] = useState(window.innerHeight);

  const fetchCorals = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/corals?page=${pageNum}&limit=50`);
      const data = await res.json();
      setCorals((prev) => (append ? [...prev, ...data.corals] : data.corals));
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCorals();
  }, [fetchCorals]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleSubmit = async (imageData, authorName) => {
    const res = await fetch("/api/corals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_data: imageData, author_name: authorName }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to submit");
    }
    const newCoral = await res.json();
    setCorals((prev) => [newCoral, ...prev]);
    setTotal((prev) => prev + 1);
    return newCoral;
  };

  // Progress through the dive: 0 = surface, 1 = deepest
  const progress = Math.min(scrollY / SCROLL_RANGE, 1);

  // Camera Z position — moves forward into the screen
  const cameraZ = progress * OCEAN_DEPTH;

  // Background color: surface light → deep dark
  const bg = interpolateColor(
    [232, 238, 246], // #e8eef6 surface
    [13, 31, 60], // #0d1f3c deep
    progress,
  );

  // Header fades out quickly
  const headerOpacity = Math.max(0, 1 - scrollY / 250);

  return (
    <>
      {/* Scrollable space — this is invisible, just gives us scroll range */}
      <div style={{ height: SCROLL_RANGE + viewportH }} />

      {/* Fixed viewport — everything renders here */}
      <div
        className="fixed inset-0 overflow-hidden"
        style={{ backgroundColor: `rgb(${bg[0]},${bg[1]},${bg[2]})` }}
      >
        {/* Ocean background effects */}
        <OceanDive scrollY={scrollY} progress={progress} />

        {/* 3D perspective container */}
        <div
          className="absolute inset-0"
          style={{
            perspective: 800,
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* The 3D scene — camera moves forward by translating on Z */}
          <div
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              transform: `translateZ(${cameraZ}px)`,
            }}
          >
            {corals.map((coral) => (
              <ZCoral key={coral.id} coral={coral} cameraZ={cameraZ} />
            ))}
          </div>
        </div>

        {/* Header — fades as you start diving */}
        <header
          className="absolute z-20 inset-x-0 top-0 flex flex-col items-center pt-14 pb-10 px-4"
          style={{
            opacity: headerOpacity,
            pointerEvents: headerOpacity < 0.1 ? "none" : "auto",
          }}
        >
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{ color: "#325483" }}
          >
            Coral Garden
          </h1>
          <p className="mt-2 text-lg" style={{ color: "#7b9cc2" }}>
            Scroll to dive into the reef
          </p>
          <div className="scroll-hint mt-6" style={{ color: "#abbad8" }}>
            <ChevronDown size={28} />
          </div>
        </header>

        {/* Nusajiwa logo — fades in at the very end of the dive */}
        {progress > 0.7 && (
          <div
            className="absolute z-20 inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{
              opacity: Math.min(1, (progress - 0.7) / 0.3),
              transition: "opacity 0.3s ease",
            }}
          >
            <img
              src="/logo.jpg"
              alt="Nusajiwa"
              className="w-32 h-32 rounded-full object-cover shadow-2xl mb-4"
              style={{ border: "3px solid rgba(171, 186, 216, 0.4)" }}
            />
            <p className="text-lg font-semibold" style={{ color: "#abbad8" }}>
              Nusajiwa
            </p>
            <p className="text-sm mt-1" style={{ color: "#4a6580" }}>
              {total > 0
                ? `${total} corals in our reef`
                : "The reef awaits its first coral"}
            </p>
          </div>
        )}

        {/* Drawing studio */}
        <DrawingStudio onSubmit={handleSubmit} />
      </div>
    </>
  );
}

// A single coral placed in 3D space
function ZCoral({ coral, cameraZ }) {
  const seed = seededRandom(coral.id * 7919);

  // Fully random position in the tunnel — each axis independent from coral.id
  const x = -45 + seed() * 90; // -45vw to +45vw from center (wide spread)
  const y = 5 + seed() * 35; // +5vh to +40vh below center (grounded on the lower half)
  const zDepth = -(seed() * OCEAN_DEPTH); // randomly scattered across the full depth
  const size = 80 + seed() * 200; // 80-280px base size
  const swayDuration = 3 + seed() * 4;

  // Relative Z: how far this coral is from the camera
  // Positive = behind camera, negative = ahead
  const relativeZ = zDepth + cameraZ;
  if (relativeZ > 400) return null; // behind us, culled
  if (relativeZ < -3000) return null; // too far ahead, culled

  // Opacity: fully visible in mid-range, fades at extremes
  let opacity = 1;
  if (relativeZ > 0) {
    // Just passed us — fade out
    opacity = Math.max(0, 1 - relativeZ / 400);
  } else if (relativeZ < -1500) {
    // Far ahead — fade in gradually
    opacity = Math.max(0, 1 - (Math.abs(relativeZ) - 1500) / 1500);
  }

  return (
    <div
      className="absolute coral-sway"
      style={{
        left: "50%",
        top: "50%",
        width: size,
        transform: `translate3d(${x}vw, ${y}vh, ${zDepth}px) translate(-50%, -50%)`,
        transformStyle: "preserve-3d",
        opacity,
        "--sway-start": `${-2 - seed() * 3}deg`,
        "--sway-end": `${2 + seed() * 3}deg`,
        animationDuration: `${swayDuration}s`,
        pointerEvents: opacity > 0.1 ? "auto" : "none",
      }}
    >
      <img
        src={coral.image_data}
        alt={`Coral by ${coral.author_name}`}
        className="w-full h-auto"
        style={{
          filter: `drop-shadow(0 4px 20px rgba(0,0,0,${0.15 + opacity * 0.15}))`,
        }}
        loading="lazy"
        draggable={false}
      />
      <p
        className="text-center text-xs mt-1 font-medium whitespace-nowrap"
        style={{ color: `rgba(179, 17, 90, ${opacity})` }}
      >
        {coral.author_name}
      </p>
    </div>
  );
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function interpolateColor(from, to, t) {
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ];
}
