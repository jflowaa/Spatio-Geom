#**Structure and Work-Flow**

### Program Structure
>The application is structured as a large scale Flask application. The application is currently broken into two blueprints. Main and API. Blueprints allows us to keep a clean structured difference between sections of the application. This also allows for any future add-ons to the application to be done seamlessly. Main is used for generating the HTML to present to the user. API is used for the communication between user and server interaction.
>
>AJAX requests are used as the middle man between user and server communication. This allows for processes to happen in the background while the user continues using the application, it also allows for progress dialogs. 
>

### Work-Flow
>We will be following the git flow model. What this means is that each feature or issue is separate from other features and issues. Each person on the team will be assigned feature and issue sets. Each of these will have its own branch. 

>When that feature or issue is complete the person will start a pull-request onto the master branch. During this pull-request each member of the team will review the code that is being committed, if it passes each of our reviews, then the code is merged into the master branch and now that feature/issue is implemented/fixed. If it does not pass our reviews then the commiter needs to fix what issues were discovered during the review and re-commit.

>This work-flow works well for us do to it’s agile nature and easy way to keep our work separate from each other. Because of this we will have less merge conflicts and with the code reviews our code base will be, in theory, structured in a clean and organized fashion. It also allows for us to go off and test other features without disturbing any one else’s work-flow. And, finally, this also allows for an easy way to revert unwanted changes. 

