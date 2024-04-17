import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getNeo4jSession } from '@db/neo4j';

function Detalles() {
  const [transactions, setTransactions] = useState([]);
  const { nodeId } = useParams(); // Obtiene el parámetro de la URL

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = getNeo4jSession();
        const query = `
          MATCH (p:Persona)-[:REALIZA]->(t:Transaccion)
          WHERE id(p) = ${nodeId}
          RETURN t
        `;

        const result = await session.run(query);
        const records = result.records;

        if (records.length > 0) {
          const transactionsData = records.map(record => record.get('t').properties);
          setTransactions(transactionsData);
        } else {
          console.error(`No se encontraron transacciones para la persona con el ID ${nodeId}`);
        }

        session.close();
      } catch (error) {
        console.error('Error retrieving transactions from Neo4j:', error);
      }
    };

    fetchData();

    return () => {
      // Limpiar efectos si es necesario
    };
  }, [nodeId]);

  if (transactions.length === 0) {
    return <div>No hay transacciones para mostrar.</div>;
  }

  return (
    <div>
      <h2>Transacciones de la Persona</h2>
      <ul>
        {transactions.map(transaction => (
          <li key={transaction.id}>
          <p>ID de Transacción: {transaction.id ? transaction.id : 'N/A'}</p>
          <p>Monto: {transaction.monto ? parseInt(transaction.monto) : 'N/A'}</p>
          <p>Fecha: {transaction.fecha ? new Date(transaction.fecha).toLocaleDateString() : 'N/A'}</p>
          <p>Tipo: {transaction.tipo ? transaction.tipo : 'N/A'}</p>
          <p>Aprobada: {transaction.aprobada !== undefined ? (transaction.aprobada ? 'Sí' : 'No') : 'N/A'}</p>

          </li>
        ))}
      </ul>
    </div>
  );
}

export default Detalles;
