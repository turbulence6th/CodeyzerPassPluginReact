import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "primereact/resources/themes/md-dark-indigo/theme.css";     
import "./styles/theme.css";
import "primereact/resources/primereact.min.css";
import "primeflex/primeflex.css"; 
import 'primeicons/primeicons.css';
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { Provider, useDispatch } from 'react-redux';
import { codeyzerDepoReducer, codeyzerHafizaReducer } from './store/CodeyzerReducer';
import { 
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import { setupListeners } from '@reduxjs/toolkit/query'
import { PersistGate } from 'redux-persist/integration/react';
import AygitYonetici from './aygit/AygitYonetici';
import { createStateSyncMiddleware, initStateWithPrevTab } from 'redux-state-sync';

const aygitYoneticiPromise = import('./aygit/' + process.env.REACT_APP_AYGIT_YONETICI).then(x => new x.default() as AygitYonetici);

const codeyzerStorage = {

  async getItem(key: string): Promise<string | null> {
      const aygitYonetici = await aygitYoneticiPromise;
      return await aygitYonetici.depodanGetir(key);
  },

  async setItem(key: string, item: string): Promise<void> {
    const aygitYonetici = await aygitYoneticiPromise;
    await aygitYonetici.depoyaKoy(key, item);
  },
      
  async removeItem(key: string): Promise<void> {
    const aygitYonetici = await aygitYoneticiPromise;
    await aygitYonetici.depodanSil(key);
  }
};

const persistConfig = {
  key: 'root',
  storage: codeyzerStorage,
  blacklist: ['codeyzerHafizaReducer']
};

const rootReducer = combineReducers({codeyzerDepoReducer, codeyzerHafizaReducer});
const persistedReducer = persistReducer(persistConfig, rootReducer);

const config = {
  blacklist: ["persist/PERSIST", "persist/REHYDRATE"],
};
const synckStateMiddleware = [createStateSyncMiddleware(config)];

export type RootState = ReturnType<typeof rootReducer>
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(synckStateMiddleware),
});

initStateWithPrevTab(store);
setupListeners(store.dispatch)

let persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch

export const AygitYoneticiKullan = () => {
  const [aygitYonetici, aygitYoneticiDegistir] = useState<AygitYonetici>();
  useEffect(() => {
    aygitYoneticiPromise.then(aygitYoneticiSonuc => {
      aygitYoneticiDegistir(aygitYoneticiSonuc);
    });
  }, []);
  return aygitYonetici;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
  </React.StrictMode>
);

