import createGlobe from "cobe";
import { useEffect, useRef } from "react";

export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    let width = 0;
    
    if (!canvasRef.current) return;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 20000,
      mapBrightness: 8,
      baseColor: [0.8, 0.8, 0.8], // Light grey continents
      markerColor: [1, 0.55, 0], // #FF8C00 (orange markers)
      glowColor: [0.2, 0.5, 1], // Soft blue atmospheric glow
      markers: [
        { location: [37.7595, -122.4367], size: 0.05 },
        { location: [40.7128, -74.006], size: 0.07 },
        { location: [51.5072, 0.1276], size: 0.04 },
        { location: [-33.8688, 151.2093], size: 0.06 },
        { location: [35.6762, 139.6503], size: 0.05 }
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.003; // Slow rotation
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    return () => {
      window.removeEventListener("resize", onResize);
      globe.destroy();
    };
  }, []);

  return (
    <div className={className} style={{ width: "100%", aspectRatio: 1, maxWidth: 800, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          contain: "layout paint size",
          opacity: 0.8,
          transition: "opacity 1s ease",
        }}
      />
    </div>
  );
}
