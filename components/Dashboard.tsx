import React, { useState, useMemo } from 'react';
import { KPI, Task, Client, DailyActivity } from '../types';
import { generateDailyPlan } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Users, Briefcase, DollarSign, CheckSquare, AlertCircle, Sparkles, Phone, Mail, User, ChevronRight } from 'lucide-react';

interface DashboardProps {
  kpi: KPI;
  tasks: Task[];
  clients: Client[];
  onNavigate: (view: 'dashboard' | 'clients' | 'calendar' | 'commissions') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ kpi, tasks, clients, onNavigate }) => {
  const urgentTasks = tasks.filter(t => !t.completed && t.priority === 'Vysoká');
  const [dailyPlan, setDailyPlan] = useState<DailyActivity[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    const plan = await generateDailyPlan(clients);
    setDailyPlan(plan);
    setIsGeneratingPlan(false);
  };

  const getActivityIcon = (type: DailyActivity['type']) => {
    switch(type) {
      case 'CALL': return <Phone size={16} />;
      case 'EMAIL': return <Mail size={16} />;
      default: return <User size={16} />;
    }
  };

  // Dynamically calculate last 6 months commissions
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    const monthNames = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];

    // Iterate last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthIndex = d.getMonth();
        const year = d.getFullYear();
        
        // Sum commissions for this specific month/year across all clients
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
  }, [clients]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center animate-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Přehled - ČSOB Poradce</h2>
          <p className="text-gray-500 dark:text-gray-400">Vítejte zpět. Zde je váš denní souhrn.</p>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-100 dark:border-slate-700">
          Dnes je {new Date().toLocaleDateString('cs-CZ')}
        </div>
      </div>

      {/* AI Daily Planner Section */}
      <div className="bg-gradient-to-r from-[#007dc5] to-[#0369a1] dark:from-blue-900 dark:to-slate-900 rounded-xl shadow-md p-6 text-white relative overflow-hidden border border-blue-600/20 transform transition-transform hover:scale-[1.01] duration-300 animate-in fade-in duration-700">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={120} />
        </div>
        <div className="relative z-10">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-yellow-300" />
                AI Plánovač Aktivit
            </h3>
            <p className="text-blue-100 dark:text-slate-300 mb-6 max-w-2xl">
                Nechte umělou inteligenci analyzovat váš klientský kmen a navrhnout nejlepší obchodní příležitosti pro dnešní den.
            </p>

            {dailyPlan.length === 0 ? (
                <button 
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan}
                    className="bg-white text-[#007dc5] px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-75 flex items-center gap-2 shadow-sm"
                >
                    {isGeneratingPlan ? 'Analyzuji portfolio...' : 'Vygenerovat Denní Plán'}
                </button>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-bottom duration-500">
                    {dailyPlan.map((activity, idx) => (
                        <div key={idx} className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/50 p-4 rounded-lg hover:bg-white/20 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-white/20 p-1.5 rounded-md text-white">
                                    {getActivityIcon(activity.type)}
                                </span>
                                {activity.priority === 'HIGH' && (
                                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">Priorita</span>
                                )}
                            </div>
                            <h4 className="font-bold text-lg mb-1">{activity.clientName}</h4>
                            <p className="text-sm text-blue-100 dark:text-slate-300">{activity.reason}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* KPI Cards - Clickable & Animated */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* AUM Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-4 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '0ms' }}>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Celkem ve správě (AUM)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{(kpi.totalAUM / 1000000).toFixed(1)} mil. Kč</p>
          </div>
        </div>

        {/* Clients Card */}
        <div 
          onClick={() => onNavigate('clients')}
          className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-blue-200 dark:hover:border-slate-600 group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '100ms' }}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Klienti</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpi.activeClients}</p>
            </div>
          </div>
          <ChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-transform group-hover:translate-x-1" size={20} />
        </div>

        {/* Tasks Card */}
        <div 
          onClick={() => onNavigate('calendar')}
          className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-yellow-200 dark:hover:border-slate-600 group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '200ms' }}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/50 transition-colors">
              <CheckSquare size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Úkoly k řešení</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpi.pendingTasks}</p>
            </div>
          </div>
          <ChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-transform group-hover:translate-x-1" size={20} />
        </div>

        {/* Commission Card */}
        <div 
           onClick={() => onNavigate('commissions')}
           className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-emerald-200 dark:hover:border-slate-600 group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '300ms' }}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Provize tento měsíc</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpi.monthlyCommission.toLocaleString('cs-CZ')} Kč</p>
            </div>
          </div>
          <ChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-transform group-hover:translate-x-1" size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-100">
        {/* Chart Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 lg:col-span-2 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vývoj Provizí (Posledních 6 měsíců)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ 
                      backgroundColor: 'rgb(30 41 59)', 
                      borderColor: 'rgb(51 65 85)', 
                      color: '#fff',
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="provize" radius={[4, 4, 0, 0]} animationDuration={1500}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#007dc5' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-full hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertCircle size={20} className="text-red-500 mr-2" />
            Urgentní Úkoly
          </h3>
          <div className="space-y-3 flex-1">
            {urgentTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Žádné urgentní úkoly.</p>
            ) : (
              urgentTasks.map(task => (
                <div key={task.id} className="p-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded-r-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                  <p className="font-medium text-gray-800 dark:text-white text-sm">{task.title}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">Do: {new Date(task.dueDate).toLocaleDateString('cs-CZ')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => onNavigate('calendar')}
            className="w-full mt-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors border border-gray-200 dark:border-slate-600"
          >
            Přejít do Kalendáře
          </button>
        </div>
      </div>
    </div>
  );
};