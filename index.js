import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "Baseball1!",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


async function countriesVisited(){
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

app.get("/", async (_req, res) => {
  const countries = await countriesVisited();
  res.render("index.ejs", 
    { 
      countries: countries, 
      total: countries.length 
    });
});


app.post("/add", async (req, res)=>{
  let newCountryName = req.body.country;
  const result = await  db.query("SELECT country_code FROM countries WHERE country_name = $1", [newCountryName]);
  const newCountryCode = result.rows[0].country_code;
  try{
    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [newCountryCode]);
    res.redirect("/");
  }catch(error){
    res.render("index.ejs", 
      { 
        error: error.message,
      });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


