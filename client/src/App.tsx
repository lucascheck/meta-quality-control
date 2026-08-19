import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SectionPage from "./pages/SectionPage";

function Router() {
  const [location] = useLocation();
  return <div key={location} className="page-transition"><Switch><Route path="/" component={Home} /><Route path="/quality" component={() => <SectionPage section="quality" />} /><Route path="/limits" component={() => <SectionPage section="limits" />} /><Route path="/templates" component={() => <SectionPage section="templates" />} /><Route path="/dispatch" component={() => <SectionPage section="dispatch" />} /><Route path="/settings" component={() => <SectionPage section="settings" />} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></div>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
