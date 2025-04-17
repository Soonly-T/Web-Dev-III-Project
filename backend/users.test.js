const request = require('supertest');
const express = require('express');
const usersRoutes = require('./routes/users/users'); // Adjust the path to your users.js file
const dbOperations = require('../database/dbOperations');
const encrypt = require('./encrypt.js');
const jwtUtil = require('./middleware/jwt');

// Mock the dbOperations module
jest.mock('../database/dbOperations', () => ({
    addUser: jest.fn(),
    getUser: jest.fn(),
}));

// Mock the encrypt module
jest.mock('encrypt.js', () => ({
    encrypt: jest.fn().mockResolvedValue('hashedPassword'),
    comparePassword: jest.fn(),
}));

// Mock the jwt module
jest.mock('./middleware/jwt', () => ({
    generateAccessToken: jest.fn().mockReturnValue('mockedAccessToken'),
}));

// Create a new Express app instance for testing
const app = express();
app.use(express.json());
app.use('/auth', usersRoutes);

describe('User Authentication Routes', () => {
    beforeEach(() => {
        // Clear mock calls before each test
        dbOperations.addUser.mockClear();
        encrypt.encrypt.mockClear();
        encrypt.comparePassword.mockClear();
        jwtUtil.generateAccessToken.mockClear();
        dbOperations.getUser.mockClear();
    });

    describe('POST /auth/signup', () => {
        it('should successfully sign up a new user', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            };

            const response = await request(app)
                .post('/auth/signup')
                .send(userData);

            expect(response.statusCode).toBe(200); // Assuming your signup returns 200 on success
            expect(dbOperations.addUser).toHaveBeenCalledWith(
                userData.username,
                userData.email,
                'hashedPassword'
            );
            expect(encrypt.encrypt).toHaveBeenCalledWith(userData.password);
        });

        it('should return 400 if required fields are missing', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
            };

            const response = await request(app)
                .post('/auth/signup')
                .send(userData);

            expect(response.statusCode).toBe(400); // Or another appropriate error code
            expect(dbOperations.addUser).not.toHaveBeenCalled();
            expect(encrypt.encrypt).not.toHaveBeenCalled();
        });

        // You can add more test cases for signup, such as:
        // - Handling duplicate usernames/emails (if implemented in dbOperations)
        // - Password validation rules (if implemented)
    });

    describe('POST /auth/login', () => {
        it('should successfully log in a user with correct credentials', async () => {
            const loginData = {
                loginIdentifier: 'testuser',
                password: 'password123',
            };

            encrypt.comparePassword.mockResolvedValue(true);
            dbOperations.getUser.mockReturnValue({ id: 1, username: 'testuser', email: 'test@example.com' });

            const response = await request(app)
                .post('/auth/login')
                .send(loginData);

            expect(response.statusCode).toBe(200);
            expect(encrypt.comparePassword).toHaveBeenCalledWith(
                loginData.loginIdentifier,
                loginData.password
            );
            expect(dbOperations.getUser).toHaveBeenCalledWith(loginData.loginIdentifier);
            expect(jwtUtil.generateAccessToken).toHaveBeenCalledWith({ id: 1, username: 'testuser', email: 'test@example.com' });
            expect(response.body).toHaveProperty('token', 'mockedAccessToken');
            expect(response.body).toHaveProperty('message', 'Login successful');
        });

        it('should return 401 for incorrect password', async () => {
            const loginData = {
                loginIdentifier: 'testuser',
                password: 'wrongpassword',
            };

            encrypt.comparePassword.mockResolvedValue(false);

            const response = await request(app)
                .post('/auth/login')
                .send(loginData);

            expect(response.statusCode).toBe(401);
            expect(encrypt.comparePassword).toHaveBeenCalledWith(
                loginData.loginIdentifier,
                loginData.password
            );
            expect(dbOperations.getUser).not.toHaveBeenCalled();
            expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
            expect(response.body).toHaveProperty('message', 'Password does not match with the username or email');
        });

        it('should return 401 if user is not found', async () => {
            const loginData = {
                loginIdentifier: 'nonexistentuser',
                password: 'password123',
            };

            encrypt.comparePassword.mockRejectedValue(new Error('User not found'));

            const response = await request(app)
                .post('/auth/login')
                .send(loginData);

            expect(response.statusCode).toBe(401);
            expect(encrypt.comparePassword).toHaveBeenCalledWith(
                loginData.loginIdentifier,
                loginData.password
            );
            expect(dbOperations.getUser).not.toHaveBeenCalled();
            expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
            expect(response.body).toHaveProperty('message', 'Username or Email is incorrect');
        });

        it('should return 400 if loginIdentifier or password is missing', async () => {
            const loginData = {
                password: 'password123',
            };

            const response = await request(app)
                .post('/auth/login')
                .send(loginData);

            expect(response.statusCode).toBe(400); // Or another appropriate error code
            expect(encrypt.comparePassword).not.toHaveBeenCalled();
            expect(dbOperations.getUser).not.toHaveBeenCalled();
            expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
        });

        // You can add more test cases for login, such as:
        // - Handling database errors during login
    });
});