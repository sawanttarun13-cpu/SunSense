import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { History } from './components/History';
import { Alerts } from './components/Alerts';
import { Device } from './components/Device';
import { SettingsPage } from './components/SettingsPage';
import { Profile } from './components/Profile';

export type Page = 'dashboard' | 'analytics' | 'history' | 'alerts' | 'device' | 'settings' | 'profile';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'analytics': return <Analytics />;
      case 'history': return <History />;
      case 'alerts': return <Alerts />;
      case 'device': return <Device />;
      case 'settings': return <SettingsPage />;
      case 'profile': return <Profile />;
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: "'Poppins', sans-serif", background: '#EEF4FF' }}
    >
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {renderPage()}
      </main>
    </div>
  );
}
