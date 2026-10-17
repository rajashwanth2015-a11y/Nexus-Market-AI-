import React, { useState, useEffect } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { OnboardingForm } from './components/OnboardingForm';
import { DatabaseInspector } from './components/DatabaseInspector';
import { Step2ContentGenerator } from './components/Step2ContentGenerator';
import { Step3AnalyticsDashboard } from './components/Step3AnalyticsDashboard';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { INITIAL_SAMPLE_DATABASE } from './data/sampleDatabase';
import { BusinessRecord, ConnectionState } from './types';
import { 
  Database, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Wand2, 
  FileText,
  Building2,
  BarChart3,
  Layers,
  Smartphone
} from 'lucide-react';

const STORAGE_KEY = 'nexus_market_ai_records_v1';

export default function App() {
  // Load sample database records from localStorage or fallback to defaults
  const [records, setRecords] = useState<BusinessRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_SAMPLE_DATABASE;
  });

  const [activeTab, setActiveTab] = useState<AppTab>('onboarding');
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  
  // Default to the first sample business if none selected yet
  const [activeBusiness, setActiveBusiness] = useState<BusinessRecord>(() => {
    return records[0] || INITIAL_SAMPLE_DATABASE[0];
  });

  const [connectionToast, setConnectionToast] = useState<string | null>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnecting: false,
    step: 'idle',
    progress: 0,
  });

  // Sync records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to sync to local storage', e);
    }
  }, [records]);

  // Handler: Connect Database & Continue (Step 1 -> Step 2 Transition)
  const handleConnectDatabase = (formData: Omit<BusinessRecord, 'id' | 'createdAt' | 'lastActive' | 'status'>) => {
    setConnectionState({
      isConnecting: true,
      step: 'handshake',
      progress: 20,
    });

    // Progressive simulated handshake & schema validation
    setTimeout(() => {
      setConnectionState((prev) => ({
        ...prev,
        step: 'validating_schema',
        progress: 55,
      }));

      setTimeout(() => {
        setConnectionState((prev) => ({
          ...prev,
          step: 'syncing_records',
          progress: 85,
        }));

        setTimeout(() => {
          const newId = `biz_${formData.category.slice(0, 3)}_${Math.floor(1000 + Math.random() * 9000)}`;
          const now = new Date();
          const timeFormatted = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

          const newRecord: BusinessRecord = {
            ...formData,
            id: newId,
            status: 'active',
            createdAt: timeFormatted,
            lastActive: 'Just now',
          };

          // Save into embedded database
          setRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newId)]);
          setActiveBusiness(newRecord);

          setConnectionState({
            isConnecting: false,
            step: 'connected',
            progress: 100,
            connectedAt: timeFormatted,
          });

          setConnectionToast(`"${newRecord.name}" connected! Generating AI marketing content...`);
          setTimeout(() => setConnectionToast(null), 4000);

          // Transition directly to Step 2: AI Content Generation Screen
          setActiveTab('content_generation');
        }, 600);
      }, 500);
    }, 450);
  };

  // Handler: Step 2 -> Step 3 Transition when Launching Campaign
  const handleLaunchCampaignComplete = () => {
    setActiveTab('analytics');
    setConnectionToast(`🚀 Live marketing campaigns deployed for ${activeBusiness.name}!`);
    setTimeout(() => setConnectionToast(null), 4000);
  };

  // Handler: Update budget directly from Dashboard (Step 3) or Controls
  const handleUpdateBusinessBudget = (newBudget: number) => {
    setActiveBusiness((prev) => ({
      ...prev,
      monthlyBudget: newBudget,
    }));

    setRecords((prev) =>
      prev.map((r) => (r.id === activeBusiness.id ? { ...r, monthlyBudget: newBudget } : r))
    );

    setConnectionToast(`Updated ${activeBusiness.name} monthly budget to $${newBudget.toLocaleString()}`);
    setTimeout(() => setConnectionToast(null), 3500);
  };

  // Reset database to initial sample records
  const handleResetDatabase = () => {
    if (window.confirm('Reset database state back to the original sample businesses?')) {
      setRecords(INITIAL_SAMPLE_DATABASE);
      setActiveBusiness(INITIAL_SAMPLE_DATABASE[0]);
      setConnectionToast('Embedded database reset to default sample businesses');
      setTimeout(() => setConnectionToast(null), 3000);
    }
  };

  // Add random realistic sample business
  const handleAddNewSample = () => {
    const samples = [
      { name: 'Blue Wave Surf & Stay', cat: 'hotel', label: 'Hotel & Hospitality', phone: '(808) 555-0143', budget: 1600 },
      { name: 'Kalon Hair & Esthetics', cat: 'salon', label: 'Hair Salon, Spa & Beauty', phone: '(305) 555-8821', budget: 600 },
      { name: 'Maison Chic Apparel', cat: 'clothing', label: 'Clothing & Fashion Boutique', phone: '(212) 555-7790', budget: 950 },
      { name: 'Artisan Roast & Bakery', cat: 'cafe', label: 'Cafe, Bakery & Roastery', phone: '(206) 774-9031', budget: 400 },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    const newId = `biz_${pick.cat}_${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeFormatted = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newRecord: BusinessRecord = {
      id: newId,
      name: pick.name,
      category: pick.cat as any,
      categoryLabel: pick.label,
      phone: pick.phone,
      phoneCountryCode: '+1',
      monthlyBudget: pick.budget,
      status: 'active',
      createdAt: timeFormatted,
      lastActive: 'Just now',
      channels: ['Google Ads', 'Meta Reels', 'Maps Pack'],
      metrics: {
        estImpressions: Math.round(pick.budget * 40),
        estClicks: Math.round(pick.budget * 0.9),
        estLeads: Math.round(pick.budget * 0.08),
      },
    };

    setRecords((prev) => [newRecord, ...prev]);
    setActiveBusiness(newRecord);
    setConnectionToast(`Added "${pick.name}" to sample database records`);
    setTimeout(() => setConnectionToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recordCount={records.length}
        isConnected={connectionState.step === 'connected'}
        businessName={activeBusiness.name}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
      />

      {/* Floating Status Notification / Toast */}
      {connectionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/40 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-xs font-medium">{connectionToast}</span>
        </div>
      )}

      {/* Visual Step Mode Switcher */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-slate-200">
              {activeTab === 'onboarding'
                ? 'Step 1: Business Onboarding & Login'
                : activeTab === 'content_generation'
                ? 'Step 2: AI Marketing Content Generation'
                : activeTab === 'analytics'
                ? 'Step 3: AI Live Marketing Analytics Dashboard'
                : 'Embedded Sample Database State'}
            </span>
            <span className="text-slate-500 hidden md:inline">· Active Profile: {activeBusiness.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                activeTab === 'onboarding'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Onboarding</span>
            </button>
            <button
              onClick={() => setActiveTab('content_generation')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                activeTab === 'content_generation'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>2. AI Content</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>3. Live Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                activeTab === 'database'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>DB ({records.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Step 1: Business Onboarding & Login Screen */}
        {activeTab === 'onboarding' && (
          <OnboardingForm
            onConnectDatabase={handleConnectDatabase}
            connectionState={connectionState}
            onSelectSampleRecord={(record) => {
              setActiveBusiness(record);
              setConnectionToast(`Loaded sample business: "${record.name}"`);
              setTimeout(() => setConnectionToast(null), 3000);
            }}
            sampleRecords={records}
          />
        )}

        {/* Step 2: AI Marketing Content Generation Screen */}
        {activeTab === 'content_generation' && (
          <Step2ContentGenerator
            business={activeBusiness}
            onBackToOnboarding={() => setActiveTab('onboarding')}
            onViewDatabase={() => setActiveTab('database')}
            onLaunchComplete={handleLaunchCampaignComplete}
          />
        )}

        {/* Step 3: AI Live Marketing Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <Step3AnalyticsDashboard
            business={activeBusiness}
            onBackToCreative={() => setActiveTab('content_generation')}
            onBackToOnboarding={() => setActiveTab('onboarding')}
            onViewDatabase={() => setActiveTab('database')}
            onUpdateBusinessBudget={handleUpdateBusinessBudget}
          />
        )}

        {/* Embedded Sample Database State */}
        {activeTab === 'database' && (
          <DatabaseInspector
            records={records}
            onSelectRecord={(rec) => {
              setActiveBusiness(rec);
              setActiveTab('analytics');
              setConnectionToast(`Switched active business to "${rec.name}" (${rec.categoryLabel})`);
              setTimeout(() => setConnectionToast(null), 3000);
            }}
            onResetDatabase={handleResetDatabase}
            onAddNewSample={handleAddNewSample}
          />
        )}
      </main>

      {/* Android APK & Mobile Installation Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* Minimalist Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Nexus Market AI</span>
            <span>·</span>
            <span>Autonomous Small Business Growth Engine</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>1. Onboarding</span>
            <span>→</span>
            <span>2. AI Content</span>
            <span>→</span>
            <span className="text-cyan-400 font-semibold">3. Live Analytics Dashboard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
