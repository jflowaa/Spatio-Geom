from flask import Flask
from flask_bootstrap import Bootstrap
from config import configs
from .main import main as main_blueprint
from .api import api as api_blueprint
from .redis_session_interface import RedisSessionInterface

bootstrap = Bootstrap()


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(configs[config_name])
    app.session_interface = RedisSessionInterface()
    configs[config_name].init_app(app)
    bootstrap.init_app(app)
    app.register_blueprint(main_blueprint)
    app.register_blueprint(api_blueprint, url_prefix="/api")
    print(app.url_map)
    return app
