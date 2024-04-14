import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getNeo4jSession } from '@db/neo4j';
import styles from './UpdateUser.module.css'; // Importa el archivo de estilos

function UpdateUser() {
    const [nodeData, setNodeData] = useState(null);
    const { nodeId } = useParams(); // Obtiene el parámetro de la URL
    const navigate = useNavigate();

    useEffect(() => {
        const session = getNeo4jSession();
        const query = `MATCH (n) WHERE ID(n) = ${nodeId - 1} RETURN n`;

        session.run(query)
            .then(result => {
                const record = result.records[0];
                if (record) {
                    const node = record.get('n').properties;
                    setNodeData(node);
                } else {
                    console.error(`No se encontró ningún nodo con el ID ${nodeId}`);
                }
            })
            .catch(error => console.error('Error retrieving node from Neo4j:', error));

        return () => {
            session.close();
        };
    }, [nodeId]);

    const handleInputChange = (event) => {
        // Manejar cambios en los inputs
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Lógica para enviar los datos actualizados
    };

    if (!nodeData) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
            <h2>Actualizar Datos</h2>
            <form onSubmit={handleSubmit}>
                <label>Nombre:</label>
                <input type="text" name="nombre" value={nodeData.nombre} onChange={handleInputChange} className={styles.input} />
                
                <label>Correos:</label>
                <input type="text" name="correos" value={nodeData.correos.join(', ')} onChange={handleInputChange} className={styles.input} />

                <label>Fecha de Registro:</label>
                <input type="text" name="fechaRegistro" value={`${nodeData.fecha_registro.day.low}/${nodeData.fecha_registro.month.low}/${nodeData.fecha_registro.year.low}`} onChange={handleInputChange} className={styles.input} />

                <label>Sexo:</label>
                <input type="text" name="sexo" value={nodeData.sexo} onChange={handleInputChange} className={styles.input} />

                <label>Edad:</label>
                <input type="text" name="edad" value={nodeData.edad.low} onChange={handleInputChange} className={styles.input} />

                <button type="submit" className={styles.submitButton}>Actualizar</button>
            </form>
        </div>
    );
}

export default UpdateUser;
