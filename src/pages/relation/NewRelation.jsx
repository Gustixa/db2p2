import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getNeo4jSession } from '@db/neo4j';
import styles from './NewRelation.module.css'; // Importa el archivo de estilos

function NewRelation() {
    const [nodeData, setNodeData] = useState(null);
    const [comercios, setComercios] = useState([]);
    const [tarjetas, setTarjetas] = useState([]);
    const [selectedComercio, setSelectedComercio] = useState('');
    const [selectedTarjeta, setSelectedTarjeta] = useState('');
    const { nodeId } = useParams();
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

        // Obtener los nodos de tipo "comercio"
        const getComercios = async () => {
            try {
                const session = getNeo4jSession();
                const comerciosQuery = `MATCH (c:Comercio) RETURN c`;
                const result = await session.run(comerciosQuery);
                const comerciosData = result.records.map(record => ({
                    id: record.get('c').identity.low,
                    nombre: record.get('c').properties.nombre
                }));
                setComercios(comerciosData);
                session.close();
            } catch (error) {
                console.error('Error retrieving comercios from Neo4j:', error);
            }
        };

        // Obtener los nodos de tipo "tarjeta"
        const getTarjetas = async () => {
            try {
                const session = getNeo4jSession();
                const tarjetasQuery = `MATCH (t:Tarjeta) RETURN t`;
        
                const result = await session.run(tarjetasQuery);
                const tarjetasData = result.records.map(record => {
                    const tarjeta = record.get('t').properties;
                    return {
                        id: record.get('t').identity.low,
                        tipo: tarjeta.tipo,
                        limiteCredito: tarjeta.limite_credito,
                        fechaEmision: tarjeta.fecha_emision,
                        activa: tarjeta.activa
                    };
                });
                setTarjetas(tarjetasData);
                session.close();
            } catch (error) {
                console.error('Error retrieving tarjetas from Neo4j:', error);
            }
        };

        getComercios();
        getTarjetas();

        return () => {
            // Cerrar la sesión de Neo4j si es necesario
        };
    }, [nodeId]);

    const handleSelectComercio = (event) => {
        setSelectedComercio(event.target.value);
    };

    const handleSelectTarjeta = (event) => {
        setSelectedTarjeta(event.target.value);
    };

    const handleSubmitComercio = async (event) => {
        event.preventDefault();
        try {
            const session = getNeo4jSession();
            const relacionQuery = `
                MATCH (n:Persona), (c:Comercio)
                WHERE ID(n) = ${nodeId} AND ID(c) = ${selectedComercio}
                CREATE (n)-[:COMPRA_EN]->(c)
                RETURN n, c
            `;
            await session.run(relacionQuery);
            session.close();
            console.log('Relación establecida exitosamente en Neo4j');
            navigate('/');
        } catch (error) {
            console.error('Error creating relationship with Comercio in Neo4j:', error);
        }
    };

    const handleSubmitTarjeta = async (event) => {
        event.preventDefault();
        try {
            if (!selectedTarjeta || !nodeId) {
                console.error('Error: Tarjeta o nodeId no definidos.');
                return;
            }
            const session = getNeo4jSession();
            const relacionQuery = `
                MATCH (n:Tarjeta), (p:Persona)
                WHERE ID(n) = ${selectedTarjeta} AND ID(p) = ${nodeId}
                CREATE (p)-[:POSEE]->(n)
                RETURN p, n
            `;
            await session.run(relacionQuery);
            session.close();
            console.log('Relación establecida exitosamente en Neo4j');
            navigate('/');
        } catch (error) {
            console.error('Error creating relationship with Tarjeta in Neo4j:', error);
        }
    };

    if (!nodeData) {
        return <div>Cargando...</div>;
    }

    const handleRegresar = () => {
        navigate("/");
    };

    return (
        <div>
            <h2>Actualizar información</h2>
            <div className={styles.container}>
                <form onSubmit={handleSubmitComercio}>
                    <div className={styles.form}>
                        {/* Selección de nodo comercio */}
                        <div className={styles.formRow}>
                            <label>Seleccione un Comercio:</label>
                            <select value={selectedComercio} onChange={handleSelectComercio} className={styles.input}>
                                <option value="">Seleccione un comercio...</option>
                                {comercios.map(comercio => (
                                    <option key={comercio.id} value={comercio.id}>{comercio.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            Establecer Relación con Comercio
                        </button>
                    </div>
                </form>

                <form onSubmit={handleSubmitTarjeta}>
                    <div className={styles.form}>
                        {/* Selección de nodo tarjeta */}
                        <div className={styles.formRow}>
                            <label>Seleccione una Tarjeta:</label>
                            <select value={selectedTarjeta} onChange={handleSelectTarjeta} className={styles.input}>
                                <option value="">Seleccione una tarjeta...</option>
                                {tarjetas.map(tarjeta => (
                                    <option key={tarjeta.id} value={tarjeta.id}>{`Tipo: ${tarjeta.tipo}, Límite de crédito: ${tarjeta.limiteCredito}, Fecha de emisión: ${tarjeta.fechaEmision}, Activa: ${tarjeta.activa}`}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            Establecer Relación con Tarjeta
                        </button>
                    </div>
                    <button className={styles.submitButton} onClick={handleRegresar}>Regresar</button>
                </form>
            </div>
        </div>
    );
}

export default NewRelation;
