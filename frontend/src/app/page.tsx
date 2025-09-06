"use client";

import { useState } from 'react';
import { Home, Printer, Settings, Menu, Sun, Moon } from 'lucide-react';
import { TabButton } from '@/components/ui/TabButton';
import { useUIStore } from '@/stores/uiStore';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home');
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore();

  return (
    <div className={`flex h-screen bg-dark-bg ${theme}`}>
      {sidebarOpen && (
        <div className="w-64 bg-dark-surface p-4 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">LezerPrint</h1>
          </div>
          <nav className="flex flex-col space-y-2">
            <TabButton
              id="home"
              label="Home"
              icon={Home}
              isActive={activeTab === 'home'}
              onClick={setActiveTab}
            />
            <TabButton
              id="printer"
              label="Printer"
              icon={Printer}
              isActive={activeTab === 'printer'}
              onClick={setActiveTab}
            />
            <TabButton
              id="settings"
              label="Settings"
              icon={Settings}
              isActive={activeTab === 'settings'}
              onClick={setActiveTab}
            />
          </nav>
        </div>
      )}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <button onClick={toggleSidebar} className="text-white">
            <Menu />
          </button>
          <button onClick={toggleTheme} className="text-white">
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
        </div>
        {activeTab === 'home' && <div className="text-white">Home Content</div>}
        {activeTab === 'printer' && <div className="text-white">Printer Content</div>}
        {activeTab === 'settings' && <div className="text-white">Settings Content</div>}
      </main>
    </div>
  );
}
