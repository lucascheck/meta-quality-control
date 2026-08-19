import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SectionPage from "./pages/SectionPage";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/quality" component={() => <SectionPage section="quality" />} /><Route path="/limits" component={() => <SectionPage section="limits" />} /><Route path="/templates" component={() => <SectionPage section="templates" />} /><Route path="/dispatch" component={() => <SectionPage section="dispatch" />} /><Route path="/settings" component={() => <SectionPage section="settings" />} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
