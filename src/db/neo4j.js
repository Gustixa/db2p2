import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  "neo4j+s://aa1788c3.databases.neo4j.io:7687",
  neo4j.auth.basic("neo4j", "Ot7Oa4GbMMYzHaGwY1A2ZRJIGQepNQLlhN_TLeXZpyA"),
)

export const getNeo4jSession = () => {
  return driver.session()
}

export const createNeo4jNode = async (formData) => {
  const session = driver.session();
  try {
    // Separar los correos y limpiarlos
    const correos = formData.correos.split(',').map(correo => correo.trim());

    // Definir los labels
    let labels = ['Persona'];

    // Si se proporciona un nuevo atributo, agrégalo como label
    if (formData.nuevoAtributo.trim() !== '') {
      labels.push(formData.nuevoAtributo);
    }

    const result = await session.run(
      `
      CREATE (n:${labels.join(':')}) 
      SET n.nombre = $nombre,
          n.sexo = $sexo,
          n.edad = $edad,
          n.fecha_registro = date($fechaRegistro),
          n.correos = $correos
      RETURN n
      `,
      {
        nombre: formData.nombre,
        sexo: formData.sexo,
        edad: parseInt(formData.edad), // Asegurando que la edad sea un número
        fechaRegistro: formData.fechaRegistro,
        correos: correos
      }
    );
    session.close();
    return result;
  } catch (error) {
    throw error;
  }
}


