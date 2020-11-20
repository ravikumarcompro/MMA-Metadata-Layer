const unitTest = require('./../index');

// Below config and options are specific to CUP.
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

let organizationModule = unitTest.getOrganizationInstance(config.id);

organizationModule.configure(config).then(()=>{
    organizationModule.getMetadata(options).then((res)=>{
        console.log(JSON.stringify(res));
    }).catch(err=>{
        console.log(err);
    })
}).catch((err)=>{
    console.log(err);
})