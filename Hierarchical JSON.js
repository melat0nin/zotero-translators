{
	"translatorID": "0a1250df-1678-4b09-88ee-ce5b7578d62a",
	"label": "Hierarchical JSON",
	"creator": "Laurence Diver",
	"target": "json",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 50,
	"configOptions": {
		"getCollections": true
	},
	"inRepository": false,
	"translatorType": 2,
	"lastUpdated": "2016-10-17 12:00:00"
}

var collectionKeys = new Array();

/* Get articles object */
function getArticles() {
    var articles = {};
    while (item = Zotero.nextItem()) {
        articles[item.itemID] = {};
        articles[item.itemID].collections = item.collections;
        articles[item.itemID].title = item.title;
        articles[item.itemID].date = (typeof item.date != 'undefined') ? new Date(item.date).getFullYear() : 'N/A';
        articles[item.itemID].contributors = new Array();
        articles[item.itemID].tags = new Array();
        if (typeof item.creators != 'undefined' && item.creators instanceof Array) {
            var contributorsArray = new Array();
            for (var j = 0; j < item.creators.length; j++) {
                var name = item.creators[j].lastName;
                contributorsArray.push(name);
            }
            articles[item.itemID].contributors = contributorsArray;
        }
        if (typeof item.tags != 'undefined' && item.tags instanceof Array) {
            var tagsArray = new Array();
            for (var k = 0; k < item.tags.length; k++) {
                tagsArray.push(item.tags[k].tag);
            }
            articles[item.itemID].tags = tagsArray;
        }
    }
    return articles;
}

/* Get collections object */
function getCollections() {
    var collections = {};
    while(collection = Zotero.nextCollection()) {	// First grab all the collections	
		collections[collection.primary.key] = {};
		collections[collection.primary.key].parentKey = collection.fields.parentKey;
		collections[collection.primary.key].title = collection.fields.name;
		collections[collection.primary.key].articles = {};
		collections[collection.primary.key].collections = {};
        collectionKeys.push(collection.primary.key);
	}
    return collections;
}

function doExport() {
    
    articles = getArticles();    
    collections = getCollections();
    
	/*
    Add articles to their respective collection(s)
    */
    for (var key in articles) {
        if (!articles.hasOwnProperty(key)) continue; // skip loop if the property is from prototype
        var article = articles[key];
        var artCollections = article.collections;
        for(var i=0; i<artCollections.length; i++) {	// Loop collection keys this article is in
            var collectionKey = artCollections[i];	// Current collection key
			if (typeof collections[collectionKey] != 'undefined' && collections[collectionKey] instanceof Object) {
				collections[collectionKey].articles[key] = article;	
			}
        }
    }
    
    /* 
    Nest child collections 
    */
    var nestedCollections = new Array();
    for (var key in collections) {
        if (!collections.hasOwnProperty(key)) continue; // skip loop if the property is from prototype
        var collection = collections[key];
        if (collectionKeys.indexOf(collection.parentKey) > -1) {  // If a collection's parent isn't the root
            collections[collection.parentKey].collections[key] = collection;    // Nest this collection in its parent        
            nestedCollections.push(key);
        }
    }
    for(var i=0;i<nestedCollections.length;i++) {   // Delete nested collections from root level (they've been nested)
        delete collections[nestedCollections[i]];
    }
    
    /* Output */
    Zotero.write(JSON.stringify(collections));
}											