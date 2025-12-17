import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { Calendar as CalendarIcon, Clock, MoreVertical, RefreshCw, Plus } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch(type) {
      case 'MEETING': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'TASK': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'REMINDER': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

  // Group by date simple implementation
  const groupedEvents: { [key: string]: CalendarEvent[] } = {};
  sortedEvents.forEach(event => {
    const dateKey = event.start.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groupedEvents[dateKey]) groupedEvents[dateKey] = [];
    groupedEvents[dateKey].push(event);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kalendář</h2>
          <p className="text-gray-500 dark:text-gray-400">Synchronizováno s Google Calendar</p>
        </div>
        <div className="flex space-x-3">
             <button 
            onClick={handleSync}
            className={`p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors ${isSyncing ? 'animate-spin' : ''}`}
            title="Synchronizovat"
          >
            <RefreshCw size={20} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
            <Plus size={20} />
            <span>Nová Událost</span>
          </button>
        </div>
      </div>

      {!isConnected ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 text-center">
          <CalendarIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Připojte svůj kalendář</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Propojte aplikaci s Google Calendar nebo Outlook pro automatickou synchronizaci schůzek s klienty.
          </p>
          <button 
            onClick={() => setIsConnected(true)}
            className="px-6 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2 mx-auto"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Připojit Google Calendar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Object.keys(groupedEvents).map(date => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 sticky top-0 bg-slate-50 dark:bg-slate-900 py-2 z-10">
                  {date}
                </h3>
                <div className="space-y-3">
                  {groupedEvents[date].map(event => (
                    <div key={event.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex flex-col items-center min-w-[60px]">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {event.start.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {event.end.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`w-1 self-stretch rounded-full ${event.type === 'MEETING' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.description}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(groupedEvents).length === 0 && (
                <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                    <p className="text-gray-500 dark:text-gray-400">Žádné nadcházející události.</p>
                </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 h-fit">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Nadcházející týden</h3>
            {/* Simplified Mini Calendar Visualization */}
            <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
              <div className="text-gray-400 dark:text-gray-500 text-xs">Po</div>
              <div className="text-gray-400 dark:text-gray-500 text-xs">Út</div>
              <div className="text-gray-400 dark:text-gray-500 text-xs">St</div>
              <div className="text-gray-400 dark:text-gray-500 text-xs">Čt</div>
              <div className="text-gray-400 dark:text-gray-500 text-xs">Pá</div>
              <div className="text-gray-400 dark:text-gray-500 text-xs">So</div>
              <div className="text-gray-400 dark:text-gray-500 text-xs">Ne</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-700 dark:text-gray-300">
                {[...Array(30)].map((_, i) => (
                    <div key={i} className={`p-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 ${i === 12 ? 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500' : ''}`}>
                        {i + 1}
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Integrace</h4>
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Google Calendar</span>
                    </div>
                    <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">Aktivní</span>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};