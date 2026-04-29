import { supabase } from '../lib/supabase'

// Interface que define os tipos de bilhetes disponíveis (fases)
export interface TicketType {
  id: string;
  name: string;
  price: number;
  sold_quantity: number;
  total_quantity: number;
}

// Interface principal para a entidade Evento
export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  status: 'draft' | 'published' | 'finished';
  ticket_types?: TicketType[];
}

export const eventService = {
  // Retorna todos os eventos públicos juntamente com os tipos de bilhetes associados
  getPublicEvents: async (): Promise<Event[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*, ticket_types(*)')
      .eq('status', 'published')
    if (error) throw error
    return data as Event[]
  },

  // Retorna estatísticas de vendas e despesas para o dashboard do organizador
  getOrganizerStats: async (organizerId: string) => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id, name,
        ticket_types (sold_quantity, price),
        expenses (amount)
      `)
      .eq('organizer_id', organizerId)
    if (error) throw error
    return data
  }
}