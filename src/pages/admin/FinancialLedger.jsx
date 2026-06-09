import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, ShieldCheck, Cpu, ArrowUpRight, ArrowDownLeft, 
  Layers, Database, Terminal, RefreshCw, Radio, FileText, Play
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function FinancialLedger() {
  const [transactions, setTransactions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ledgerBalance, setLedgerBalance] = useState(482910.45);
  const [gasPrice, setGasPrice] = useState(28);
  const { showToast } = useToast() || {};


  const [sandboxAmount, setSandboxAmount] = useState('');
  const [sandboxType, setSandboxType] = useState('DEBIT');
  const [sandboxDesc, setSandboxDesc] = useState('');

  useEffect(() => {

    const historicData = [
      { id: 'TX-9042', timestamp: new Date(Date.now() - 400000).toISOString(), type: 'CREDIT', amount: 14500.00, desc: 'Enterprise Subscription Liquidity Pool', hash: '0x8f3c...da91' },
      { id: 'TX-9041', timestamp: new Date(Date.now() - 900000).toISOString(), type: 'DEBIT', amount: 320.45, desc: 'Vercel Edge Network Router Overages', hash: '0x2a1e...44b2' },
      { id: 'TX-9040', timestamp: new Date(Date.now() - 1500000).toISOString(), type: 'CREDIT', amount: 8900.00, desc: 'API Gateway Commercial Tier Provision', hash: '0x7c9d...ee10' }
    ];
    setTransactions(historicData);


    const interval = setInterval(() => {
      setGasPrice(prev => Math.min(Math.max(prev + Math.floor(Math.random() * 5) - 2, 15), 65));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const injectSandboxTransaction = (e) => {
    e.preventDefault();
    if (!sandboxAmount || isNaN(sandboxAmount)) {
      showToast?.('Invalid quantitative ledger value entry.', 'error');
      return;
    }

    setIsProcessing(true);
    

    setTimeout(() => {
      const amt = parseFloat(sandboxAmount);
      const newTx = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        type: sandboxType,
        amount: amt,
        desc: sandboxDesc || 'Manual Sandbox Kernel Assertion',
        hash: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`
      };

      setTransactions(prev => [newTx, ...prev]);
      setLedgerBalance(prev => sandboxType === 'CREDIT' ? prev + amt : prev - amt);
      setIsProcessing(false);
      setSandboxAmount('');
      setSandboxDesc('');
      showToast?.('Ledger transaction committed to state vector pipeline.', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Layers className="text-cyan-400" size={32} />
            Financial Ledger System
          </h2>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-1">
            Secure Cryptographic Asset Pipeline // Core Ledger Sandbox
          </p>
        </div>
        <div className="text-right font-mono bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Ledger Integrity Hash</span>
          <span className="text-xs text-emerald-400 font-bold">SHA-256 SECURE LEVEL 0</span>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 w-fit mb-3"><DollarSign size={20} /></div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Aggregated Pipeline Asset Value</p>
          <h3 className="text-2xl font-mono font-black text-white mt-1">
            ${ledgerBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-purple-400 w-fit mb-3"><Cpu size={20} /></div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Calculated Compute Fee (Gas)</p>
          <h3 className="text-2xl font-mono font-black text-purple-400 mt-1">{gasPrice} Gwei</h3>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 w-fit mb-3"><ShieldCheck size={20} /></div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Asynchronous Consensus Sync</p>
          <h3 className="text-2xl font-mono font-black text-emerald-400 mt-1 flex items-center gap-2">
            <Radio size={16} className="animate-pulse text-emerald-400" /> 100% ONLINE
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 h-fit lg:col-span-1 space-y-4">
          <div className="border-b border-slate-900 pb-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Terminal size={14} className="text-cyan-400" />
              Developer Transaction Sandbox
            </h4>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">Inject direct mock events or write DB bindings later.</p>
          </div>

          <form onSubmit={injectSandboxTransaction} className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-slate-500 block mb-1 text-[11px] uppercase">Transaction Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSandboxType('CREDIT')}
                  className={`py-2 rounded-lg font-bold border transition-all ${sandboxType === 'CREDIT' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                  CREDIT (Inflow)
                </button>
                <button
                  type="button"
                  onClick={() => setSandboxType('DEBIT')}
                  className={`py-2 rounded-lg font-bold border transition-all ${sandboxType === 'DEBIT' ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                  DEBIT (Outflow)
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1 text-[11px] uppercase">Quantitative Value ($)</label>
              <input 
                type="text" 
                value={sandboxAmount}
                onChange={(e) => setSandboxAmount(e.target.value)}
                placeholder="0.00" 
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-2.5 text-white outline-none font-bold"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1 text-[11px] uppercase">System Context Description</label>
              <input 
                type="text" 
                value={sandboxDesc}
                onChange={(e) => setSandboxDesc(e.target.value)}
                placeholder="e.g. AWS Multi-Region Deployment Provision" 
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-2.5 text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-black uppercase tracking-wider py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isProcessing ? <RefreshCw className="animate-spin" size={14} /> : <Play size={12} />}
              Execute Ledger Commit
            </button>
          </form>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3 text-[11px] font-mono text-slate-400 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">// Production Readiness Notice</span>
            <p>To wire this system to production, map your backend database route endpoint inside this codeblock container:</p>
            <code className="text-slate-500 block bg-slate-950 p-1.5 rounded text-[10px] overflow-x-auto">
              await api.post('/ledger/transaction', newTx);
            </code>
          </div>
        </div>

        {}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden lg:col-span-2 shadow-2xl flex flex-col">
          <div className="bg-slate-900/50 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Database size={14} className="text-emerald-400" />
              Cryptographic Transaction Ledger Pipeline
            </h4>
            <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">
              Memory Cache Safe
            </span>
          </div>

          <div className="divide-y divide-slate-900 overflow-y-auto max-h-[460px] font-mono text-xs">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-slate-900/20 transition-all flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${tx.type === 'CREDIT' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                    {tx.type === 'CREDIT' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{tx.desc}</span>
                      <span className="text-[10px] text-slate-600 bg-slate-900 border border-slate-800/60 px-1.5 py-0.2 rounded font-mono">{tx.id}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-3">
                      <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                      <span className="text-purple-400 font-light font-mono">Sig: {tx.hash}</span>
                    </div>
                  </div>
                </div>
                <div className={`font-bold font-mono text-right text-sm ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
