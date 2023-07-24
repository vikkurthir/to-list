const bodyParser=require("body-parser");
const express=require("express");
const mongoose=require("mongoose");
const _=require("lodash");
const app=express();
mongoose.set('strictQuery', false);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://illasanjaykirankiran:qWoBVDSFB9G1qNZi@cluster0.spcbm3r.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true })
const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to your to do list"
});
const item2=new Item({
  name:"Hit the + button to add a new item."
});
const item3=new Item({
  name:"<-- Hit this to delete an item."
});
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("list",listSchema)
const defaultItems=[item1,item2,item3];
  app.get("/", function (req, res){
    Item.find({}).then(function(FoundItems){
    if(FoundItems.length===0){
      Item.insertMany(defaultItems)
       .then(() => {
          console.log('Documents inserted successfully.');
          // Additional code
        })
        .catch((error) => {
          console.log('Error inserting documents:', error);
        });
      res.redirect("/");
    }else{

      res.render("list", {listTitle: "Today", newListItems:FoundItems});
    }

});
  });
app.post("/",function(req,res){
  let itemname=req.body.newItem;
  let listName=req.body.list;

   const item=new Item({
     name:itemname
   });
   if(listName ==="Today"){

        item.save();
        res.redirect("/");
   }else{
     List.findOne({name: listName},function(err,FoundList){
       FoundList.items.push(item);
       FoundList.save();
       res.redirect("/"+listName);
     });
   }
 });

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, FoundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }
});
//   Item.findByIdAndRemove(checkedItemId).exec();
// res.redirect('/');
// });
app.get("/:createitem",function(req,res){
  const createitem=_.capitalize(req.params.createitem);
    // List.findOne({ name: createitem }, (err,FoundItems) => {
    List.findOne({name: createitem},function(err,FoundList){
    if (!err) {
      // Handle the error
      if(!FoundList){
        const list=new List({
          name:createitem,
          items:defaultItems
        });

        list.save();
        res.redirect("/"+createitem);
      } else {
      // Handle the result
      res.render("list", {listTitle: FoundList.name, newListItems:FoundList.items});
    }

    }
    });
    });
app.get("/work",function(req,res){
  res.render("list",{listTitle:"Work List",newListItems:workItems})
});
app.get("/about",function(req,res){
  res.render("about");
});
app.listen(3000,function(){
  console.log("server started at port 3000");
});
