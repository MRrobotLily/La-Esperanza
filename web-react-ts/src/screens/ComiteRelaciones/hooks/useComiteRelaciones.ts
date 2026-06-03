// ──────────────────────────────────────────────────────────────────────────────
// Hook "Relaciones" del Comité — permite visualizar, de forma READ-ONLY, las
// interacciones entre productores y compradores (acuerdos + mensajes).
// Transparencia total para el comité sin interferir con las conversaciones.
// ──────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listarAcuerdos } from '../../../api/acuerdosApi';
import { listarMensajes } from '../../../api/mensajesApi';
import { listarUsuariosParaComite } from '../../../api/comiteApi';
import type { Acuerdo, Mensaje, Usuario } from '../../../types';

export interface ParRelacion {
  productorId: string;
  compradorId: string;
  productor?: Usuario;
  comprador?: Usuario;
  acuerdos: Acuerdo[];
  totalAcuerdos: number;
  totalFinalizados: number;
  totalCanceladosRechazados: number;
  ultimaInteraccion: string; // ISO
}

export function useComiteRelaciones() {
  const [seleccionado, setSeleccionado] = useState<string | null>(null); // "productorId::compradorId"
  const [busqueda, setBusqueda] = useState('');

  const usuarios = useQuery({
    queryKey: ['usuarios:todos'],
    queryFn: listarUsuariosParaComite,
  });

  // Para el comité, listarAcuerdos devuelve TODOS.
  const acuerdos = useQuery({
    queryKey: ['acuerdos', 'comite'],
    queryFn: () => listarAcuerdos('', 'comite'),
    refetchInterval: 5000,
  });

  const mapaUsuarios = useMemo(
    () =>
      (usuarios.data ?? []).reduce(
        (acc, u) => acc.set(u.id, u),
        new Map<string, Usuario>(),
      ),
    [usuarios.data],
  );

  // Agrupar acuerdos por par productor↔comprador.
  const pares = useMemo<ParRelacion[]>(() => {
    const map = new Map<string, ParRelacion>();
    (acuerdos.data ?? []).forEach((a) => {
      const clave = `${a.productorId}::${a.compradorId}`;
      const prev = map.get(clave);
      const finalizado = a.estado === 'finalizado' ? 1 : 0;
      const cancelado = a.estado === 'cancelado' || a.estado === 'rechazado' ? 1 : 0;
      if (!prev) {
        map.set(clave, {
          productorId: a.productorId,
          compradorId: a.compradorId,
          productor: mapaUsuarios.get(a.productorId),
          comprador: mapaUsuarios.get(a.compradorId),
          acuerdos: [a],
          totalAcuerdos: 1,
          totalFinalizados: finalizado,
          totalCanceladosRechazados: cancelado,
          ultimaInteraccion: a.actualizadoEn,
        });
      } else {
        prev.acuerdos.push(a);
        prev.totalAcuerdos += 1;
        prev.totalFinalizados += finalizado;
        prev.totalCanceladosRechazados += cancelado;
        if (a.actualizadoEn > prev.ultimaInteraccion) {
          prev.ultimaInteraccion = a.actualizadoEn;
        }
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      b.ultimaInteraccion.localeCompare(a.ultimaInteraccion),
    );
  }, [acuerdos.data, mapaUsuarios]);

  // Filtro por nombre / municipio.
  const paresFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pares;
    return pares.filter((p) => {
      const nombres = [
        p.productor?.nombre,
        p.productor?.apellido,
        p.productor?.municipio,
        p.comprador?.nombre,
        p.comprador?.apellido,
        p.comprador?.municipio,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return nombres.includes(q);
    });
  }, [pares, busqueda]);

  const parActivo = useMemo(
    () => pares.find((p) => `${p.productorId}::${p.compradorId}` === seleccionado) ?? null,
    [pares, seleccionado],
  );

  // Mensajes entre las dos partes (independientes del acuerdo).
  const mensajes = useQuery<Mensaje[]>({
    queryKey: ['mensajes:par', parActivo?.productorId, parActivo?.compradorId],
    queryFn: () =>
      parActivo
        ? listarMensajes(parActivo.productorId, parActivo.compradorId)
        : Promise.resolve([]),
    enabled: !!parActivo,
    refetchInterval: parActivo ? 5000 : false,
  });

  return {
    state: {
      cargando: acuerdos.isLoading || usuarios.isLoading,
      pares: paresFiltrados,
      totalPares: pares.length,
      busqueda,
      seleccionado,
      parActivo,
      mensajes: mensajes.data ?? [],
      cargandoMensajes: mensajes.isLoading,
      mapaUsuarios,
    },
    handler: {
      setBusqueda,
      seleccionar: (par: ParRelacion | null) =>
        setSeleccionado(par ? `${par.productorId}::${par.compradorId}` : null),
    },
  };
}
