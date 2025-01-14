const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom login endpoint
server.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = router.db.get('users').find({ username, password }).value();
    if (user) {
        res.status(200).json({ token: user.token });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

server.use(router);
server.listen(5001, () => {
    console.log('Custom JSON Server is running on port 5001');
});
