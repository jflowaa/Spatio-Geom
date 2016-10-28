A web interface for the [pyspatiotemporalgeom](https://pypi.python.org/pypi/pyspatiotemporalgeom/) package.

### Features
* Use Google Maps to create a polygon for selecting an area
* Manage created regions, such as delete, hide/show, or run computations
* Regions stored on server allowing for restore for later use

### Libraries
This web application is built in Python2 using the Flask web framework.  
[pyspatiotemporalgeom](https://pypi.python.org/pypi/pyspatiotemporalgeom/) an open source geometry processing library focusing on regions and moving regions.  
Sessions are saved in memory using [Redis](http://redis.io/).

### Installation
Install Redis, instructions can be found [here](http://redis.io/topics/quickstart).

Clone the repository
```bash
git clone https://github.com/jflowaa/Spatio-Geom.git
```

Create a virtual environment and activate it.

To install virtualenv
```bash
pip install virtualenv
```

To create a virtual environment and activate
```bash
cd Spatio-Geom/
virtualenv -p python2.7 venv
source venv/bin/activate
```

Install the packages
```bash
pip install -r requirements.txt
```
Start the redis-server
```bash
redis-server
```

Then run the application
```bash
python run.py run
```
The application is now running at: http://0.0.0.0:5000
### Todo
- [x] Draw a polygon on a map to generate a region for processing
- [x] Decide on a UI
- [x] Map intersections and unions
- [x] Only run computations on selected regions
- [x] Manage regions. Such as delete, hide, clear map
- [x] Select regions on map and hide/delete it from a context menu
- [ ] Import regions from database
- [x] Restore session feature
