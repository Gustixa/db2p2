import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getNeo4jSession } from '@db/neo4j'
import styles from './UpdateComercio.module.css' // Importa el archivo de estilos

function UpdateComercio() {
    const [nodeData, setNodeData] = useState(null)
    const { nodeId } = useParams() // Obtiene el parámetro de la URL
    console.log(nodeId)
    const navigate = useNavigate()

    useEffect(() => {
        const session = getNeo4jSession()
        const query = `MATCH (n) WHERE id(n) = ${nodeId} RETURN n`

        session.run(query)
            .then(result => {
                const record = result.records[0]
                if (record) {
                    const node = record.get('n').properties
                    setNodeData(node)
                } else {
                    console.error(`No se encontró ningún nodo con el ID ${nodeId}`)
                }
                session.close()
            })
            .catch(error => console.error('Error retrieving node from Neo4j:', error))

        return () => {
            
        }
    }, [nodeId])

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setNodeData(prevNodeData => ({
            ...prevNodeData,
            [name]: value
        }))
    }
            
    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            const session = getNeo4jSession()
            const updateQuery = `
                MATCH (n)
                WHERE ID(n) = ${nodeId}
                SET n.nombre = "${nodeData.nombre}",
                    n.calle = "${nodeData.calle}",
                    n.address = "${nodeData.address}",
                    n.categoria = "${nodeData.categoria}",
                    n.abierto = ${nodeData.abierto}
            `
            await session.run(updateQuery)
            session.close()
            console.log('Datos actualizados exitosamente en Neo4j')
        } catch (error) {
            console.error('Error updating node in Neo4j:', error)
        }
        navigate("/")
    }
    
    const handleCancel = async (event) => {
        event.preventDefault()
        navigate("/")
    }
    if (!nodeData) {
        return <div>Cargando...</div>
    }

    return (
        <div>
            <h2>Actualizar información</h2>
            <div className={styles.container}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.form}>
                        <div className={styles.formRow}>
                            <label>Nombre:</label>
                            <input type="text" name="nombre" value={nodeData.nombre} onChange={handleInputChange} className={styles.input} />
                        </div>
                        <div className={styles.formRow}>
                            <label>Calle:</label>
                            <input type="text" name="calle" value={nodeData.calle} onChange={handleInputChange} className={styles.input} />
                        </div>
                        <div className={styles.formRow}>
                            <label>Dirección:</label>
                            <input type="text" name="address" value={nodeData.address} onChange={handleInputChange} className={styles.input} />
                        </div>
                        <div className={styles.formRow}>
                            <label>Categoría:</label>
                            <input type="text" name="categoria" value={nodeData.categoria} onChange={handleInputChange} className={styles.input} />
                        </div>
                        <div className={styles.formRow}>
                            <label>Abierto:</label>
                            <select name="abierto" value={nodeData.abierto} onChange={handleInputChange} className={styles.input}>
                                <option value={true}>Sí</option>
                                <option value={false}>No</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        Actualizar
                    </button>
                    <button onClick={handleCancel} className={styles.cancelButton}>
                        Cancelar
                    </button>
                </form>
            </div>
        </div>
    )
}

export default UpdateComercio
