import React, { useState, useEffect } from 'react'
import neo4j from 'neo4j-driver'

const Neo4jNodesViewer = () => {
  // Estado para almacenar los nodos recuperados de Neo4j
  const [nodes, setNodes] = useState([]);

  // Efecto para cargar los nodos al montar el componente
  useEffect(() => {
    // Conexión a la base de datos Neo4j
    const driver = neo4j.driver("neo4j+s://44e3538a.databases.neo4j.io:7687", neo4j.auth.basic("neo4j", "MnC8T9_kfHxKCH-jTBbWSxh3PhJRkL_uSg3qK4XKR_4"));
    const session = driver.session();

    // Consulta Cypher para recuperar todos los nodos
    const query = "MATCH (n) RETURN n";

    // Ejecutar la consulta y actualizar el estado con los nodos recuperados
    session.run(query)
      .then(result => {
        const records = result.records;
        const nodesData = records.map(record => record.get('n').properties);
        setNodes(nodesData);
      })
      .catch(error => console.error('Error retrieving nodes from Neo4j:', error));

    // Cerrar la sesión y la conexión al desmontar el componente
    return () => {
      session.close();
      driver.close();
    };
  }, []); // Ejecutar solo una vez al montar el componente

  return (
    <div>
      <h2>Neo4j Nodes Viewer</h2>
      <ul>
        {nodes.map((node, index) => (
          <li key={index}>{JSON.stringify(node)}</li> // Muestra cada nodo como una cadena JSON
        ))}
      </ul>
    </div>
  );
};

export default Neo4jNodesViewer