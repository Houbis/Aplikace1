import React from 'react';
import { CommissionSettings } from '../types';
import { Save, Coins, Home, TrendingUp, CreditCard, Shield } from 'lucide-react';

interface SettingsViewProps {
  settings: CommissionSettings;
  onSave: (settings: CommissionSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState<CommissionSettings>(settings);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // High contrast input field specifically requested
  const InputField = ({ label, value, onChange, unit, desc }: { label: string, value: number, onChange: (val: number) => void, unit: string, desc?: string }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{desc}</p>}
        <div className="relative">
            <input 
                type="number" 
                step={unit === '%' ? "0.01" : "1"}
                className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg pl-3 pr-12 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-xl font-bold shadow-sm"
                value={value}
                onChange={e => onChange(Number(e.target.value))}
            />
            <span className="absolute right-3 top-3.5 text-gray-500 dark:text-gray-300 font-bold">{unit}</span>
        </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nastavení Provizí</h2>
        <p className="text-gray-500 dark:text-gray-400">Konfigurace sazeb pro výpočet odměn.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Pojištění (Insurance) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                    <Shield size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pojištění</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Životní, Majetkové, Auto</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <InputField 
                    label="Životní Pojištění" 
                    desc="Z ročního pojistného"
                    value={localSettings.lifeInsuranceRate} 
                    onChange={v => setLocalSettings({...localSettings, lifeInsuranceRate: v})} 
                    unit="%" 
                />
                 <InputField 
                    label="Pojištění Nemovitosti" 
                    desc="Jednorázově z ročního"
                    value={localSettings.propertyInsuranceRate} 
                    onChange={v => setLocalSettings({...localSettings, propertyInsuranceRate: v})} 
                    unit="%" 
                />
                 <InputField 
                    label="Autopojištění" 
                    desc="Z ročního pojistného"
                    value={localSettings.autoInsuranceRate} 
                    onChange={v => setLocalSettings({...localSettings, autoInsuranceRate: v})} 
                    unit="%" 
                />
            </div>
        </div>

        {/* Investice & Úvěry (General) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                    <Coins size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Investice & Hypotéky</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Základní sazby z objemu</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField 
                    label="Hypotéky" 
                    desc="Včetně refinancování"
                    value={localSettings.mortgageRate} 
                    onChange={v => setLocalSettings({...localSettings, mortgageRate: v})} 
                    unit="%" 
                />
                 <InputField 
                    label="Investice" 
                    desc="Z objemu investic"
                    value={localSettings.investmentRate} 
                    onChange={v => setLocalSettings({...localSettings, investmentRate: v})} 
                    unit="%" 
                />
            </div>
        </div>

        {/* Spoření & Penze */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spoření & Penze</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fixní odměny</p>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <InputField 
                    label="Penzijní Spoření" 
                    desc="Za založení smlouvy"
                    value={localSettings.pensionFixed} 
                    onChange={v => setLocalSettings({...localSettings, pensionFixed: v})} 
                    unit="Kč" 
                />
                 <InputField 
                    label="Spořící Účet" 
                    desc="Fixní odměna"
                    value={localSettings.savingsAccountFixed} 
                    onChange={v => setLocalSettings({...localSettings, savingsAccountFixed: v})} 
                    unit="Kč" 
                />
            </div>
        </div>

        {/* Úvěry ze SS & SS */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="bg-orange-50 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
                    <Home size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stavební Spoření & Úvěry</h3>
                </div>
            </div>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Úvěry ze Stavebního spoření</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <InputField 
                    label="Nezajištěný meziúvěr" 
                    value={localSettings.buUnsecuredLoanRate} 
                    onChange={v => setLocalSettings({...localSettings, buUnsecuredLoanRate: v})} 
                    unit="%" 
                />
                <InputField 
                    label="Zajištěný úvěr" 
                    value={localSettings.buSecuredLoanRate} 
                    onChange={v => setLocalSettings({...localSettings, buSecuredLoanRate: v})} 
                    unit="%" 
                />
                <InputField 
                    label="Řádný úvěr" 
                    value={localSettings.buRegularLoanRate} 
                    onChange={v => setLocalSettings({...localSettings, buRegularLoanRate: v})} 
                    unit="%" 
                />
            </div>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 border-t border-gray-100 dark:border-gray-700 pt-4">Smlouvy Stavebního spoření</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Prvotní smlouva</label>
                    <div className="space-y-4">
                         <InputField 
                            label="CČ > 500 tis." 
                            value={localSettings.ssFirstOver500} 
                            onChange={v => setLocalSettings({...localSettings, ssFirstOver500: v})} 
                            unit="Kč" 
                        />
                         <InputField 
                            label="CČ ≤ 500 tis." 
                            value={localSettings.ssFirstUnder500} 
                            onChange={v => setLocalSettings({...localSettings, ssFirstUnder500: v})} 
                            unit="Kč" 
                        />
                    </div>
                </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Následná smlouva</label>
                     <div className="space-y-4">
                         <InputField 
                            label="CČ > 500 tis." 
                            value={localSettings.ssNextOver500} 
                            onChange={v => setLocalSettings({...localSettings, ssNextOver500: v})} 
                            unit="Kč" 
                        />
                         <InputField 
                            label="CČ ≤ 500 tis." 
                            value={localSettings.ssNextUnder500} 
                            onChange={v => setLocalSettings({...localSettings, ssNextUnder500: v})} 
                            unit="Kč" 
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Běžné Účty & Identita & Retence */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                    <CreditCard size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Účty, Identita & Retence</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField 
                    label="Pouze Identita" 
                    value={localSettings.identityCommission} 
                    onChange={v => setLocalSettings({...localSettings, identityCommission: v})} 
                    unit="Kč" 
                />
                 <InputField 
                    label="Založení Účtu" 
                    value={localSettings.accountCommission} 
                    onChange={v => setLocalSettings({...localSettings, accountCommission: v})} 
                    unit="Kč" 
                />
                 <InputField 
                    label="Aktivita (Bonus)" 
                    value={localSettings.activityBonus} 
                    onChange={v => setLocalSettings({...localSettings, activityBonus: v})} 
                    unit="Kč" 
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                 <InputField 
                    label="Retence (Udržení)" 
                    value={localSettings.retentionCommission} 
                    onChange={v => setLocalSettings({...localSettings, retentionCommission: v})} 
                    unit="Kč" 
                />
                 <InputField 
                    label="Retence (Hranice)" 
                    value={localSettings.retentionThreshold} 
                    onChange={v => setLocalSettings({...localSettings, retentionThreshold: v})} 
                    unit="Kč" 
                />
            </div>
        </div>

        {/* Bonusové vklady */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bonusové Vklady</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <InputField 
                    label="1 rok (Fixní odměna)" 
                    value={localSettings.deposit1YearFixed} 
                    onChange={v => setLocalSettings({...localSettings, deposit1YearFixed: v})} 
                    unit="Kč" 
                />
                 <InputField 
                    label="25 měsíců (% z částky)" 
                    value={localSettings.deposit25MonthRate} 
                    onChange={v => setLocalSettings({...localSettings, deposit25MonthRate: v})} 
                    unit="%" 
                />
            </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-4 pb-12">
             {isSaved && (
                <span className="text-green-600 dark:text-green-400 text-sm font-medium animate-in fade-in">Uloženo v pořádku</span>
            )}
            <button 
                type="submit" 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg"
            >
                <Save size={20} />
                Uložit Nastavení
            </button>
        </div>
      </form>
    </div>
  );
};