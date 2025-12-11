export enum AgentType {
  COORDINATOR = 'coordinator',
  PATIENT_MANAGEMENT = 'PatientManagement',
  APPOINTMENT_SCHEDULER = 'AppointmentScheduler',
  MEDICAL_RECORDS = 'MedicalRecords',
  BILLING_INSURANCE = 'BillingAndInsurance',
  USER = 'user'
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system_tool';
  content: string;
  agent?: AgentType; // Which agent produced this message
  timestamp: Date;
  metadata?: Record<string, any>; // Store tool args if needed
}

export interface ToolCallResult {
  functionName: string;
  args: any;
}

export interface ProcessingState {
  isThinking: boolean;
  activeAgent: AgentType | null;
  statusMessage: string;
}