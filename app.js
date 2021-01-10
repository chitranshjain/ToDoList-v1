const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

//Connecting to the database
mongoose.connect("mongodb+srv://admin-chitransh:test123@cluster0.kdy5e.mongodb.net/todolistDB?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Defining the schemas for the to do list items
const listItemSchema = mongoose.Schema({
    name: String
});

const customListSchema = mongoose.Schema({
    name: String,
    items: [listItemSchema]
});

//Creating the model for the to do list items
const ListItem = mongoose.model("List", listItemSchema);

const CustomList = mongoose.model("CustomList", customListSchema);

//Custom items
const first = new ListItem({
    name: "Welcome to your to do list"
});

const second = new ListItem({
    name: "Hit the + button to add a new item"
});

const third = new ListItem({
    name: "<-- Click here to delete an item"
});

const defaultList = [first, second, third];

//Home routes
app.get("/", function (req, res) {
    ListItem.find({}, function (err, listItems) {

        if (listItems.length === 0) {

            ListItem.insertMany(defaultList, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Insertion successful");
                    res.redirect("/");
                }
            });
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: listItems
            });
        }
    });
});

//Add an item
app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const newItem = new ListItem({
        name: itemName
    });

    if (listName === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        CustomList.findOne({
            name: listName
        }, function (err, thisCustomList) {
            thisCustomList.items.push(newItem);
            thisCustomList.save();
            res.redirect("/" + _.lowerCase(listName));
        });
    }
});

//Deleting an element
app.post("/delete", function (req, res) {
    const taskCompleted = req.body.checkbox;
    const listName = req.body.list;

    if (listName === "Today") {
        ListItem.deleteOne({
            name: taskCompleted
        }, function (err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/");
            }
        });
    } else {
        CustomList.findOne({
            name: listName
        }, function (err, thisCustomList) {
            if (err) {
                console.log(err);
            } else {
                console.log("List : " + listName);
                console.log("Task : " + taskCompleted);
                for (var i = 0; i<thisCustomList.items.length; i++) {
                    if(thisCustomList.items[i].name === taskCompleted) {
                        console.log("Item found at index : "+i);
                        console.log("Actual item : " + thisCustomList.items[i]);
                        thisCustomList.items.splice(i,1);
                        break;
                    }
                }
                thisCustomList.save();
                res.redirect("/"+_.lowerCase(listName));
            }
        });
    }
});

//Dynamic Routes
app.get("/:title", function (req, res) {
    const customListTitle = _.capitalize(req.params.title);
    CustomList.findOne({
        name: customListTitle
    }, function (err, thisCustomList) {
        if (err) {
            console.log(err);
        } else {
            if (!thisCustomList) {
                const myCustomList = new CustomList({
                    name: customListTitle,
                    items: defaultList
                });

                myCustomList.save();

                const listPath = "/" + _.lowerCase(customListTitle);

                res.redirect(listPath);
            } else {
                res.render("list", {
                    listTitle: customListTitle,
                    newListItems: thisCustomList.items
                });
            }
        }
    });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
    console.log("Server is up and running");
});