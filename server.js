const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('src/assets/db.json'); // დააკავშირე შენი JSON მონაცემები
const middlewares = jsonServer.defaults();


server.use(middlewares);

// დაამატე CORS header-ები (X-Total-Count გამჭვირვალე რომ გახდეს)
server.use((req, res, next) => {
    res.header('Access-Control-Expose-Headers', 'X-Total-Count');
    next();
});

server.use(router);

server.listen(3000, () => {
    console.log('JSON Server is running on port 3000');
});