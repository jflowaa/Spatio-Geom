from flask import render_template, url_for, flash, redirect, request,\
 current_app
from . import main
from .. import utils


@main.route("/")
def index():
    context = {
        "GOOGLE_MAPS_KEY": current_app.config["GOOGLE_MAPS_KEY"]
    }
    return render_template("index.html", **context)
