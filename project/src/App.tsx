import { useState } from 'react';
import { AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { useRouter } from './lib/router';
import { TOOL_MAP } from './lib/registry';
import { TOOL_COMPONENTS } from './lib/toolComponents';

function AppShell() {
  const { route } = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  let content: React.ReactNode;
  if (route.name === 'home') {
    content = <Home onOpenAuth={openAuth} />;
  } else if (route.name === 'category') {
    content = <CategoryPage categoryId={route.categoryId} />;
  } else if (route.name === 'search') {
    content = <SearchPage query={route.query} />;
  } else if (route.name === 'profile') {
    content = <ProfilePage />;
  } else if (route.name === 'tool') {
    const Comp = TOOL_COMPONENTS[route.toolId];
    if (Comp) {
      content = <Comp onSignIn={() => openAuth('signin')} />;
    } else {
      content = (
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-ink">Tool not found</h1>
          <p className="text-slate-500 mt-2">"{route.toolId}" does not exist.</p>
          <a href="#/" className="btn-primary mt-4 inline-flex">Go home</a>
        </div>
      );
    }
  } else {
    content = <Home onOpenAuth={openAuth} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Header onOpenAuth={openAuth} />
      <main className="flex-1">{content}</main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

// keep TOOL_MAP referenced (used by other modules; here for type-safety tree-shaking)
void TOOL_MAP;
