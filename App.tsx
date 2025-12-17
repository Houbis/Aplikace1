import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/ClientList';
import { ClientDetail } from './components/ClientDetail';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { AuthView } from './components/AuthView';
import { MOCK_CLIENTS, MOCK_KPI, MOCK_TASKS, MOCK_EVENTS } from './constants';
import { Client, PortfolioItem, CommissionSettings, User, KPI } from './types';
import { 
  LayoutDashboard, Users, Settings, LogOut, Calendar, ShieldCheck, 
  UserCircle, DollarSign, SlidersHorizontal, Menu 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Sub-components for new simple views ---

const ProfileView = ({ user }: { user: User }) => (
  <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 animate-in zoom-in-95 duration-500">
    <div className="flex items-center gap-6 mb-8">
      <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-bold shadow-inner">
        {user.fullName.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.fullName}</h2>
        <p className="text-gray-500 dark:text-gray-400">Senior Finanční Specialista</p>
        <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">Top Performer</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">ČSOB Premium</span>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Kontaktní údaje</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <p>Uživatel: {user.username}</p>
                <p>Email: {user.username}@csob.cz</p>
                <p>Telefon: +420 777 888 999</p>
                <p>Pobočka: Praha 1, Na Příkopě</p>
            </div>
        </div>
        <div>
             <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Zabezpečení</h3>
             <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Biometrie</span>
                    <span className={user.biometricsEnabled ? "text-green-600 font-medium" : "text-gray-400"}>
                        {user.biometricsEnabled ? "Aktivní" : "Neaktivní"}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Dvoufázové ověření</span>
                    <span className="text-green-600 font-medium">Zapnuto</span>
                </div>
             </div>
        </div>
    </div>
  </div>
);

const AppSettingsView = ({ isDarkMode, onToggleDarkMode }: { isDarkMode: boolean, onToggleDarkMode: () => void }) => (
    <div className="max-w-2xl bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 animate-in slide-in-from-right duration-500">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Nastavení Aplikace</h2>
        
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-slate-700">
                <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Tmavý Režim</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Přepnout mezi světlým a tmavým vzhledem</p>
                </div>
                <button 
                    onClick={onToggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg opacity-50 cursor-not-allowed">
                 <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Jazyk Aplikace</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Čeština (Výchozí)</p>
                </div>
                <span className="text-xs text-gray-500">Pouze ČJ</span>
            </div>
             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg opacity-50 cursor-not-allowed">
                 <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Notifikace</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">E-mail a Push notifikace</p>
                </div>
                <span className="text-xs text-gray-500">Zapnuto</span>
            </div>
        </div>
    </div>
);

const CommissionsView = ({ kpi, chartData }: { kpi: KPI, chartData: any[] }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Moje Provize</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow duration-300">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aktuální měsíc</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{kpi.monthlyCommission.toLocaleString('cs-CZ')} Kč</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow duration-300">
                     <p className="text-sm text-gray-500 dark:text-gray-400">Minulý měsíc</p>
                     <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {chartData[chartData.length - 2]?.provize.toLocaleString('cs-CZ') || 0} Kč
                     </p>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow duration-300">
                     <p className="text-sm text-gray-500 dark:text-gray-400">Celkem za zobrazené období</p>
                     <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                         {chartData.reduce((acc, curr) => acc + curr.provize, 0).toLocaleString('cs-CZ')} Kč
                     </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Přehled vyplacených provizí</h3>
                 <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `${value / 1000}k`} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="provize" radius={[6, 6, 0, 0]} animationDuration={1500}>
                        {chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#007dc5' : '#cbd5e1'} />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                 </div>
            </div>
        </div>
    );
}

// --- Main App Component ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile' | 'commissions' | 'commission_settings' | 'clients' | 'calendar' | 'app_settings'>('dashboard');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for Clients
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);

  // Global Commission Settings State
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>({
      // General Loans & Invest
      mortgageRate: 2.3, 
      investmentRate: 0.68, // Updated 0.68%

      // Insurance
      lifeInsuranceRate: 105.0, // 105% of annual
      propertyInsuranceRate: 36.0, // 36% of annual
      autoInsuranceRate: 12.5, // 12.5% of annual
      
      // Savings & Pension
      pensionFixed: 2210, // Updated 2210
      savingsAccountFixed: 338, // Updated 338

      // Stavební spoření defaults
      ssFirstOver500: 1852,
      ssFirstUnder500: 1553,
      ssNextOver500: 1235,
      ssNextUnder500: 1035,

      // Bonusové vklady defaults
      deposit1YearFixed: 450,
      deposit25MonthRate: 0.5,

      // Úvěry ze SS
      buUnsecuredLoanRate: 2.9,
      buSecuredLoanRate: 1.4,
      buRegularLoanRate: 1.9,

      // Účty
      identityCommission: 450,
      accountCommission: 497,
      activityBonus: 685,

      // Retence
      retentionCommission: 900,
      retentionThreshold: 100000
  });

  // Check login state
  useEffect(() => {
    const savedUser = localStorage.getItem('csob_user');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }
  }, []);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Dynamic KPI Calculations
  const calculateCurrentMonthCommission = (clients: Client[]) => {
      const now = new Date();
      let total = 0;
      clients.forEach(client => {
          client.portfolio.forEach(item => {
              if (!item.isExisting && item.commissionFinal) {
                  const created = new Date(item.createdDate);
                  if (created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()) {
                      total += item.commissionFinal;
                  }
              }
          });
      });
      return total;
  };

  const calculateTotalAUM = (clients: Client[]) => {
      let total = 0;
      clients.forEach(client => {
          client.portfolio.forEach(item => {
              // Only sum positive values (investments, savings) for AUM, ignoring loans (negative) or insurance (premiums)
              // Or summing everything that represents value managed.
              // Typically AUM = Investments + Savings. Loans are volume.
              // For simplicity, summing absolute value of all managed products except Insurance premiums which are flows.
              if (item.type !== 'Pojištění' && item.type !== 'Pojištění nemovitosti' && item.type !== 'Autopojištění') {
                  total += Math.abs(item.value);
              }
          });
      });
      return total;
  };

  const generateChartData = (clients: Client[]) => {
    const data = [];
    const today = new Date();
    const monthNames = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];

    // Iterate last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthIndex = d.getMonth();
        const year = d.getFullYear();
        
        let monthlyTotal = 0;
        clients.forEach(client => {
            client.portfolio.forEach(item => {
                const itemDate = new Date(item.createdDate);
                if (itemDate.getMonth() === monthIndex && itemDate.getFullYear() === year && item.commissionFinal && !item.isExisting) {
                    monthlyTotal += item.commissionFinal;
                }
            });
        });

        data.push({
            name: monthNames[monthIndex],
            provize: monthlyTotal
        });
    }
    return data;
  };

  const currentKPI: KPI = {
      totalAUM: calculateTotalAUM(clients),
      activeClients: clients.length,
      pendingTasks: MOCK_TASKS.filter(t => !t.completed).length,
      monthlyCommission: calculateCurrentMonthCommission(clients)
  };

  const chartData = generateChartData(clients);

  const handleLogin = (newUser: User) => {
      setUser(newUser);
      localStorage.setItem('csob_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('csob_user');
      setCurrentView('dashboard');
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setCurrentView('clients');
  };

  const handleBackToClients = () => {
    setSelectedClient(null);
  };

  const handleAddClient = (clientData: Omit<Client, 'id' | 'portfolio'>) => {
      const newClient: Client = {
          ...clientData,
          id: Math.random().toString(36).substr(2, 9),
          portfolio: []
      };
      setClients([...clients, newClient]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
      setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
      setSelectedClient(updatedClient);
  }

  const handleDeleteClient = (id: string) => {
      if(window.confirm('Opravdu chcete smazat tohoto klienta?')) {
          setClients(clients.filter(c => c.id !== id));
          if(selectedClient?.id === id) {
              setSelectedClient(null);
          }
      }
  };

  const handleAddProduct = (product: Omit<PortfolioItem, 'id'>) => {
      if (!selectedClient) return;
      
      const newPortfolioItem: PortfolioItem = {
          ...product,
          id: Math.random().toString(36).substr(2, 9)
      };

      const updatedClient = {
          ...selectedClient,
          portfolio: [...selectedClient.portfolio, newPortfolioItem]
      };

      // Update in local state
      setSelectedClient(updatedClient);
      
      // Update in main list
      setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const renderContent = () => {
    switch(currentView) {
        case 'dashboard':
            return <Dashboard kpi={currentKPI} tasks={MOCK_TASKS} clients={clients} onNavigate={setCurrentView} />;
        case 'profile':
            return user ? <ProfileView user={user} /> : null;
        case 'commissions':
            return <CommissionsView kpi={currentKPI} chartData={chartData} />;
        case 'commission_settings':
            return <SettingsView settings={commissionSettings} onSave={setCommissionSettings} />;
        case 'clients':
            if (selectedClient) {
                return <ClientDetail client={selectedClient} commissionSettings={commissionSettings} onBack={handleBackToClients} onAddProduct={handleAddProduct} onUpdateClient={handleUpdateClient} />;
            }
            return <ClientList clients={clients} onSelectClient={handleClientSelect} onAddClient={handleAddClient} onDeleteClient={handleDeleteClient} />;
        case 'calendar':
            return <CalendarView events={MOCK_EVENTS} />;
        case 'app_settings':
            return <AppSettingsView isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />;
        default:
            return <div>Stránka nenalezena</div>;
    }
  };

  const SidebarItem = ({ view, icon: Icon, label }: { view: typeof currentView, icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
        <button
            onClick={() => { setCurrentView(view); setSelectedClient(null); setIsMobileMenuOpen(false); }}
            className={`flex items-center space-x-3 w-full px-4 py-3 mb-1 rounded-lg transition-all duration-200 group relative ${
                isActive 
                ? 'bg-blue-50 dark:bg-slate-700/80 text-blue-700 dark:text-blue-300 font-medium' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
            {/* Active Indicator Line */}
            {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-md"></div>}
            
            <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span>{label}</span>
            
            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
        </button>
    );
  };

  // If not logged in, show Auth View
  if (!user) {
      return (
        <div className={isDarkMode ? 'dark' : ''}>
             <AuthView onLogin={handleLogin} />
        </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 fixed h-full z-10 shadow-lg shadow-slate-200/50 dark:shadow-none transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col items-center flex-shrink-0">
          <div className="flex items-center space-x-2 mb-2 hover:scale-105 transition-transform duration-300 cursor-default">
            <div className="w-10 h-10 bg-[#007dc5] rounded-full flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <ShieldCheck size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#007dc5] dark:text-blue-400">ČSOB</h1>
          </div>
          <p className="text-xs text-slate-400 font-medium tracking-wider">FINANČNÍ PORADCE</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <SidebarItem view="dashboard" icon={LayoutDashboard} label="Domů" />
          <SidebarItem view="profile" icon={UserCircle} label="Můj Profil" />
          <SidebarItem view="commissions" icon={DollarSign} label="Moje Provize" />
          <SidebarItem view="commission_settings" icon={SlidersHorizontal} label="Nastavení Provizí" />
          
          <div className="my-4 border-t border-slate-100 dark:border-slate-700"></div>
          
          <SidebarItem view="clients" icon={Users} label="Klienti" />
          <SidebarItem view="calendar" icon={Calendar} label="Aktivity" />
          
           <div className="my-4 border-t border-slate-100 dark:border-slate-700"></div>

           <SidebarItem view="app_settings" icon={Settings} label="Nastavení" />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex-shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all duration-200 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Odhlásit</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-[#007dc5] text-white z-20 flex justify-between items-center p-4 shadow-md backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-2">
             <ShieldCheck size={20} />
             <span className="font-bold">ČSOB Poradce</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 active:scale-95 transition-transform">
            <Menu />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 md:hidden backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-slate-800 p-4 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-end mb-6">
                      <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">Zavřít</button>
                  </div>
                  <nav className="space-y-2">
                      <SidebarItem view="dashboard" icon={LayoutDashboard} label="Domů" />
                      <SidebarItem view="profile" icon={UserCircle} label="Můj Profil" />
                      <SidebarItem view="commissions" icon={DollarSign} label="Moje Provize" />
                      <SidebarItem view="commission_settings" icon={SlidersHorizontal} label="Nastavení Provizí" />
                      <SidebarItem view="clients" icon={Users} label="Klienti" />
                      <SidebarItem view="calendar" icon={Calendar} label="Aktivity" />
                      <SidebarItem view="app_settings" icon={Settings} label="Nastavení" />
                      
                      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-700">
                          <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <LogOut size={20} />
                              <span>Odhlásit</span>
                          </button>
                      </div>
                  </nav>
              </div>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;