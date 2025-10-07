const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'))
app.use("/profile", express.static("public/profile"));
app.use('/products', express.static("public/products"));

const productsDir = path.join(__dirname, 'public', 'products');
const temp_upload = multer({ dest: "uploads/" });

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

// for image save ----------------------------------------------->
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/profile");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
const uploadfiles = multer({ dest: path.join(__dirname, 'projectFiles') });

// Root directory for file storage
const rootDir = path.join(process.cwd(), 'public/projectfiles');

// Helper to map file system items
function getItems(dirPath) {
  return fs.readdirSync(dirPath, { withFileTypes: true }).map((dirent) => {
    const fullPath = path.join(dirPath, dirent.name);
    const relativePath = path.relative(rootDir, fullPath);
    return {
      name: dirent.name,
      type: dirent.isDirectory() ? 'folder' : 'file',
      path: relativePath.replace(/\\/g, '/'), // normalize for Windows
      url: !dirent.isDirectory() ? `/${relativePath.replace(/\\/g, '/')}` : null
    };
  });
}

// List files/folders
app.get('/api/files', (req, res) => {
  const reqPath = req.query.path || '';
  const dirPath = path.join(rootDir, reqPath);

  if (!fs.existsSync(dirPath)) {
    return res.status(400).json({ error: 'Directory does not exist' });
  }

  try {
    const items = getItems(dirPath);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Cannot read directory' });
  }
});

// Create new folder
app.post('/api/create-folder', (req, res) => {
  const { path: folderPath, name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  const newFolderPath = path.join(rootDir, folderPath || '', name);

  if (fs.existsSync(newFolderPath)) {
    return res.status(400).json({ error: 'Folder already exists' });
  }

  try {
    fs.mkdirSync(newFolderPath);
    res.json({ message: 'Folder created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error creating folder' });
  }
});

app.post('/api/uploadfiles', uploadfiles.array('files'), (req, res) => {
  console.log(req.files);
  res.json({ message: 'Files uploaded successfully' });
});

app.post("/api/uploadProfileImg", upload.single("file"), (req, res) => {
  const userID = req.body.userID;
  if (!req.file || !userID) {
    return res.status(400).json({ ok: false, error: "Missing file or userID" });
  }

  const imagePath = `/profile/${req.file.filename}`;
  const query = "UPDATE users SET profile_image = ? WHERE ID = ?";

  db.query(query, [imagePath, userID], (err, result) => {
    if (err) {
      console.log("DB update error", err);
      return res.status(500).json({ ok: false, error: "Database error" });
    }

    return res.json({ ok: true, path: imagePath });
  });
});

// supplier login ------------------------------------------------------------------------>
app.post("/api/supplier_login",(req,res)=>{
  const {email,password} = req.body;

  try {
    const query = "SELECT * FROM supplier WHERE email = ? and pass = ?";

    db.query(query,[email,password],(err,result)=>{
      if(err){
        return res.status(500).json({ok:false,message:err})
      }

      res.json({ok:true,message:"success"})

    })

    
  } catch (error) {
    return res.status(500).json({ok:false,message:"Error Login"})
  }

})

//login --------------------------------------------------------------------------------->
app.post("/api/login", (req, res) => {
  const { email, pass } = req.body;

  if (!email || !pass) {
    return res.status(400).send("Email and password are required");
  }

  const query = "SELECT * FROM users WHERE email = ? AND pass = ?";
  
  db.query(query, [email, pass], (err, response) => {
    if (err) {
      console.error("Server error", err);
      return res.status(500).send("Server error");
    }

    res.json(response);
  });
});

// supplier add products -------------------------------------------------------------------------------------------->
app.post("/api/add_product", upload.single("image"), (req, res) => {
  const { name, price } = req.body;
  const file = req.file;

  if (!name || !price || !file) {
    return res.status(400).json({ ok: false, message: "Missing required fields." });
  }

  try {
    const fileBuffer = fs.readFileSync(file.path);
    const base64 = fileBuffer.toString("base64");

    const query = "INSERT INTO products (name, price, base64) VALUES (?, ?, ?)";
    db.query(query, [name, price, base64], (err, result) => {
      fs.unlinkSync(file.path);

      if (err) {
        return res.status(500).json({ ok: false, message: err.message || err });
      }

      return res.json({ ok: true, message: "Product added successfully" });
    });
  } catch (error) {
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

// get products -------------------------------------------------------------------------------------------->

app.post('/api/fetch_product', async (req, res) => {
  try {
    const query = 'SELECT * FROM products';
    db.query(query, async (err, results) => {
      if (err) {
        return res.status(500).json({ ok: false, message: err });
      }

      for (let product of results) {
        if (product.base64) {
          try {
            let base64Data = product.base64;
            if (base64Data.startsWith('data:image')) {
              base64Data = base64Data.split(',')[1];
            }
            const filename = `${product.ID}${Date.now()}.jpg`;
            const filepath = path.join(productsDir, filename);

            fs.writeFileSync(filepath, base64Data, 'base64');

            product.image_url = `/products/${filename}`;

            delete product.base64;
          } catch (e) {
            console.error(`Failed to write image for product ID ${product.ID}`, e);
            product.image_url = null;
          }
        } else {
          product.image_url = null;
        }
      }

      return res.json({ ok: true, message: "Success", products: results });
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Error while fetching data" });
  }
});

// delete products ------------------------------------------------------------------------------------------>
app.post("/api/delete_product", (req, res) => {
  const { productID } = req.body;

  if (!productID) {
    return res.status(400).json({ ok: false, message: "Product ID is required" });
  }

  const query = "DELETE FROM products WHERE ID = ?";

  db.query(query, [productID], (err, result) => {
    if (err) {
      return res.status(500).json({ ok: false, message: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: "Product not found" });
    }

    res.json({ ok: true, message: "Product Deleted" });
  });
});


// update products ------------------------------------------------------------------------------------------>
app.post("/api/update_products", temp_upload.single("image"), (req, res) => {
  const { productID, name, price } = req.body;

  let imageBase64 = null;

  if (req.file) {
    const imgBuffer = fs.readFileSync(req.file.path);
    imageBase64 = imgBuffer.toString("base64");

    fs.unlinkSync(req.file.path);
  }

  let sql, params;

  if (imageBase64) {
    sql = `
      UPDATE products
      SET name = ?, price = ?, base64 = ?
      WHERE ID = ?
    `;
    params = [name, price, imageBase64, productID];
  } else {
    sql = `
      UPDATE products
      SET name = ?, price = ?
      WHERE productID = ?
    `;
    params = [name, price, productID];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error updating product:", err);
      return res.status(500).json({ message: "Database update failed" });
    }
    res.json({ message: "Product updated successfully", result });
  });
});


// get products ----------------------------------------------------------->

app.get("/api/get_products",(req,res)=>{
  const query = "SELECT * FROM products";

  db.query(query,(err,result)=>{
    if(err){
      console.log(err);
      return res
        .status(500)
        .json({message:"Server Error"})
    }
    
    res.status(201).json(result)

  })
})


//register -------------------------------------------------------------------------------------------------->

app.post("/api/register", (req, res) => {
  const { fname, lname, email, password, confirmPass } = req.body;

  if (
    fname === "" ||
    lname === "" ||
    email === "" ||
    password === "" ||
    confirmPass === ""
  ) {
    return res.status(400).json({ message: "Empty Fields" });
  }

  if (password !== confirmPass) {
    return res.status(400).json({ message: "Password does not match" });
  }

  // Check if email already exists
  const checkEmailSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkEmailSql, [email], (err, results) => {
    if (err) {
      console.error("Error checking email:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "Use another email address" });
    }

    const insertSql =
      "INSERT INTO users (fname, lname, email, pass, profile_image, current_projects, role) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(
      insertSql,
      [fname, lname, email, password, null, null, "staff"],
      (err, result) => {
        if (err) {
          console.error("Error inserting user:", err);
          return res
            .status(500)
            .json({ message: "Server error during registration" });
        }

        res.status(201).json({ message: "User registered successfully" });
      }
    );
  });
});


// get all projects -------------------------------------------------->
app.get("/api/getprojects", (req, res) => {
  const sql = "SELECT * FROM projectstbl ORDER BY ID desc";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching projects: ", err);
      return res
        .status(500)
        .json({ message: "Server error fetching projects" });
    }
    
    res.json({
      ok: true,
      projects: results
    });

  });
});

