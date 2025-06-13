import React, { useState } from 'react';
import Inventario from './Inventario';

export default function App() {
  const [tab, setTab] = useState('inventario');

  return (
    <div>
      <button onClick={() => setTab('inventario')}>Inventario</button>
      {tab === 'inventario' && <Inventario />}
    </div>
  );
}
