import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { perfilEditSchema, type PerfilEditInput } from '../../../schemas/authSchemas';
import { actualizarPerfil } from '../../../api/authApi';
import { useAuth } from '../../../providers/AuthProvider/useAuth';
import {
  calificacionesRecibidas,
  resumen,
} from '../../../api/calificacionesApi';
import { listarUsuariosParaComite } from '../../../api/comiteApi';
import type { Usuario } from '../../../types';

/**
 * Maneja el formulario de edición del perfil propio y la subida opcional
 * de foto. Mantiene el AuthProvider sincronizado tras guardar.
 */
export function usePerfil() {
  const { usuario, refrescar } = useAuth();
  const qc = useQueryClient();
  const [editando, setEditando] = useState(false);

  const form = useForm<PerfilEditInput>({
    resolver: zodResolver(perfilEditSchema),
    defaultValues: {
      nombre: usuario?.nombre ?? '',
      apellido: usuario?.apellido ?? '',
      direccion: usuario?.direccion ?? '',
      departamento: usuario?.departamento ?? '',
      municipio: usuario?.municipio ?? '',
    },
  });

  useEffect(() => {
    if (!usuario) return;
    form.reset({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      direccion: usuario.direccion ?? '',
      departamento: usuario.departamento ?? '',
      municipio: usuario.municipio ?? '',
    });
  }, [usuario?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const guardar = useMutation({
    mutationFn: async (
      cambios: PerfilEditInput & { fotoPerfil?: string },
    ) => {
      if (!usuario) throw new Error('No hay sesión.');
      return actualizarPerfil(usuario.id, cambios);
    },
    onSuccess: async () => {
      await refrescar();
      await qc.invalidateQueries();
      toast.success('Perfil actualizado');
      setEditando(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const subirFoto = (dataUrl: string) => {
    if (!usuario) return;
    guardar.mutate({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      direccion: usuario.direccion ?? '',
      departamento: usuario.departamento ?? '',
      municipio: usuario.municipio ?? '',
      fotoPerfil: dataUrl,
    });
  };

  const submit = form.handleSubmit((datos) => guardar.mutate(datos));

  // Calificaciones recibidas para mostrar reputación en el perfil.
  const recibidas = useQuery({
    queryKey: ['reputacion', usuario?.id],
    queryFn: () => calificacionesRecibidas(usuario!.id),
    enabled: !!usuario,
  });

  const usuarios = useQuery({
    queryKey: ['usuarios:todos'],
    queryFn: listarUsuariosParaComite,
  });

  const mapaUsuarios = (usuarios.data ?? []).reduce(
    (acc, u) => acc.set(u.id, u),
    new Map<string, Usuario>(),
  );

  const calificaciones = recibidas.data ?? [];
  const reputacion = resumen(calificaciones);

  return {
    usuario,
    form,
    editando,
    setEditando,
    submit,
    guardando: guardar.isPending,
    subirFoto,
    calificaciones,
    reputacion,
    mapaUsuarios,
    cargandoReputacion: recibidas.isLoading,
  };
}
