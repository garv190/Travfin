from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import jwt
from functools import wraps
import bcrypt
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string
import datetime
from werkzeug.utils import secure_filename
import math


load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["https://travfin-carefree-travel.netlify.app"])

client = MongoClient(os.getenv('MONGO_URI'))
db = client.travfin


users = db.users
temp_users = db.temp_users
trips = db.trips
transactions = db.transactions
invitations = db.invitations


JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
JWT_REFRESH_SECRET_KEY = os.getenv('JWT_REFRESH_SECRET_KEY')


EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')


def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

def send_email(to, subject, body):
    msg = MIMEMultipart()
    msg['From'] = EMAIL_USER
    msg['To'] = to
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)

# Authentication Decorator
def authenticate_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        # Check cookies first
        if 'accesstoken' in request.cookies:
            token = request.cookies.get('accesstoken')
        # Then check Authorization header
        elif 'Authorization' in request.headers:
            auth_header = request.headers.get('Authorization')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        if not token:
            return jsonify({'message': 'Unauthorized - No token provided', 'success': False}), 401
        try:
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            current_user = users.find_one({'_id': ObjectId(data['id'])})  
            if not current_user:
                return jsonify({'message': 'User not found', 'success': False}), 404
            request.user = current_user
        except Exception as e:
            return jsonify({'message': 'Invalid or expired token', 'success': False}), 403
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def home():
    return jsonify({'message': 'Welcome to this page'})

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    confirmpassword = data.get('confirmpassword')
   
    if not all([name, email, password, confirmpassword]):
        return jsonify({'success': False, 'message': 'All fields are required'}), 400
    if password != confirmpassword:
        return jsonify({'success': False, 'message': 'Passwords do not match'}), 400
 
    if users.find_one({'email': email}) or temp_users.find_one({'email': email}):
        return jsonify({'success': False, 'message': 'User already exists or verification pending'}), 400
    
    otp = generate_otp()
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    temp_users.insert_one({
        'name': name,
        'email': email,
        'password': hashed_pw,
        'otp': otp,
        'created_at': datetime.datetime.utcnow()
    })
    # Send verification email
    send_email(
        to=email,
        subject='Email Verification OTP',
        body=f'Your OTP for verification is: {otp}'
    )
    return jsonify({'success': True, 'message': 'OTP sent to email'}), 200

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    temp_user = temp_users.find_one({'email': email})
    if not temp_user or temp_user['otp'] != otp:
        return jsonify({'success': False, 'message': 'Invalid OTP or email'}), 400
    # Create permanent user
    users.insert_one({
        'name': temp_user['name'],
        'email': temp_user['email'],
        'password': temp_user['password'],
        'created_at': datetime.datetime.utcnow(),
        'refreshtoken': None
    })
    # Cleanup temp user
    temp_users.delete_one({'_id': temp_user['_id']})
    return jsonify({'success': True, 'message': 'Account verified successfully'}), 200

@app.route('/signin', methods=['POST'])
def signin():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = users.find_one({'email': email})
    if not user:
        return jsonify({'message': 'User does not exist'}), 404
    if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({'message': 'Invalid password'}), 400
    # Generate tokens
    access_token = jwt.encode(
        {'id': str(user['_id'])},
        JWT_SECRET_KEY,
        algorithm='HS256'
    )
    refresh_token = jwt.encode(
        {'id': str(user['_id'])},
        JWT_REFRESH_SECRET_KEY,
        algorithm='HS256'
    )
    # Update user with refresh token
    users.update_one(
        {'_id': user['_id']},
        {'$set': {'refreshtoken': refresh_token}}
    )
    # Create response with cookies
    response = make_response(jsonify({
        'success': True,
        'accesstoken': access_token,
        'refreshToken': refresh_token,
        'message': 'User logged in',
        'user': {
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email']
        }
    }))
    response.set_cookie(
        'accesstoken',
        access_token,
        httponly=True,
        secure=True,
        samesite='None',
        path='/'
    )
    response.set_cookie(
        'refreshToken',
        refresh_token,
        httponly=True,
        secure=True,
        samesite='None',
        path='/'
    )
    return response, 200

# Trip Management 
@app.route('/trips', methods=['POST'])
@authenticate_token
def create_trip():
    data = request.json
    trip_name = data.get('tripName')
    participant_emails = data.get('participantEmails')
    # emails
    if isinstance(participant_emails, str):
        email_list = [e.strip().lower() for e in participant_emails.split(',')]
    elif isinstance(participant_emails, list):
        email_list = [str(e).strip().lower() for e in participant_emails]
    else:
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400
    # Find participants
    participants = list(users.find({'email': {'$in': email_list}}))
    participant_ids = [ObjectId(p['_id']) for p in participants]
    # Create trip
    trip_id = trips.insert_one({
        'name': trip_name,
        'creator': ObjectId(request.user['_id']),
        'participants': [ObjectId(request.user['_id'])] + participant_ids,
        'transactions': [],
        'created_at': datetime.datetime.utcnow()
    }).inserted_id
    # Send invitations
    creator = request.user
    for participant in participants:
        # Generate invitation token
        invitation_token = jwt.encode(
            {'tripId': str(trip_id), 'userId': str(participant['_id'])},
            JWT_SECRET_KEY,
            algorithm='HS256'
        )
        # Save invitation
        invitations.insert_one({
            'trip_id': trip_id,
            'user_id': participant['_id'],
            'token': invitation_token,
            'status': 'pending',
            'created_at': datetime.datetime.utcnow()
        })
        # Send email
        invitation_link = f"https://travfin-carefree-travel.netlify.app/join-trip/{trip_id}?token={invitation_token}"
        send_email(
            to=participant['email'],
            subject=f"Join Trip: {trip_name}",
            body=f"You've been invited to join {trip_name}. Click here: {invitation_link}"
        )
    return jsonify({
        'success': True,
        'trip': {
            '_id': str(trip_id),
            'name': trip_name,
            'creator': {
                '_id': str(request.user['_id']),
                'name': request.user['name']
            }
        }
    }), 201

if __name__ == '__main__':
    app.run(port=int(os.getenv('PORT', 3500)), debug=True)