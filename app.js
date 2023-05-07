const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _= require("lodash");
require("dotenv").config(); 

const srvr = process.env.N1_KEY; 
const srvrCred = process.env.N1_SECRET;


const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

main().catch((err) => console.log(err));


async function main() {
  await mongoose.connect("mongodb+srv://"+srvr+":"+srvrCred+"@cluster0.1iafpek.mongodb.net/toDoListDB");
}


const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Welcome to your todo list!!" });

const item2 = new Item({ name: "Click + button to add a new Item." });

const item3 = new Item({ name: "<-- Hit this to delete an item" });

const defaultItems = [item1, item2, item3];

const listSchema= {
  name: String,
  items: [itemsSchema]
}

const List= mongoose.model("List", listSchema);

async function getItems() {
  const Items = await Item.find({});
  return Items;
}

app.get("/", function (req, res) {
  const day = date.getDate();
  Item.find({})
    .then((foundItem) => {
      if (foundItem.length === 0) {
        return Item.insertMany(defaultItems);
      } else {
        return foundItem;
      }
    })
    .then((savedItem) => {
      res.render("list.ejs", {
        listTitle: day,
        newListItems: savedItem,
      });
    })
    .catch((err) => console.log(err));
});


app.get("/:customListName", function(req, res){
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then((foundItem)=>{ 
      if(!foundItem){
        const list= new List({
          name: customListName,
          items: defaultItems
        })

        list.save();

        res.redirect("/"+customListName);
      }else{
        res.render("list.ejs", {listTitle: customListName, newListItems: foundItem.items});
      }
  })
});

app.post("/", (req, res) => {
  const itemName= req.body.newItem;
  const listName= req.body.list;
  const day= date.getDate();
  const item= new Item({name: itemName});

  if(listName===day){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then((foundItem)=>{
      foundItem.items.push(item);
      foundItem.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete", (req, res) => {
  const checkedItem= req.body.checkbox;
  const checkListName= req.body.listName;
  const day= date.getDate();

  if(checkListName===day){
    Item.findByIdAndRemove(checkedItem).then(()=>{
        res.redirect("/");
    });
  }else{
    List.findOneAndUpdate({name: checkListName}, {$pull: {items: {_id: checkedItem}}}).then(()=>{
      res.redirect("/"+checkListName);
    })
  }
});

let port= process.env.port;
if(port==null || port==""){
  port=3000;
}

app.listen(port, () => {
  console.log("Server is up and running at port:3000...");
});
