import { Link, useNavigate } from 'react-router-dom';
import Screen from '../../layout/Screen';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Loader from '../../components/Loader';
import VacioEstado from '../../components/VacioEstado';
import { useMisProductos } from './hooks/useMisProductos';
import { fmtQuetzales, emojiCategoria } from '../../utils/format';

export default function MisProductos() {
  const { state, handler } = useMisProductos();
  const navigate = useNavigate();

  return (
    <Screen
      titulo="Mis productos"
      subtitulo="Publica, edita y controla la visibilidad de tus productos."
      accion={
        <Button tamano="lg" onClick={() => navigate('/mis-productos/nuevo')} izquierda={<span>＋</span>}>
          Agregar producto
        </Button>
      }
    >
      {state.cargando ? (
        <Loader />
      ) : state.productos.length === 0 ? (
        <VacioEstado
          icono="📦"
          titulo="Aún no has publicado productos"
          descripcion="Registra tu primer producto para que los compradores puedan verlo."
          accion={
            <Button onClick={() => navigate('/mis-productos/nuevo')}>
              Agregar mi primer producto
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {state.productos.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
              <div className="flex">
                <img
                  src={p.imagenes[0]}
                  alt={p.nombre}
                  className="h-28 w-28 shrink-0 object-cover sm:h-36 sm:w-36"
                />
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-ink">{p.nombre}</h3>
                    <Badge tono={p.activo ? 'success' : 'neutral'}>
                      {p.activo ? 'Activo' : 'Pausado'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-ink-muted">
                    {emojiCategoria(p.categoria)} {p.categoria}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {p.cantidadDisponible} {p.unidadMedida} · {fmtQuetzales(p.precioUnitario)} /{' '}
                    {fmtQuetzales(p.precioMayor)} (mayor)
                  </p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    <Link
                      to={`/mis-productos/${p.id}/editar`}
                      className="inline-flex items-center gap-1 rounded-lg bg-bg-alt px-2.5 py-1.5 text-[11px] font-semibold text-primary-dark hover:bg-primary-soft"
                    >
                      ✏️ Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => handler.togglear(p.id, !p.activo)}
                      className="inline-flex items-center gap-1 rounded-lg bg-bg-alt px-2.5 py-1.5 text-[11px] font-semibold text-primary-dark hover:bg-primary-soft"
                    >
                      {p.activo ? '⏸ Pausar' : '▶ Activar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar "${p.nombre}"?`)) handler.eliminar(p.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-danger-light px-2.5 py-1.5 text-[11px] font-semibold text-danger hover:bg-danger/10"
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}
