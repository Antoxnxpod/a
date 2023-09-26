// 1. Import necessary packages:
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

// 2. Define interfaces to represent a Document in MongoDB:
interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
}

// 3. Create User Schema:
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

// 4. Create User Model:
const User = mongoose.model<IUser>('User', UserSchema);

// 5. Create Server:
class Server {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    public config() {
        // 6. Setting up mongoose and express middleware
        const MONGO_URI = 'mongodb://localhost/myapp';
        mongoose.set('useFindAndModify', false);
        mongoose.set('useCreateIndex', true);
        mongoose.set('useNewUrlParser', true);
        mongoose.set('useUnifiedTopology', true);
        mongoose
            .connect(MONGO_URI || process.env.MONGODB_URL)
            .then(() => {
                console.log('Connected to the database');
            })
            .catch((err) => {
                console.log('MongoDB Connection Failed', err);
            });
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cors());
    }

    public routes(): void {
        const router = express.Router();

        // 7. Router middleware for creating a new user
        router.post('/new-user', async (req, res) => {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });

            await newUser.save((err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ message: 'User created successfully' });
                }
            });
        });

        // 8. Router middleware for getting all users
        router.get('/users', async (req, res) => {
            const users = await User.find((err, users) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send(users);
                }
            });
        });

        // 9. Router middleware for getting user by ID
        router.get('/users/:id', async (req, res) => {
            const users = await User.findById(req.params.id, (err, users) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send(users);
                }
            });
        });

        // 10. Router middleware for
        router.put('/users/:id', async (req, res) => {
            await User.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, user) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send(user);
                }
            });
        });

        // 11. Router middleware for deleting a user by ID
        router.delete('/users/:id', async (req, res) => {
            await User.findByIdAndRemove(req.params.id, (err, user) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ message: 'User deleted successfully' });
                }
            });
        });

        // Add the router to the main app
        this.app.use('/', router);
    }

    public start() {
        // 12. Start the server
        const PORT = process.env.PORT || 3000;
        this.app.listen(PORT, () => {
            console.log('Server is running on port ' + PORT);
        });
    }
}

// 13. Create an instance of the server
const server = new Server();

// 14. Start the server
server.start();
