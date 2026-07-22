import { useState } from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';
import { Header } from './Header';
import { Footer } from './Footer';
import { AuthModal } from './AuthModal';
import { Home } from './Home';
import { CategoryPage } from './CategoryPage';
import { SearchPage } from './SearchPage';
import { ProfilePage } from './ProfilePage';
import { useRouter } from './router';
import { TOOL_MAP } from './registry';
import { TOOL_COMPONENTS } from './toolComponents';

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
