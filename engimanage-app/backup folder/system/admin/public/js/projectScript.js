import adminapi from "./adminglobal.js";  
const imgAPI = 'http://localhost:3000'

window.onload = function () {
  getAllProjects();
  console.log(`${adminapi}/getprojects`);
  
};

const getAllProjects = async () => {
  try {
    const response = await fetch(`${adminapi}/getprojects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "",
    });

    const data = await response.json();
    

    const tbody = document.getElementById("projectTableBody");
    tbody.innerHTML = "";

    data.forEach((project) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
                <td>${project.ID}</td>
                <td><input style="border: none; color:grey" type="text" value="${project.projectName}" id="projectName-${project.ID}"></td>
                <td>
                    <Button title="replace" data-toggle="modal" data-target="#changePM" style="border:none; color:grey; outline:none; background-color:transparent;">
                    <image style="width:30px; height:20px; object-fit:contain;" src="img/alter.png"></image></Button> ${project.projectManager.replace(/_/g,' ')}
                </td>
                <td><input style="border: none; color:grey" type="text" value="${project.desc}" id="projectDesc-${project.ID}"></td>
                <td><input style="border: none; color:grey" type="text;" value="${project.pin}" id="projectPin-${project.ID}"></td>
                <td>
                  <div class="dropdown" style="position: relative;">
                    <button class="status-toggle" style="background-color: transparent; border: none; color: grey;">${project.status}</button>
                    <div class="status-options" style="display: none; position: absolute; background: white; border: 1px solid #ccc; z-index: 100;">
                      ${["Pending", "In Progress", "Completed", "Cancelled"].map(status => `
                        <button class="status-option" data-status="${status}" data-id="${project.ID}" style="display: block; width: 100%; border: none; background: white; padding: 5px; text-align: left;">
                          ${status}
                        </button>
                      `).join('')}
                    </div>
                  </div>
                </td>
                <td><button class="view-btn" style="background-color: yellow; border:none; margin:3px; outline:none; border-radius: 2px;">View</button></td>
                <td>
                    <div style="display:flex;">
                    <button class="update-btn" style="background-color: green; border:none; margin:3px; outline:none; border-radius: 2px;">Update</button>
                    <button class="delete-btn" style="background-color: red; border:none; margin:3px; outline:none; border-radius: 2px;">Delete</button>
                    </div>
                </td>
            `;

      const button = tr.querySelectorAll("button");
      const replacePM = button[0];
      const statusBtn = button[1];
      const viewbtn = tr.querySelector('.view-btn');
      const updatebtn = tr.querySelector('.update-btn');
      const deletebtn = tr.querySelector('.delete-btn');

      // dropdown toggle
      const statusToggle = tr.querySelector(".status-toggle");
      const statusOptions = tr.querySelector(".status-options");

      statusToggle.addEventListener("click", () => {
        statusOptions.style.display = statusOptions.style.display === "none" ? "block" : "none";
      });

      // handle status button clicks
      const statusButtons = tr.querySelectorAll(".status-option");
      statusButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          const selectedStatus = btn.dataset.status;
          const projID = btn.dataset.id;
          alert(`Status: ${selectedStatus}, Project ID: ${projID}`);
          statusOptions.style.display = "none"; // hide after selection
        });
      });

      statusBtn.addEventListener('click',()=>{
        
      })

      replacePM.addEventListener("click", () => {
        changePM(project.ID);
      });

      viewbtn.addEventListener("click", () => {
        viewMembers(project.ID);
      });

      updatebtn.addEventListener("click", () => {
        updateProject(project.ID);
      });

      deletebtn.addEventListener("click", () => {
        deleteProject(project.ID);
      });

      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
  }
};

