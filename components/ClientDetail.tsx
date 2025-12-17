import React, { useState, useEffect, useRef } from 'react';
import { Client, PortfolioItem, CommissionSettings } from '../types';
import { analyzeClientPortfolio } from '../services/geminiService';
import { ArrowLeft, Sparkles, FileText, PieChart, Shield, Home, Briefcase, Mail, Phone, Plus, X, Coins, TrendingUp, CreditCard, Landmark, Car, Edit2, Save, Calendar } from 'lucide-react';

interface ClientDetailProps {
  client: Client;
  commissionSettings: CommissionSettings;
  onBack: () => void;
  onAddProduct: (item: Omit<PortfolioItem, 'id'>) => void;
  onUpdateClient: (updatedClient: Client) => void;
}

export const ClientDetail: React.FC<ClientDetailProps> = ({ client, commissionSettings, onBack, onAddProduct, onUpdateClient }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-analysis' | 'documents'>('overview');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<Client>(client);

  // Quick Note Edit State
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(client.notes);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  // Sync editedClient if client prop changes
  useEffect(() => {
    setEditedClient(client);
    setTempNotes(client.notes);
  }, [client]);

  // Focus textarea when clicking on notes
  useEffect(() => {
    if (isEditingNotes && noteInputRef.current) {
        noteInputRef.current.focus();
    }
  }, [isEditingNotes]);

  // New product state
  const [newProduct, setNewProduct] = useState<Partial<PortfolioItem> & { 
    commissionType: 'PERCENTAGE' | 'FIXED', 
    commissionInput: number,
    isExisting: boolean 
  }>({
    type: 'Investice',
    name: '',
    value: 0,
    details: '',
    commissionType: 'PERCENTAGE',
    commissionInput: 0,
    isExisting: false
  });

  // Local state for sub-variants
  const [ssVariant, setSsVariant] = useState<'PRVOTNI' | 'NASLEDNA'>('PRVOTNI');
  const [depositVariant, setDepositVariant] = useState<'1ROK' | '25MESICU'>('1ROK');
  const [loanVariant, setLoanVariant] = useState<'NEZAJISTENY' | 'ZAJISTENY' | 'RADNY'>('NEZAJISTENY');
  const [accountVariant, setAccountVariant] = useState<'IDENTITY_ONLY' | 'ACCOUNT_ONLY' | 'FULL' | 'ACTIVITY'>('FULL');

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm transition-colors";

  // Effect to update default commission
  useEffect(() => {
    if (newProduct.isExisting) {
        setNewProduct(prev => ({ ...prev, commissionInput: 0, commissionType: 'FIXED' }));
        return;
    }

    let type = 'PERCENTAGE';
    let input = 0;

    switch(newProduct.type) {
        case 'Hypotéka':
            type = 'PERCENTAGE';
            input = commissionSettings.mortgageRate;
            break;
        case 'Investice':
            type = 'PERCENTAGE';
            input = commissionSettings.investmentRate;
            break;
        case 'Pojištění': 
            type = 'PERCENTAGE';
            input = commissionSettings.lifeInsuranceRate;
            break;
         case 'Pojištění nemovitosti':
            type = 'PERCENTAGE';
            input = commissionSettings.propertyInsuranceRate;
            break;
         case 'Autopojištění':
            type = 'PERCENTAGE';
            input = commissionSettings.autoInsuranceRate;
            break;
        case 'Penzijní spoření':
            type = 'FIXED';
            input = commissionSettings.pensionFixed;
            break;
        case 'Spořící účet':
            type = 'FIXED';
            input = commissionSettings.savingsAccountFixed;
            break;
        case 'Stavební spoření':
            type = 'FIXED';
            input = 0; 
            break;
        case 'Bonusový vklad':
            if (depositVariant === '1ROK') {
                type = 'FIXED';
                input = commissionSettings.deposit1YearFixed;
            } else {
                type = 'PERCENTAGE';
                input = commissionSettings.deposit25MonthRate;
            }
            break;
        case 'Úvěr ze SS':
             type = 'PERCENTAGE';
             if (loanVariant === 'NEZAJISTENY') input = commissionSettings.buUnsecuredLoanRate;
             else if (loanVariant === 'ZAJISTENY') input = commissionSettings.buSecuredLoanRate;
             else input = commissionSettings.buRegularLoanRate;
             break;
        case 'Běžný účet':
             type = 'FIXED';
             if (accountVariant === 'IDENTITY_ONLY') input = commissionSettings.identityCommission;
             else if (accountVariant === 'ACCOUNT_ONLY') input = commissionSettings.accountCommission;
             else if (accountVariant === 'FULL') input = commissionSettings.identityCommission + commissionSettings.accountCommission;
             else if (accountVariant === 'ACTIVITY') input = commissionSettings.activityBonus;
             break;
        case 'Retence':
            type = 'FIXED';
            input = commissionSettings.retentionCommission;
            break;
    }

    setNewProduct(prev => ({
        ...prev,
        commissionType: type as any,
        commissionInput: input
    }));
  }, [newProduct.type, commissionSettings, isProductModalOpen, depositVariant, ssVariant, loanVariant, accountVariant, newProduct.isExisting]);

  // Recalculate Logic for fixed/threshold items
  useEffect(() => {
      if (newProduct.isExisting) return;

      if (newProduct.type === 'Stavební spoření') {
          const value = newProduct.value || 0;
          let calculatedCommission = 0;
          
          if (ssVariant === 'PRVOTNI') {
              calculatedCommission = value > 500000 
                ? commissionSettings.ssFirstOver500 
                : commissionSettings.ssFirstUnder500;
          } else {
               calculatedCommission = value > 500000 
                ? commissionSettings.ssNextOver500 
                : commissionSettings.ssNextUnder500;
          }
          setNewProduct(prev => ({ ...prev, commissionType: 'FIXED', commissionInput: calculatedCommission }));
      }

      if (newProduct.type === 'Retence') {
           const value = newProduct.value || 0;
           const calculatedCommission = value >= commissionSettings.retentionThreshold ? commissionSettings.retentionCommission : 0;
            setNewProduct(prev => ({ ...prev, commissionType: 'FIXED', commissionInput: calculatedCommission }));
      }

  }, [newProduct.value, ssVariant, newProduct.type, commissionSettings, newProduct.isExisting]);


  const handleRunAnalysis = async () => {
    setIsLoadingAi(true);
    const result = await analyzeClientPortfolio(client);
    setAiAnalysis(result);
    setIsLoadingAi(false);
  };

  const handleSaveClient = () => {
    onUpdateClient(editedClient);
    setIsEditing(false);
  }

  const handleNotesBlur = () => {
      setIsEditingNotes(false);
      // Save changes immediately
      if (tempNotes !== client.notes) {
          onUpdateClient({ ...client, notes: tempNotes });
      }
  };

  const calculateCommission = () => {
    if (newProduct.isExisting) return 0;

    if (newProduct.type === 'Stavební spoření' || newProduct.type === 'Retence' || newProduct.type === 'Penzijní spoření' || newProduct.type === 'Spořící účet') {
        return newProduct.commissionInput;
    }

    const value = Math.abs(newProduct.value || 0);

    if (newProduct.type === 'Pojištění') {
        const annualPremium = value * 12;
        return (annualPremium * (newProduct.commissionInput / 100));
    }

    if (newProduct.type === 'Pojištění nemovitosti' || newProduct.type === 'Autopojištění') {
        return (value * (newProduct.commissionInput / 100));
    }

    if (newProduct.commissionType === 'PERCENTAGE') {
        return (value * (newProduct.commissionInput / 100));
    }
    return newProduct.commissionInput;
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCommission = calculateCommission();
    
    let finalDetails = newProduct.details || '';
    if (newProduct.isExisting) {
        finalDetails = `(Externí) ${finalDetails}`;
    }
    else if (newProduct.type === 'Stavební spoření') {
        finalDetails = `Typ: ${ssVariant === 'PRVOTNI' ? 'Prvotní smlouva' : 'Následná smlouva'}. ${finalDetails}`;
    } else if (newProduct.type === 'Bonusový vklad') {
        finalDetails = `Varianta: ${depositVariant === '1ROK' ? '1 rok' : '25 měsíců'}. ${finalDetails}`;
    } else if (newProduct.type === 'Úvěr ze SS') {
        const variants = { NEZAJISTENY: 'Nezajištěný meziúvěr', ZAJISTENY: 'Zajištěný úvěr', RADNY: 'Řádný úvěr' };
        finalDetails = `Typ: ${variants[loanVariant]}. ${finalDetails}`;
    } else if (newProduct.type === 'Běžný účet') {
        const variants = { IDENTITY_ONLY: 'Pouze Identita', ACCOUNT_ONLY: 'Pouze Účet', FULL: 'Účet + Identita', ACTIVITY: 'Bonus za aktivitu' };
        finalDetails = `Balíček: ${variants[accountVariant]}. ${finalDetails}`;
    }

    // Use selected type as default name if name is empty
    const finalName = newProduct.name?.trim() ? newProduct.name : newProduct.type;

    onAddProduct({
        type: newProduct.type as any,
        name: finalName,
        value: newProduct.value || 0,
        details: finalDetails,
        expiryDate: newProduct.expiryDate,
        createdDate: new Date().toISOString(), // TIMESTAMP
        commissionType: newProduct.commissionType,
        commissionInput: newProduct.commissionInput,
        commissionFinal: finalCommission,
        isExisting: newProduct.isExisting
    });
    setIsProductModalOpen(false);
  };

  const getPortfolioIcon = (type: PortfolioItem['type']) => {
    switch(type) {
      case 'Hypotéka': return <Home size={18} />;
      case 'Úvěr ze SS': return <Home size={18} className="text-orange-600" />;
      case 'Investice': return <PieChart size={18} />;
      case 'Pojištění': return <Shield size={18} />;
      case 'Pojištění nemovitosti': return <Home size={18} className="text-blue-600" />;
      case 'Autopojištění': return <Car size={18} />;
      case 'Stavební spoření': return <Home size={18} className="text-orange-600" />;
      case 'Bonusový vklad': return <TrendingUp size={18} />;
      case 'Spořící účet': return <TrendingUp size={18} className="text-green-600" />;
      case 'Běžný účet': return <CreditCard size={18} />;
      case 'Retence': return <Landmark size={18} />;
      default: return <Briefcase size={18} />;
    }
  };

  const getValueLabel = () => {
    switch (newProduct.type) {
        case 'Pojištění': return 'Měsíční pojistné (Kč)';
        case 'Pojištění nemovitosti':
        case 'Autopojištění': return 'Roční pojistné (Kč)';
        case 'Hypotéka':
        case 'Úvěr ze SS': return 'Výše úvěru (Kč)';
        case 'Investice': return 'Objem investice (Kč)';
        case 'Stavební spoření': return 'Cílová částka (Kč)';
        default: return 'Hodnota / Vklad (Kč)';
    }
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-300 relative pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <ArrowLeft size={24} />
            </button>
            <div>
                {isEditing ? (
                     <div className="flex flex-col md:flex-row gap-2">
                        <input 
                            value={editedClient.firstName}
                            onChange={e => setEditedClient({...editedClient, firstName: e.target.value})}
                            className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-lg font-bold w-full md:w-32 dark:text-white"
                        />
                         <input 
                            value={editedClient.lastName}
                            onChange={e => setEditedClient({...editedClient, lastName: e.target.value})}
                            className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-lg font-bold w-full md:w-32 dark:text-white"
                        />
                     </div>
                ) : (
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{client.firstName} {client.lastName}</h2>
                )}
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm flex items-center space-x-2 mt-1">
                    <span>Naposledy: {new Date(client.lastContact).toLocaleDateString('cs-CZ')}</span>
                </p>
            </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
            {isEditing ? (
                <button 
                    onClick={handleSaveClient}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                >
                    <Save size={18} />
                    Uložit
                </button>
            ) : (
                 <button 
                    onClick={() => setIsEditing(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors shadow-sm font-medium"
                >
                    <Edit2 size={18} />
                    Upravit
                </button>
            )}
            <button 
                onClick={() => setIsProductModalOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
                <Plus size={18} />
                <span className="hidden md:inline">Přidat Produkt</span>
                <span className="md:hidden">Produkt</span>
            </button>
        </div>
      </div>

      {/* Stats Strip / Editable Fields */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Věk</p>
          {isEditing ? (
              <input 
                type="number"
                value={editedClient.age || ''}
                onChange={e => setEditedClient({...editedClient, age: Number(e.target.value)})}
                className="w-full mt-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded px-2 py-1 text-sm dark:text-white"
              />
          ) : (
             <p className="text-base md:text-lg font-medium dark:text-gray-200">{client.age} let</p>
          )}
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Povolání</p>
          {isEditing ? (
              <input 
                type="text"
                value={editedClient.occupation}
                onChange={e => setEditedClient({...editedClient, occupation: e.target.value})}
                className="w-full mt-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded px-2 py-1 text-sm dark:text-white"
              />
          ) : (
            <p className="text-base md:text-lg font-medium dark:text-gray-200 truncate" title={client.occupation}>{client.occupation}</p>
          )}
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm col-span-2 md:col-span-1">
          <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Měsíční Příjem</p>
           {isEditing ? (
              <input 
                type="number"
                value={editedClient.income || ''}
                onChange={e => setEditedClient({...editedClient, income: Number(e.target.value)})}
                className="w-full mt-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded px-2 py-1 text-sm dark:text-white"
              />
          ) : (
             <p className="text-base md:text-lg font-medium dark:text-gray-200">{client.income.toLocaleString('cs-CZ')} Kč</p>
          )}
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm col-span-2 md:col-span-1">
          <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Kontakt</p>
          {isEditing ? (
              <div className="space-y-2 mt-1">
                   <input 
                    type="email"
                    value={editedClient.email}
                    onChange={e => setEditedClient({...editedClient, email: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded px-2 py-1 text-xs dark:text-white"
                    placeholder="Email"
                  />
                  <input 
                    type="tel"
                    value={editedClient.phone}
                    onChange={e => setEditedClient({...editedClient, phone: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded px-2 py-1 text-xs dark:text-white"
                    placeholder="Telefon"
                  />
              </div>
          ) : (
            <div className="flex space-x-3 mt-1">
                <a href={`mailto:${client.email}`} className="text-gray-500 dark:text-gray-300 hover:text-primary-600 bg-gray-50 dark:bg-slate-700 p-1.5 rounded-full"><Mail size={16} /></a>
                <a href={`tel:${client.phone}`} className="text-gray-500 dark:text-gray-300 hover:text-primary-600 bg-gray-50 dark:bg-slate-700 p-1.5 rounded-full"><Phone size={16} /></a>
            </div>
          )}
        </div>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="border-b border-gray-200 dark:border-gray-700 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar">
        <nav className="-mb-px flex space-x-6 min-w-max">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Přehled Portfolia
          </button>
          <button
            onClick={() => setActiveTab('ai-analysis')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'ai-analysis' 
                ? 'border-purple-500 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Sparkles size={16} className={activeTab === 'ai-analysis' ? 'text-purple-500' : 'text-gray-400'} />
            <span>AI Asistent</span>
          </button>
          <button
             onClick={() => setActiveTab('documents')}
             className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
               activeTab === 'documents' 
                 ? 'border-primary-500 text-primary-600' 
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
             }`}
          >
             <FileText size={16} />
             <span>Dokumenty</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white hidden md:block">Aktivní Produkty</h3>
             {client.portfolio.length === 0 ? (
               <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                 Tento klient nemá žádné aktivní produkty.
               </div>
             ) : (
               <div className="grid gap-3 md:gap-4">
                 {client.portfolio.map((item, index) => (
                   <div 
                      key={item.id} 
                      className={`bg-white dark:bg-slate-800 p-4 rounded-lg border ${item.isExisting ? 'border-dashed border-gray-300 dark:border-gray-600 opacity-80' : 'border-gray-100 dark:border-slate-700'} shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in slide-in-from-bottom duration-500`}
                      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                   >
                     <div className="flex items-center space-x-3 md:space-x-4">
                       <div className={`p-3 rounded-lg ${
                         item.isExisting ? 'bg-gray-100 dark:bg-slate-700 text-gray-500' :
                         item.value < 0 ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                       }`}>
                         {getPortfolioIcon(item.type)}
                       </div>
                       <div className="flex-1">
                         <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                            {item.isExisting && (
                                <span className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-600 whitespace-nowrap">
                                    Externí
                                </span>
                            )}
                            {!item.isExisting && item.commissionFinal && (
                                <span className="text-[10px] bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded border border-green-200 dark:border-green-800 whitespace-nowrap" title="Provize">
                                    {item.commissionFinal.toLocaleString('cs-CZ')} Kč
                                </span>
                            )}
                         </div>
                         <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{item.type} • {item.details}</p>
                       </div>
                     </div>
                     <div className="flex justify-between md:block md:text-right border-t md:border-t-0 border-gray-50 dark:border-slate-700 pt-2 md:pt-0">
                       <span className="md:hidden text-sm text-gray-500">Hodnota:</span>
                       <div>
                           <p className={`font-bold ${item.value < 0 ? 'text-gray-900 dark:text-gray-100' : 'text-green-600 dark:text-green-400'}`}>
                             {item.value.toLocaleString('cs-CZ')} Kč
                           </p>
                           {item.expiryDate && (
                             <p className="text-[10px] md:text-xs text-orange-600 font-medium mt-1 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full inline-block">
                               Exp: {new Date(item.expiryDate).toLocaleDateString('cs-CZ')}
                             </p>
                           )}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
             
             <div className="mt-8">
               <div className="flex justify-between items-center mb-2">
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Poznámky</h3>
               </div>
               
               {isEditingNotes ? (
                   <textarea 
                        ref={noteInputRef}
                        className="w-full h-32 p-4 bg-yellow-50 dark:bg-slate-800 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg text-gray-800 dark:text-white focus:ring-4 focus:ring-yellow-400/30 focus:outline-none transition-all shadow-md text-sm md:text-base"
                        value={tempNotes}
                        onChange={e => setTempNotes(e.target.value)}
                        onBlur={handleNotesBlur}
                        placeholder="Zadejte poznámky ke klientovi..."
                   />
               ) : (
                   <div 
                        onClick={() => setIsEditingNotes(true)}
                        className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-100 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 text-sm whitespace-pre-wrap cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/50 hover:border-yellow-300 transition-all min-h-[50px] relative group"
                        title="Klikněte pro úpravu"
                   >
                        {client.notes ? client.notes : <span className="text-yellow-800/50 italic">Klikněte sem pro přidání poznámky...</span>}
                        <div className="absolute top-2 right-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 size={14} className="text-yellow-600" />
                        </div>
                   </div>
               )}
             </div>
          </div>
        )}

        {/* AI Analysis Tab */}
         {activeTab === 'ai-analysis' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in duration-300">
              <div className="p-4 md:p-6 bg-gradient-to-r from-purple-50 to-white dark:from-slate-800 dark:to-slate-700 border-b border-gray-100 dark:border-slate-600">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="text-purple-600 dark:text-purple-400" size={20} />
                    AI Finanční Analýza
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Generováno modelem Gemini na základě portfolia.
                  </p>
                </div>
                {!aiAnalysis && (
                  <button 
                    onClick={handleRunAnalysis}
                    disabled={isLoadingAi}
                    className="w-full md:w-auto px-4 py-3 md:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoadingAi ? 'Analyzuji...' : 'Spustit Analýzu'}
                    {!isLoadingAi && <Sparkles size={16} />}
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-4 md:p-6 min-h-[300px]">
              {isLoadingAi ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <p className="text-gray-500 animate-pulse">Analyzuji data a poznámky...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="prose prose-sm prose-purple dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 animate-in fade-in">
                    <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-100 dark:border-purple-800 mb-4 text-xs text-purple-800 dark:text-purple-300 flex items-center gap-2">
                        <Shield size={14} />
                        Tato analýza je vygenerována umělou inteligencí a slouží pouze jako podklad pro poradce.
                    </div>
                   <div dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/- (.*?)(<br \/>|$)/g, '• $1<br />') }} />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Klikněte na "Spustit Analýzu" pro získání AI doporučení.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dokumenty</h3>
              <div className="text-center py-12 bg-gray-50 dark:bg-slate-900 rounded-lg border border-dashed border-gray-200 dark:border-gray-600">
                 <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                 <p className="text-gray-500 dark:text-gray-400">Zatím žádné dokumenty.</p>
              </div>
           </div>
        )}
      </div>

       {/* Add Product Modal - Full Screen Mobile */}
       {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
            <div className="bg-white dark:bg-slate-800 rounded-t-2xl md:rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom duration-300 h-[90vh] md:h-auto md:max-h-[90vh] flex flex-col my-0 md:my-8 border border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-slate-900/50 sticky top-0 z-10 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nový Produkt</h3>
                    <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>
                <div className="overflow-y-auto p-6 space-y-4 flex-1">
                <form id="productForm" onSubmit={handleAddProductSubmit} className="space-y-4">
                    
                    {/* External Checkbox */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                         <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={newProduct.isExisting}
                                onChange={e => setNewProduct({...newProduct, isExisting: e.target.checked})}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div>
                                <span className="font-medium text-gray-900 dark:text-white block">Klient již vlastní (Bez provize)</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Produkt sjednán dříve nebo u jiné instituce.</span>
                            </div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ</label>
                            <select 
                                className={inputClass}
                                value={newProduct.type}
                                onChange={e => setNewProduct({...newProduct, type: e.target.value as any})}
                            >
                                <option value="Investice">Investice</option>
                                <option value="Hypotéka">Hypotéka</option>
                                <option value="Úvěr ze SS">Úvěr ze SS</option>
                                <option value="Pojištění">Životní Pojištění</option>
                                <option value="Pojištění nemovitosti">Pojištění Nemovitosti</option>
                                <option value="Autopojištění">Autopojištění</option>
                                <option value="Penzijní spoření">Penzijní spoření</option>
                                <option value="Stavební spoření">Stavební spoření</option>
                                <option value="Bonusový vklad">Bonusový vklad</option>
                                <option value="Spořící účet">Spořící účet</option>
                                <option value="Běžný účet">Běžný účet / Identita</option>
                                <option value="Retence">Retence</option>
                            </select>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Název (Volitelné)</label>
                            <input 
                                type="text" 
                                placeholder={newProduct.type}
                                className={inputClass}
                                value={newProduct.name}
                                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Dynamic Variant Selectors */}
                    {!newProduct.isExisting && newProduct.type === 'Stavební spoření' && (
                        <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg border border-orange-100 dark:border-orange-800 mb-2">
                             <label className="block text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">Typ smlouvy</label>
                             <div className="flex gap-4 flex-wrap">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="ssVariant" 
                                        checked={ssVariant === 'PRVOTNI'} 
                                        onChange={() => setSsVariant('PRVOTNI')}
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Prvotní smlouva</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="ssVariant" 
                                        checked={ssVariant === 'NASLEDNA'} 
                                        onChange={() => setSsVariant('NASLEDNA')}
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Následná smlouva</span>
                                </label>
                             </div>
                        </div>
                    )}

                    {!newProduct.isExisting && newProduct.type === 'Úvěr ze SS' && (
                        <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg border border-orange-100 dark:border-orange-800 mb-2">
                             <label className="block text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">Typ úvěru</label>
                             <select 
                                className="w-full border border-orange-200 dark:border-orange-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-slate-700 dark:text-white"
                                value={loanVariant}
                                onChange={e => setLoanVariant(e.target.value as any)}
                            >
                                <option value="NEZAJISTENY">Nezajištěný meziúvěr (2,9%)</option>
                                <option value="ZAJISTENY">Zajištěný úvěr (1,4%)</option>
                                <option value="RADNY">Řádný úvěr (1,9%)</option>
                            </select>
                        </div>
                    )}

                    {!newProduct.isExisting && newProduct.type === 'Běžný účet' && (
                        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-100 dark:border-purple-800 mb-2">
                             <label className="block text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">Typ služby</label>
                             <select 
                                className="w-full border border-purple-200 dark:border-purple-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-slate-700 dark:text-white"
                                value={accountVariant}
                                onChange={e => setAccountVariant(e.target.value as any)}
                            >
                                <option value="FULL">Komplet (Účet + Identita)</option>
                                <option value="ACCOUNT_ONLY">Pouze Účet</option>
                                <option value="IDENTITY_ONLY">Pouze Identita</option>
                                <option value="ACTIVITY">Bonus za aktivitu</option>
                            </select>
                        </div>
                    )}

                    {!newProduct.isExisting && newProduct.type === 'Bonusový vklad' && (
                        <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-100 dark:border-green-800 mb-2">
                             <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-1">Délka vkladu</label>
                             <select 
                                className="w-full border border-green-200 dark:border-green-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-slate-700 dark:text-white"
                                value={depositVariant}
                                onChange={e => setDepositVariant(e.target.value as any)}
                            >
                                <option value="1ROK">1 rok (Fixní odměna)</option>
                                <option value="25MESICU">25 měsíců (% z vkladu)</option>
                            </select>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {getValueLabel()}
                        </label>
                        <input 
                            required
                            type="number" 
                            className={inputClass}
                            value={newProduct.value === 0 ? '' : newProduct.value}
                            onChange={e => setNewProduct({...newProduct, value: Number(e.target.value)})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Pro hypotéky/úvěry zadejte zápornou hodnotu.</p>
                    </div>

                    {!newProduct.isExisting && (
                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600 space-y-3">
                        <div className="flex items-center gap-2 text-gray-800 dark:text-white font-medium mb-1">
                            <Coins size={16} />
                            <span>Provize</span>
                        </div>
                        
                        {(newProduct.type === 'Stavební spoření' || newProduct.type === 'Retence' || newProduct.type === 'Běžný účet' || newProduct.type === 'Spořící účet' || newProduct.type === 'Penzijní spoření') ? (
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Automaticky vypočteno:</span>
                                <span className="font-bold text-orange-600 dark:text-orange-400 text-lg">{calculateCommission().toLocaleString('cs-CZ')} Kč</span>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Typ Provize</label>
                                        <select 
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-slate-600 dark:text-white"
                                            value={newProduct.commissionType}
                                            onChange={e => setNewProduct({...newProduct, commissionType: e.target.value as any})}
                                            disabled={newProduct.type === 'Bonusový vklad' && depositVariant === '1ROK'}
                                        >
                                            <option value="PERCENTAGE">Procento (%)</option>
                                            <option value="FIXED">Fixní (Kč)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            {newProduct.commissionType === 'PERCENTAGE' ? 'Sazba %' : 'Částka Kč'}
                                        </label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-slate-600 dark:text-white"
                                            value={newProduct.commissionInput === 0 ? '' : newProduct.commissionInput}
                                            onChange={e => setNewProduct({...newProduct, commissionInput: Number(e.target.value)})}
                                            disabled={newProduct.type === 'Bonusový vklad' && depositVariant === '1ROK'}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Vypočítaná provize:</span>
                                    <span className="font-bold text-gray-800 dark:text-white">{calculateCommission().toLocaleString('cs-CZ')} Kč</span>
                                </div>
                                {newProduct.type === 'Pojištění' && (
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">Počítáno jako {newProduct.commissionInput}% z ročního pojistného (12 x měsíční).</p>
                                )}
                            </>
                        )}
                    </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detaily</label>
                        <textarea 
                            className={inputClass + " h-20"}
                            value={newProduct.details}
                            onChange={e => setNewProduct({...newProduct, details: e.target.value})}
                        />
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Datum Expirace (Volitelné)</label>
                        <input 
                            type="date" 
                            className={inputClass}
                            value={newProduct.expiryDate || ''}
                            onChange={e => setNewProduct({...newProduct, expiryDate: e.target.value})}
                        />
                    </div>
                    </form>
                    </div>

                    <div className="flex justify-end gap-3 p-4 pt-2 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky bottom-0 z-10 shrink-0">
                        <button 
                            type="button" 
                            onClick={() => setIsProductModalOpen(false)}
                            className="px-4 py-3 md:py-2 flex-1 md:flex-none text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-600 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-500 text-sm font-medium"
                        >
                            Zrušit
                        </button>
                        <button 
                            type="submit" 
                            form="productForm"
                            className="px-4 py-3 md:py-2 flex-1 md:flex-none text-white bg-blue-600 rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                            Uložit Produkt
                        </button>
                    </div>
            </div>
        </div>
       )}
    </div>
  );
};