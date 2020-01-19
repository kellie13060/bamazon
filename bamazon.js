var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "iTbiTcaT777.",
    database: "bamazondb"
});

//connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

//funciton for the start of the program. 
function start() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        buy();
    });
};

function purchaseAgain() {
    inquirer
        .prompt({
            name: "again",
            type: "list", 
            message: "Would you like to purchase more items?",
            choices: ["YES", "NO"]
        })
        .then(function(answer){
            //based on their answer the choose
            if (answer.again === "YES"){
                start();
            }
            else {
                connection.end();
            }
        })
}

function buy() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        inquirer
            .prompt([{
                    name: "whatToBuy",
                    type: "integer",
                    message: "What is the item_id would you like to buy?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: "howMany",
                    type: "integer",
                    message: "How many of that item would you like to purchase?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                }
            ])
            .then(function (answer) {
                var chosenItem;
                for (var i = 0; i < res.length; i++) {
                    if (res[i].item_id == answer.whatToBuy) {
                        chosenItem = res[i];
                    }
                }

                //determining if the we have the quantities in stock
                if (chosenItem.stock_quantity >= answer.howMany){
                    //enough quantities
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: chosenItem.stock_quantity - answer.howMany
                            },
                            {
                                item_id: chosenItem.item_id
                            }
                        ],
                        function(err) {
                            if (err) throw err; 
                        }
                    );
                    console.log("You have purchased " + chosenItem.product_name + ". " + "Your total cost was $" + chosenItem.price * answer.howMany + "!")
                    purchaseAgain();
                }
                else {
                    //don't have that many items
                    console.log("We don't have enough of those. Try again...");
                    start();
                }
            });
    });

};