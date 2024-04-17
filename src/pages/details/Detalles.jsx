import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getNeo4jSession } from '@db/neo4j';
import styles from './Detalles.module.css';

function Detalles() {
  const [tarjeta, setTarjeta] = useState(null);
  const [compras, setCompras] = useState([]);
  const [transaccion, setTransaccion] = useState(null);
  const [productosUtilizados, setProductosUtilizados] = useState([]);
  const { nodeId } = useParams();
  const navigate = useNavigate();

  const handleRegresar = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = getNeo4jSession(); // Obtener sesión de Neo4j

        // Consulta Cypher para obtener detalles de la tarjeta asociada a la persona con el ID dado
        const resultTarjeta = await session.run(
          `
          MATCH (p:Persona)-[:POSEE]->(t:Tarjeta)
          WHERE ID(p) = $nodeId
          RETURN t
          `,
          { nodeId: parseInt(nodeId) }
        );

        const recordsTarjeta = resultTarjeta.records;
        if (recordsTarjeta.length > 0) {
          const tarjetaData = recordsTarjeta[0].get('t').properties;
          tarjetaData.fecha_emision = new Date(tarjetaData.fecha_emision);
          setTarjeta(tarjetaData);
        } else {
          console.error(`No se encontró una tarjeta asociada para el nodo con el ID ${nodeId}`);
        }

        // Consulta Cypher para obtener detalles de las compras de productos realizadas por la persona con el ID dado
        const resultCompras = await session.run(
          `
          MATCH (p:Persona)-[:COMPRA_PRODUCTO]->(prod:Producto)
          WHERE ID(p) = $nodeId
          RETURN prod
          `,
          { nodeId: parseInt(nodeId) }
        );

        const recordsCompras = resultCompras.records;
        if (recordsCompras.length > 0) {
          const comprasData = recordsCompras.map((record) => {
            const productoData = record.get('prod').properties;
            productoData.fecha_compra = new Date(productoData.fecha_compra);
            return productoData;
          });
          setCompras(comprasData);
        } else {
          console.error(`No se encontraron compras de productos para el nodo con el ID ${nodeId}`);
        }

        // Consulta Cypher para obtener detalles de la transacción realizada por la persona con el ID dado
        const resultTransaccion = await session.run(
          `
          MATCH (p:Persona)-[:REALIZA]->(t:Transaccion)
          WHERE ID(p) = $nodeId
          RETURN t
          `,
          { nodeId: parseInt(nodeId) }
        );

        const recordsTransaccion = resultTransaccion.records;
        if (recordsTransaccion.length > 0) {
          const transaccionData = recordsTransaccion[0].get('t').properties;
          transaccionData.fecha = new Date(transaccionData.fecha);
          setTransaccion(transaccionData);
        } else {
          console.error(`No se encontró una transacción realizada para el nodo con el ID ${nodeId}`);
        }

        // Consulta Cypher para obtener detalles de los productos utilizados por la persona con el ID dado
        const resultProductosUtilizados = await session.run(
          `
          MATCH (p:Persona)-[:UTILIZA]->(prod:Producto)
          WHERE ID(p) = $nodeId
          RETURN prod
          `,
          { nodeId: parseInt(nodeId) }
        );

        const recordsProductosUtilizados = resultProductosUtilizados.records;
        if (recordsProductosUtilizados.length > 0) {
          const productosUtilizadosData = recordsProductosUtilizados.map((record) => {
            const productoData = record.get('prod').properties;
            productoData.precio = parseFloat(productoData.precio);
            productoData.stock_disponible = parseInt(productoData.stock_disponible);
            return productoData;
          });
          setProductosUtilizados(productosUtilizadosData);
        } else {
          console.error(`No se encontraron productos utilizados para el nodo con el ID ${nodeId}`);
        }

        session.close();
      } catch (error) {
        console.error('Error al recuperar los datos de Neo4j:', error);
      }
    };

    fetchData();

    return () => {
      // Limpiar efectos si es necesario
    };
  }, [nodeId]);

  const handleEliminarProducto = async (neo4jId) => {
    
    try {
      const session = getNeo4jSession();
  
      // Realiza la eliminación de la relación de uso del producto utilizando el Neo4j ID
      await session.run(
        `
        MATCH (p:Persona)-[r:UTILIZA]->(prod:Producto)
        WHERE ID(p) = $nodeId AND id(prod) = $neo4jId
        DELETE r
        `,
        { nodeId: parseInt(nodeId), neo4jId: neo4jId } // Asegurar que neo4jId se pase correctamente
      );
  
      // Después de la eliminación, vuelve a cargar los datos para actualizar la interfaz
      fetchData();
    } catch (error) {
      console.error('Error al eliminar la relación de uso de producto:', error);
    }
  };
  

  return (
    <div className={styles.container}>
      <button onClick={() => handleRegresar()} className={styles.button}>
        Regresar
      </button>
      <h2>Detalles de la Tarjeta</h2>
      <p>Tipo: {tarjeta ? tarjeta.tipo : 'Cargando...'}</p>
<p>Límite de Crédito: {tarjeta ? tarjeta.limite_credito : 'Cargando...'}</p>
<p>Fecha de Emisión: {tarjeta ? tarjeta.fecha_emision.toLocaleDateString() : 'Cargando...'}</p>
<p>Activa: {tarjeta ? (tarjeta.activa ? 'Sí' : 'No') : 'Cargando...'}</p>


      <h2>Compras de Productos</h2>
      {compras.length > 0 ? (
        <ul className={styles.list}>
          {compras.map((compra, index) => (
            <li key={index}>
              <p>Nombre: {compra.nombre}</p>
              <p>Precio: {compra.precio}</p>
              <p>Fecha de Compra: {compra.fecha_compra.toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div>No se encontraron compras de productos para mostrar.</div>
      )}

      <h2>Detalles de la Transacción</h2>
      {transaccion && (
        <div>
          <p>Fecha: {transaccion.fecha.toLocaleDateString()}</p>
          <p>Tipo: {transaccion.tipo}</p>
          <p>Monto: {transaccion.monto}</p>
          <p>Aprobada: {transaccion.aprobada ? 'Sí' : 'No'}</p>
        </div>
      )}

      <h2>Productos Utilizados</h2>
      {productosUtilizados.length > 0 ? (
        <ul className={styles.list}>
          {productosUtilizados.map((producto, index) => (
            <li key={index}>
              <p>Nombre: {producto.nombre}</p>
              <p>Precio: {producto.precio}</p>
              <p>Stock Disponible: {producto.stock_disponible}</p>
              <button onClick={() => handleEliminarProducto(producto.neo4jId)}>Eliminar producto</button>
            </li>
          ))}
        </ul>
      ) : (
        <div>No se encontraron productos utilizados para mostrar.</div>
      )}
    </div>
  );
}

export default Detalles;
