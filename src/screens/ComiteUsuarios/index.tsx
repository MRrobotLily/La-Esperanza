import Screen from '../../layout/Screen';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import VacioEstado from '../../components/VacioEstado';
import { etiquetaRol, fmtFecha, fmtTelefono, iniciales } from '../../utils/format';
import { useComiteUsuarios } from './hooks/useComiteUsuarios';
import SancionModal from './components/SancionModal';

export default function ComiteUsuarios() {
  const { state, handler } = useComiteUsuarios();

  return (
    <Screen
      titulo="Gestión de usuarios"
      subtitulo="Busca, supervisa y sanciona cuentas del sistema."
    >
      {/* Filtros */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Input
          prefijo="🔍"
          placeholder="Buscar por nombre, teléfono o DPI…"
          value={state.busqueda}
          onChange={(e) => handler.setBusqueda(e.target.value)}
        />
        <Select
          label="Rol"
          value={state.filtroRol}
          onChange={(e) => handler.setFiltroRol(e.target.value as typeof state.filtroRol)}
        >
          <option value="todos">Todos</option>
          <option value="productor">Productores</option>
          <option value="comprador">Compradores</option>
        </Select>
        <Select
          label="Estado"
          value={state.filtroEstado}
          onChange={(e) => handler.setFiltroEstado(e.target.value as typeof state.filtroEstado)}
        >
          <option value="todos">Todos</option>
          <option value="activa">Activas</option>
          <option value="suspendida">Suspendidas</option>
          <option value="cancelada">Canceladas</option>
        </Select>
      </div>

      {state.cargando ? (
        <Loader texto="Cargando usuarios…" />
      ) : state.lista.length === 0 ? (
        <VacioEstado
          icono="🙅"
          titulo="No hay usuarios"
          descripcion="Ajusta los filtros o prueba otro término de búsqueda."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-bg-alt/60">
                <tr className="text-left text-[11px] uppercase tracking-wider text-ink-light">
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="hidden px-4 py-3 md:table-cell">Teléfono</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Alta</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {state.lista.map((u) => (
                  <tr key={u.id} className="hover:bg-bg-alt/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                          {iniciales(u.nombre, u.apellido)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">
                            {u.nombre} {u.apellido}
                          </p>
                          <p className="truncate text-[11px] text-ink-light">
                            DPI {u.dpi}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {etiquetaRol(u.rol)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tono={
                          u.estado === 'activa'
                            ? 'success'
                            : u.estado === 'suspendida'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {u.estado}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {fmtTelefono(u.telefono)}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-ink-muted lg:table-cell">
                      {fmtFecha(u.creadoEn)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        tamano="sm"
                        variante="outline"
                        onClick={() => handler.seleccionar(u)}
                      >
                        Acciones
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de detalle con acciones */}
      <Modal
        abierto={!!state.seleccionado}
        onCerrar={handler.cerrarDetalle}
        titulo={
          state.seleccionado
            ? `${state.seleccionado.nombre} ${state.seleccionado.apellido}`
            : ''
        }
      >
        {state.seleccionado && (
          <div className="flex flex-col gap-4">
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-light">Rol</dt>
                <dd className="font-medium">{etiquetaRol(state.seleccionado.rol)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-light">Estado</dt>
                <dd>
                  <Badge
                    tono={
                      state.seleccionado.estado === 'activa'
                        ? 'success'
                        : state.seleccionado.estado === 'suspendida'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {state.seleccionado.estado}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-light">Teléfono</dt>
                <dd className="font-medium">
                  {fmtTelefono(state.seleccionado.telefono)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-light">DPI</dt>
                <dd className="font-medium">{state.seleccionado.dpi}</dd>
              </div>
              {state.seleccionado.motivoSuspension && (
                <div>
                  <dt className="text-ink-light">Motivo actual</dt>
                  <dd className="text-ink-muted">
                    {state.seleccionado.motivoSuspension}
                  </dd>
                </div>
              )}
            </dl>
            <div className="flex flex-col gap-2 border-t border-line pt-4">
              {state.seleccionado.estado === 'activa' && (
                <>
                  <Button
                    variante="outline"
                    onClick={() => handler.iniciarSancion('advertencia')}
                  >
                    ⚠️ Enviar advertencia
                  </Button>
                  <Button
                    variante="outline"
                    onClick={() => handler.iniciarSancion('suspension_temporal')}
                  >
                    ⏸️ Suspender temporalmente
                  </Button>
                  <Button
                    variante="danger"
                    onClick={() => handler.iniciarSancion('cancelacion_permanente')}
                  >
                    🛑 Cancelar cuenta
                  </Button>
                </>
              )}
              {state.seleccionado.estado === 'suspendida' && (
                <>
                  <Button onClick={() => handler.iniciarSancion('reactivacion')}>
                    ✅ Reactivar
                  </Button>
                  <Button
                    variante="danger"
                    onClick={() => handler.iniciarSancion('cancelacion_permanente')}
                  >
                    🛑 Cancelar permanentemente
                  </Button>
                </>
              )}
              {state.seleccionado.estado === 'cancelada' && (
                <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">
                  🛑 Esta cuenta fue cancelada permanentemente y no puede reactivarse.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <SancionModal
        tipo={state.sancion}
        onCerrar={handler.cerrarModal}
        onConfirmar={handler.aplicar}
        cargando={state.aplicando}
      />
    </Screen>
  );
}
