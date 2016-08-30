A web interface for the [pyspatiotemporalgeom](https://pypi.python.org/pypi/pyspatiotemporalgeom/) package.

### Features
* Use Google Maps to create a polygon for selecting an area.

### Libraries
This web application is built in Python2 using the Flask web framework.  
[pyspatiotemporalgeom](https://pypi.python.org/pypi/pyspatiotemporalgeom/) an open source geometry processing library focusing on regions and moving regions.

### Installation
Clone the repository
```bash
git clone https://github.com/jflowaa/spatiotemoralgeom_interface.git
```

Create a virtual environment and activate it.

To install virtualenv
```bash
pip install virtualenv
```

To create a virtual environment and activate
```bash
cd spatiotemoralgeom_interface/
virtualenv -p python2.7 venv
source venv/bin/activate
```

Install the packages
```bash
pip install -r requirements.txt
```

Then run the application
```bash
python run.py run
```
The application is now running at: http://0.0.0.0:5000
### Todo
- [ ] Everything
