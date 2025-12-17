import React, { useState } from 'react';
import { Client } from '../types';
import { Search, ChevronRight, User, Plus, Trash2, X, Phone, Mail, Wallet } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  onAddClient: (client: Omit<Client, 'id' | 'portfolio'>) => void;
  onDeleteClient: (id: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ clients, onSelectClient, onAddClient, onDeleteClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: 30,
    occupation: '',
    income: 0,
    notes: '',
    lastContact: new Date().toISOString().split('T')[0]
  });

  const filteredClients = clients.filter(c => 
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClient(newClient);
    setIsModalOpen(false);
    // Reset form
    setNewClient({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        age: 30,
        occupation: '',
        income: 0,
        notes: '',
        lastContact: new Date().toISOString().split('T')[0]
    });
  };

  const inputClass = "w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm transition-colors";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative pb-20">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-30 bg-slate-50 dark:bg-slate-900 py-2 md:static">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white hidden md:block">Moje Portfolio</h2>
        <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Hledat..." 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white p-2.5 md:px-4 md:py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-sm shrink-0"
            >
                <Plus size={20} />
                <span className="hidden md:inline">Nový Klient</span>
            </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Jméno</th>
                <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium hidden md:table-cell">Poslední kontakt</th>
                <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium hidden md:table-cell">Příjem</th>
                <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium text-right">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredClients.map((client, index) => (
                <tr 
                  key={client.id} 
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group animate-in slide-in-from-bottom duration-300 fill-mode-both"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                  <td className="px-6 py-4 cursor-pointer" onClick={() => onSelectClient(client)}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-blue-900/30 flex items-center justify-center text-primary-600 dark:text-blue-400">
                        <User size={16} />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{client.lastName} {client.firstName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 hidden md:table-cell cursor-pointer" onClick={() => onSelectClient(client)}>
                    {new Date(client.lastContact).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 hidden md:table-cell cursor-pointer" onClick={() => onSelectClient(client)}>
                    {client.income.toLocaleString('cs-CZ')} Kč
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteClient(client.id); }}
                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Smazat klienta"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                        onClick={() => onSelectClient(client)}
                        className="text-primary-600 hover:text-primary-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredClients.map((client, index) => (
            <div 
                key={client.id}
                onClick={() => onSelectClient(client)}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 active:scale-[0.98] transition-transform animate-in slide-in-from-bottom duration-300 fill-mode-both"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                            {client.lastName[0]}{client.firstName[0]}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{client.lastName} {client.firstName}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{client.occupation || 'Nezadáno'}</p>
                        </div>
                    </div>
                    <button 
                         onClick={(e) => { e.stopPropagation(); onDeleteClient(client.id); }}
                         className="text-gray-300 hover:text-red-500 p-1"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-100 dark:border-slate-700 pt-3">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Wallet size={14} className="text-gray-400" />
                        <span>{client.income > 0 ? `${(client.income / 1000).toFixed(0)} tis. Kč` : '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 justify-end">
                        <span className="text-xs text-gray-400">Kontakt:</span>
                        <span>{new Date(client.lastContact).toLocaleDateString('cs-CZ')}</span>
                    </div>
                </div>
            </div>
        ))}
         {filteredClients.length === 0 && (
            <div className="text-center py-12 text-gray-400">
                <p>Žádný klient nenalezen.</p>
            </div>
        )}
      </div>

      {/* Modal - Responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
            <div className="bg-white dark:bg-slate-800 rounded-t-2xl md:rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 sticky top-0 z-10">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nový Klient</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jméno *</label>
                            <input 
                                required 
                                type="text" 
                                className={inputClass}
                                value={newClient.firstName}
                                onChange={e => setNewClient({...newClient, firstName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Příjmení *</label>
                            <input 
                                required 
                                type="text" 
                                className={inputClass}
                                value={newClient.lastName}
                                onChange={e => setNewClient({...newClient, lastName: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input 
                                type="email" 
                                className={inputClass}
                                value={newClient.email}
                                onChange={e => setNewClient({...newClient, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                            <input 
                                type="tel" 
                                className={inputClass}
                                value={newClient.phone}
                                onChange={e => setNewClient({...newClient, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Věk</label>
                            <input 
                                type="number" 
                                className={inputClass}
                                value={newClient.age === 0 ? '' : newClient.age}
                                onChange={e => setNewClient({...newClient, age: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Měsíční příjem</label>
                            <input 
                                type="number" 
                                className={inputClass}
                                value={newClient.income === 0 ? '' : newClient.income}
                                onChange={e => setNewClient({...newClient, income: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Povolání</label>
                        <input 
                            type="text" 
                            className={inputClass}
                            value={newClient.occupation}
                            onChange={e => setNewClient({...newClient, occupation: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-3 md:py-2 w-full md:w-auto text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium"
                        >
                            Zrušit
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-3 md:py-2 w-full md:w-auto text-white bg-blue-600 rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                            Uložit Klienta
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};