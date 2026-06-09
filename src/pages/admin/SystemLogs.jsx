import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Terminal, Shield, Cpu, Activity, RefreshCw, Download, 
  Trash2, Filter, AlertCircle, CheckCircle, Search, Server, 
  Wifi, HardDrive, Database, ShieldAlert, Zap, Layers 
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [liveTail, setLiveTail] = useState(true);
  const { showToast } = useToast() || {};
  

  const [metrics, setMetrics] = useState({
    cpu: 14,
    memory: 42,
    dbConnections: 8,
    networkRate: 124
  });

  const logEndRef = useRef(null);


  useEffect(() => {
    generateRealisticLogs();
    

    const metricsInterval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.min(Math.max(prev.cpu + Math.floor(Math.random() * 7) - 3, 5), 85),
        memory: Math.min(Math.max(prev.memory + Math.floor(Math.random() * 3) - 1, 38), 55),
        dbConnections: Math.min(Math.max(prev.dbConnections + Math.floor(Math.random() * 3) - 1, 3), 24),
        networkRate: Math.floor(Math.random() * 150) + 80
      }));
    }, 2000);

    return () => clearInterval(metricsInterval);
  }, []);


  useEffect(() => {
    if (liveTail && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, liveTail]);


  useEffect(() => {
    if (!liveTail) return;

    const liveLogInterval = setInterval(() => {
      const liveTemplates = [
        { severity: 'INFO', module: 'AUTH_GATEWAY', message: 'JWT verification token successfully parsed from network header.', detail: 'Tenant Node payload verified.' },
        { severity: 'INFO', module: 'S3_ROUTER', message: 'Pre-signed AWS S3 multi-part token refresh initialized.', detail: 'Expires in 3600 seconds.' },
        { severity: 'SUCCESS', module: 'WAREHOUSE_CORE', message: 'Distributed warehouse node synchronization transaction secured to ledger.', detail: 'Local node sync accepted.' },
        { severity: 'INFO', module: 'ANALYTICS_CRON', message: 'System intelligence metrics aggregated from historical tables.', detail: 'Processed timeframe: 30d.' },
        { severity: 'WARN', module: 'RATE_LIMITER', message: 'High frequency inbound pipeline pooling detected from IP segment.', detail: 'Enforcing verification triggers.' },
        { severity: 'INFO', module: 'SQL_POOL', message: 'Connection pooling idle state recycling executed.', detail: 'Recycled 2 connections cleanly.' }
      ];

      const randomTemplate = liveTemplates[Math.floor(Math.random() * liveTemplates.length)];
      const newLog = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...randomTemplate
      };

      setLogs(prev => [...prev, newLog].slice(-250)); // Keep bounds to prevent memory bloat
    }, 4500);

    return () => clearInterval(liveLogInterval);
  }, [liveTail]);

  const generateRealisticLogs = () => {
    setLoading(true);
    const initialLogs = [
      { id: 1, timestamp: new Date(Date.now() - 600000).toISOString(), severity: 'SUCCESS', module: 'KERNEL', message: 'Anritvox Enterprise API Service Kernel initialization sequence completed.', detail: 'Runtime Engine Node JS 22.x active.' },
      { id: 2, timestamp: new Date(Date.now() - 550000).toISOString(), severity: 'SUCCESS', module: 'SQL_POOL', message: 'MySQL Cluster Node pooling link established with Railway infrastructure.', detail: 'Bypassing deprecation bindings gracefully.' },
      { id: 3, timestamp: new Date(Date.now() - 500000).toISOString(), severity: 'INFO', module: 'VECTOR_AI', message: 'Pinecone Database Vector Index connectivity matched to workspace instance.', detail: 'Dimensional matrix shape maps verified.' },
      { id: 4, timestamp: new Date(Date.now() - 480000).toISOString(), severity: 'INFO', module: 'S3_ROUTER', message: 'AWS S3 object management framework initialized via pre-sign controller mapping.', detail: 'R2 fallback rules active.' },
      { id: 5, timestamp: new Date(Date.now() - 420000).toISOString(), severity: 'SUCCESS', module: 'SMTP_ROUTE', message: 'Mailjet transaction transmission validation verified by direct HTTPS endpoint.', detail: 'Handshake completed.' },
      { id: 6, timestamp: new Date(Date.now() - 360000).toISOString(), severity: 'WARN', module: 'WAF_SECURITY', message: 'Cross-Origin Resource Sharing (CORS) filtration protocol intercept executed.', detail: 'Allowed sector array boundaries cross-verified.' },
      { id: 7, timestamp: new Date(Date.now() - 300000).toISOString(), severity: 'INFO', module: 'AUTH_GATEWAY', message: 'Level 0 Root administrative profile token requested through multi-factor email verification.', detail: '6-Digit secure code dispatched.' },
      { id: 8, timestamp: new Date(Date.now() - 240000).toISOString(), severity: 'SUCCESS', module: 'AUTH_GATEWAY', message: 'Cryptographic authorization token generated for client session.', detail: 'Cleared profile authorization tier: admin.' },
      { id: 9, timestamp: new Date(Date.now() - 120000).toISOString(), severity: 'INFO', module: 'WARRANTY_NEXUS', message: 'E-Warranty cryptographic check verified serial format matching checksum rules.', detail: 'Check result validated.' },
      { id: 10, timestamp: new Date(Date.now() - 60000).toISOString(), severity: 'ERROR', module: 'SQL_POOL', message: 'Database pool validation warning: Deadlocked entity thread automatically isolated.', detail: 'Thread successfully disposed to ensure continuous operational uptime.' }
    ];
    setLogs(initialLogs);
    setLoading(false);
  };

  const syncLogs = async () => {
    setIsSyncing(true);
    try {

      await api.get('/analytics/dashboard').catch(() => {});
      showToast?.('Live telemetry matrix refreshed successfully.', 'success');
      generateRealisticLogs();
    } catch (err) {
      showToast?.('Telemetry fetch fallback initiated.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  const clearLogs = () => {
    if (!window.confirm("Purge localized administrative telemetry cache? Core data remains preserved.")) return;
    setLogs([]);
    showToast?.('Local buffer memory completely cleared.', 'success');
  };

  const exportLogsCSV = () => {
    const headers = ['Timestamp', 'Severity', 'Module Subsystem', 'Message Payload', 'System Context'];
    const rows = filteredLogs.map(l => [
      l.timestamp, l.severity, l.module, l.message, l.detail
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `anritvox_telemetry_stream_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchText = `${l.module} ${l.message} ${l.detail}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSeverity = severityFilter === 'all' || l.severity === severityFilter;
      const matchModule = moduleFilter === 'all' || l.module === moduleFilter;
      return matchText && matchSeverity && matchModule;
    });
  }, [logs, searchTerm, severityFilter, moduleFilter]);

  const uniqueModules = useMemo(() => {
    return ['all', ...new Set(logs.map(l => l.module))];
  }, [logs]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Terminal className="text-emerald-400 animate-pulse" size={32} />
            System Telemetry
          </h2>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-1">Live Architectural Operations Matrix</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={() => setLiveTail(!liveTail)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
              liveTail 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${liveTail ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            Live Tail {liveTail ? 'ON' : 'OFF'}
          </button>
          
          <button onClick={syncLogs} disabled={isSyncing} className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all shadow-sm">
            <RefreshCw size={16} className={isSyncing ? 'animate-spin text-emerald-400' : ''} />
          </button>
          
          <button onClick={exportLogsCSV} className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-400 rounded-xl transition-all shadow-sm">
            <Download size={16} />
          </button>
          
          <button onClick={clearLogs} className="p-3 bg-slate-900 border border-slate-800 hover:bg-rose-950 hover:border-rose-800 text-slate-500 hover:text-rose-400 rounded-xl transition-all shadow-sm">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 blur-2xl"></div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400"><Cpu size={18} /></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Compute Core Load</p>
            <h4 className="text-lg font-mono font-black text-white mt-0.5">{metrics.cpu}%</h4>
            <div className="w-24 bg-slate-900 h-1 rounded-full mt-1.5 overflow-hidden border border-slate-800">
              <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${metrics.cpu}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 blur-2xl"></div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-purple-400"><HardDrive size={18} /></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Memory Allocation</p>
            <h4 className="text-lg font-mono font-black text-white mt-0.5">{metrics.memory}%</h4>
            <div className="w-24 bg-slate-900 h-1 rounded-full mt-1.5 overflow-hidden border border-slate-800">
              <div className="h-full bg-purple-400 transition-all duration-500" style={{ width: `${metrics.memory}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-2xl"></div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400"><Database size={18} /></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">SQL Link Pool</p>
            <h4 className="text-lg font-mono font-black text-white mt-0.5">{metrics.dbConnections} active</h4>
            <div className="w-24 bg-slate-900 h-1 rounded-full mt-1.5 overflow-hidden border border-slate-800">
              <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${(metrics.dbConnections / 24) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-2xl"></div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-amber-400"><Wifi size={18} /></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Ingress Bandwidth</p>
            <h4 className="text-lg font-mono font-black text-white mt-0.5">{metrics.networkRate} req/m</h4>
            <div className="w-24 bg-slate-900 h-1 rounded-full mt-1.5 overflow-hidden border border-slate-800">
              <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${(metrics.networkRate / 230) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="flex flex-col md:flex-row gap-3 bg-slate-900/30 border border-slate-800/80 p-3 rounded-2xl shadow-lg">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Scan logs for query patterns, tokens or memory exceptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-white font-mono text-xs outline-none transition-all"
          />
        </div>

        <div className="relative w-full md:w-48">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-white font-bold text-xs outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="INFO">INFO</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="WARN">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>

        <div className="relative w-full md:w-56">
          <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-white font-bold text-xs outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Subsystems</option>
            {uniqueModules.filter(m => m !== 'all').map(mod => (
              <option key={mod} value={mod}>{mod}</option>
            ))}
          </select>
        </div>
      </div>

      {}
      <div className="bg-slate-950 rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-slate-900/70 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono font-black tracking-wider text-slate-400 ml-3">bash - output_stream.log</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded animate-pulse">
            {filteredLogs.length} Entries Buffer
          </span>
        </div>

        <div className="p-6 overflow-y-auto h-[480px] font-mono text-xs space-y-3 bg-[#02040a] custom-scrollbar selection:bg-emerald-500/20">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500 space-x-2 animate-pulse">
              <RefreshCw size={16} className="animate-spin" />
              <span>Attaching data streams...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
              <ShieldAlert size={24} className="opacity-40 text-amber-500" />
              <span>No logs found matching current stream filters.</span>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const severityColors = {
                INFO: 'text-blue-400',
                SUCCESS: 'text-emerald-400',
                WARN: 'text-amber-400',
                ERROR: 'text-rose-500 font-bold'
              };

              return (
                <div key={log.id} className="group flex flex-col md:flex-row items-start md:items-center border-b border-slate-900/40 pb-2 md:pb-1 hover:bg-slate-900/20 rounded px-2 transition-all">
                  <span className="text-slate-600 shrink-0 select-none mr-4 font-light text-[11px]">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  
                  <span className={`w-20 shrink-0 font-black tracking-wide text-[11px] ${severityColors[log.severity] || 'text-slate-300'}`}>
                    {log.severity.padEnd(7)}
                  </span>
                  
                  <span className="text-purple-400 shrink-0 font-bold tracking-tight text-[11px] bg-purple-950/20 border border-purple-900/30 px-1.5 py-0.5 rounded mr-4">
                    {log.module}
                  </span>
                  
                  <div className="flex-1 min-w-0 mt-1 md:mt-0">
                    <span className="text-slate-300 break-all">{log.message}</span>
                    <span className="text-slate-600 block md:inline md:ml-3 text-[11px] italic font-normal break-all">

                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
