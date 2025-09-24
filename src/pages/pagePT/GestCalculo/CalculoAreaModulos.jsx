import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const CalculoAreaModulos = () => {
  const location = useLocation();

  // ✅ Recibir data desde CalculoResumen.jsx
  const { resumenData } = location.state || {};

  const nutricion = resumenData?.find((x) => x.nombre === "NUTRICIÓN") || {
    id: 7,
    nombre: "NUTRICIÓN",
    m2Base: 9,
    costoUSD: 12443.08,
  };

  const [items, setItems] = useState([]);
  const [pasilloItems, setPasilloItems] = useState([]);
  const [tipoCambio, setTipoCambio] = useState(3.7);
  const [imprevistos, setImprevistos] = useState(false);

  useEffect(() => {
    const ids =
      "3814,5380,3043,13,19,3355,3074,124,103,3121,103,4959,5382,230,429,500";
    fetch(`http://localhost:4000/api/articulos/ids?ids=${ids}`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error al traer artículos:", err));

    const idsPasillo = "3121,3008,3781,3878,500";
    fetch(`http://localhost:4000/api/articulos/ids?ids=${idsPasillo}`)
      .then((res) => res.json())
      .then((data) => setPasilloItems(data))
      .catch((err) =>
        console.error("Error al traer artículos del pasillo:", err)
      );
  }, []);

  // Helpers de formato
  const fmt = (num) =>
    num?.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const calcularSoles = (cantidad, costoUnit) => {
    let subtotal = cantidad * costoUnit;
    return imprevistos ? subtotal * 1.1 : subtotal;
  };

  const calcularDolares = (soles) =>
    tipoCambio > 0 ? soles / tipoCambio : 0;

  // Totales
  const totalSoles = items.reduce(
    (acc, item) => acc + calcularSoles(item.cantidad, item.costo_unitario_soles),
    0
  );
  const totalDolares = calcularDolares(totalSoles);

  const totalSolesPasillo = pasilloItems.reduce(
    (acc, item) => acc + calcularSoles(item.cantidad, item.costo_unitario_soles),
    0
  );
  const totalDolaresPasillo = calcularDolares(totalSolesPasillo);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2 text-center">
        {nutricion.nombre} | AREA (m2): {nutricion.m2Base}
      </h1>

      {/* Tipo de cambio */}
      <div style={{ marginBottom: "1rem" }}>
        <label>TIPO DE CAMBIO ($): </label>
        <input
          type="number"
          value={tipoCambio}
          onChange={(e) => setTipoCambio(parseFloat(e.target.value) || 0)}
          style={{ width: "100px", marginLeft: "0.5rem" }}
        />
      </div>

      {/* Imprevistos */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="checkbox"
            checked={imprevistos}
            onChange={() => setImprevistos((s) => !s)}
          />{" "}
          IMPREVISTOS 10%
        </label>
      </div>

      {/* TABLA NUTRICIÓN */}
      <h2 className="text-2xl font-bold mt-6 mb-3 text-center">
        TABLA NUTRICIÓN
      </h2>
      <table className="table table-bordered table-striped">
        <thead className="bg-yellow-300 text-dark">
          <tr>
            <th>#</th>
            <th>DESCRIPCIÓN</th>
            <th>CANT.</th>
            <th>SOLES</th>
            <th>DÓLARES</th>
            <th>CÓDIGO</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const soles = calcularSoles(item.cantidad, item.costo_unitario_soles);
            const dolares = calcularDolares(soles);

            return (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.producto}</td>
                <td>{item.cantidad}</td>
                <td>{fmt(soles)}</td>
                <td>{dolares.toLocaleString()}</td>
                <td>{`NUT-${index + 1}`}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-yellow-300 text-dark fw-bold">
            <td colSpan="3" className="text-center">
              TOTAL
            </td>
            <td>{fmt(totalSoles)}</td>
            <td>{totalDolares.toLocaleString()}</td>
            <td>-</td>
          </tr>
        </tfoot>
      </table>

      {/* TABLA PASILLO PRINCIPAL */}
      <h2 className="text-2xl font-bold mt-6 mb-3 text-center">
        PASILLO PRINCIPAL
      </h2>
      <table className="table table-bordered table-striped">
        <thead className="bg-yellow-300 text-dark">
          <tr>
            <th>#</th>
            <th>DESCRIPCIÓN</th>
            <th>CANT.</th>
            <th>SOLES</th>
            <th>DÓLARES</th>
            <th>CÓDIGO</th>
          </tr>
        </thead>
        <tbody>
          {pasilloItems.map((item, index) => {
            const soles = calcularSoles(item.cantidad, item.costo_unitario_soles);
            const dolares = calcularDolares(soles);

            return (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.producto}</td>
                <td>{item.cantidad}</td>
                <td>{fmt(soles)}</td>
                <td>{dolares.toLocaleString()}</td>
                <td>{`PAS-${index + 1}`}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-yellow-300 text-dark fw-bold">
            <td colSpan="3" className="text-center">
              TOTAL
            </td>
            <td>{fmt(totalSolesPasillo)}</td>
            <td>{totalDolaresPasillo.toLocaleString()}</td>
            <td>-</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default CalculoAreaModulos;
