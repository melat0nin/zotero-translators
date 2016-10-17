{
	"translatorID": "43b6b1f5-d27a-4b79-a19f-4f0feb5275d7",
	"label": "Freemind v2",
	"creator": "Laurence Diver",
	"target": "mm",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 50,
	"configOptions": {
		"getCollections": true
	},
	"inRepository": false,
	"translatorType": 2,
	"lastUpdated": "2016-10-16 11:46:00"
}

/* Set up XML */
var parser = new DOMParser();
var doc = parser.parseFromString('<map/>', 'application/xml');
//doc.removeChild(document.Element);
//var map = doc.createElement("map");
var mapVersion = doc.createAttribute("version");
mapVersion.value = "1.0.1";
doc.documentElement.setAttributeNode(mapVersion);
var rootNode = doc.createElement("node");

/* Colours */
var green = "#007439";
var red = "#990066";

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
		collections[collection.primary.key].title = collection.fields.name;
		collections[collection.primary.key].articles = {};
	}
    return collections;
}



/* Generic XML node attribute creator */
Element.prototype.setAttributes = function (attrs) {
    for (var idx in attrs) {
        this.setAttribute(idx, attrs[idx]);
    }
}

Element.prototype.addChild = function (name, attributes, children) {
    var c = doc.createElement(name);
    c.setAttributes(attributes);
    if (typeof children != 'undefined' && children instanceof Array) {  // Add any specified children
        for (var i=0; i< children.length; i++) {
            c.addChild(children[i].name, children[i].attrs);
        }
    }
    this.appendChild(c);
}



// foreach($array as $idx=>$child) {
//}

function doExport() {
    
    articles = getArticles();    
    collections = getCollections();
    
	// Sort articles into their respective collection(s)
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
    
    /*for (var idx in articles) {
        var artCollections = articles[idx].collections;
        for (var j=0;j<artCollections.length;j++) {
            collections[artCollections[j]].articles[idx].push(thisArticle);
        }
    }*/
    
    Zotero.write(JSON.stringify(collections));
    //Zotero.write(JSON.stringify(articles));
    
	//Zotero.write('<?xml version="1.0" encoding="UTF-8"?>\n');
	//var serializer = new XMLSerializer();
	//Zotero.write(serializer.serializeToString(doc));
}


