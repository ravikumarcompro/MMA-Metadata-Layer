/*********************************Library References****************************************************************/ 
const communicate = require('./communicate');

/*********************************Global Variables******************************************************************/  

/*********************************Functions************************************************************************/  

/*
Output: returns a categoryMap in Builder friendly format after fetching data from MMA endpoints 
        and applying conversion logic on it 
Input:1.taxonomies->{ 
                        "taxonomy_id_1":{ theme:"color_1" },
                        "taxonomy_id_2":{ theme:"color_2" },
                    }
        
        2.config -->{
                        "url":"mma_base_url",
                        "id":"unique_id_mma_client"
                        "apiKey":"authentication_key_for_MMA_Api"
                    }
*/ 
async function getCategoryMap(options, config){
    try {
        let response ;
        // if docs flag is true fetch all docs and convert into builder format and return 
        if(options.docs && options.docs == true){
            response = getAllDocs(options, config);
        }
        else{
            // Fetch data from provided taxonomies id and create flatMap from it.
            let flattenedMap = await getFlattenedMap(options.taxonomy, config);
            // Convert the FlatMap obtained from above step and convert it into Hierarchical Map (Builder Friendly Format).
            response = createMapFromFlattened(flattenedMap);
        }
        return Promise.resolve(response);
    }
    catch(err){
        return Promise.reject(err);
    }

}

/*
Output: returns flattened taxonomy data and colormap as follows 
        {
            response:{ 
                    "taxonomy_id_1":{} //taxonomy data,
                    "taxonomy_id_2":{} //taxonomy data,
                    ...
                    },
            colorMap:{
                    "taxonomy_id_1":"theme_1",
                    "taxonomy_id_2":"theme_2"
                    ...
                    }
        }
Input:1.taxonomies->{ 
                        "taxonomy_id_1":{ theme:"color_1" },
                        "taxonomy_id_2":{ theme:"color_2" },
                    }
        
        2.config -->{
                        "url":"mma_base_url",
                        "id":"unique_id_mma_client"
                        "apiKey":"authentication_key_for_MMA_Api"
                    }
*/ 

async function getFlattenedMap(taxonomies, config){
    try{
        let response = {};
        let promiseArray = [];
        let colorMap = {};
        // Loop over taxonomy list and make a call for each taxonomy id and store the promise in an promiseArray.
        // Similarly make ColorMap in which every taxonomy id has a corresponding theme.
        for(let taxonomyId in taxonomies ){
            colorMap[taxonomyId] = taxonomies[taxonomyId].theme || 'black'; // Chosen black as a fallback color
            promiseArray.push(communicate.getLatestTaxonomyById(config, taxonomyId));
        }

        // Create a flatmap of taxonomies result and store it key-value pairs in response object where key = taxonomy_id
        // and value = taxonomy data from API
        let result = await Promise.all(promiseArray);
        for (let i = 0; i < result.length; i++){
            if(result[i].data && result[i].data.id){
                response[result[i].data.id] = result[i].data;
            }
        }
        // return the flattend taxonomies data and colorMap
        return Promise.resolve({ response:response, colorMap:colorMap });
    }
    catch(err){
        console.log(err);
        return Promise.reject(err);
    }
}


/*
Output: returns hierarchical CategoryMap as follows :- https://jsonformatter.org/json-parser/7616c1
Input: Flattened Map obtained in Above Step
*/ 
function createMapFromFlattened(flattenedMap){
    let data = flattenedMap.response;
    let colorMap = flattenedMap.colorMap;

    // loop on flattened taxonomies data and transform it into builder format
    for(let id in data){
        let currentTax = data[id];
        let transformedTax = {};
        transformedTax.doc = currentTax;
        transformedTax.tags = createTree(currentTax.terms, id);   
        transformedTax.doc["last-modified"] = {
                time: null,
                by: "",
        };
        transformedTax.doc.meta = {
                name: currentTax.name,
                theme: colorMap[id],
        }
        // put parentid = 0 for taxonomies as they are on top level of hierarchy
        transformedTax.doc.parentid =  0;
        transformedTax.doc['_id'] = id;
        // delete terms and id from the taxonomy doc data as they are redundant now
        delete transformedTax.doc.terms;
        delete data[id];
        data[id] = transformedTax;
    }
    return data;
}

// Create hierarchy for terms of a Taxonomy such as (Parent term >> Child term) 
function createTree(termsArray, pid){
    var recMap = {}
    var childParentMap = {};
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
    getChildren(recMap, 0, pid);
   

    function getChildren(recMap, parentId, pid) {
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
                recMap[childParentMap[parentId][i]["proxyId"]].doc.parentid =  pid;
                recMap[childParentMap[parentId][i]["proxyId"]].doc["_id"] =   recMap[childParentMap[parentId][i]["proxyId"]].doc.proxyId;
                //delete duplicate parentId
                delete recMap[childParentMap[parentId][i]["proxyId"]].doc.parentId;

                getChildren(recMap[childParentMap[parentId][i]["proxyId"]].tags, childParentMap[parentId][i]["id"], childParentMap[parentId][i]["proxyId"]);   
            }
        }
    }
    return recMap;
}

/*************Get all Docs Method *********/
async function getAllDocs(options, config){
    try {
        let docs = await fetchAllDocs(options, config);
        let response = transform(docs.data, docs.colorMap);
        return Promise.resolve(response);
    } catch (err) {
        console.log(err);
        return Promise.reject(err);
    }
}

async function fetchAllDocs(options, config){
    try{
        let taxonomies = options.taxonomy || {};
        let promiseArray = [];
        let colorMap = [];
        for(let taxonomyId in taxonomies ){
            colorMap[taxonomyId] = taxonomies[taxonomyId].theme;
            promiseArray.push(communicate.getLatestTaxonomyById( config, taxonomyId ));
        }
        let response = [];
        let results = await Promise.all(promiseArray);
        for (let i = 0; i < results.length; i++){
           if(results[i].data && results[i].data.id){
            response.push(results[i].data);
           }
        }
        return Promise.resolve({data:response, colorMap:colorMap});
    }catch(err){
        console.log(err);
        return Promise.reject(err);
    }

}

function transform(collection, colorMap){
    let response = [];
    let termProxyMap = {};
    for(let i = 0 ; i< collection.length; i++){
        let terms = collection[i].terms;
        response.push(convertToBuilderFormat(collection[i], '0', {}, colorMap));
        if(terms.length > 0){
            for(let j = 0; j < terms.length; j++){
                termProxyMap[terms[j].id] = terms[j].proxyId;
                response.push(convertToBuilderFormat(terms[j], collection[i].id, termProxyMap, colorMap));
            }
        }
    }
    return response;
}

function convertToBuilderFormat(item, parentId, termProxyMap, colorMap){
    let format = {
        "last-modified":{ 
            by:"",
            time:Date.now()
        },
        meta:{
            name:""
        },
        parentid:null,
        _id: null
    }

    format.parentid = item.label == 'taxonomy' ? "0": getTermParent(item.parentId, parentId, termProxyMap);
    format._id =  item.label == 'taxonomy' ? item.id : item.proxyId;
    format.meta = item;
    format.meta.name = item.name;
    if( item.label == 'taxonomy'){
        format.meta.theme = colorMap[item.id];
        delete format.meta.category;
        delete format.meta.terms;
    }
    return format;
}

function getTermParent(itemParentId, fallbackParentId, termProxyMap){
    if(itemParentId == "")
        return fallbackParentId;
    else
        return termProxyMap[itemParentId];
}

module.exports = { getCategoryMap }