//check user membership -------------------------------------------------->
app.post('/api/checkmembership', (req, res) => {
  const { userID, projectID } = req.body;
  try {
    const [result] = db.query(
      'SELECT * FROM project_members WHERE user_id = ? AND project_id = ?',
      [userID, projectID]
    );
    if (result.length > 0) {
      res.json({ ok: true });
    } else {
      res.json({ ok: false });
    }
  } catch (error) {
    console.error('Error checking membership:', error);
    res.status(500).json({ ok: false, message: 'Server error.' });
  }
});

//create project ---------------------------------------------->
const PIN = require("../app/globals/randomPin");

app.post("/api/createproject", (req, res) => {
  const { projectName, desc, projectManager, userID } = req.body;

  if (!projectName || !desc || !projectManager || !userID) {
    return res.status(400).json({ message: "Missing Data" });
  }

  let randomPin = PIN.Pin_generator();

  const insertProjectSql = `
    INSERT INTO projectstbl (projectName, \`desc\`, projectManager, PM_ID, members, budget, status, pin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    insertProjectSql,
    [projectName, desc, projectManager, userID, null, 0, "pending", randomPin],
    (err, insertResult) => {
      if (err) {
        console.error("Error inserting project:", err);
        return res.status(500).json({ message: "Server error during inserting project" });
      }

      const newProjectId = insertResult.insertId;

      // Insert into statistics
      insertData(newProjectId, (insertErr) => {
        if (insertErr) {
          console.error("Error inserting into statistics:", insertErr);
          return res.status(500).json({ message: "Server error inserting into statistics" });
        }
        
        res.status(201).json({
          ok: true,
          message: "Project created and statistics initialized",
          projectID: newProjectId,
          randomPin: randomPin
        });
      });
    }
  );
});


// automatically ma insert sang data sa statistics para ma ready ang table

const insertData = (projectID, callback) => {
  const query = `
    INSERT INTO statistics (projectID, month, percentage)
    VALUES 
      (${projectID}, 'Jan', 0),
      (${projectID}, 'Feb', 0),
      (${projectID}, 'Mar', 0),
      (${projectID}, 'Apr', 0),
      (${projectID}, 'May', 0),
      (${projectID}, 'Jun', 0),
      (${projectID}, 'Jul', 0),
      (${projectID}, 'Aug', 0),
      (${projectID}, 'Sep', 0),
      (${projectID}, 'Oct', 0),
      (${projectID}, 'Nov', 0),
      (${projectID}, 'Dec', 0);
  `;

  db.query(query, (err, result) => {
    callback(err);
  });
};


// join project --------------------------------------------->
app.post("/api/joinproject", (req, res) => {
  const { pin, employeeID } = req.body;

  if (!pin || !employeeID) {
    return res.status(400).json({ message: "Missing pin or employeeID" });
  }

  const findProjectSql = "SELECT * FROM projectstbl WHERE pin = ?";
  db.query(findProjectSql, [pin], (err, projectResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error fetching projects" });
    }

    if (projectResults.length === 0) {
      return res.json({ ok: false, message: "Invalid PIN" });
    }

    const projectID = projectResults[0].ID;
    let members = projectResults[0].members;
    let membersArray = [];

    if (members) {
      try {
        membersArray = JSON.parse(members);
      } catch (e) {
        console.error("Error parsing members:", e);
        membersArray = [];
      }
    }

    if (!membersArray.includes(employeeID)) {
      membersArray.push(employeeID);
    } else {
      // User already a member, no need to continue
      return res.json({ ok: false, message: "Already a project member" });
    }

    const updateMembersSql = "UPDATE projectstbl SET members = ? WHERE ID = ?";
    db.query(updateMembersSql, [JSON.stringify(membersArray), projectID], (err, updateMembersResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error updating members" });
      }

      // update the user's current_projects (wala na ni 4/28/2025 )
      const getUserSql = "SELECT current_projects FROM users WHERE ID = ?";
      db.query(getUserSql, [employeeID], (err, userResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Server error fetching user" });
        }

        if (userResults.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        let currentProjects = userResults[0].current_projects;
        let projectsArray = [];

        if (currentProjects) {
          try {
            projectsArray = JSON.parse(currentProjects);
          } catch (e) {
            console.error("Error parsing current_projects:", e);
            projectsArray = [];
          }
        }

        if (!projectsArray.includes(projectID)) {
          projectsArray.push(projectID);
        }

        const updateProjectsSql = "UPDATE users SET current_projects = ? WHERE ID = ?";
        db.query(updateProjectsSql, [JSON.stringify(projectsArray), employeeID], (err, updateResult) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error updating user's projects" });
          }

          res.json({ ok: true, message: "Joined project successfully", projectID });
        });
      });
    });
  });
});

// get team leader
app.post('/api/teamleader',(req,res)=>{
  const {projectID} = req.body

  try {
    const query = `SELECT * FROM users WHERE ID = (SELECT PM_ID from projectstbl WHERE ID = ?)`

    db.query(query,[projectID],(err,result)=>{
      if (err){
        return res.status(500).json({message:"Error fetching data",ok:false})
      }

      res.json({message:"Success",ok:true,result})

    })
  } catch (error) {
    console.error(error);
  }
})

// check project members
app.post('/api/checkProjectMembers',(req,res)=>{
  
  const { userID, projectID } = req.body;

  try {

    const query = `
        SELECT
          projectstbl.*,
          users.fname
        FROM
            projectstbl
        JOIN
          users
        ON (
          projectstbl.PM_ID = users.ID
          OR projectstbl.members LIKE CONCAT('%[',users.ID,',%')
          OR projectstbl.members LIKE CONCAT('%,',users.ID,']%')
          OR projectstbl.members LIKE CONCAT('%,',users.ID,',%')
          OR projectstbl.members LIKE CONCAT('%[',users.ID,']%')
        )
        WHERE projectstbl.ID = ? AND (users.ID = ? OR projectstbl.PM_ID = ?)
    `;

    db.query(query,[projectID,userID,userID], (err,result)=>{
      if(err){
        return res.status(500).json({ok:false,message:"Error retrieving data"})
      }
      res.json(result);
      
    })
    
  } catch (error) {
    console.error(error);
  }
})

// users current project
app.post('/api/userCurrentProject',(req,res)=>{
  const { ID } = req.body;
  try {
    const query = `
      SELECT *
      FROM projectstbl
      WHERE 
        PM_ID = ?
        OR members LIKE CONCAT('%,', ?, ',%')
        OR members LIKE CONCAT('[', ?, ',%')
        OR members LIKE CONCAT('%,', ?, ']')
        OR members = CONCAT('[', ?, ']')

    `;

    db.query(query,[ID,ID,ID,ID,ID], (err,result)=>{
      if(err){
        return res.status(500).json({message:`Error fetching data: ${err}`})
      }
      res.json(result)
    })


  } catch (error) {
    
  }
})

// other projects ---------------------------------------------->
app.post('/api/otherprojects',(req,res)=>{
  const { ID } = req.body;
  try {
    const query = `
      SELECT *
      FROM projectstbl
      WHERE 
          PM_ID != ?
          AND (members IS NULL 
              OR (
                members NOT LIKE CONCAT('%,', ?, ',%')
                AND members NOT LIKE CONCAT('[', ?, ',%')
                AND members NOT LIKE CONCAT('%,', ?, ']')
                AND members != CONCAT('[', ?, ']')
              )
      )
    `;

    db.query(query,[ID,ID,ID,ID,ID], (err,result)=>{
      if(err){
        return res.status(500).json({message:`Error fetching data: ${err}`})
      }
      res.json(result)
    })


  } catch (error) {
    
  }
})

// Add item to cart ------------------------------------------------------------------------------->
app.post('/api/addToCart', (req, res) => {
  const { employeeID, itemName, itemPrice, quantity, imgPath } = req.body;

  if (!employeeID || !itemName || !itemPrice || !quantity || !imgPath) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const totalPrice = itemPrice * quantity;

  const checkSql = 'SELECT * FROM cart WHERE itemName = ? AND employeeID = ?';

  db.query(checkSql, [itemName, employeeID], (err, results) => {
    console.log(results);
    

    if (err) {
      console.error('Error checking item in cart:', err);
      return res.status(500).json({ message: 'Server error checking cart' });
    }

    if (results.length > 0) {
      const updatedQuantity = results[0].quantity + quantity;
      const updatedTotalPrice = results[0].itemPrice + totalPrice;

      const updateSql = 'UPDATE cart SET quantity = ?, itemPrice = ? WHERE itemName = ? AND employeeID = ?';

      db.query(updateSql, [updatedQuantity, updatedTotalPrice, itemName, employeeID], (err, updateResult) => {
        if (err) {
          console.error('Error updating cart:', err);
          return res.status(500).json({ message: 'Server error updating cart' });
        }

        res.json({ ok: true, message: 'Item updated in cart' });
      });
    } else {

      const insertSql = 'INSERT INTO cart (employeeID, itemName, itemPrice, quantity, imgPath) VALUES (?, ?, ?, ?, ?)';

      db.query(insertSql, [employeeID, itemName, totalPrice, quantity, imgPath], (err, insertResult) => {
        if (err) {
          console.error('Error adding to cart:', err);
          return res.status(500).json({ message: 'Server error adding item to cart' });
        }

        res.status(201).json({ ok: true, message: 'Item added to cart' });
      });
    }
  });
});


//update cart ------------------------------------------------------------------------------->
const sql = `
  UPDATE cart 
  SET quantity = ?, 
      employeeID = ?,
      itemPrice = (itemPrice / (SELECT q FROM (SELECT quantity AS q FROM cart WHERE id = ?) AS sub)) * ?
  WHERE id = ?`;

app.post('/api/updateQuantity', (req, res) => {
  const { id, quantity, employeeID } = req.body;

  if (!id || quantity < 1) {
    return res.status(400).json({ message: 'Invalid quantity update request' });
  }

  db.query(sql, [quantity, employeeID, id, quantity, id], (err, result) => {
    if (err) {
      console.error('Error updating quantity:', err);
      return res.status(500).json({ message: 'Server error updating quantity' });
    }

    res.json({ ok: true, message: 'Quantity updated successfully' });
  });
});


//delete item ------------------------------------------------------------------------------->
app.delete('/api/deleteItem', (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Invalid delete request' });
  }

  const sql = 'DELETE FROM cart WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting item:', err);
      return res.status(500).json({ message: 'Server error deleting item' });
    }

    res.json({ ok: true, message: 'Item deleted successfully' });
  });
});


// Get all cart items ------------------------------------------------------------------------------->
app.get('/api/cart', (req, res) => {
  const sql = 'SELECT * FROM cart';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching cart:', err);
      return res.status(500).json({ message: 'Server error fetching cart' });
    }

    res.json({ ok: true, cart: results });
  });
});

// Get all expense claims ------------------------------------------------------------------------------->
app.get('/api/getExpenses', (req, res) => {
  const sql = 'SELECT id, itemName, itemPrice, quantity, imgPath FROM cart';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching expense claims:', err);
      return res.status(500).json({ message: 'Server error fetching expense claims' });
    }
    const expenses = results.map(expense => ({
      id: expense.id,
      name: expense.itemName,
      price: expense.itemPrice,
      pcs: expense.quantity,
      icon: expense.imgPath
    }));
    res.json(expenses);
  });
});

// Record Duty Hours -------------------------------------------------------------->
app.post("/api/recordDuty", (req, res) => {
  const { employeeID, timein, timeout, dutyHours, currentDate } = req.body;
  console.log(timein);
  

  if (!employeeID || !timein || !timeout || !dutyHours || !currentDate) {
      return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = "INSERT INTO duty_logs (employeeID, time_in, time_out, duty_hours, log_date) VALUES (?, ?, ?, ?, ?)";
  
  db.query(sql, [employeeID, timein, timeout, dutyHours, currentDate], (err, result) => {
      if (err) {
          console.error("Error recording duty hours:", err);
          return res.status(500).json({ message: "Server error while recording duty hours" });
      }

      res.status(201).json({ ok: true, message: "Duty hours recorded successfully" });
  });
});

//get duty logs -------------------------------------------------------------------------->
app.post("/api/dutylogs",(req,res)=>{
  const {employeeID} = req.body;

  if(!employeeID){
    return res.status(400).json({message : "Missing ID"})
  }

  const query = "SELECT * FROM duty_logs WHERE employeeID = ?"

  db.query(query,[employeeID],(err,result)=>{
    if(err){
      console.error(err);
      return res.status(500).json({message : "Error retrieving data"})
    }

    res.status(201).json(result)
  })
})

// update profile img
app.post('/api/updateProfileImg',(req,res)=>{
  const { profileImg, userID } = req.body;

  try {
    const query = `
      UPDATE
          users
      SET
          profile_image = ?
      WHERE
          ID = ?
    `;

    db.query(query,[profileImg,userID],(err,result)=>{
      if(err){
        return res.status(500).json({message:"error inserting image"})
      }
      res.json({ok:true,result})
    })


  } catch (error) {
    console.error(error);
    
  }

})

// get profile image ------------------------------------------------->
app.post('/api/getProfileImg',(req,res)=>{
  const { userID } = req.body;

  try {
    const query = "SELECT profile_image FROM users WHERE ID = ?";

    db.query(query,[userID],(err,result)=>{
      if(err){
        return res.status(500).json({message:"Error retrieving data"})
      }

      res.json(result);
    })


  } catch (error) {
    console.error(error);
  }

})

// get tasks ------------------------------------------------------------------>

app.post('/api/getTasks',(req, res)=>{
  const { projectID } = req.body;

  if(!projectID){
    return res.status(500).json({ok:false,message:"Missing data"});
  }
  try {
    const query = `
        SELECT
            *
        FROM
            tasks
        WHERE
            projectID = ?
        ORDER BY
            progress ASC
    
    `;

    db.query(query,[projectID],(err, result)=>{
      if(err){
        return res.status(500).json({message:"Error fetching data", ok:false});
      }

      res.json({ok:true, message:"Retriving data successfully!", result})
    })


  } catch (error) {
    console.log(error);
    
  }
})

//  update task ----------------------------------------------------------->
app.post('/api/updateTask', (req,res)=>{
  const {id, progress} = req.body;

  try {
    const query = `
          UPDATE
              tasks
          SET
              progress = ?
          WHERE ID = ?
    `;

    db.query(query,[progress,id],(err,result)=>{
      if(err){
        return res.status(500).json({ok:false,message:"Error updating data"})
      }

      res.json({ok:true, message:"Update successfully!", result})
    })


  } catch (error) {
    console.error(error);
    
  }

})

// create task -------------------------------------------------------------------------->
app.post('/api/createTask',(req,res)=>{
  const { projectID , label } = req.body;

  try {
    const query = "INSERT INTO tasks(projectID, label, progress) VALUES (?,?,?)"

    db.query(query,[projectID,label,0],(err,result)=>{
      if(err){
        return res.status(500).json({ok:false, message:"Error inserting data"});
      }
      
      res.json({ok:true,message:"Task created successfully!", result})
    })


  } catch (error) {
    console.error(error);
    
  }

})

// delete task ---------------------------------------------------------------->
app.post('/api/deleteTask',(req,res)=>{
  const { ID } = req.body;
  try {
    const query = "DELETE FROM `tasks` WHERE ID = ?";

    db.query(query,[ID], (err,result)=>{
      if(err){
        return res.status(500).json({ok:false,message:"error deleting data"})
      }

      res.json({ok:true,message:"Deleted successfully!",result})
    })
  } catch (error) {
    console.error(error);
    
  }
})

// update user status ------------------------------------------------------------>
app.post('/api/updateUserStatus',(req,res)=>{
  const {userID, status} = req.body;

  console.log(`Data: ${userID}, ${status}`);
  

  try {
    const query = 'UPDATE users SET status = ? WHERE ID = ?';

    db.query(query,[status,userID],(err,result)=>{
      if(err){
        return res.status(500).json({ok:false,message:"Error updating data"})
      }
      res.json({ok:true,message:"Success!",result})
    })


  } catch (error) {
    console.error(error);
    
  }
})

// get project para sa task manager -------------------------------------------->
app.post('/api/getTaskManager',(req,res)=>{
  const { userID } = req.body;

  try {
    const query = `
        SELECT
            projectstbl.*,
            JSON_LENGTH(projectstbl.members) AS members_count
        FROM
            projectstbl
        WHERE 
          projectstbl.PM_ID = ?
          OR projectstbl.members LIKE CONCAT('%[',?,']%')
          OR projectstbl.members LIKE CONCAT('%[',?,',%')
          OR projectstbl.members LIKE CONCAT('%,',?,',%')
          OR projectstbl.members LIKE CONCAT('%,',?,']%')
    `;

    db.query(query,[userID,userID,userID,userID,userID],(err,result)=>{
      if(err){
        return res.status(500).json({ok:false,message:`Error while fetching data: ${err}`})
      }

      res.json({ok:true,message:"Success!",result})
    })

  } catch (error) {
    console.error(error);
    
  }

})

// get users nga wala na belong sa muni nga group ------------------------------------------>
app.post('/api/getavailablemembers',(req,res)=>{
  const { projectID } = req.body;
  try {
  const query = `
    SELECT *
    FROM users
    WHERE users.ID NOT IN (
        SELECT PM_ID
        FROM projectstbl
        WHERE ID = ? AND PM_ID IS NOT NULL
    )
    AND users.ID NOT IN (
        SELECT users.ID
        FROM users
        WHERE 
            (
                (SELECT members FROM projectstbl WHERE ID = ?) LIKE CONCAT('%[', users.ID, ',%')
                OR (SELECT members FROM projectstbl WHERE ID = ?) LIKE CONCAT('%,', users.ID, ']%')
                OR (SELECT members FROM projectstbl WHERE ID = ?) LIKE CONCAT('%,', users.ID, ',%')
                OR (SELECT members FROM projectstbl WHERE ID = ?) LIKE CONCAT('%[', users.ID, ']%')
            )
    )`;

    db.query(query,[projectID,projectID,projectID,projectID,projectID],(err,result)=>{
      if(err){
        return res.status(500).json({ok:false,message:"error fetching data"})
      }

      res.json({ok:true,message:"success",result})
    })
  } catch (error) {
    console.error(error);
    
  }
})

// get current members except sa project manager ----------------------------------->
app.post('/api/getprojectmembers',(req,res)=>{
  const { projectID } = req.body;

  try {
    const query = `
        SELECT u.*,er.role AS projectRole
        FROM users u
        JOIN employeeroles er 
            ON u.ID = er.employeeID 
           AND er.projectID = ? 
        WHERE u.ID IN (
            SELECT users.ID
            FROM users
            WHERE 
                (
                    (SELECT members FROM projectstbl WHERE ID = ?) LIKE CONCAT('%[', users.ID, ',%')
                    OR (SELECT members FROM projectstbl WHERE ID = ?) LIKE CONCAT('%,', users.ID, ']%')
                    OR (SELECT members FROM projectstbl WHERE ID = ?) LIKE CONCAT('%,', users.ID, ',%')
                    OR (SELECT members FROM projectstbl WHERE ID = ?) LIKE CONCAT('%[', users.ID, ']%')
                )
        )
        AND (SELECT PM_ID FROM projectstbl WHERE ID = ?) != u.ID
        ORDER BY u.role;

    `;

    db.query(query,[projectID,projectID,projectID,projectID,projectID,projectID],(err,result)=>{
      if(err){
        return res.status(500).json({ok:false,message:err.sqlMessage})
      }

      res.json({ok:true, message:"Success", result})
    })
    
  } catch (error) {
    console.error(error);
  }
})

// update budget ------------------------------------------------>
app.post('/api/updatebudget',(req,res)=>{
  const { value,projectID } = req.body;
  try {
    const query = "UPDATE projectstbl SET budget = ? WHERE ID = ?"
    db.query(query,[value,projectID],(err,result)=>{
      if(err){
        return res.status(500).json({ok:false,message:"error updating data"})
      }
      res.json({ok:true,message:"success",result})
    })
  } catch (error) {
    console.error(error);
  }
})

// update deadline ------------------------------------------------------------------>
app.post('/api/setdeadline',(req,res)=>{
  const {projectID,newDeadline} = req.body;

  try {

    const query = "UPDATE projectstbl SET deadline = ? WHERE ID = ?";

    db.query(query,[newDeadline,projectID],(err,result)=>{
      if(err){
        return res.status(500).json({ok:false,message:"error updating data"})
      }
      res.json({ok:true,message:"success",result})
    })
  } catch (error) {
    console.error(error);
    
  }
})

// get project data -------------------------------------------------------->
app.post('/api/getprojectinfo', (req,res)=>{
  const { projectID } = req.body;

  try {
    const query = "SELECT * FROM projectstbl WHERE ID = ?"
    db.query(query,[projectID],(err,result)=>{
      if(err){
        return res.status(500).json({ok:false,message:"error fetching data"})
      }
      res.json({ok:true,message:"success fetching data",result})
    })
  } catch (error) {
    console.error(error);
  }
})


// DELETE members -------------------------------------------------------------------------------------->
app.post('/api/deletemember', (req, res) => {
  const { memberID, projectID } = req.body;

  if (!memberID || !projectID) {
    return res.status(400).json({ ok: false, message: "memberID and projectID are required" });
  }

  const selectQuery = "SELECT members FROM projectstbl WHERE ID = ?";
  db.query(selectQuery, [projectID], (err, result) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ ok: false, message: "Project not found" });
    }

    let membersArr = [];
    try {
      membersArr = JSON.parse(result[0].members) || [];
    } catch (e) {
      membersArr = [];
    }

    membersArr = membersArr.filter(id => id != memberID);

    const updateQuery = "UPDATE projectstbl SET members = ? WHERE ID = ?";
    db.query(updateQuery, [JSON.stringify(membersArr), projectID], (err) => {
      if (err) {
        return res.status(500).json({ ok: false, message: err });
      }

      const deleteQuery = "DELETE FROM employeeroles WHERE projectID = ? AND employeeID = ?";
      db.query(deleteQuery, [projectID, memberID], (err) => {
        if (err) {
          return res.status(500).json({ ok: false, message: err });
        }
        return res.json({ ok: true, message: "Member deleted successfully" });
      });
    });
  });
});


// insert new members on project---------------------------------------------------------->
app.post('/api/addmember', (req, res) => {
  const { members, projectID } = req.body;

  const currentMembersQuery = "SELECT members FROM projectstbl WHERE ID = ?";

  db.query(currentMembersQuery, [projectID], (err, result) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Database error", error: err });
    }

    let existingMembers = [];
    try {
      existingMembers = result[0]?.members ? JSON.parse(result[0].members) : [];
    } catch (e) {
      existingMembers = [];
    }

    const newMembers = typeof members === 'string' ? JSON.parse(members) : members;
    const finalArr = existingMembers.concat(newMembers);

    const updateQuery = "UPDATE projectstbl SET members = ? WHERE ID = ?";

    db.query(updateQuery, [JSON.stringify(finalArr), projectID], (err, updateResult) => {
      if (err) {
        return res.status(500).json({ ok: false, message: err });
      }

      if (newMembers.length > 0) {
        const insertValues = newMembers.map(memberID => [projectID, memberID, 'staff']);
        const insertQuery = `
          INSERT INTO employeeroles (projectID, employeeID, role)
          VALUES ?
        `;

        db.query(insertQuery, [insertValues], (err, insertResult) => {
          if (err) {
            return res.status(500).json({ ok: false, message: "Error inserting into project_roles", error: err });
          }

          return res.json({
            ok: true,
            message: "Members updated and roles assigned",
            updatedMembers: updateResult,
            insertedRoles: insertResult
          });
        });
      } else {
        return res.json({ ok: true, message: "Members updated (no new members to assign roles)" });
      }
    });
  });
});

// app.post('/api/addmember', (req, res) => {
//   const { members, projectID } = req.body;

//   const currentMembersQuery = "SELECT members FROM projectstbl WHERE ID = ?";

//   db.query(currentMembersQuery, [projectID], (err, result) => {
//     if (err) {
//       return res.status(500).json({ ok: false, message: "Database error", error: err });
//     }

//     let existingMembers = [];
//     try {
//       existingMembers = result[0]?.members ? JSON.parse(result[0].members) : [];
//     } catch (e) {
//       existingMembers = [];
//     }

//     const newMembers = typeof members === 'string' ? JSON.parse(members) : members;
//     const finalArr = existingMembers.concat(newMembers);

//     const updateQuery = "UPDATE projectstbl SET members = ? WHERE ID = ?";

//     db.query(updateQuery, [JSON.stringify(finalArr), projectID], (err, result) => {
//       if (err) {
//         return res.status(500).json({ ok: false, message: err });
//       }
//       return res.json({ ok: true, message: "Members updated", result });
//     });
//   });
// });

// get percentage sang yearly activities

app.post('/api/getYearlyActivities',(req,res)=>{
  try {
    const query = "SELECT * FROM statistics ORDER BY ID";

    db.query(query,(err,result)=>{
      if(err){
        return res.status(500).json({ok:false,message:`Error: ${err}`})
      }
      res.json({
        ok:true,
        message:"Success",
        result : {
          label:result.map((r)=>r.month),
          dataset:[{data:result.map((r)=>r.percentage)}]
        }
      })
    })


  } catch (error) {
    console.error(error);
  }
})

// get requests ----------------------------------------------------------------->
app.post('/api/get_notif', (req, res) => {
  const { employee_ID } = req.body;

  if (!employee_ID) {
    return res.status(400).json({ ok: false, message: "Missing employee_ID" });
  }

  const query = 'SELECT * FROM notif WHERE sender_id = ? OR receiver_id = ?';

  db.query(query, [employee_ID, employee_ID], (err, results) => {
    if (err) {
      return res.status(500).json({ ok: false, message: `${err}` });
    }

    const notifWithFlag = results.map(notif => ({
      ...notif,
      isSender: notif.sender_id === employee_ID
    }));

    res.json({
      ok: true,
      message: "Success",
      result: notifWithFlag
    });
  });
});

// insert request ---------------------------------------------------------------->
app.post('/api/send_request', (req, res) => {
  const { projectID, employeeID } = req.body;

  if (!projectID || !employeeID) {
    return res.status(400).json({ ok: false, message: "Missing projectID or employeeID" });
  }

  try {
    // Get project details
    const getProjectQuery = 'SELECT projectName, PM_ID FROM projectstbl WHERE ID = ?';

    db.query(getProjectQuery, [projectID], (err, projectResults) => {
      if (err) {
        return res.status(500).json({ ok: false, message: `Error fetching project: ${err}` });
      }

      if (projectResults.length === 0) {
        return res.status(404).json({ ok: false, message: "Project not found" });
      }

      const { projectName, PM_ID } = projectResults[0];

      // Get user's name
      const getUserQuery = 'SELECT fname, lname FROM users WHERE ID = ?';

      db.query(getUserQuery, [employeeID], (err, userResults) => {
        if (err) {
          return res.status(500).json({ ok: false, message: `Error fetching user: ${err}` });
        }

        if (userResults.length === 0) {
          return res.status(404).json({ ok: false, message: "User not found" });
        }

        const { fname, lname } = userResults[0];
        const fullName = `${fname} ${lname}`;
        const context = `Request from ${fullName} to join on ${projectName}`;

        // Check if request already exists
        const checkRequestQuery = `
          SELECT * FROM notif
          WHERE project_id = ? AND sender_id = ?
        `;

        db.query(checkRequestQuery, [projectID, employeeID], (err, existingResults) => {
          if (err) {
            return res.status(500).json({ ok: false, message: `Error checking existing request: ${err}` });
          }

          if (existingResults.length > 0) {
            return res.json({ ok: false, message: "You already sent a request to this project" });
          }

          // Insert new notification
          const insertNotifQuery = `
            INSERT INTO notif (project_id, sender_id, receiver_id, req_status, context)
            VALUES (?, ?, ?, 'pending', ?)
          `;

          db.query(insertNotifQuery, [projectID, employeeID, PM_ID, context], (err, result) => {
            if (err) {
              return res.status(500).json({ ok: false, message: `Error inserting notification: ${err}` });
            }

            return res.json({ ok: true, message: "Join request sent successfully" });
          });
        });
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});




// update request ---------------------------------------------------------------->
app.post('/api/update_req', (req, res) => {
  const { notif_id, req_status } = req.body;

  if (!notif_id || !req_status) {
    return res.status(400).json({ ok: false, message: "Missing notif_id or req_status" });
  }

  if (!['accepted', 'rejected'].includes(req_status)) {
    return res.status(400).json({ ok: false, message: "Invalid req_status value" });
  }

  const query = 'UPDATE notif SET req_status = ? WHERE notif_id = ?';

  db.query(query, [req_status, notif_id], (err, result) => {
    if (err) {
      return res.status(500).json({ ok: false, message: `Database error: ${err}` });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: "Notification not found" });
    }

    res.json({ ok: true, message: `Request ${req_status}` });
  });
});

//add sa group ang mga na accept na ang request -------------------------------------------------------------->
const processAcceptedRequests = () => {
  const getAcceptedNotifQuery = `
    SELECT notif_id, project_id, sender_id
    FROM notif
    WHERE req_status = 'accepted'
  `;

  db.query(getAcceptedNotifQuery, async (err, results) => {
    if (err) {
      console.error("Error fetching accepted requests:", err);
      return;
    }

    if (!results.length) return;

    for (const notif of results) {
      const { project_id, sender_id, notif_id } = notif;

      const getProjectQuery = 'SELECT members FROM projectstbl WHERE ID = ?';
      db.query(getProjectQuery, [project_id], (err, projectResults) => {
        if (err || !projectResults.length) {
          console.error(`Error fetching project ${project_id}:`, err);
          return;
        }

        let membersStr = projectResults[0].members || '[]';

        let membersArr;
        try {
          membersArr = JSON.parse(membersStr);
          if (!Array.isArray(membersArr)) membersArr = [];
        } catch {
          membersArr = [];
        }

        if (!membersArr.includes(sender_id)) {
          membersArr.push(sender_id);

          const updatedMembers = JSON.stringify(membersArr);

          const updateProjectQuery = 'UPDATE projectstbl SET members = ? WHERE ID = ?';
          db.query(updateProjectQuery, [updatedMembers, project_id], (err) => {
            if (err) {
              console.error(`Failed to update project ${project_id}:`, err);
            } else {
              console.log(`Added employee ${sender_id} to project ${project_id}`);
            }
          });
        }
      });
    }
  });
};
setInterval(processAcceptedRequests, 1000);

// assign roles to project members ---------------------------------------------------->
app.post('/api/project_assign_role',(req,res)=>{
  const {employeeID, role, projectID} = req.body;

  try {
    const query = "UPDATE employeeroles SET role = ? WHERE projectID = ? and employeeID = ? ";

    db.query(query,[role,projectID,employeeID],(err,result)=>{
      if(err){
        res.status(500).json({ok:false,message:err});
      }
      res.json({ok:true,message:"Success"});
    })

  } catch (error) {
    return res.status(500).json({ok:false,message:error});
  }
})

// para sa port connection--------------------------------------------->

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

//------------------------------------------------------------------------------->
app.use('/',(req, res) => {
  res.status(404).send("404 - Page Not Found");
});
