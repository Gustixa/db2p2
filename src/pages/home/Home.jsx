import React, { useState, useEffect } from 'react'
import { getNeo4jSession } from '@db/neo4j'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'
import NavBar from '@components/navBar'

function Home() {
    const [nodes, setNodes] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const session = getNeo4jSession()
        const query = "MATCH (n) RETURN n"

        session.run(query)
            .then(result => {
                const records = result.records
                const nodesData = records.map(record => record.get('n').properties)
                setNodes(nodesData)
                session.close() // Cerrar la sesión después de que la transacción se complete
            })
            .catch(error => console.error('Error retrieving nodes from Neo4j:', error))

        return () => {
            // No es necesario cerrar la sesión aquí, ya que se cierra después de que la transacción se completa
        }
    }, [])

    const handleEditNode = (nodeId) => {
        // Implementa la lógica para abrir un formulario o un modal de edición para el nodo con el ID especificado
        navigate(`/updateUser/${nodeId}`)
    }

    const handleDeleteNode = async (nodeId) => {
        try {
            const session = getNeo4jSession();
            const deleteQuery = `MATCH (n) WHERE ID(n) = ${nodeId} DELETE n`;
            await session.run(deleteQuery);
            session.close();
            setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId)); // Usar el callback en setNodes
            navigate('/'); // Regresar a la página principal después de eliminar el nodo
        } catch (error) {
            console.error('Error deleting node from Neo4j:', error);
        }
    };
    

    return (
        <div>
            <NavBar/>
            <h2>Neo4j Nodes Viewer</h2>
            <div className={styles.nodeContainer}>
                {nodes.map((node, index) => (
                    <div key={index} className={styles.nodeCard}>
                        <h3>{node.nombre}</h3>
                        <p>Correos: {node.correos && node.correos.join(', ')}</p>
                        <p>{node.id}</p>
                        {node.fecha_registro && (
                            <p>Fecha de Registro: {node.fecha_registro.day.low}/{node.fecha_registro.month.low}/{node.fecha_registro.year.low}</p>
                        )}
                        <p>Sexo: {node.sexo}</p>
                        <p>Edad: {node.edad && node.edad.low}</p>
                        <div className={styles.buttonContainer}>
                            <button className={styles.editButton} onClick={() => handleEditNode(node.id)}>Editar</button>
                            <button className={styles.deleteButton} onClick={() => handleDeleteNode(node.id)}>Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Home





/**
 *  {"correos":["fernando@example.com","fernando@gmail.com"],"fecha_registro":{"year":{"low":2024,"high":0},"month":{"low":3,"high":0},"day":{"low":31,"high":0}},"id":"1","sexo":"masculino","nombre":"Fernando","edad":{"low":50,"high":0}}
    {"correos":["juan@example.com"],"fecha_registro":{"year":{"low":2024,"high":0},"month":{"low":3,"high":0},"day":{"low":31,"high":0}},"id":"2","sexo":"masculino","nombre":"Juan","edad":{"low":48,"high":0}}
    {"correos":["daniel@example.com","daniel@hotmail.com"],"fecha_registro":{"year":{"low":2024,"high":0},"month":{"low":3,"high":0},"day":{"low":31,"high":0}},"id":"3","sexo":"masculino","nombre":"Daniel","edad":{"low":23,"high":0}}
    {"correos":["marcos@example.com"],"fecha_registro":{"year":{"low":2024,"high":0},"month":{"low":3,"high":0},"day":{"low":31,"high":0}},"id":"4","sexo":"masculino","nombre":"Marcos","edad":{"low":30,"high":0}}
    {"correos":["gonzalo@example.com"],"fecha_registro":{"year":{"low":2024,"high":0},"month":{"low":3,"high":0},"day":{"low":31,"high":0}},"id":"5","sexo":"masculino","nombre":"Gonzalo","edad":{"low":31,"high":0}}
    {"correos":["marta@example.com"],"fecha_registro":{"year":{"low":2024,"high":0},"month":{"low":3,"high":0},"day":{"low":31,"high":0}},"id":"6","sexo":"femenino","nombre":"Marta","edad":{"low":52,"high":0}}
    {"correo":"u1@gmail.com","nombre":"U1","contraseña":"contraseña123"}
    {"correo":"u2@gmail.com","nombre":"U2","contraseña":"contraseña123"}
 */