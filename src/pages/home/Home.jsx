import React, { useState, useEffect } from 'react'
import { getNeo4jSession } from '@db/neo4j'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'
import NavBar from '@components/navBar'

function Home() {
    const [nodes, setNodes] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [totalNodes, setTotalNodes] = useState(0)
    const [selectedNodes, setSelectedNodes] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            const session = getNeo4jSession()

            let query = `MATCH (n:Persona)`

            if (searchTerm) {
                query += ` WHERE toLower(n.nombre) CONTAINS toLower("${searchTerm}")`
            }

            query += ' RETURN n'

            try {
                const result = await session.run(query)

                const records = result.records
                const nodesData = records.map(record => {
                    const node = record.get('n').properties
                    node.neo4jId = record.get('n').identity.low
                    return node
                })

                setNodes(nodesData)

            } catch (error) {
                console.error('Error retrieving nodes from Neo4j:', error)
            }

            session.close()

            // Consulta para contar el número total de nodos
            const countSession = getNeo4jSession()

            try {
                const countResult = await countSession.run('MATCH (n:Persona) RETURN count(n) AS totalNodes')
                const totalNodes = countResult.records[0].get('totalNodes').toNumber()
                setTotalNodes(totalNodes)
            } catch (error) {
                console.error('Error retrieving total nodes count from Neo4j:', error)
            }

            countSession.close()
        }

        fetchData()
    }, [searchTerm, selectedNodes])

    const updateNodeInList = (updatedNode) => {
        setNodes(prevNodes => prevNodes.map(node => {
            if (node.neo4jId === updatedNode.neo4jId) {
                return updatedNode;
            }
            return node;
        }));
    };

    const handleEditNode = (neo4jId) => {
        navigate(`/updateUser/${neo4jId}`);
    };

    const handleRelation = (neo4jId) => {
        navigate(`/nuevaRelacion/${neo4jId}`)
    }

    const handleDeleteNode = async () => {
        try {
            const session = getNeo4jSession();
            const idsToDelete = selectedNodes.map(node => node.neo4jId);
            for (const neo4jId of idsToDelete) {
                const checkRelationsQuery = `
                    MATCH (n)-[r]-()
                    WHERE ID(n) = ${neo4jId}
                    RETURN COUNT(r) AS relationCount
                `;
                const result = await session.run(checkRelationsQuery);
                const relationCount = result.records[0].get('relationCount').toNumber();
        
                if (relationCount > 0) {
                    // El nodo tiene relaciones, eliminar nodo y relaciones
                    const deleteQuery = `
                        MATCH (n)-[r]-()
                        WHERE ID(n) = ${neo4jId}
                        DELETE n, r
                    `;
                    await session.run(deleteQuery);
                } else {
                    // El nodo no tiene relaciones, eliminar solo el nodo
                    const deleteNodeQuery = `
                        MATCH (n)
                        WHERE ID(n) = ${neo4jId}
                        DELETE n
                    `;
                    await session.run(deleteNodeQuery);
                }
            }

            session.close();
    
            // Actualizar la lista de nodos después de eliminar los nodos seleccionados
            setNodes(prevNodes => prevNodes.filter(node => !selectedNodes.some(selectedNode => selectedNode.neo4jId === node.neo4jId)));
            setSelectedNodes([]);
            navigate('/');
        } catch (error) {
            console.error('Error deleting nodes and relationships from Neo4j:', error);
        }
    };
    
    const handleNodeInfo = (neo4jId) => {
        navigate(`/detalles/${neo4jId}`)
    }

    const toggleNodeSelection = (neo4jId) => {
        const isSelected = selectedNodes.some(node => node.neo4jId === neo4jId);
        if (isSelected) {
            setSelectedNodes(prevSelected => prevSelected.filter(node => node.neo4jId !== neo4jId));
        } else {
            const nodeToAdd = nodes.find(node => node.neo4jId === neo4jId);
            setSelectedNodes(prevSelected => [...prevSelected, nodeToAdd]);
        }
    };

    return (
        <div>
            <NavBar />
            <h2 className={styles.title}>Clientes ({totalNodes})</h2> {/* Título con el total de nodos */}
            <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.search}
            />
            {selectedNodes.length > 0 && (
                <button onClick={handleDeleteNode}>Eliminar nodos seleccionados</button>
            )}
            <div className={styles.nodeContainer}>
                {nodes.map((node, index) => (
                    <div key={index} className={styles.nodeCard}>
                        <input
                            type="checkbox"
                            checked={selectedNodes.some(selectedNode => selectedNode.neo4jId === node.neo4jId)}
                            onChange={() => toggleNodeSelection(node.neo4jId)}
                        />
                        <h3>{node.nombre}</h3>
                        {node.correos && <p>Correos: {node.correos.join(', ')}</p>}
                        {node.fecha_registro && (
                            <p>Fecha de Registro: {node.fecha_registro.day.low}/{node.fecha_registro.month.low}/{node.fecha_registro.year.low}</p>
                        )}
                        {node.sexo && <p>Sexo: {node.sexo}</p>}
                        {node.edad && <p>Edad: {node.edad.low}</p>}

                        {node.categoria && <p>Categoría: {node.categoria}</p>}
                        {node.address && <p>Direccion: {node.address}</p>}
                        {node.calle && <p>Calle: {node.calle}</p>}
                        <div className={styles.buttonContainer}>
                            <button className={styles.infoButton} onClick={() => handleNodeInfo(node.neo4jId)}>Detalles</button>
                            <button className={styles.editButton} onClick={() => handleEditNode(node.neo4jId)}>Editar</button>
                            <button className={styles.editButton} onClick={() => handleRelation(node.neo4jId)}>Crear relacion</button>
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