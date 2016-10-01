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
  * Improve the `region list` tab on the frontend
  * When selecting/clicking a region in the `region list` the polygon on the map should outline. This will help the user identify the region in the list easier besides color matching.
  * This will also help `feature10` if the plan for the frontend goes as planned
  * Add a slider to 3D regions. No functionality yet
    * The polygon object found in `main.js` will need a new attribute to define itself as 3D

Feature 11
  * Allow the user to create multiple polygons for one region
  * Computations that return multiple regions should be merged into one region
  * For the backend: I'm thinking polygon object found in `main.js` will have a new attribute: `groupId`. This will allow the server to know what is a region with multiple regions
  * For the frontend: The user needs to be able to draw polygons and make them a group a polygons. My current idea is allow the user to continue to do how it is now. If the user wants two polygons to be a group, then within the `region list` tab, the user can click and drag one of the regions onto another region, this will merge the two regions, this process continutes for more regions

Feature 12
  * There is a database of created regions
  * Add the ability to import a dataset taken from the database and map these imported regions
  * There is currently a button that is disabled, this is the current plan of implementation:
    * Upon button click a model window is shown
    * This window has data sets to choose from
    * Option to close window and option to import selected region
    * The dataset will need to be iterated and converted into regions. Stored in session. Converted to coordinates and sent to frontend to map.
