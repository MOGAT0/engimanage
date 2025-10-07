import adminapi from "./adminglobal.js";

window.onload = function () {
  fetchUser();
  setInterval(updateUserStatuses, 500);
};

const updateUserStatuses = async () => {
  try {
    const response = await fetch(`${adminapi}/get_all_users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    data.forEach(user => {
      const statusCell = document.querySelector(`#status-${user.ID}`);
      if (statusCell) {
        statusCell.textContent = user.status === "active" ? "🟢" : "🔴";
      }
    });
  } catch (error) {
    console.error("Status update error:", error);
  }
};


const fetchUser = async () => {
  try {
    const response = await fetch(`${adminapi}/get_all_users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";

    data.map((user) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${user.ID}</td>
        <td>
          <div style="display:flex;">
            <Button style="background-color:transparent; border:none; outline:none;" title="status">
              <p id="status-${user.ID}" style="margin:auto;">${user.status === "active" ? "🟢" : "🔴"}</p>
            </Button>
            <input style="border: none; color:grey; width:130px" type="text" value="${user.fname.replace(/_/g," ")}" id="fname-${user.ID}">
          </div>
        </td>
        <td><input style="border: none; color:grey; width:130px" type="text" value="${user.lname.replace(/_/g," ")}" id="lname-${user.ID}"></td>
        <td><input style="border: none; color:grey; width:130px" type="text" value="${user.email}" id="email-${user.ID}"></td>
        <td><input style="border: none; color:grey; width:130px" type="text" value="${user.pass}" id="pass-${user.ID}"></td>
        <td>
          <select id="role-${user.ID}" style="border: none; color:grey; width:130px">
            <option value="${user.role}" selected disabled hidden>${user.role.replace(/_/g,' ')}</option>
            <option value="project_manager">project manager</option>
            <option value="staff">staff</option>
            <option value="finance_dept">finance dept</option>
          </select>
        </td>
        <td>
          <div style="display:flex;">
            <button style="background-color: green; border:none; margin:3px; outline:none; border-radius: 2px;">Update</button>
            <button style="background-color: red; border:none; margin:3px; outline:none; border-radius: 2px;">Delete</button>
          </div>
        </td>
      `;

      const button = tr.querySelectorAll("button");
      const faqStatus = button[0]
      const updateBtn = button[1];
      const deleteBtn = button[2];

      faqStatus.addEventListener("click", function () {
        openStatusModal()
      })

      updateBtn.addEventListener("click", function () {
        updateUser(user.ID);
      });

      deleteBtn.addEventListener("click", function () {
        deleteUser(user.ID);
      });

      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
  }

};

function openStatusModal() {
  document.getElementById('statusModal').style.display = 'flex';
}

function closeStatusModal() {
  document.getElementById('statusModal').style.display = 'none';
}

document.getElementById('closeStatusModalbtn').addEventListener('click', closeStatusModal);

const updateUser = async (id)=> {
  const fname = document.getElementById(`fname-${id}`).value;
  const lname = document.getElementById(`lname-${id}`).value;
  const email = document.getElementById(`email-${id}`).value;
  const pass = document.getElementById(`pass-${id}`).value;
  const role = document.getElementById(`role-${id}`).value;

  if(!fname || !lname || !email || !pass || !role){
    console.error("Empty field");
    return;
  }

  try {

    const reqData = {
      ID:id,
      fname:fname.replace(/\s/g,"_"),
      lname:lname.replace(/\s/g,"_"),
      email:email,
      pass:pass,
      role:role.replace(/\s/g,"_")
    };

    const response = await fetch(`${adminapi}/updateUser`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body: JSON.stringify(reqData),
    })

    const data = await response.json();
    alert(data.message)
    fetchUser();
    

  } catch (error) {
    console.error(error);
    
  }

}

const deleteUser = async (id) => {
  let confirmDel = confirm(`Are you sure to delete this user? userID: ${id}`)

  if(!confirmDel){
    console.log("Action canceled");
    return;
  }

  try {
    const reqData = {
      ID:id,
    }

    const respose = await fetch(`${adminapi}/deleteUser`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body: JSON.stringify(reqData),
    })

    const data = await respose.json();
    alert(data.message);
    fetchUser();

  } catch (error) {
    console.log(error);
  }
}
