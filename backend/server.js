const express = require("express");
const app = express();


app.get("/home",(req,res)=>{
    res.send({
        message: "hiii"
    })
});

app.listen(8000,()=>{
    console.log("Server is running");
})