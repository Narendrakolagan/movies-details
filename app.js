const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

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

// GET PLAYERS

app.get("/players/", async (request, response) => {
  const playersQuery = `
    
    SELECT 
    player_id AS playerId,
    player_name AS playerName
    FROM 
    player_details
    `;
  const players = await db.all(playersQuery);
  response.send(players);
});

module.exports = app;

//GET UNIQUE PLAYER

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    
    SELECT 
    player_id AS playerId,
    player_name AS playerName
    FROM 
    player_details
    WHERE 
    player_id = ${playerId}

    `;
  const player = await db.get(playerQuery);
  response.send(player);
});
module.exports = app;

// PUT

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;

  const updatedPlayerQuery = `
    
    UPDATE 
    player_details
    SET 
    player_name = '${playerName}'
    WHERE 
    player_id = ${playerId}
    `;
  await db.run(updatedPlayerQuery);
  response.send("Player Details Updated");
});

module.exports = app;

// GET MATCHES

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchQuery = `
    
    SELECT 
    match_id AS matchId,
    match,
    year
    FROM 
    match_details
    WHERE 
    match_id = ${matchId}
    `;

  const match = await db.get(matchQuery);
  response.send(match);
});
module.exports = app;

//GET MATCHES OF PLAYER

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const matchQuery = `
    
    SELECT 
    match_id AS matchId,
    match,
    year
    FROM 
    player_match_score NATURAL JOIN match_details
    WHERE 
    player_id = ${playerId}

    `;

  const match = await db.all(matchQuery);
  response.send(match);
});
module.exports = app;

// GET PLAYERS

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const matchQuery = `
    
    SELECT 
    player_id AS playerId,
    player_name AS playerName
    FROM 
    player_match_score NATURAL JOIN player_details
    WHERE 
    match_id = ${matchId}
    `;

  const match = await db.all(matchQuery);
  response.send(match);
});
module.exports = app;

// GET STATISTICS

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const matchQuery = `
    
    SELECT 
    player_id AS playerId,
    player_name AS playerName,
    SUM(score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes
    FROM 
    player_match_score NATURAL JOIN player_details 
    WHERE 
    player_id = ${playerId}

    `;

  const match = await db.get(matchQuery);
  response.send(match);
});
module.exports = app;
