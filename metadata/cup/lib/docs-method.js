/*********************************Library References****************************************************************/ 
const communicate = require('./communicate');

/*********************************Global Variables******************************************************************/  

/*********************************Functions************************************************************************/  

/**
 * returns all of taxonomy and its term docs.
 * @param { Object }  options - Options.
 * @param { Object }  options.taxonomy - Pass taxonomy list .
 * @param { boolean } options.docs - Set true to fetch all docs and false to fetch categoryMap.
 * @param { Object }  config  -  Config for Api endpoints.
 * @param { String }  config.apiKey  -  Key for API endpoint authentication.
 * @param { String }  config.url  -  MMA Endpoint base url.
 * @param { String }  config.id  -  Unique client id.
 * @returns { Promise } Promise which gets resolved with all taxonomy and its term docs.
 */
async function getAllDocs(options, config){
    try {
        //fetch all taxonomies in a flatMap.
        let docs = await fetchAllDocs(options, config);
        // transform all taxonomies and terms into builder format doc
        let response = transform(docs.data, docs.colorMap);
        return Promise.resolve(response);
    } catch (err) {
        return Promise.reject(err);
    }
}

/**
 * Fetch all taxonomies and their corresponding color in  respective flatMaps.
 * @param { Object }  options - Options.
 * @param { Object }  options.taxonomy - Pass taxonomy list .
 * @param { boolean } options.docs - Set true to fetch all docs and false to fetch categoryMap.
 * @param { Object }  config  -  Config for Api endpoints.
 * @param { String }  config.apiKey  -  Key for API endpoint authentication.
 * @param { String }  config.url  -  MMA Endpoint base url.
 * @param { String }  config.id  -  Unique client id.
 * @returns {Promise} Promise which gets resolved with taxonomy flatmap and corresponding color flatmap.
 */
async function fetchAllDocs(options, config){
    try{
        let taxonomies = options.taxonomy || {};
        let promiseArray = [];
        let colorMap = [];
        //loop for each taxonomy in taxonomies array
        for(let taxonomyId in taxonomies ){
            // put a color in colormap corresponding to each taxonomyId.
            colorMap[taxonomyId] = taxonomies[taxonomyId].theme;
            // push each latest call into promiseArray.
            promiseArray.push(communicate.getLatestTaxonomyById( config, taxonomyId ));
        }
        let response = [];
        //resolve all taxonomies call
        let results = await Promise.all(promiseArray);
        // push each taxonomy results against their taxonomy id in the response map.
        for (let i = 0; i < results.length; i++){
           if(results[i].data && results[i].data.id){
            response.push(results[i].data);
           }
        }
        return Promise.resolve({data:response, colorMap:colorMap});
    }catch(err){
        return Promise.reject(err);
    }
}

/**
 * transforms all the taxonimies data into builder docs format
 * @param { Object } collection - collection of taxonomies data
 * @param { Object } colorMap - colorMap of taxonomyid vs their theme color
 * @returns {Object} A flatmap of docs (including taxonomy , terms , child terms) in builder format.
 */
function transform(collection, colorMap){
    let response = [];
    let termProxyMap = {};
    // loop for each taxonomy data 
    for(let i = 0 ; i< collection.length; i++){
        // store terms of a taxonomy 
        let terms = collection[i].terms;
        // convert taxonomy data into builder doc format
        response.push(convertToBuilderFormat(collection[i], '0', {}, colorMap));
        // check if current taxonomy has terms
        if(terms.length > 0){
            // loop for terms inside a taxonomy
            for(let j = 0; j < terms.length; j++){
                // store termid vs their proxyid in a termProxyMap.
                termProxyMap[terms[j].id] = terms[j].proxyId;
                // convert each term into builder doc format.
                response.push(convertToBuilderFormat(terms[j], collection[i].id, termProxyMap, colorMap));
            }
        }
    }
    // return final flatmap ( including taxonomies , terms and child terms ....) in builder format
    return response;
}

/**
 * converts passed data into builder doc format.
 * @param { Object } item - data to convert into builder format
 * @param { String } parentId - parent id of the item.
 * @param { Object } termProxyMap - termProxyMap to find parent proxy of a term.
 * @param { Object } colorMap - colorMap to insert color into builder doc against taxonomy id.
 * @returns { Object } - data in builder format.
 */
function convertToBuilderFormat(item, taxonomyId, termProxyMap, colorMap){
    let format = {
        "last-modified": { by:"", time:Date.now() },
        meta: { name:"" },
        parentid: null,
        _id: null
    }

    /* 
    if taxonomy put parentid = 0
    if parentTerm put parentid = taxonomyId 
    if childterm  put parentid = proxyid of parent term 
    */
    format.parentid = item.label == 'taxonomy' ? "0": (item.parentId == ""? taxonomyId: termProxyMap[item.parentId]);
    /* 
    if taxonomy put _id = id of taxonomy
    if term put _id = proxy id of that term 
    */
    format._id  =  item.label == 'taxonomy' ? item.id : item.proxyId;
    // put rest of data into meta node
    format.meta = item;
    format.meta.name = item.name;

    // if taxonomy put theme into its meta node and delete terms node as it is not needed.
    if( item.label == 'taxonomy'){
        format.meta.theme = colorMap[item.id] || 'black';
        delete format.meta.terms;
    }
    // delete unused parentId to avoid confusion
    delete format.meta.parentId;
    return format;
}


module.exports = { getAllDocs }