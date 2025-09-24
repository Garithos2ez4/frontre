import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CalculoArea = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // recibir estados desde CalculoResumen (si vienen)
  const calculadoraM2 = location.state?.calculadoraM2 ?? 1;
  const tipoCambioInicial = location.state?.tipoCambio ?? 3.7;
  const imprevistosInicial = location.state?.imprevistos ?? false;

  const [items, setItems] = useState([]);
  const [pasilloItems, setPasilloItems] = useState([]);
  const [tipoCambio, setTipoCambio] = useState(tipoCambioInicial);
  const [imprevistos, setImprevistos] = useState(imprevistosInicial);

  useEffect(() => {
    const ids =
      "5390,3174,2973,130,44,428,787,39,36,3475,3496,6,3781,2959,30,103,4920,18,4915,41,24,5200,469,19,20,18,500";
    fetch(`http://localhost:4000/api/articulos/ids?ids=${ids}`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error al traer artículos:", err));

    const idsPasillo = "4881,4902,10,385,500";
    fetch(`http://localhost:4000/api/articulos/ids?ids=${idsPasillo}`)
      .then((res) => res.json())
      .then((data) => setPasilloItems(data))
      .catch((err) =>
        console.error("Error al traer artículos del pasillo:", err)
      );
  }, []);

  // fórmula Excel: SI((B8*G6)/(1*B6)<0.5;1;(B8*G6)/(1*B6))
  const calcularCantidad = (areaCounter) => {
    const B8 = 1;
    const B6 = 20;
    const G6 = areaCounter;
    const valor = (B8 * G6) / B6;
    return valor < 0.5 ? 1 : valor;
  };

  const generarCodigo = (nombreProducto, index, pref = "CV") => {
    const letra = (nombreProducto?.charAt(0) || "X").toUpperCase();
    const numero = String(index + 1).padStart(3, "0");
    return `${pref}-${letra}${numero}`;
  };

  const calcularM2Counter = (m2) => {
    const C9 = 20;
    const C6 = 639.1;
    return m2 < 451 ? 9 : (C9 * m2) / C6;
  };
  const areaCounter = Math.round(calcularM2Counter(calculadoraM2));

  const imprevistosPercent = imprevistos ? 0.1 : 0;
  const I4 = 1 + imprevistosPercent;
  const J4 = I4;

  const calcularSolesExcel = (cantidad, precioUnitario, imprevistos) => {
  const base = Math.round(cantidad * precioUnitario); // REDONDEAR
  const factor = 1 + (imprevistos ? 0.1 : 0);         // J4 = 1.1 si hay imprevistos
  return base * factor;
};
const calcularDolaresExcel = (soles, tipoCambio) => {
  return tipoCambio > 0 ? Math.round(soles / tipoCambio) : 0;
};
  const handleCalcularClick = () => {
    navigate("/calculo-area", {
      state: { calculadoraM2, tipoCambio, imprevistos },
    });
  };

  // Totales
  const totalSoles = items.reduce(
    (acc, item) =>
      acc + calcularSolesExcel(calcularCantidad(areaCounter), item.costo_unitario_soles),
    0
  );

  const totalDolares =
    tipoCambio > 0
      ? items.reduce(
          (acc, item) =>
            acc +
            Math.round(
              calcularSolesExcel(calcularCantidad(areaCounter), item.costo_unitario_soles) /
                tipoCambio
            ),
          0
        )
      : 0;

  const totalSolesPasillo = pasilloItems.reduce(
    (acc, item) => acc + calcularSolesExcel(item.cantidad, item.costo_unitario_soles),
    0
  );

  const totalDolaresPasillo =
    tipoCambio > 0
      ? pasilloItems.reduce(
          (acc, item) =>
            acc + Math.round(calcularSolesExcel(item.cantidad, item.costo_unitario_soles) / tipoCambio),
          0
        )
      : 0;

  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : n;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2 text-center">
        INVERSION LOCAL RPM 50 XTREME
      </h1>

      {/* Tipo de cambio recibido del resumen */}
      <div style={{ marginBottom: "1rem" }}>
        <label>TIPO DE CAMBIO ($): </label>
        <input
          type="number"
          value={tipoCambio}
          onChange={(e) => setTipoCambio(parseFloat(e.target.value) || 0)}
          style={{ width: "100px", marginLeft: "0.5rem" }}
        />
      </div>

      {/* Mostrar si vino imprevistos desde el resumen */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="checkbox"
            checked={imprevistos}
            onChange={() => setImprevistos((s) => !s)}
          />{" "}
          IMPREVISTOS 10%
        </label>
        <small className="ms-2"> (factor aplicado: {I4})</small>
      </div>

      <div className="mb-4 text-sm">
        <div className="bg-yellow-300 text-dark p-2 rounded mb-1">
          COUNTER DE VENTAS | AREA (m2): {areaCounter}
        </div>
        <div className="bg-yellow-300 text-dark p-2 rounded">
          AREA TOTAL (m2): {areaCounter}
        </div>
      </div>

      {/* ✅ Botón Calcular M2 */}
      <button
        onClick={handleCalcularClick}
        className="btn btn-warning text-white fw-bold mb-4"
      >
        Calcular M2
      </button>

      {/* TABLA PRINCIPAL */}
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
            let nombreProducto = item.producto || "";

            if (nombreProducto.toUpperCase().includes("TOALLA")) {
              nombreProducto += item.cantidad > 1 ? " GRANDE" : " CHICA";
            }

            if (
              nombreProducto.toUpperCase().includes("TV") ||
              nombreProducto.toUpperCase().includes("PANTALLA")
            ) {
              nombreProducto += " 55''";
            }

            // 👇 aquí calculas la cantidad según tu fórmula de Excel
           const cantidadCalculada = calcularCantidad(areaCounter);
const soles = calcularSolesExcel(cantidadCalculada, item.costo_unitario_soles, imprevistos);
const dolares = calcularDolaresExcel(soles, tipoCambio);


            return (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{nombreProducto}</td>
                {/* <td>{item.cantidad}</td> */}
                <td>{cantidadCalculada}</td>
                <td>{fmt(soles)}</td>
                <td>{dolares.toLocaleString()}</td>
                <td>{generarCodigo(nombreProducto, index, "CV")}</td>
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

      {/* PASILLO PRINCIPAL */}
      <h2 className="text-2xl font-bold mt-6 mb-3">
        PASILLO PRINCIPAL AREA (m2)
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
            const soles = calcularSolesExcel(
              item.cantidad,
              item.costo_unitario_soles
            );
            const dolares =
              tipoCambio > 0 ? Math.round(soles / tipoCambio) : 0;

            return (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.producto}</td>
                <td>{item.cantidad}</td>
                <td>{fmt(soles)}</td>
                <td>{dolares.toLocaleString()}</td>
                <td>{generarCodigo(item.producto, index, "PP")}</td>
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

export default CalculoArea;