function doE1xport() {
    var tmpArticles = new Array();
	var articles = getItems();
    var collections = getCollections();

	for(var i=0; i < collections.length; i++) {	// Loop through parent collections

        thisCollection = collections[i];
        var collectionObj = doc.createElement("node");
        collectionObj.setAttributes({
            "text"      :   thisCollection.name,
            "id"        :   thisCollection.id,
            "position"  :   (i % 2 == 0) ? "left" : "right"
        });
        
    
		// Set up any child collection nodes
		var descendents = thisCollection.descendents;
		for (var j=0; j < descendents.length; j++) {	// Loop descendents
			var thisDescendent = descendents[j];
			if (thisDescendent.type === "collection") {	// Descendent is a collection, set up node
				
                var childCollectionObj = doc.createElement("node");
                childCollectionObj.setAttributes({
                    "text"      :   thisDescendent.name,
                    "id"        :   thisDescendent.id
                });
                childCollectionObj.addChild("cloud", {
                    "color"     :   "#ffffff"
                });
                
                
                
                
                


				var childItems = thisDescendent.children;
				for (var k = 0; k < childItems.length; k++){ // Loop items
					var thisItem = childItems[k];
					if (thisItem.type === "item") {	// Set up item node
                    
                        var itemContributors = articles[thisItem.id].contributors, contributorsString = '';
                        for(var l = 0; l < itemContributors.length; l++) {
							if (l == 2) {	// Max 2 authors displayed
								contributorsString += "...  ";
								break; 
							}
							contributorsString += itemContributors[l] + ", ";
						}
                        childCollectionObj.addChild("node", {
                           "text"   :   "[" + articles[thisItem.id].date + " " + contributorsString.substring(0, (contributorsString.length-2)) + "] " + articles[thisItem.id].title,
                           "id"     :   thisItem.id,
                           "color"  :   ""
                        }, [{
                            name    :   "icon",
                            attrs   :   {
                            }
                        }]);
                    
                    /*
						var itemObj = doc.createElement("node"); // item
						var itemTitle = doc.createAttribute("text");
						//var itemDate = doc.createAttribute("date");
						var itemID = doc.createAttribute("id");
						var itemColour = doc.createAttribute("color");
						//var itemContributors = articles[thisItem.id].contributors, contributorsString = '';
						var itemRead = doc.createElement("icon");
						var itemReadIcon = doc.createAttribute("builtin");
						
						itemTitle.value = "[" + articles[thisItem.id].date + " " + contributorsString.substring(0, (contributorsString.length-2)) + "] " + articles[thisItem.id].title;
						itemObj.setAttributeNode(itemTitle);
						//itemDate.value = articles[thisItem.id].date
						//itemObj.setAttributeNode(itemDate);
						itemID.value = thisItem.id;
						itemObj.setAttributeNode(itemID);
						
						// Green and red tags (core and important)
						if (articles[thisItem.id].tags.indexOf("Core") > -1) {	
							itemColour.value = green;
						} else if (articles[thisItem.id].tags.indexOf("Important") > -1) {
							itemColour.value = red;
						}
						itemObj.setAttributeNode(itemColour);
						
						// Read/unread icon, from tag
						if (articles[thisItem.id].tags.indexOf("Unread") > -1) {	// Read/unread tags
							itemReadIcon.value = "help";
						} else {
							itemReadIcon.value = "button_ok";
						}
						itemRead.setAttributeNode(itemReadIcon);
						itemObj.appendChild(itemRead);
		
	
						*/

						/* Subnodes for individual contributors -- commented out because Freemind ignores it
						var itemContributors = articles[thisItem.id].contributors;
						for(var l = 0; l < itemContributors.length; l++) {
							var contributorObj = doc.createElement("contributor");
							var contributorName = doc.createTextNode( itemContributors[l] );
							contributorObj.appendChild(contributorName);
							itemObj.appendChild(contributorObj);
						}*/

						//childCollectionObj.appendChild(itemObj);	// Add item to child collection
					}
				}

				collectionObj.appendChild(childCollectionObj);	// Add child collection to parent

			} /*else if (thisDescendent.type === "item") {
				var itemObj = doc.createElement("node"); // item
				var itemTitle = doc.createAttribute("text");
				//var itemDate = doc.createAttribute("date");
				var itemID = doc.createAttribute("id");
				var itemColour = doc.createAttribute("color");
				var itemContributors = articles[thisDescendent.id].contributors, contributorsString = '';
				var itemRead = doc.createElement("icon");
				var itemReadIcon = doc.createAttribute("builtin");
				for(var l = 0; l < itemContributors.length; l++) {
					if (l == 2) {	// Max 2 authors displayed
						contributorsString += "...  ";
						break; 
					}
					contributorsString += itemContributors[l] + ", ";
				}
				itemTitle.value = "[" + articles[thisDescendent.id].date + " " + contributorsString.substring(0, (contributorsString.length-2)) + "] " + articles[thisDescendent.id].title;
				itemObj.setAttributeNode(itemTitle);
				//itemDate.value = articles[thisDescendent.id].date;
				//itemObj.setAttributeNode(itemDate);
				itemID.value = thisDescendent.id;
				itemObj.setAttributeNode(itemID);
				
				// Green and red tags (core and important)
				if (articles[thisDescendent.id].tags.indexOf("Core") > -1) {
					itemColour.value = green;
				} else if (articles[thisDescendent.id].tags.indexOf("Important") > -1) {
					itemColour.value = red;
				}
				itemObj.setAttributeNode(itemColour);
				
				// Read/unread tags
				if (articles[thisDescendent.id].tags.indexOf("Unread") > -1) {	
					itemReadIcon.value = "help";
				} else {
					itemReadIcon.value = "button_ok";
				}
				itemRead.setAttributeNode(itemReadIcon);
				itemObj.appendChild(itemRead);
				
				/* Subnodes for individual contributors -- commented out because Freemind ignores it
				var itemContributors = articles[thisDescendent.id].contributors;
				for(var l = 0; l < itemContributors.length; l++) {
					var contributorObj = doc.createElement("contributor");
					var contributorName = doc.createTextNode( itemContributors[l] );
					contributorObj.appendChild(contributorName);
					itemObj.appendChild(contributorObj);
				}*!/
				
				collectionObj.appendChild(itemObj);	// Add item to child collection
			} */
		}

		// TODO add items for this (parent) collection

		rootNode.appendChild(collectionObj);
		doc.documentElement.appendChild(rootNode);
		//doc.documentElement.appendChild(collectionObj);
	}

	Zotero.write(JSON.stringify(articles));
	//Zotero.write('<?xml version="1.0" encoding="UTF-8"?>\n');
	//var serializer = new XMLSerializer();
	//Zotero.write(serializer.serializeToString(doc));

}

														