// iya sang admin server ni

const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.set('view engine', 'ejs');

app.use(cors());
app.use(express.json());
app.use(express.static('public'))

// db connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "engimanage",
});

db.connect((error) => {
  if (error) {
    console.error("Database connection failed:", error.stack);
    return;
  }

});

// default
app.get('/',(req,res)=>{
  res.render('index')
})

app.get('/tables',(req,res)=>{
  res.render('tables')
})

app.get('/projects',(req,res)=>{
  res.render('projects')
})

// get all users
app.post('/get_all_users', (req,res)=>{
  try{
    const query = 'SELECT * FROM users  ';

    db.query(query,(err,result)=>{
      if(err){
        return res.status(500).send(err);
      }
      res.json(result);
    })

  }catch (error){
    console.error(error);
  }
})

//update user
app.post('/updateUser', (req,res)=>{
  const {ID,fname,lname,email,pass,role} = req.body;

  try {
    const query = "UPDATE users SET fname = ?, lname = ?, email = ?, pass = ?, role = ? where ID = ?"
    db.query(query, [fname,lname,email,pass,role,ID],(err,result)=>{
      if(err){
        return res.status(500).send(err);
      }

      res.json({message:"updated successfully", result});
    })
  } catch (error) {
    console.error(error);
  }
})

//delete user
app.post('/deleteUser',(req,res)=>{
  const { ID } = req.body;

  try {
    const query = "DELETE FROM `users` WHERE ID = ?";
    db.query(query,[ID],(err, result)=>{
      if(err){
        return res.status(500).send(err);
      }
      res.json({message:"Deleted Successfuly",result})
    })
  } catch (error) {
    console.error(error);
  }
})

//get projects

app.post('/getprojects',(req,res)=>{

  try {
    const query = "SELECT * FROM projectstbl";
    db.query(query,(err,result)=>{
      if(err){
        return res.status(500).send(err);
      }
      res.json(result);
    })
  } catch (error) {
    
  }

})


// update project

app.post('/updateProject',(req,res)=>{
  const { projectID, projectName, projectDesc,pin } = req.body;

  try {
    const query = "UPDATE `projectstbl` SET `projectName` = ?, `desc` = ?, `pin` = ? WHERE `ID` = ?"

    db.query(query, [projectName,projectDesc,pin,projectID], (err,result)=>{
      if(err){
        return res.status(500).send(err);
      }
      res.json(result);
    })
    
  } catch (error) {
    console.error();
  }

})

// delete project

app.post('/deleteProject',(req,res)=>{
  const { ID } = req.body;

  try {
    const query = "DELETE FROM projectstbl WHERE ID = ?";
    db.query(query,[ID],(err,result)=>{
      if(err){
        return res.status(500).send(err);
      }
      res.json({message:"Deleted successfully!",result});
    })
  } catch (error) {
    console.error(error);
  }
})

// get all PM
app.post('/getallPM',(req,res)=>{
  const { projectID } = req.body;
  
  if(!projectID){
    return res.status(500).json({message:"no recieved data"})
  }

  try {
    
    const query = `
      SELECT 'pm' AS category, u.*
      FROM users u
      JOIN projectstbl p ON u.id = p.PM_ID
      WHERE u.role = 'project_manager'
        AND p.ID = ?

      UNION ALL

      SELECT 'others' AS category, u.*
      FROM users u
      WHERE u.role = 'project_manager'
        AND u.id NOT IN (
            SELECT PM_ID FROM projectstbl WHERE ID = ?
        );

    `;

    db.query(query,[projectID,projectID],(err,result)=>{
      if(err){
        return res.status(500).json({message:"error while fetching data"})
      }

      res.json({ok:true,message:"Success!",result})
    })

  } catch (error) {
    console.error(error);    
  }
})

// updatePM
app.post('/updatePM',(req,res)=>{
  const { pmID,proID } = req.body;
  try {

    const query = `
      UPDATE
          projectstbl
      SET
          projectManager = (SELECT fname FROM users WHERE ID = ?),
          PM_ID = ?
      WHERE
        ID = ?
    `;

    db.query(query,[pmID,pmID,proID],(err,result)=>{
      if(err){
        return res.status(500).json({message:"error updating data", ok:false})
      }

      res.status(200).json({ok:true,message:"Update successful", result})
    })

  } catch (error) {
    console.error(error);
    
  }
})


// Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});