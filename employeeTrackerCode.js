const mysql = require("mysql");
const inquirer = require("inquirer");
const consoleTable = require("console.table");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employeeTracker_DB",
    multipleStatements: true,
});

connection.connect((err) => {
    if (err) throw err;
    runSearch();
});

function runSearch() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "Add Department",
                "Add Role",
                "Add Emplyoyee",
                "View Departments",
                "View Roles",
                "View Employees",
                "Update Employee Roles",
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "Add Department":
                    addDepartment();
                    break;

                case "Add Role":
                    addRole();
                    break;

                case "Add Emplyoyee":
                    addEmployee();
                    break;

                case "View Departments":
                    viewDepartments();
                    break;

                case "View Role":
                    viewRoles();
                    break;

                case "View All Employees":
                    viewEmployees();
                    break;

                case "Update Employee Roles":
                    update();
                    break;


                case "exit":
                    connection.end();
                    break;
            }
        });
}

function viewDepartments() {
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.log(res);
        connection.end();
    });
    runSearch();
};

function viewEmployees() {
    connection.query("SELECT * FROM employee", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.log(res);
        connection.end();
    });
    runSearch();
};

function viewRoles() {
    connection.query("SELECT * FROM role", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.log(res);
        connection.end();
    });
    runSearch();
};

function addDepartment() {
    inquirer
        .prompt(
            {
                name: "department",
                type: "input",
                message: "Add the name of the department?"
            },
        )
        .then((answer) => {

            const query = connection.query(
                "INSERT INTO department SET ?",
                {
                    name: answer.department,
                },
                function (err) {
                    if (err) throw err;
                });

            runSearch();
        });
}

async function addRole() {
    let departments = [];
    connection.query("SELECT * FROM department", async (err, answer) => {
        console.log(answer);
        for (let index = 0; index < answer.length; index++) {
            departments.push(answer[index].name + " " + answer[index].id);
        };
        console.log(departments);

        const response = await inquirer
            .prompt([
                {
                    name: "department_id",
                    type: "list",
                    message: "What is the department of the role?",
                    choices: departments
                },
                {
                    name: "title",
                    type: "input",
                    message: "What is the role title?"
                },
                {
                    name: "salary",
                    type: "number",
                    message: "What is the salary of the role?"
                }])

        const query = connection.query(
            "INSERT INTO role SET ?", //query to grab id from department
            {
                title: response.title,
                salary: response.salary,
                department_id: parseInt(response.department_id.split(" ")[1])
            },
            function (err) {
                if (err) throw err;
            });

        runSearch();
    })
}


function addEmployee() {
    inquirer
        .prompt([
            {
                name: "firstName",
                type: "input",
                message: "What is the employee's first name?"
            },
            {
                name: "lastName",
                type: "input",
                message: "What is the employee's last name?"
            },
            {
                name: "role_id",
                type: "input",
                message: "What is the employee's role id?"
            },
            {
                name: "manager_id",
                type: "input",
                message: "What is the employee's manager id?"
            }])

        .then(function (answer) {
            const query = connection.query(
                "INSERT INTO employee SET ?",
                {
                    first_name: answer.firstName,
                    last_name: answer.lastName,
                    role_id: answer.role_id,
                    manager_id: answer.manager_id,
                },
                function (err) {
                    if (err) throw err;
                });
            runSearch();
        });
}

function update() {

    // show employees roles. prompt user to update
    let employees = [];
    let roles = [];

    connection.query("SELECT * FROM employee, role", async (err, answer) => {
        console.log(answer);
        for (let index = 0; index < answer.length; index++) {
            employees.push(answer[index].first_name + " " + answer[index].last_name);
        };
        

        for (let index = 0; index < answer.length; index++) {
            roles.push(answer[index].title + " " + answer[index].department_id);
        };
        

        const response = await inquirer
            .prompt([
                {
                    name: "employeeRoleUpdate",
                    type: "list",
                    message: "Which employee do you want to update?",
                    choices: employees
                },
                {
                    type: "list",
                    message: "select new role",
                    choices: ["manager", "employee"],
                    name: "newrole"
                }
                // {
                //     name: "title",
                //     type: "list",
                //     message: "What is the role you would like to update?",
                //     choices: roles
                // },
            ])
            .then(function(answer) {
                console.log("about to update", answer);
                const updatedId = {};
                updatedId.employeeId = parseInt(answer.employeeRoleUpdate.split(" ")[0]);

                if (answer.newrole === "manager") {
                  updatedId.role_id = 1;

                } else if (answer.newrole === "employee") {
                  updatedId.role_id = 2;
                }

                connection.query(
                  "UPDATE employee SET role_id = ? WHERE id = ?",
                  [updatedId.role_id, updatedId.employeeId],
                  function(err, data) {
                    runsearch();
                  }
                );
            })
    })
}


