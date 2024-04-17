import React, { useState, useEffect } from 'react'
import { getNeo4jSession } from '@db/neo4j'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'
import NavBar from '@components/navBar'

function Home() {
    const [nodes, setNodes] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const session = getNeo4jSession()
        let query = `MATCH (n:Persona)`

        if (searchTerm) {
            query += ` WHERE toLower(n.nombre) CONTAINS toLower("${searchTerm}")`
        }

        query += ' RETURN n'

        session.run(query)
            .then(result => {
                const records = result.records
                const nodesData = records.map(record => {
                    const node = record.get('n').properties
                    node.neo4jId = record.get('n').identity.low
                    return node
                })
                setNodes(nodesData)
                session.close()
            })
            .catch(error => console.error('Error retrieving nodes from Neo4j:', error))
    }, [searchTerm])

    const handleEditNode = (neo4jId) => {
        navigate(`/updateUser/${neo4jId}`)
    }

    /**
     * Eliminacion del nodo junto con todas las relaciones que posee, entrantes y salientes
     * @param {} neo4jId 
     */
    const handleDeleteNode = async (neo4jId) => {
        try {
            const session = getNeo4jSession()
            const deleteQuery = `
                MATCH (n)-[r]-() 
                WHERE ID(n) = ${neo4jId} 
                DELETE n, r
            `
            await session.run(deleteQuery)
            session.close()
            setNodes(prevNodes => prevNodes.filter(node => node.neo4jId !== neo4jId))
            navigate('/')
        } catch (error) {
            console.error('Error deleting node and relationships from Neo4j:', error)
        }
    }

    const handleNodeInfo = (neo4jId) => {
        navigate(`/detalles/${neo4jId}`)
    }


    return (
        <div>
            <NavBar />
            <h2 className={styles.title}>Clientes</h2> {/* Título fijo para Clientes */}
            <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.search}
            />
            <div className={styles.nodeContainer}>
                {nodes.map((node, index) => (
                    <div key={index} className={styles.nodeCard}>
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
                            <button className={styles.deleteButton} onClick={() => handleDeleteNode(node.neo4jId)}>Eliminar</button>
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