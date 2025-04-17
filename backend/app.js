const express= require('express');
const cors = require('cors');
const app = express();
const routes=require('./routes');

// console.log('Type of routes:', typeof routes);
// console.log('Value of routes:', routes);

app.use(express.json());
app.use(cors())

app.use('/', routes);


app.listen(port=3000,hostname="localhost",()=>{
    console.log(`Server is running on http://${hostname}:${[port]}`)
})

