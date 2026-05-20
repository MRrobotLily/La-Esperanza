import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '../../../providers/AuthProvider/useAuth';
import {
  enviarMensaje,
  listarMensajes,
  marcarConversacionLeida,
} from '../../../api/mensajesApi';
import { listarUsuariosParaComite } from '../../../api/comiteApi';
import type { Usuario } from '../../../types';

/**
 * Conversación 1:1 entre el usuario actual y otro. Si viene ?acuerdo=xxx
 * marca los mensajes como relacionados al acuerdo.
 */
export function useChat() {
  const { otroId } = useParams<{ otroId: string }>();
  const [params] = useSearchParams();
  const acuerdoId = params.get('acuerdo') ?? undefined;
  const { usuario } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [texto, setTexto] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const usuarios = useQuery({
    queryKey: ['usuarios:todos'],
    queryFn: listarUsuariosParaComite,
  });

  const otro: Usuario | undefined = (usuarios.data ?? []).find(
    (u) => u.id === otroId,
  );

  const mensajes = useQuery({
    queryKey: ['mensajes', usuario?.id, otroId],
    queryFn: () =>
      usuario && otroId ? listarMensajes(usuario.id, otroId) : Promise.resolve([]),
    enabled: !!usuario && !!otroId,
    refetchInterval: 2000,
  });

  // Marcar como leídos al abrir
  useEffect(() => {
    if (!usuario || !otroId) return;
    marcarConversacionLeida(usuario.id, otroId, usuario.id).then(() => {
      qc.invalidateQueries({ queryKey: ['notificaciones', usuario.id] });
      qc.invalidateQueries({ queryKey: ['conversaciones', usuario.id] });
    });
  }, [usuario?.id, otroId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll al final cuando llegan mensajes nuevos
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [mensajes.data?.length]);

  const enviar = useMutation({
    mutationFn: async () => {
      if (!usuario || !otroId || !texto.trim()) return;
      return enviarMensaje({
        remitenteId: usuario.id,
        destinatarioId: otroId,
        texto: texto.trim(),
        acuerdoId,
      });
    },
    onSuccess: () => {
      setTexto('');
      qc.invalidateQueries({ queryKey: ['mensajes', usuario?.id, otroId] });
      qc.invalidateQueries({ queryKey: ['conversaciones', usuario?.id] });
    },
  });

  return {
    state: {
      mensajes: mensajes.data ?? [],
      cargando: mensajes.isLoading,
      usuario,
      otro,
      texto,
      acuerdoId,
      enviando: enviar.isPending,
      scrollRef,
    },
    handler: {
      setTexto,
      enviar: () => enviar.mutate(),
      volver: () => navigate('/chats'),
    },
  };
}
