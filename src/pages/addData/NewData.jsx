import React, { useState } from 'react';
import NavBar from '@components/navBar';
import styles from './NewData.module.css';
import { createNeo4jNode } from '@db/neo4j'; // Importa la función para crear un nodo en Neo4j

function NewData() {
    const initialValues = {
        nombre: '',
        correos: '',
        fechaRegistro: '',
        sexo: '',
        edad: '',
        nuevoAtributo: '' // Nuevo campo para agregar como label
    };

    const [formData, setFormData] = useState(initialValues);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // Lógica para crear un nodo en Neo4j con los datos del formulario
            await createNeo4jNode(formData);
            console.log('Nodo creado exitosamente en Neo4j');
            // Reiniciar los valores del formulario a los valores iniciales
            setFormData(initialValues);
            // Puedes redirigir al usuario a otra página después de crear el nodo si lo deseas
        } catch (error) {
            console.error('Error al crear el nodo en Neo4j:', error);
        }
    };

    return (
        <div>
            <NavBar />
            <div className={styles.container}>
                <form onSubmit={handleSubmit}>
                  <div className={styles.form}>
                    <div className={styles.formColumn}>
                        <div className={styles.formRow}>
                            <label>Nombre:</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className={styles.input} />
                        </div>
                        <div className={styles.formRow}>
                            <label>Fecha de Registro:</label>
                            <input type="date" name="fechaRegistro" value={formData.fechaRegistro} min="2000-01-01" max="2040-12-31" onChange={handleInputChange} className={styles.input} />
                        </div>
                        <div className={styles.formRow}>
                            <label>Edad:</label>
                            <input type="text" name="edad" value={formData.edad} onChange={handleInputChange} className={styles.input} />
                        </div>
                    </div>
                    <div className={styles.formColumn}>
                        <div className={styles.formRow}>
                            <label>Correos:</label>
                            <input type="text" name="correos" value={formData.correos} onChange={handleInputChange} className={styles.input} />
                        </div>
                        <div className={styles.formRow}>
                            <label>Sexo:</label>
                            <input type="text" name="sexo" value={formData.sexo} onChange={handleInputChange} className={styles.input} />
                        </div>
                        {/* Nuevo input para el atributo adicional */}
                        <div className={styles.formRow}>
                            <label>Nuevo Atributo:</label>
                            <input type="text" name="nuevoAtributo" value={formData.nuevoAtributo} onChange={handleInputChange} className={styles.input} />
                        </div>
                    </div>
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        Agregar
                    </button>
                </form>
            </div>
        </div>
    )
}

export default NewData;

