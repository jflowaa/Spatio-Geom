from flask import render_template, url_for, flash, redirect, request
from . import main
from .. import utils


@main.route("/")
def index():
    return render_template("index.html")
