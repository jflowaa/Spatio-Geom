#### Tasks
Feature 1
  * Convert a polygon into a region
  * The polygon needs to be sent to the backend to be able to do this

Feature 2
  * Allow multiple polygons to be drawn
  * Commuicate these polygons to the backend
  * Create regions from the polygons

Feature 3
  * Clear the map in a reasonable way
  * Allow the user to delete unwanted regions

Feature 4 
  * Implement intersection computation
  * Hide and show drawn regions
  * Give polygons colors, this will be used to help the user identify which region is which when shown in a list
  * Implement union computation

Feature 5
  * Redesign UI
  * Update backend to work with the new UI design
  * Mobile friendly
  * Flesh out the interactions between front end and back end
  
Feature 6
  * Add differences computation
  
Feature 7
  * Restore session
  * Clear session happens on load of page, this will need to be removed
  * Since we have the ability to clear the map, which also clears the session. I think restore session on load would be a nice feature
  * Performance doesn't see to be an issue if implemented

Feature 8
  * Another way to delete or hide a region on the map
  * Currently only one way, this way require the user to look at the map and then the list to be able to find the correct region to delete or hide, the ability to act on the map will be the process easier on the user

Feature 9
  * There is a database of created regions
  * Add the ability to import a dataset taken from the database and map these imported regions
  * There is currently a button that is disabled, this is the current plan of implementation:
    * Upon button click a model window is shown
    * This window has data sets to choose from
    * Option to close window and option to import selected region
    * The dataset will need to be iterated and converted into regions. Stored in session. Converted to coordinates and sent to frontend to map.

Feature 10
  * More computation options
  * There may need to be a way to select regions to run computations on, instead of hiding and showing regions
  * However, if `feature 8` works out well, this may not be an issue