// change project manager
const changePM = async (projectID) => {
  try {
    const reqBody = {
      projectID,
    };

    const response = await fetch(`${adminapi}/getallPM`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Server responded with an error:", data.message);
      return;
    }

    const users = data.result;

    const container = document.getElementById("replacePM");
    container.innerHTML = "";
    
    const currentPM = users.filter(user => user.category === "pm");
    const otherPMs = users.filter(user => user.category === "others");
    
    const currentTable = document.createElement("table");
    currentTable.className = "table";
    currentTable.innerHTML = `
          <thead>
            <tr><th>Current Project Manager</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="display:flex;">
                    <img 
                      src="${currentPM[0] && currentPM[0].profile_image ? imgAPI+currentPM[0].profile_image : '/profile/home.png'}" 
                      class="profile-img" 
                      height="25px" 
                      width="25px" 
                      style="object-fit: cover; border-radius: 50%; border: 2px solid black;" 
                      alt="profile" 
                    />
                    <p style="margin-left:50px">${currentPM[0]?.fname.replace(/_/g,' ')  || "Not Assigned"} ${currentPM[0]?.lname.replace(/_/g,' ')  || ""}</p>
                </div>
              </td>
              <td></td>
            </tr>
          </tbody>
        `;
    container.appendChild(currentTable);

    const pmTable = document.createElement("table");
    pmTable.className = "table";
    pmTable.innerHTML = `
          <thead>
            <tr>
              <th>Project Managers</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;
    const tbody = pmTable.querySelector("tbody");

    otherPMs.forEach((pm) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>
                <div style="display:flex;">
                    <img src="${otherPMs[0] && otherPMs[0].profile_image ? imgAPI+otherPMs[0].profile_image : imgAPI+'/profile/user.png'}" 
                    class="profile-img" height="25px" width="25px" 
                    style="object-fit: cover; border-radius: 50%; 
                    border: 2px solid black;" alt="profile">
                    <p style="margin-left:50px;">${pm.fname.replace(/_/g,' ')} ${pm.lname.replace(/_/g,' ')}</p>
                </div>
            </td>
            <td><input type="radio" id="select-${pm.ID}" name="selectPM" value="${pm.ID}"></td>
          `;

      tbody.appendChild(row);

      const PMbtn = document.getElementById("savePMsetting");
      PMbtn.addEventListener("click", () => {
        const selected = document.getElementById(`select-${pm.ID}`);
        if (selected.checked) {
          updatePM(selected.value, projectID);
        } else {
          alert("Please select a Project Manager.");
        }
      });
    });

    container.appendChild(pmTable);
  } catch (err) {
    console.error("Error fetching PMs:", err);
  }
};

// update pm
const updatePM = async (pmID,proID)=>{
    if(!pmID || !proID){
        alert("please select new project manager or cancel");
        return;
    }

    try {
        const reqBody = {
            pmID,
            proID
        }

        const response = await fetch(`${adminapi}/updatePM`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify(reqBody)
        });

        const data = await response.json();

        if(data.ok){
            getAllProjects();
            $('#changePM').modal('hide');
            window.location.reload();
        }
        


    } catch (error) {
        console.error(error);
        
    }
}

// show all members
const viewMembers = (projectID) => {
  alert(`show members: ${projectID}`);
};
// update request
const updateProject = async (projectID) => {
  const projectName = document.getElementById(`projectName-${projectID}`).value;
  const projectDesc = document.getElementById(`projectDesc-${projectID}`).value;
  const pin = document.getElementById(`projectPin-${projectID}`).value;

  if (!projectName || !pin || !projectDesc) {
    alert("All field are required!");
    return;
  }

  let confm = confirm(`Are you sure to update project: ${projectID}`);
  if (!confm) {
    alert("Action Canceled");
    return;
  }

  try {
    const reqBody = {
      projectID: projectID,
      projectName: projectName,
      projectDesc: projectDesc,
      pin: pin,
    };

    const response = await fetch(`${adminapi}/updateProject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });

    const data = await response.json();
    console.log(...data);

    getAllProjects();
  } catch (error) {
    console.error();
  }
};

// delete request
const deleteProject = async (projectID) => {
  let confm = confirm(`Delete Project: ${projectID}?`);
  if (!confm) {
    alert("Action Canceled");
    return;
  }

  try {
    const reqBody = {
      ID: projectID,
    };

    const response = await fetch(`${adminapi}/deleteProject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });

    const data = await response.json();
    alert(data.message);
    getAllProjects();
  } catch (error) {
    console.error(error);
  }
};

