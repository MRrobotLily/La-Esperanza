import AppProvider from './providers/AppProvider';
import MainStack from './navigators/MainStack';

export default function App() {
  return (
    <AppProvider>
      <MainStack />
    </AppProvider>
  );
}
