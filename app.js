

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");


const app = express();

// const items = ["Buy food", "Cook food", "Eat food"];
// const workItems = ["Thesis", "Website", "Resume"];

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = new mongoose.Schema ({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Wake up",
});

const item2 = new Item ({
  name: "Handstand push ups",
});

const item3 = new Item ({
  name: "Take a walk",
});

const defaultItems = [item1, item2, item3];

Item.insertMany(defaultItems, function(err){
  if (err) {
    console.log(err);
  } else {
    console.log("Successfully saved default items to DB.");
  }
});

app.get("/", function(req, res){

  const day = date.getDate();

  res.render("list", {listTitle: day, newListItems: items});

  });

app.post("/", function(req, res) {

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req,res){
  res.render("about");
});

app.listen(3000, function(){
  console.log("Server started on port 3000")
})
