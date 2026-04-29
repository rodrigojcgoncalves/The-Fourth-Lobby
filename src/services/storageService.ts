import { supabase } from '../lib/supabase';

// Serviço responsável pela interface com o Supabase Storage.

export const storageService = {
    // Efetua o upload do avatar do utilizador para o bucket 'user-avatars'
    uploadAvatar: async (userId: string, file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
    },

    // Gere o upload de cartazes de eventos para o bucket 'event-images'
    //permite apenas users com a rola ORGANIZADORES

    uploadEventImage: async (eventId: string, file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${eventId}/cover.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

    return data.publicUrl;
    }
};