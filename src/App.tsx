import { Provider } from 'react-redux';
import { store } from './features/store/store';
import GameLayout from './features/game/GameLayout';

function App() {
  return (
    <Provider store={store}>
      <div className="app-container">
        <GameLayout />
      </div>
    </Provider>
  );
}

export default App;