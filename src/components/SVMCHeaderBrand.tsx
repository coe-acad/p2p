import { useLocation, useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";

/**
 * Compact brand mark for the app shell header.
 *
 * - Renders the CharzPe wordmark with the circular logo emblem.
 * - Click behaviour: navigates to the persona-aware home; if the user is
 *   ALREADY on home, performs a full reload so they get fresh data.
 */
const SVMCHeaderBrand = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUserData();
  const isBuyer = (userData as any)?.intent === "buy";
  const homeRoute = isBuyer ? "/buyer-home" : "/home";
  const isOnHome = location.pathname === homeRoute;

  const handleClick = () => {
    if (isOnHome) {
      window.location.reload();
    } else {
      navigate(homeRoute);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isOnHome ? "Refresh" : "Go to home"}
      title={isOnHome ? "Refresh" : "Home"}
      className="group inline-flex items-center gap-2 rounded-md -mx-1 px-1 py-1
                 transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-100
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* CharzPe logo — the SVG in public/ is a raster-to-vector conversion
          artifact with a black rectangle behind the circle. Use the PNG we
          re-masked with a transparent-outside-circle alpha so it composites
          cleanly on the header's off-white background. */}
      <img
        src="/logo_charzpe_round.png"
        alt="CharzPe"
        className="h-5 w-5 object-contain transition-transform duration-200 ease-out group-hover:scale-110"
      />

      {/* Wordmark — matches the logo's two-tone design. Uses the exact
          brand hex (#0172BD) for "Charz" instead of Tailwind's --primary so
          it lines up with the logo mark's blue, and the accent green for
          "Pe". Keep in sync with the color used on the login screen. */}
      <span className="text-base font-semibold tracking-tight sm:text-lg">
        <span style={{ color: "#0172BD" }}>Charz</span>
        <span className="text-accent">Pe</span>
      </span>
    </button>
  );
};

export default SVMCHeaderBrand;
