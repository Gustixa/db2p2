import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  "neo4j+s://e7678ef5.databases.neo4j.io:7687",
  neo4j.auth.basic("neo4j", "rjSIrAHCpYnUoF9hoTFKt8TrGHaG73sfX2hOVT0wzg0"),
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




