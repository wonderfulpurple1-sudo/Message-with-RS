import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, ShieldCheck, Database, LayoutGrid } from 'lucide-react';
import { AgentType, Message, ProcessingState } from './types';
import AgentCard from './components/AgentCard';
import ChatMessage from './components/ChatMessage';
import { sendMessageToCoordinator } from './services/geminiService';

// Validation helper
const validatePatientId = (id: string): boolean => {
  // Format: Starts with 'P' followed by exactly 5 digits (e.g. P12345)
  const regex = /^P\d{5}$/;
  return regex.test(id);
};

// Mock execution Logic for the Simulation
const executeSubAgent = (agentName: string, args: any): string => {
  // Simulate delay logic could be added here if needed, but we keep it synchronous for simplicity
  
  switch (agentName) {
    case 'PatientManagement':
      // Validate ID if provided (it might be empty for new registrations)
      if (args.patient_id && !validatePatientId(args.patient_id)) {
        return `[ERROR] Format ID Pasien tidak valid: "${args.patient_id}".\nHarap gunakan format standar: Pxxxxx (Huruf P diikuti 5 digit angka, contoh: P12345).`;
      }
      return `[SUKSES] Data pasien diproses.\nAksi: ${args.action}\nID Pasien: ${args.patient_id || 'Baru (Auto-generated)'}\nDetail: ${args.patient_details || '-'}\nStatus: Terverifikasi di database pendaftaran.`;
      
    case 'AppointmentScheduler':
      // ID is required for scheduling
      if (!args.patient_id || !validatePatientId(args.patient_id)) {
        return `[ERROR] Gagal memproses jadwal. ID Pasien tidak valid atau hilang.\nInput: "${args.patient_id || '(kosong)'}"\nFormat yang benar: Pxxxxx (contoh: P12345).`;
      }
      return `[KONFIRMASI] Jadwal berhasil diatur.\nAksi: ${args.action}\nPasien ID: ${args.patient_id}\nDetail: ${args.appointment_details}\nTiket Antrian: A-${Math.floor(Math.random() * 100)}`;
      
    case 'MedicalRecords':
      return `[RAHASIA] Akses Rekam Medis Diizinkan.\nPasien ID: ${args.patient_id}\nTipe Data: ${args.requested_summary_type}\n\nRingkasan: Pasien memiliki riwayat hipertensi ringan (2023). Hasil lab terakhir menunjukkan kadar kolesterol normal. Tidak ada alergi obat yang tercatat.`;
      
    case 'BillingAndInsurance':
      return `[KEUANGAN] Transaksi Diproses.\nAksi: ${args.action}\nPasien ID: ${args.patient_id}\nDetail: ${args.financial_details}\nStatus Pembayaran: LUNAS / KLAIM TERKIRIM.`;
      
    default:
      return "Sub-agen tidak dikenali.";
  }
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Selamat datang di Sistem Informasi RS Terpadu. Saya adalah Koordinator Pusat. Silakan sampaikan kebutuhan Anda (Pendaftaran, Jadwal, Rekam Medis, atau Pembayaran).',
      timestamp: new Date(),
      agent: AgentType.COORDINATOR
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [state, setState] = useState<ProcessingState>({
    isThinking: false,
    activeAgent: null,
    statusMessage: ''
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || state.isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      agent: AgentType.USER
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setState({ isThinking: true, activeAgent: AgentType.COORDINATOR, statusMessage: 'Koordinator sedang menganalisis...' });

    try {
      // 1. Send to Gemini (Coordinator)
      const response = await sendMessageToCoordinator(userMsg.content);
      
      // 2. Analyze Response for Function Calls
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("No response from AI");
      }

      const modelPart = candidates[0].content.parts[0];

      // Case A: Coordinator asks for clarification (No function call)
      if (modelPart.text && !modelPart.functionCall) {
        const reply: Message = {
          id: Date.now().toString() + '_coord',
          role: 'model',
          content: modelPart.text,
          timestamp: new Date(),
          agent: AgentType.COORDINATOR
        };
        setMessages(prev => [...prev, reply]);
        setState({ isThinking: false, activeAgent: null, statusMessage: '' });
        return;
      }

      // Case B: Coordinator delegates to a Tool
      if (modelPart.functionCall) {
        const fc = modelPart.functionCall;
        const agentName = fc.name;
        const args = fc.args;

        // Visual update: Switch active agent
        setState({ 
          isThinking: true, 
          activeAgent: agentName as AgentType, 
          statusMessage: `Mendelegasikan ke ${agentName}...` 
        });

        // Simulate network delay for effect
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Execute Mock Sub-Agent
        const agentResponseText = executeSubAgent(agentName, args);

        const toolMsg: Message = {
          id: Date.now().toString() + '_tool',
          role: 'system_tool',
          content: agentResponseText,
          timestamp: new Date(),
          agent: agentName as AgentType,
          metadata: args // Store args to show in UI
        };

        setMessages(prev => [...prev, toolMsg]);
      }

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString() + '_err',
        role: 'model',
        content: "Maaf, terjadi kesalahan pada sistem koordinator. Mohon coba lagi.",
        timestamp: new Date(),
        agent: AgentType.COORDINATOR
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setState({ isThinking: false, activeAgent: null, statusMessage: '' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Left Sidebar - System Status */}
      <div className="hidden md:flex w-80 flex-col border-r border-slate-200 bg-white h-full shadow-sm z-20">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2 text-blue-700 mb-1">
            <LayoutGrid className="w-6 h-6" />
            <h1 className="font-bold text-lg tracking-tight">SIA RS Terpadu</h1>
          </div>
          <p className="text-xs text-slate-500">Architecture: Coordinator-Delegate Pattern</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
            Status Agen
          </div>
          
          <AgentCard 
            type={AgentType.PATIENT_MANAGEMENT} 
            isActive={state.activeAgent === AgentType.PATIENT_MANAGEMENT}
            label="Manajemen Pasien"
            description="Pendaftaran, Update Data, Demografi"
          />
          
          <AgentCard 
            type={AgentType.APPOINTMENT_SCHEDULER} 
            isActive={state.activeAgent === AgentType.APPOINTMENT_SCHEDULER}
            label="Penjadwal Janji"
            description="Booking, Reschedule, Pembatalan"
          />
          
          <AgentCard 
            type={AgentType.MEDICAL_RECORDS} 
            isActive={state.activeAgent === AgentType.MEDICAL_RECORDS}
            label="Rekam Medis (EMR)"
            description="Riwayat, Diagnosa, Hasil Lab"
          />
          
          <AgentCard 
            type={AgentType.BILLING_INSURANCE} 
            isActive={state.activeAgent === AgentType.BILLING_INSURANCE}
            label="Penagihan & Asuransi"
            description="Invoicing, Klaim, Pembayaran"
          />

          <div className="mt-8 border-t border-slate-100 pt-4 px-2">
            <div className={`flex items-center space-x-2 text-sm ${state.activeAgent === AgentType.COORDINATOR ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
              <ShieldCheck className="w-4 h-4" />
              <span>Koordinator Pusat</span>
              {state.activeAgent === AgentType.COORDINATOR && (
                <span className="ml-auto text-xs animate-pulse">Processing...</span>
              )}
            </div>
            <div className="mt-2 flex items-center space-x-2 text-sm text-slate-400">
              <Database className="w-4 h-4" />
              <span>Database Terpusat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Mobile Header */}
        <div className="md:hidden h-14 bg-white border-b flex items-center px-4 justify-between shadow-sm z-10">
           <span className="font-bold text-blue-700">SIA RS Terpadu</span>
           <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
             {state.activeAgent ? state.activeAgent : 'Idle'}
           </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide bg-slate-50">
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {state.isThinking && (
              <div className="flex justify-start mb-4 animate-pulse">
                <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                  <Activity className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-slate-500 italic">{state.statusMessage}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <div className="max-w-3xl mx-auto flex items-end gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 text-slate-700 placeholder:text-slate-400 py-3 px-3 text-sm"
              rows={1}
              placeholder="Jelaskan kebutuhan Anda (Contoh: Jadwalkan ID P12345 dengan Dr. Bima minggu depan)..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || state.isThinking}
              className={`
                p-3 rounded-xl mb-1 transition-all duration-200
                ${!inputValue.trim() || state.isThinking 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'}
              `}
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">
              Sistem AI Koordinator • Data Anda diproses dengan enkripsi standar RS.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;