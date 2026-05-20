// ──────────────────────────────────────────────────────────────────────────────
// Hook del "carrito" — que en La Esperanza es una LISTA DE COMPRAS.
// Comportamiento según requerimiento: no hay cobro; el comprador arma una
// lista y la envía al productor por chat interno, WhatsApp o PDF imprimible.
// ──────────────────────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  actualizarCantidad,
  eliminarDelCarrito,
  leerCarritoHidratado,
  vaciarCarrito,
} from '../../../api/carritoApi';
import { crearAcuerdo } from '../../../api/acuerdosApi';
import { enviarMensaje } from '../../../api/mensajesApi';
import { useAuth } from '../../../providers/AuthProvider/useAuth';
import type { ItemCarritoHidratado } from '../../../api/carritoApi';
import { DB_KEYS, read } from '../../../api/storage';
import type { Usuario } from '../../../types';
import {
  construirTextoLista,
  imprimirListaCompras,
  type DatosListaPdf,
} from '../../../utils/listaComprasPdf';

export interface GrupoCarrito {
  productorId: string;
  productorNombre: string;
  productorTelefono?: string;
  items: ItemCarritoHidratado[];
  subtotal: number;
}

export function useCarrito() {
  const { usuario } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const items = useQuery({
    queryKey: ['carrito:hidratado', usuario?.id],
    queryFn: () => leerCarritoHidratado(usuario!.id),
    enabled: !!usuario,
  });

  const cambiarCantidad = useMutation({
    mutationFn: ({ id, cantidad }: { id: string; cantidad: number }) =>
      actualizarCantidad(usuario!.id, id, cantidad),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrito', usuario?.id] });
      qc.invalidateQueries({ queryKey: ['carrito:hidratado', usuario?.id] });
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => eliminarDelCarrito(usuario!.id, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrito', usuario?.id] });
      qc.invalidateQueries({ queryKey: ['carrito:hidratado', usuario?.id] });
    },
  });

  const grupos = agruparPorProductor(items.data ?? []);
  const totalGlobal = (items.data ?? []).reduce((s, i) => s + i.subtotal, 0);

  // Envía al productor (chat interno o WhatsApp). Crea el acuerdo y limpia
  // los productos de ese productor del carrito.
  const enviarProductor = useMutation({
    mutationFn: async ({
      productorId,
      canal,
      notas,
    }: {
      productorId: string;
      canal: 'chat' | 'whatsapp';
      notas?: string;
    }) => {
      const g = grupos.find((x) => x.productorId === productorId);
      if (!g) throw new Error('Sin productos de este productor.');

      const acuerdo = await crearAcuerdo({
        compradorId: usuario!.id,
        productorId,
        items: g.items.map((i) => ({
          productoId: i.producto.id,
          cantidad: i.cantidad,
        })),
        canalContacto: canal,
      });

      // Si es chat interno, enviamos automáticamente el listado como mensaje.
      if (canal === 'chat') {
        const datos = crearDatosPdf(usuario!, g, notas);
        await enviarMensaje({
          remitenteId: usuario!.id,
          destinatarioId: productorId,
          acuerdoId: acuerdo.id,
          texto: construirTextoLista(datos),
        });
      }

      // Quitamos esos productos del carrito
      for (const it of g.items) {
        await eliminarDelCarrito(usuario!.id, it.producto.id);
      }
      return { acuerdo, canal, productorId, grupo: g, notas };
    },
    onSuccess: ({ acuerdo, canal, grupo, notas }) => {
      qc.invalidateQueries({ queryKey: ['carrito', usuario?.id] });
      qc.invalidateQueries({ queryKey: ['carrito:hidratado', usuario?.id] });
      qc.invalidateQueries({ queryKey: ['acuerdos'] });
      qc.invalidateQueries({ queryKey: ['acuerdos', usuario?.id] });
      qc.invalidateQueries({ queryKey: ['mensajes'] });
      toast.success('Solicitud enviada al productor ✅');

      if (canal === 'whatsapp') {
        const datos = crearDatosPdf(usuario!, grupo, notas);
        const texto = encodeURIComponent(construirTextoLista(datos));
        const tel = (grupo.productorTelefono ?? '502').replace(/\D/g, '');
        window.open(`https://wa.me/${tel}?text=${texto}`, '_blank');
      } else {
        // Mandamos al chat para que vea la conversación con el listado ya enviado
        navigate(`/chat/${acuerdo.productorId}?acuerdo=${acuerdo.id}`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    state: {
      grupos,
      totalGlobal,
      cargando: items.isLoading,
      vacio: (items.data?.length ?? 0) === 0,
      enviando: enviarProductor.isPending,
    },
    handler: {
      incrementar: (i: ItemCarritoHidratado) =>
        cambiarCantidad.mutate({ id: i.producto.id, cantidad: i.cantidad + 1 }),
      decrementar: (i: ItemCarritoHidratado) =>
        cambiarCantidad.mutate({
          id: i.producto.id,
          cantidad: Math.max(1, i.cantidad - 1),
        }),
      cambiarCantidadDirecta: (id: string, n: number) =>
        cambiarCantidad.mutate({ id, cantidad: n }),
      eliminar: (id: string) => eliminar.mutate(id),
      vaciar: async () => {
        if (!usuario) return;
        await vaciarCarrito(usuario.id);
        qc.invalidateQueries({ queryKey: ['carrito', usuario.id] });
        qc.invalidateQueries({ queryKey: ['carrito:hidratado', usuario.id] });
        toast.success('Lista vaciada');
      },
      enviarPorChat: (productorId: string, notas?: string) =>
        enviarProductor.mutate({ productorId, canal: 'chat', notas }),
      enviarPorWhatsApp: (productorId: string, notas?: string) =>
        enviarProductor.mutate({ productorId, canal: 'whatsapp', notas }),
      generarPDF: (productorId: string, notas?: string) => {
        const g = grupos.find((x) => x.productorId === productorId);
        if (!g || !usuario) return;
        imprimirListaCompras(crearDatosPdf(usuario, g, notas));
        toast.success('Se abrió la vista imprimible');
      },
      seguirComprando: () => navigate('/catalogo'),
    },
  };
}

// ─── Helpers ───────────────────────────────────────────────────────

function agruparPorProductor(items: ItemCarritoHidratado[]): GrupoCarrito[] {
  const usuarios = read<Usuario[]>(DB_KEYS.usuarios, []);
  const map = new Map<string, GrupoCarrito>();
  items.forEach((it) => {
    const pid = it.producto.productorId;
    const u = usuarios.find((x) => x.id === pid);
    const g =
      map.get(pid) ??
      ({
        productorId: pid,
        productorNombre: u ? `${u.nombre} ${u.apellido}` : 'Productor',
        productorTelefono: u?.telefono,
        items: [],
        subtotal: 0,
      } satisfies GrupoCarrito);
    g.items.push(it);
    g.subtotal += it.subtotal;
    map.set(pid, g);
  });
  return Array.from(map.values());
}

function crearDatosPdf(
  comprador: Usuario,
  grupo: GrupoCarrito,
  notas?: string,
): DatosListaPdf {
  return {
    compradorNombre: `${comprador.nombre} ${comprador.apellido}`,
    compradorTelefono: comprador.telefono,
    productorNombre: grupo.productorNombre,
    productorTelefono: grupo.productorTelefono,
    items: grupo.items.map((i) => ({
      nombre: i.producto.nombre,
      cantidad: i.cantidad,
      unidad: i.producto.unidadMedida,
      precioUnitario: i.precioAplicado,
      subtotal: i.subtotal,
    })),
    total: grupo.subtotal,
    notas,
  };
}
