{
	"translatorID": "laurence123",
	"label": "Mind Map",
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
	"lastUpdated": "2016-10-13 08:45:20"
}

var parser = new DOMParser();
var doc = parser.parseFromString('<map/>', 'application/xml');
//doc.removeChild(document.Element);
//var map = doc.createElement("map");
var mapVersion = doc.createAttribute("version");
mapVersion.value = "1.0.1";
doc.documentElement.setAttributeNode(mapVersion);

var rootNode = doc.createElement("node");

var green = "#007439";
var red = "#990066";

function doExport() {
    var tmpArticles = new Array();
	var articles = {};
    var collections = new Array();

    while (item = Zotero.nextItem()) {  // Articles for direct reference later
        articles[item.itemID] = {};
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

        //tmpArticles.push(item);
    }


    var childCollectionIDs = new Array();
    while(collection = Zotero.nextCollection()) {	// First grab all the collections	

		// Check if current collection has children
		// If it does, add them but then ignore them subsequently (so they aren't repeated)

		childIDs = collection.childCollections;
		for(var i=0;i<childIDs.length;i++){
			childCollectionIDs.push(childIDs[i]);
		}

		if (childCollectionIDs.indexOf(collection.primary.collectionID) === -1) { // Push if not a child collection
			collections.push(collection);
		}
	}

	for(var i=0; i < collections.length; i++) {	// Loop through parent collections

		// Set up parent collection node
		thisCollection = collections[i];
		var collectionObj = doc.createElement("node"); // Collection
		var collectionTitle = doc.createAttribute("text");
		var collectionID = doc.createAttribute("id");
		var collectionPos = doc.createAttribute("position");
		//var cloud = doc.createElement("cloud");
		//collectionObj.appendChild(cloud);
		collectionTitle.value = thisCollection.name;
		collectionObj.setAttributeNode(collectionTitle);
		collectionID.value = thisCollection.id;
		collectionObj.setAttributeNode(collectionID);
		collectionPos.value = (l % 2 == 0) ? "left" : "right";
		collectionObj.setAttributeNode(collectionPos);

		// Set up any child collection nodes
		var descendents = thisCollection.descendents;
		for (var j=0; j < descendents.length; j++) {	// Loop descendents
			var thisDescendent = descendents[j];
			if (thisDescendent.type === "collection") {	// Descendent is a collection, set up node
				var childCollectionObj = doc.createElement("node"); // Collection
				var childCollectionTitle = doc.createAttribute("text");
				var childCollectionID = doc.createAttribute("id");
				var childCollectionPos = doc.createAttribute("position");
				var cloud = doc.createElement("cloud");
				var cloudColour = doc.createAttribute("color");
				cloudColour.value = "#ffffff";
				cloud.setAttributeNode(cloudColour);
				childCollectionObj.appendChild(cloud);
				childCollectionTitle.value = thisDescendent.name;
				childCollectionObj.setAttributeNode(childCollectionTitle);
				childCollectionID.value = thisDescendent.id;
				childCollectionObj.setAttributeNode(childCollectionID);
				childCollectionPos.value = (l % 2 == 0) ? "left" : "right";
				childCollectionObj.setAttributeNode(childCollectionPos);


				var childItems = thisDescendent.children;
				for (var k = 0; k < childItems.length; k++){ // Loop items
					var thisItem = childItems[k];
					if (thisItem.type === "item") {	// Set up item node
						var itemObj = doc.createElement("node"); // item
						var itemTitle = doc.createAttribute("text");
						//var itemDate = doc.createAttribute("date");
						var itemID = doc.createAttribute("id");
						var itemColour = doc.createAttribute("color");
						var itemContributors = articles[thisItem.id].contributors, contributorsString = '';
						var itemRead = doc.createElement("icon");
						var itemReadIcon = doc.createAttribute("builtin");
						for(var l = 0; l < itemContributors.length; l++) {
							if (l == 2) {	// Max 2 authors displayed
								contributorsString += "...  ";
								break; 
							}
							contributorsString += itemContributors[l] + ", ";
						}
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
		
	
						

						/* Subnodes for individual contributors -- commented out because Freemind ignores it
						var itemContributors = articles[thisItem.id].contributors;
						for(var l = 0; l < itemContributors.length; l++) {
							var contributorObj = doc.createElement("contributor");
							var contributorName = doc.createTextNode( itemContributors[l] );
							contributorObj.appendChild(contributorName);
							itemObj.appendChild(contributorObj);
						}*/

						childCollectionObj.appendChild(itemObj);	// Add item to child collection
					}
				}

				collectionObj.appendChild(childCollectionObj);	// Add child collection to parent

			} else if (thisDescendent.type === "item") {
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
				}*/
				
				collectionObj.appendChild(itemObj);	// Add item to child collection
			}
		}

		// TODO add items for this (parent) collection

		rootNode.appendChild(collectionObj);
		doc.documentElement.appendChild(rootNode);
		//doc.documentElement.appendChild(collectionObj);
	}

	//Zotero.write(JSON.stringify(articles));
	Zotero.write('<?xml version="1.0" encoding="UTF-8"?>\n');
	var serializer = new XMLSerializer();
	Zotero.write(serializer.serializeToString(doc));

}

														