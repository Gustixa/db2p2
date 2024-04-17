import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getNeo4jSession } from '@db/neo4j'
import styles from './UpdateUser.module.css' // Importa el archivo de estilos

function UpdateUser() {
    const [nodeData, setNodeData] = useState(null);
    const [newProperty, setNewProperty] = useState({ name: '', value: '' }); // Estado para la nueva propiedad
    const { nodeId } = useParams(); // Obtiene el parámetro de la URL
    
    const navigate = useNavigate();

    useEffect(() => {
        const session = getNeo4jSession();
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
                session.close();
            })
            .catch(error => console.error('Error retrieving node from Neo4j:', error));

        return () => {
            // Cerrar la sesión de Neo4j si es necesario
        };
    }, [nodeId]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewProperty(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleAddProperty = () => {
        // Agrega la nueva propiedad al nodo solo si el nombre y el valor no están vacíos
        if (newProperty.name.trim() !== '' && newProperty.value.trim() !== '') {
            setNodeData(prevNodeData => ({
                ...prevNodeData,
                [newProperty.name]: newProperty.value
            }));
            // Limpia los campos después de agregar la propiedad
            setNewProperty({ name: '', value: '' });
        }
    }
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // Asegurarse de que nodeData esté actualizado antes de construir la consulta de actualización
            const updatedNodeData = { ...nodeData };
    
            const session = getNeo4jSession();
            const updateQuery = `
                MATCH (n)
                WHERE ID(n) = ${nodeId}
                SET n.nombre = $nombre,
                    n.correos = $correos,
                    n.fecha_registro = date($fechaRegistro),
                    n.sexo = $sexo,
                    n.edad = $edad
            `;
            await session.run(updateQuery, {
                nombre: updatedNodeData.nombre,
                correos: updatedNodeData.correos,
                fechaRegistro: updatedNodeData.fecha_registro,
                sexo: updatedNodeData.sexo,
                edad: updatedNodeData.edad
            });
            session.close();
            console.log('Datos actualizados exitosamente en Neo4j');
            // Actualizar el estado con los nuevos datos después de la actualización en Neo4j
            setNodeData(updatedNodeData);
            // Aquí puedes redirigir al usuario a otra página si lo deseas
            navigate("/");
        } catch (error) {
            console.error('Error updating node in Neo4j:', error);
        }
    }
    
    
    const handleCancel = async (event) => {
        event.preventDefault();
        navigate("/");
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
                        <div className={styles.formRow}>
                            <label>Nombre:</label>
                            <input type="text" name="nombre" value={nodeData.nombre} onChange={handleInputChange} className={styles.input} />
                        </div>
                        <div className={styles.formRow}>
                            <label>Fecha de Registro:</label>
                            <input type="text" name="fecha_registro" value={`${new Date(nodeData.fecha_registro).getDate()}/${new Date(nodeData.fecha_registro).getMonth() + 1}/${new Date(nodeData.fecha_registro).getFullYear()}`} onChange={handleInputChange} className={styles.input} />
                        </div>
                        <div className={styles.formRow}>
                            <label>Edad:</label>
                            <input type="number" name="edad" value={nodeData.edad} onChange={handleInputChange} className={styles.input} />
                        </div>
                        <div className={styles.formRow}>
                            <label>Correos:</label>
                            <input type="text" name="correos" value={Array.isArray(nodeData.correos) ? nodeData.correos.join(', ') : ''} onChange={handleInputChange} className={styles.input} />
                        </div>
                        <div className={styles.formRow}>
                            <label>Sexo:</label>
                            <input type="text" name="sexo" value={nodeData.sexo} onChange={handleInputChange} className={styles.input} />
                        </div>

                        {/* Campos para la nueva propiedad */}
                        <div className={styles.formRow}>
                            <label>Nueva Propiedad:</label>
                            <input type="text" name="name" value={newProperty.name} onChange={handleInputChange} className={styles.input} placeholder="Nombre" />
                            <input type="text" name="value" value={newProperty.value} onChange={handleInputChange} className={styles.input} placeholder="Valor" />
                            <button type="button" onClick={handleAddProperty}>Agregar</button>
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

export default UpdateUser;


