const app = require('./src/app');
const connect = require('./src/db/db');
connect();
app.listen(3000,(err)=>{
    if(!err)
    {
        console.log('server running on http://localhost:3000');
    }
    else{
        console.log('error listening on port 3000');
    }
});