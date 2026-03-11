
export type Status = 'Em Viagem' | 'Concluído';

export interface Trip {
  id: string;
  veiculo: string;
  motorista: string;
  seguranca: string;
  kmSaida: number;
  destino: string;
  dataSaida: string;
  status: Status;
  kmRetorno?: number;
  kmRodado?: number;
  dataRetorno?: string;
}

export interface ReferenceData {
  veiculos: string[];
  motoristas: string[];
  segurancas: string[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHECK_OUT = 'CHECK_OUT',
  ACTIVE_TRIPS = 'ACTIVE_TRIPS',
  HISTORY = 'HISTORY'
}
