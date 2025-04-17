const bcrypt=require('bcrypt');
const saltRounds=10;
// const myPlaintextPassword='s0/\/\\P4$$w0rD';
// const someOtherPlaintextPassword='not_bacon';
const dbOperations=require('../database/dbOperations');


const encrypt = async(password)=>{
    try{
        const hash=await bcrypt.hash(password,saltRounds);
        return hash;
    }catch(err){
        console.log(err);
        throw err;
    }

}

const comparePassword= async(loginIdentifier,password)=>{

    const hashdb= await dbOperations.getHashedPass(loginIdentifier);


    console.log("Comparing password");
    console.log(loginIdentifier)
    console.log(hashdb);
    try{
        const match=await bcrypt.compare(password,hashdb);
        console.log("Match: ",match);
        return true;
    }catch(err){
        return false;

    }

    




}


// bcrypt.hash(myPlaintextPassword,saltRounds,(err,hash)=>{
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log(hash);
//         bcrypt.compare(myPlaintextPassword,hash,(err,result)=>{
//             console.log(result);
//         });
//         bcrypt.compare(someOtherPlaintextPassword,hash,(err,result)=>{
//             console.log(result);
//         });
//     }
// });

module.exports={encrypt, comparePassword}