import { useCallback, useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { type AppRoute, Navbar } from './components/Navbar';
import { DocumentationPage } from './pages/DocumentationPage';
import { HomePage } from './pages/HomePage';
import { LogsHealthPage } from './pages/LogsHealthPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TesterPage } from './pages/TesterPage';
import { fetchEndpointsRegistry, fetchSystemStatus } from './services/apiClient';
import type { ApiCategorySummary, ApiEndpointDefinition, SystemStatusResponse } from './types/api';

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname || '/';
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePath(window.location.pathname),
  );
  const [statusData, setStatusData] = useState<SystemStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [endpoints, setEndpoints] = useState<ApiEndpointDefinition[]>([]);
  const [categories, setCategories] = useState<ApiCategorySummary[]>([]);
  const [registryError, setRegistryError] = useState<string | null>(null);

  const [docsCategory, setDocsCategory] = useState<string>('all');
  const [testerEndpoint, setTesterEndpoint] = useState<ApiEndpointDefinition | null>(null);
  const [testerCategory, setTesterCategory] = useState<string | null>(null);

  const navigate = useCallback((path: AppRoute) => {
    const clean = normalizePath(path);
    if (window.location.pathname !== clean) {
      window.history.pushState({}, '', clean);
    }
    setCurrentPath(clean);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const loadStatus = useCallback(async (forceRefresh = false) => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const data = await fetchSystemStatus(forceRefresh);
      setStatusData(data);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Unable to reach backend gateway');
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus(false);
    fetchEndpointsRegistry()
      .then((res) => {
        setEndpoints(res.endpoints);
        setCategories(res.categories);
      })
      .catch((err) => {
        setRegistryError(err instanceof Error ? err.message : 'Failed to load endpoints');
      });
  }, [loadStatus]);

  const handleSelectCategoryDocs = (categoryId: string) => {
    setDocsCategory(categoryId);
    navigate('/docs');
  };

  const handleSelectCategoryTester = (categoryId: string) => {
    setTesterEndpoint(null);
    setTesterCategory(categoryId);
    navigate('/tester');
  };

  const handleOpenInTester = (ep: ApiEndpointDefinition) => {
    setTesterCategory(ep.categoryId);
    setTesterEndpoint(ep);
    navigate('/tester');
  };

  const handleRequestCompleted = useCallback(() => {
    void loadStatus(false);
  }, [loadStatus]);

  return (
    <div className="min-h-screen flex flex-col bg-obsidian-canvas text-zinc-100">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onQuickHealthCheck={() => void loadStatus(true)}
        checkingHealth={statusLoading}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {registryError && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {registryError}
          </div>
        )}

        {currentPath === '/' && (
          <HomePage
            statusData={statusData}
            statusLoading={statusLoading}
            statusError={statusError}
            endpoints={endpoints}
            onRefreshStatus={() => void loadStatus(true)}
            onNavigate={navigate}
            onSelectCategoryDocs={handleSelectCategoryDocs}
            onSelectCategoryTester={handleSelectCategoryTester}
          />
        )}

        {currentPath === '/docs' && (
          <DocumentationPage
            endpoints={endpoints}
            categories={categories}
            initialCategory={docsCategory}
            onOpenInTester={handleOpenInTester}
            onRequestCompleted={handleRequestCompleted}
          />
        )}

        {currentPath === '/tester' && (
          <TesterPage
            endpoints={endpoints}
            categories={categories}
            preselectedEndpoint={testerEndpoint}
            preselectedCategory={testerCategory}
            onRequestCompleted={handleRequestCompleted}
          />
        )}

        {currentPath === '/logs' && (
          <LogsHealthPage
            statusData={statusData}
            statusLoading={statusLoading}
            onRefreshStatus={() => void loadStatus(true)}
          />
        )}

        {currentPath !== '/' &&
          currentPath !== '/docs' &&
          currentPath !== '/tester' &&
          currentPath !== '/logs' && <NotFoundPage onNavigate={navigate} />}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}
