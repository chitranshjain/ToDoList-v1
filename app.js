const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

console.log(date());

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

let items = [];
let workItems = [];

//Home routes

app.get("/", function (req, res) {

    res.render("list", {
        listTitle: date(),
        newListItems: items
    });
});

app.post("/", function (req, res) {

    console.log(req.body.list);
    if (req.body.list === "Work") {

        let workItem = req.body.newItem;
        workItems.push(workItem);
        res.redirect("/work");
    } else {
        let item = req.body.newItem;
        items.push(item);
        res.redirect("/");
    }
});

//Work routes

app.get("/work", function (req, res) {
    res.render("list", {
        listTitle: "Work list",
        newListItems: workItems
    });
});


app.listen(3000, function () {
    console.log("The server is up and running on port 3000");
});