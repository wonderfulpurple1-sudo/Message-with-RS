import React from 'react';
import { AgentType } from '../types';
import { Users, Calendar, FileText, CreditCard, Activity } from 'lucide-react';

interface AgentCardProps {
  type: AgentType;
  isActive: boolean;
  label: string;
  description: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ type, isActive, label, description }) => {
  const getIcon = () => {
    switch (type) {
      case AgentType.PATIENT_MANAGEMENT: return <Users className="w-6 h-6" />;
      case AgentType.APPOINTMENT_SCHEDULER: return <Calendar className="w-6 h-6" />;
      case AgentType.MEDICAL_RECORDS: return <FileText className="w-6 h-6" />;
      case AgentType.BILLING_INSURANCE: return <CreditCard className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  return (
    <div 
      className={`
        relative p-4 rounded-xl border transition-all duration-300 flex items-start space-x-3
        ${isActive 
          ? 'bg-blue-50 border-blue-500 shadow-md transform scale-105 z-10' 
          : 'bg-white border-slate-200 text-slate-400 opacity-80 scale-100'}
      `}
    >
      <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
        {getIcon()}
      </div>
      <div>
        <h3 className={`font-semibold text-sm ${isActive ? 'text-blue-900' : 'text-slate-500'}`}>{label}</h3>
        <p className="text-xs mt-1 line-clamp-2">{description}</p>
      </div>
      {isActive && (
        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
        </span>
      )}
    </div>
  );
};

export default AgentCard;