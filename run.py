from app import create_app
from flask_script import Manager, Server, Shell

app = create_app('development')
manager = Manager(app)


def make_shell_context():
    return dict(app=app)

manager.add_command("shell", Shell(make_context=make_shell_context))
manager.add_command("run", Server(host="0.0.0.0", port=5000))

if __name__ == "__main__":
    manager.run()
