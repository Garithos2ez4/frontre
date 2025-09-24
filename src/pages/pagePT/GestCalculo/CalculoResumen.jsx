import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CalculoResumen = () => {
  const navigate = useNavigate();

  
  const [calculadoraM2, setCalculadoraM2] = useState(
    () => Number(sessionStorage.getItem('calculadoraM2')) || 1
  );
  const [tipoCambio, setTipoCambio] = useState(
  () => Number(sessionStorage.getItem('tipoCambio')) || 3.7
);

  const [imprevistos, setImprevistos] = useState(false);

  const equipamiento = [
    { id: 1, nombre: 'COUNTER DE VENTA', m2Base: 9, costoUSD: 9817.65 },
    { id: 2, nombre: 'PASILLO PRINCIPAL', m2Base: 37, costoUSD: 3850.0 },
    { id: 5, nombre: 'BAÑOS Y CAMERINOS', m2Base: 36, costoUSD: 863.76 },
    { id: 6, nombre: 'LOCKERS', m2Base: 4, costoUSD: 951.35 },
    { id: 7, nombre: 'NUTRICIÓN', m2Base: 9, costoUSD: 12443.08 },
    { id: 8, nombre: 'PSICOLOGIA', m2Base: 6, costoUSD: 844.32 },
    { id: 9, nombre: 'CUARTO DE REPOSO Y ALIMENTACION', m2Base: 19, costoUSD: 811.62 },
    { id: 10, nombre: 'AREA ADMINISTRATIVA', m2Base: 17, costoUSD: 7237.11 },
  ];

  // Fórmulas
  const calcularM2Counter = (m2) => {
    const C9 = 20;
    const C6 = 639.1;
    return m2 < 451 ? 9 : (C9 * m2) / C6;
  };

  const calcularSolesCounter = (m2, imprevistos) => {
    const I36 = 2000; // valor fijo
    const factorImprevistos = imprevistos ? 1.1 : 1;
    return I36 * (m2 / 9) * factorImprevistos;
  };

  const handleChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setCalculadoraM2(value);
    sessionStorage.setItem('calculadoraM2', value);
  };

  const resultados = equipamiento.map((item) => {
    let m2 = item.id === 1 ? calcularM2Counter(calculadoraM2) : item.m2Base;
    const factorImprevistos = imprevistos ? 1.1 : 1;
    let soles, dolares;
    if (item.id === 1) {
      soles = calcularSolesCounter(m2, imprevistos);
      dolares = soles / tipoCambio;
    } else {
      soles = item.costoUSD * tipoCambio * factorImprevistos;
      dolares = item.costoUSD * factorImprevistos;
    }
    return { ...item, m2, soles, dolares };
  });

  const totalM2 = resultados.reduce((acc, r) => acc + r.m2, 0);
  const totalSoles = resultados.reduce((acc, r) => acc + r.soles, 0);
  const totalDolares = resultados.reduce((acc, r) => acc + r.dolares, 0);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Calculadora Equipamiento</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>CALCULADORA M2: </label>
        <input
          type="number"
          value={calculadoraM2}
          onChange={handleChange}
          style={{ width: '80px', marginLeft: '0.5rem' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>TIPO DE CAMBIO ($): </label>
        <input
          type="number"
          value={tipoCambio}
          onChange={(e) => setTipoCambio(parseFloat(e.target.value) || 0)}
          style={{ width: '80px', marginLeft: '0.5rem' }}
        />
      </div>

      <button
        type="button"
        onClick={() => navigate('/calculo-area', { state: { calculadoraM2,tipoCambio,imprevistos } })}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        style={{ marginBottom: '1rem' }}
      >
        Calculo por Área
      </button>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={imprevistos}
            onChange={() => setImprevistos(!imprevistos)}
          />{' '}
          IMPREVISTOS 10%
        </label>
      </div>

      <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
        INVERSIÓN APROXIMADA: S/{totalSoles.toFixed(2)} / ${totalDolares.toFixed(2)}
      </div>

      <table border="1" cellPadding="5" style={{ width: '100%', textAlign: 'center' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>EQUIPAMIENTO VALORIZADO SEGÚN AREA</th>
            <th>M2</th>
            <th>INVERSIÓN SOLES</th>
            <th>INVERSIÓN DOLARES</th>
          </tr>
        </thead>
        <tbody>
          {resultados.map((res) => (
            <tr key={res.id}>
              <td>{res.id}</td>
              <td>{res.nombre}</td>
              <td>{res.m2.toFixed(1)} m2</td>
              <td>S/{res.soles.toFixed(2)}</td>
              <td>${res.dolares.toFixed(2)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 'bold' }}>
            <td colSpan={2}>INVERSIÓN APROXIMADA</td>
            <td>{totalM2.toFixed(1)} m2</td>
            <td>S/{totalSoles.toFixed(2)}</td>
            <td>${totalDolares.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CalculoResumen;
