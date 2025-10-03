import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Example integration (remove comments to enable):
// import { useBackgroundTripTracking } from './hooks/useBackgroundTripTracking';
// function TrackingBootstrap({ children }: { children: React.ReactNode }) {
//   const activeTripId = null; // supply from your state/store
//   const { start, stop, permission } = useBackgroundTripTracking(activeTripId);
//   // Start when trip active
//   // useEffect(()=>{ if(activeTripId) start(); else stop(); }, [activeTripId]);
//   return <>{children}</>;
// }

createRoot(document.getElementById("root")!).render(<App />);
