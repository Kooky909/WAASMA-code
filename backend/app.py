from flask import Flask, request, jsonify
import json
from bson import json_util, ObjectId
from flask_cors import CORS
from db_config import user_collection

app = Flask(__name__)
#CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route("/users", methods=["GET"])
def get_users():
    users_cursor = user_collection.find()
    # Convert documents to JSON format using bson's json_util
    json_users = list(map(lambda x: json.loads(json_util.dumps(x)), users_cursor))
    return jsonify({"users": json_users})


@app.route("/create_user", methods=["POST"])
def create_user():
    data = request.json

    if not data:
        return (
            jsonify({"message": "You must include a first name, last name and email"}),
            400,
        )
    
    try:
        user_collection.insert_one(data)
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "User created!"}), 201


@app.route("/update_user/<id>", methods=["PATCH"])
def update_user(id):
    user_id = {"_id": ObjectId(id)}  # Correctly format the user_id
    
    # Check if the user exists
    existing_user = user_collection.find_one(user_id)
    if not existing_user:
        return jsonify({"message": "User not found"}), 404

    data = request.json
    # Define the update operation
    update = {"$set": data}  # Use $set to update the specified fields
    user_collection.update_one(user_id, update)

    return jsonify({"message": "User updated."}), 200


@app.route("/delete_user/<id>", methods=["DELETE"])
def delete_user(id):
    user_id = {"_id": ObjectId(id)}  # Correctly format the user_id
    
    # Check if the user exists
    existing_user = user_collection.find_one(user_id)
    if not existing_user:
        return jsonify({"message": "User not found"}), 404

    result = user_collection.delete_one(user_id)

    return jsonify({"message": "User deleted!"}), 200


if __name__ == "__main__":
    app.run(debug=True)