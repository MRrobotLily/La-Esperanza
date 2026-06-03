import Screen from '../../layout/Screen';
import Input from '../../components/Input';
import Loader from '../../components/Loader';
import ProductoCard from '../../components/ProductoCard';
import VacioEstado from '../../components/VacioEstado';
import { useAuth } from '../../providers/AuthProvider/useAuth';
import { emojiCategoria } from '../../utils/format';
import { useCatalogo } from './hooks/useCatalogo';

export default function Catalogo() {
  const { usuario } = useAuth();
  const { state, handler } = useCatalogo();

  return (
    <Screen
      titulo={
        usuario
          ? `Hola, ${usuario.nombre} 👋`
          : 'Productos frescos, directo del productor'
      }
      subtitulo={
        usuario
          ? usuario.rol === 'productor'
            ? 'Revisa el catálogo o publica un nuevo producto en "Mis productos".'
            : 'Compra directamente a productores locales, sin intermediarios.'
          : 'Explora sin registrarte. Para comprar o vender debes crear una cuenta.'
      }
    >
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="md:flex-1">
          <Input
            prefijo="🔍"
            placeholder="Buscar tomate, maíz, frijol…"
            value={state.busqueda}
            onChange={(e) => handler.setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {state.categorias.map((c) => {
          const activo = state.categoria === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => handler.setCategoria(c)}
              className={[
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-all',
                activo
                  ? 'border-primary bg-primary text-white shadow-soft'
                  : 'border-line bg-white text-ink-muted hover:border-primary-light',
              ].join(' ')}
            >
              <span>{c === 'Todas' ? '🌿' : emojiCategoria(c)}</span>
              {c}
            </button>
          );
        })}
      </div>

      {state.cargando ? (
        <Loader texto="Cargando catálogo…" />
      ) : state.productos.length === 0 ? (
        <VacioEstado
          titulo="No encontramos productos"
          descripcion="Prueba con otra categoría o busca por otro nombre."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {state.productos.map((p) => {
            const resumen = state.mapa?.mapProm.get(p.id);
            return (
              <ProductoCard
                key={p.id}
                producto={p}
                promedio={resumen?.promedio}
                totalResenas={resumen?.total}
                nombreProductor={state.mapa?.mapProd.get(p.productorId)}
              />
            );
          })}
        </div>
      )}
    </Screen>
  );
}
