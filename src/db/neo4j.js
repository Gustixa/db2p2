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
      const result = await session.run(
          `
          CREATE (n:Persona { nombre: $nombre, sexo: $sexo, edad: $edad, fecha_registro: date($fechaRegistro), correos: $correos })
          RETURN n
          `,
          {
              nombre: formData.nombre,
              sexo: formData.sexo,
              edad: parseInt(formData.edad), // Asegurando que la edad sea un número
              fechaRegistro: formData.fechaRegistro,
              correos: formData.correos.split(',').map(correo => correo.trim()) // Separando y limpiando los correos
          }
      );
      session.close();
      return result;
  } catch (error) {
      throw error;
  }
}




