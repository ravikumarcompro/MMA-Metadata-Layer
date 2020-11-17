const communicate = require('./communicate');

async function getCategoryMap(taxonomies, config){
    try {
        let flattenedMap = await getFlattenedMap(taxonomies, config);
        let response = createMapFromFlattened(flattenedMap);
        return Promise.resolve(response)
    }
    catch(err){
        return Promise.reject(err);
    }

}

async function getFlattenedMap(taxonomies, config){
    try{
        let response = {};
        let promiseArray = [];
        let colorMap = {};
        for(let taxonomyId in taxonomies ){
            colorMap[taxonomyId] = taxonomies[taxonomyId].theme;
            promiseArray.push(communicate.getLatestTaxonomyById(config, taxonomyId));
        }

        let result = await Promise.all(promiseArray);
        for (let i = 0; i < result.length; i++){
            if(result[i].data && result[i].data.id){
                response[result[i].data.id] = result[i].data;
            }
        }
        return Promise.resolve({ response:response, colorMap:colorMap });
    }
    catch(err){
        console.log(err);
        return Promise.reject(err);
    }
}

function createMapFromFlattened(flattenedMap){
    let data = flattenedMap.response;
    let colorMap = flattenedMap.colorMap;
    for(let id in data){
        let currentTax = data[id];
        let transformedTax = {};
        transformedTax.doc = currentTax;
        transformedTax.tags = createTree(currentTax.terms);   
        transformedTax.doc["last-modified"] = {
                time: null,
                by: "",
            };
        transformedTax.doc.meta = {
                name: currentTax.name,
                theme: colorMap[id],
            }
        transformedTax.doc.parentid =  0;
        transformedTax.doc['_id'] = id;
        delete transformedTax.doc.terms;
        delete data[id];
        data[id] = transformedTax;
    }
    return data;
}

function createTree(termsArray){
    let recMap = {}
    let childParentMap = {};
    for(let i=0; i< termsArray.length; i++) {
        
        if(!childParentMap[termsArray[i].parentId]) {
            if(termsArray[i].parentId == ""){
                childParentMap['0'] = childParentMap['0'] || [];
                childParentMap['0'].push(termsArray[i]);
            }
            else
                childParentMap[termsArray[i].parentId] =  [];
        }
        if(termsArray[i].parentId != "")
            childParentMap[termsArray[i].parentId].push(termsArray[i]);

        if(!childParentMap[termsArray[i]["id"]]) {
            childParentMap[termsArray[i]["id"]] = [];
        }
        childParentMap[termsArray[i]["id"]].unshift(termsArray[i]);
    }
    /* create root level(hidden from user) which has id = 0 */
    childParentMap[0].unshift(
        {
            "id" : "0",
            "meta" : {
                "name" : "Zero"
            }
        }
    );
    let recMap = {};
    getChildren(recMap, 0);
   

    function getChildren(recMap, parentId) {
        if(childParentMap[parentId].length) {
            for(let i=1; i< childParentMap[parentId].length; i++) {
                recMap[childParentMap[parentId][i]["proxyId"]] = {
                    "doc" : childParentMap[parentId][i],
                    "tags" : {}
                }

                recMap[childParentMap[parentId][i]["proxyId"]].doc['last-modified'] = {
                    by: "",
                    time: null
                }

                recMap[childParentMap[parentId][i]["proxyId"]].doc["meta"] =  {
                        "name":  recMap[childParentMap[parentId][i]["proxyId"]].doc.name,
                        "theme": ""
                }
                recMap[childParentMap[parentId][i]["proxyId"]].doc.parentid =  recMap[childParentMap[parentId][i]["proxyId"]].doc.parentId;
                recMap[childParentMap[parentId][i]["proxyId"]].doc["_id"] =   recMap[childParentMap[parentId][i]["proxyId"]].doc.proxyId;
                //delete duplicate parentId
                delete recMap[childParentMap[parentId][i]["proxyId"]].doc.parentId;

                getChildren(recMap[childParentMap[parentId][i]["proxyId"]].tags, childParentMap[parentId][i]["id"]);   
            }
        }
    }
    return recMap;
}




module.exports = { getCategoryMap }