import AppProvider from './providers/AppProvider';
import MainStack from './navigators/MainStack';

// Componente principal donde se cargan los providers y la navegacion general del sistema.
export default function App() {
  return (
    <AppProvider>
      <MainStack />
    </AppProvider>
  );
}
