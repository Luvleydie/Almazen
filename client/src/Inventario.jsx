import React, { useState, useEffect } from 'react';

export default function Inventario() {
  const [columns, setColumns] = useState(['nombre']);
  const [newColumn, setNewColumn] = useState('');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [tableId, setTableId] = useState('');

  useEffect(() => {
    fetch('/api/tables')
      .then(r => r.json())
      .then(tables => {
        const inv = tables.find(t => t.name === 'inventario');
        if (inv) {
          setColumns(inv.columns);
          setTableId(inv._id);
          loadItems(inv._id);
        }
      });
  }, []);

  function loadItems(id) {
    fetch(`/api/tables/${id}/items`)
      .then(r => r.json())
      .then(setItems);
  }

  function addColumn() {
    if (newColumn && !columns.includes(newColumn)) {
      setColumns([...columns, newColumn]);
      setNewColumn('');
    }
  }

  function handleChange(col, value) {
    setForm({ ...form, [col]: value });
  }

  async function saveTable() {
    const res = await fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'inventario', columns })
    });
    const t = await res.json();
    setTableId(t._id);
  }

  async function addItem() {
    if (!tableId) return;
    await fetch(`/api/tables/${tableId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    loadItems(tableId);
  }

  return (
    <div>
      <h2>Inventario</h2>
      <div>
        <input value={newColumn} onChange={e => setNewColumn(e.target.value)} />
        <button onClick={addColumn}>Agregar columna</button>
        <button onClick={saveTable}>Guardar tabla</button>
      </div>
      {columns.map(col => (
        <div key={col}>
          <label>{col}</label>
          <input onChange={e => handleChange(col, e.target.value)} />
        </div>
      ))}
      <button onClick={addItem}>Agregar fila</button>
      <table>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              {columns.map(c => (
                <td key={c}>{item[c]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
