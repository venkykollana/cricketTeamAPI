const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//API-1 (get all player details)
app.get("/players/", async (request, response) => {
  const getAllPlayers = `
    SELECT * 
    FROM cricket_team;`;
  const allPlayers = await db.all(getAllPlayers);
  response.send(
    allPlayers.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API-2(add player to the table)
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const postPlayerDetails = `INSERT INTO
     cricket_team(player_name,jersey_number,role)
     VALUES ('${playerName}', ${jerseyNumber},'${role}');`;
  const player = await db.run(postPlayerDetails);
  response.send("Player Added to Team");
});

//API-3 (get details of particular player only)
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getParticularPlayer = `
    SELECT * 
    FROM cricket_team
    WHERE player_id = ${playerId};`;
  const getPlayer = await db.get(getParticularPlayer);
  response.send(convertDbObjectToResponseObject(getPlayer));
});

//API-4 (update the details of a player)
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `UPDATE cricket_team 
    SET player_name = '${playerName}', 
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE player_id = ${playerId};`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//API-5 (player to be removed)
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `DELETE FROM cricket_team 
    WHERE player_id = ${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
