

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");



const app = express();

// const items = ["Buy food", "Cook food", "Eat food"];
// const workItems = ["Thesis", "Website", "Resume"];

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin-michael:Test123@cluster0.zglpf.mongodb.net/todolistDB", {useNewUrlParser: true});
mongoose.set('useFindAndModify', false);

const itemsSchema = new mongoose.Schema ({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to the list",
});

const item2 = new Item ({
  name: "Hit the + button to add",
});

const item3 = new Item ({
  name: "<-- Hit this to delete",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/")
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });




  });

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemN = new Item({
    name: itemName
  });

  if (listName === "Today"){
    itemN.save();
    res.redirect("/")
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(itemN);
      foundList.save();
      res.redirect("/" + listName)
    });
  }


});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("successfully deleted " + checkedItemId);
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        console.log("successfully deleted " + checkedItemId);
        res.redirect("/" + listName);
      }
    });
  }
});


app.get("/:listName", function(req, res){
  const requestedTitle = _.capitalize(req.params.listName);

  List.findOne({name: requestedTitle}, function(err, foundList){
    if (!err) {
      if (!foundList) {
        //Create New List
        const list = new List({
          name: requestedTitle,
          items: defaultItems
        });
        list.save()
        res.redirect("/" + requestedTitle)
      } else {
        //Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    } else {
      console.log(err);
    }
  });

});

app.get("/about", function(req,res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server has started successfully.")
})
