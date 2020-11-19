const unitTest = require('./../index');

let config = {
    apiKey:"",
    url: "",
    id:""
}

let options = {
    taxonomy:{
    },
    docs:true
}

unitTest.configure(config).then(()=>{
    unitTest.getMetadata(options).then((res)=>{
        console.log(JSON.stringify(res));
    }).catch(err=>{
        console.log(err);
    })
}).catch((err)=>{
    console.log(err);
})