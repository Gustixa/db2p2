import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  "neo4j+s://44e3538a.databases.neo4j.io:7687",
  neo4j.auth.basic("neo4j", "MnC8T9_kfHxKCH-jTBbWSxh3PhJRkL_uSg3qK4XKR_4"),
)

export const getNeo4jSession = () => {
  return driver.session()
}