import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getNeo4jSession } from '@db/neo4j'
import styles from './UpdateUser.module.css' // Importa el archivo de estilos

function UpdateUser() {
    const [nodeData, setNodeData] = useState(null);
    const { nodeId } = useParams() // Obtiene el parámetro de la URL
    
    const navigate = useNavigate()

    useEffect(() => {
        const session = getNeo4jSession()
        const query = `MATCH (n) WHERE id(n) = ${nodeId} RETURN n`;

        session.run(query)
            .then(result => {
                const record = result.records[0];
                if (record) {
                    const node = record.get('n').properties;
                    setNodeData(node);
                } else {
                    console.error(`No se encontró ningún nodo con el ID ${nodeId}`);
                }
                session.close()
            })
            .catch(error => console.error('Error retrieving node from Neo4j:', error));

        return () => {
            
        };
    }, [nodeId])

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'correos') {
            // Si el campo es 'correos', separa los correos electrónicos por comas y actualiza el estado
            setNodeData(prevNodeData => ({
                ...prevNodeData,
                correos: value.split(',').map(email => email.trim()) // Separar correos por comas y eliminar espacios en blanco
            }));
        } else if (name === 'edad') {
            // Si el campo es 'edad', asegúrate de que el valor sea un número antes de actualizar el estado
            setNodeData(prevNodeData => ({
                ...prevNodeData,
                [name]: parseInt(value) // Convertir el valor a número
            }));
        } else {
            // Si no es 'correos' ni 'edad', actualiza directamente el estado
            setNodeData(prevNodeData => ({
                ...prevNodeData,
                [name]: value
            }));
        }
    }
            
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // Asegurar que nodeData esté actualizado antes de construir la consulta de actualización
            await setNodeData(nodeData => ({ ...nodeData }));
            
            const session = getNeo4jSession();
            const updateQuery = `
                MATCH (n)
                WHERE ID(n) = ${nodeId}
                SET n.nombre = "${nodeData.nombre}",
                    n.correos = [${nodeData.correos.map(correo => `"${correo}"`).join(', ')}],
                    n.fecha_registro = date({ year: ${nodeData.fecha_registro.year.low}, month: ${nodeData.fecha_registro.month.low}, day: ${nodeData.fecha_registro.day.low} }),
                    n.sexo = "${nodeData.sexo}",
                    n.edad = ${nodeData.edad.low}
            `;
            await session.run(updateQuery);
            session.close();
            console.log('Datos actualizados exitosamente en Neo4j');
            // Aquí puedes redirigir al usuario a otra página si lo deseas
        } catch (error) {
            console.error('Error updating node in Neo4j:', error);
        }
        navigate("/")
    }
    
    const handleCancel = async (event) => {
        event.preventDefault()
        navigate("/")
    }
    if (!nodeData) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
        <h2>Actualizar informacion</h2>
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <div className={styles.form}>
                <div className={styles.formColumn}>
                    <div className={styles.formRow}>
                        <label>Nombre:</label>
                        <input type="text" name="nombre" value={nodeData.nombre} onChange={handleInputChange} className={styles.input} />
                    </div>
                    <div className={styles.formRow}>
                    <label>Fecha de Registro:</label>
                <input type="text" name="fechaRegistro" value={`${nodeData.fecha_registro.day.low}/${nodeData.fecha_registro.month.low}/${nodeData.fecha_registro.year.low}`} onChange={handleInputChange} className={styles.input} />
                    </div>
                    <div className={styles.formRow}>
                        <label>Edad:</label>
                        <input type="number" name="edad" value={nodeData.edad.low} onChange={handleInputChange} className={styles.input} />
                    </div>
                </div>
                <div className={styles.formColumn}>
                    <div className={styles.formRow}>
                        <label>Correos:</label>
                        <input type="text" name="correos" value={Array.isArray(nodeData.correos) ? nodeData.correos.join(', ') : ''} onChange={handleInputChange} className={styles.input} />
                    </div>
                    <div className={styles.formRow}>
                        <label>Sexo:</label>
                        <input type="text" name="sexo" value={nodeData.sexo} onChange={handleInputChange} className={styles.input} />
                    </div>
                </div>
                </div>
                <button type="submit" className={styles.submitButton}>
                    Actualizar
                </button>
                <button onClick={() => handleCancel} className={styles.cancelButton}>
                    Cancelar
                </button>
            </form>
            
        </div>
    </div>
    )
}

export default UpdateUser
