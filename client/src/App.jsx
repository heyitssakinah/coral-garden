import { useState, useEffect } from "react";
import OceanDive from "./components/OceanDive";
import DrawingStudio from "./components/DrawingStudio";
import CoralGallery from "./components/CoralGallery";
import { ChevronDown, Eye } from "lucide-react";

// Total Z-depth of the ocean tunnel
const OCEAN_DEPTH = 5000;
// How many px of scroll maps to the full depth
const SCROLL_RANGE = 4000;
// Maximum look-around angle in degrees (±45° = 90° total)
const MAX_LOOK_ANGLE = 45;

export default function App() {
  const [corals, setCorals] = useState([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState("dive"); // 'dive' | 'gallery'
  const [scrollY, setScrollY] = useState(0);
  const [viewportH, setViewportH] = useState(window.innerHeight);
  const [mouseX, setMouseX] = useState(0.5); // 0 = left edge, 1 = right edge

  useEffect(() => {
    let cancelled = false;
    fetch("/api/corals?page=1&limit=50")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setCorals(data.corals);
        setTotal(data.total);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onResize = () => setViewportH(window.innerHeight);
    const onMouseMove = (e) => {
      // Skip if mouse is over the drawing studio panel
      if (e.target.closest?.("[data-drawing-studio]")) return;
      setMouseX(e.clientX / window.innerWidth);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
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
    [232, 238, 246], // #0e6080 surface
    [13, 31, 60], // #0d1f3c deep
    progress,
  );

  // Look-around: mouse X maps to Y-rotation of the scene
  // Reduce sensitivity as you dive deeper (corals are nearer, rotation feels bigger)
  const lookSensitivity = 1 - progress * 0.95;
  const lookAngle = (mouseX - 0.5) * 2 * MAX_LOOK_ANGLE * lookSensitivity;

  // Header fades out quickly
  const headerOpacity = Math.max(0, 1 - scrollY / 250);

  if (view === "gallery") {
    return (
      <CoralGallery
        corals={corals}
        onBack={() => {
          setView("dive");
          window.scrollTo(0, 0);
        }}
      />
    );
  }

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
        <OceanDive
          scrollY={scrollY}
          progress={progress}
          lookAngle={lookAngle}
        />

        {/* 3D perspective container */}
        <div
          className="absolute inset-0"
          style={{
            perspective: 800,
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* The 3D scene — camera moves forward and rotates on Y for look-around */}
          <div
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              transform: `translateZ(${cameraZ}px) rotateY(${lookAngle}deg)`,
              transition: "transform 0.15s ease-out",
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

        {/* See All Corals button — top right */}
        <button
          onClick={() => setView("gallery")}
          className="absolute z-20 top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            color: "#e8eef6",
            backgroundColor: "rgba(50, 84, 131, 0.5)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Eye size={16} />
          See All Corals
        </button>

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

        {/* Sea floor — gradient at the bottom of the viewport */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: "35vh",
            opacity: 1,
            background: `linear-gradient(to bottom,
              transparent 0%,
              rgba(139,119,90,0.15) 30%,
              rgba(120,100,70,0.3) 80%,
              rgba(100,85,58,0.45) 95%,
              rgba(85,72,50,0.55) 100%)`,
          }}
        />

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
  const x = -70 + seed() * 140; // -70vw to +70vw from center (extra wide for look-around)
  const y = 20 + seed() * 10; // anchored near the sea floor
  const zDepth = -(seed() * OCEAN_DEPTH - 500); // randomly scattered across the full depth
  const size = 120 + seed() * 200; // 120-320px base size

  // Relative Z: how far this coral is from the camera
  // Positive = behind camera, negative = ahead
  const relativeZ = zDepth + cameraZ;
  if (relativeZ > 550) return null; // behind us, culled
  if (relativeZ < -3000) return null; // too far ahead, culled

  // Opacity: fully visible in mid-range, fades at extremes
  let opacity = 1;
  if (relativeZ < -1500) {
    // Far ahead — fade in gradually
    opacity = Math.max(0, 1 - (Math.abs(relativeZ) - 1500) / 1500);
  }

  return (
    <div
      className="absolute coral-item"
      style={{
        left: "50%",
        top: "50%",
        width: size,
        transform: `translate3d(${x}vw, ${y}vh, ${zDepth}px) translate(-50%, -50%)`,
        transformStyle: "preserve-3d",
        opacity,
        "--coral-shadow": `drop-shadow(0 4px 20px rgba(0,0,0,${0.15 + opacity * 0.15}))`,
        pointerEvents: opacity > 0.1 ? "auto" : "none",
      }}
    >
      <img
        src={coral.image_data}
        alt={`Coral by ${coral.author_name}`}
        className="w-full h-auto"
        loading="lazy"
        draggable={false}
      />
      <p
        className="text-center text-xs mt-1 font-medium whitespace-nowrap coral-author"
        style={{ color: `rgba(179, 17, 90, ${opacity})` }}
      >
        {coral.author_name}
      </p>
    </div>
  );
}

function seededRandom(seed) {
  // Hash the seed to avoid correlation with small sequential inputs
  let s = Math.abs(seed) | 0;
  s = (((s >> 16) ^ s) * 45989) | 0;
  s = (((s >> 16) ^ s) * 45989) | 0;
  s = ((s >> 16) ^ s) | 0;
  s = (Math.abs(s) % 2147483646) + 1;
  return () => {
    s = (s * 16807) % 2147483647;
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
