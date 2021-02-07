require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const SHA256 = require('crypto-js/hmac-sha256');
const jwtMiddleware = require('express-jwt');
const { Storage } = require('@google-cloud/storage');
const shortid = require('shortid');

const coffee = require('./coffee');
const tags = require('./tags');

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

const usersBucket = storage.bucket(process.env.USERS_BUCKET);
const ordersBucket = storage.bucket(process.env.ORDERS_BUCKET);

const JWT_MIDDLEWARE = jwtMiddleware({
  secret: process.env.WEB_TOKEN_SECRET,
  algorithms: ['HS256'],
});

const authenticator = (request, response, next) => {
  if (request.user.user) {
    next();
  } else {
    return response.sendStatus(401);
  }
};

const AUTH_MIDDLEWARE = [JWT_MIDDLEWARE, authenticator];

const signData = (data) =>
  jwt.sign(data, process.env.WEB_TOKEN_SECRET, {
    expiresIn: '1h',
  });

const toBuffer = (data) => Buffer.from(JSON.stringify(data));

const getBufferedFile = async (username, type = 'user') => {
  const bucket = type === 'user' ? usersBucket : ordersBucket;
  const file = bucket.file(username);
  const bufferedFile = await file
    .download()
    .then((data) => data[0])
    .catch(() => null);

  return { file, bufferedFile };
};

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/health', async (_, response) => {
  return response.sendStatus(200);
});

app.post('/login', async (request, response) => {
  const { username, password } = request.body;
  if (!password || !username) {
    return response
      .status(400)
      .send({ message: 'Missing username or password.' });
  }

  const userFile = usersBucket.file(username);

  const userExists = await userFile.exists();

  if (!userExists) {
    return response.status(404).send({ message: 'User not found.' });
  }

  const bufferedFile = await userFile.download().then((data) => data[0]);

  try {
    const user = JSON.parse(bufferedFile.toString());

    const { password: savedPassword, ...safeUser } = user;

    const hashedPassword = SHA256(
      password,
      process.env.PASSWORD_HASH_SECRET
    ).toString();

    if (savedPassword !== hashedPassword) {
      return response
        .status(401)
        .send({ message: 'Incorrect username or password.' });
    }

    const token = signData({
      user: safeUser,
    });

    return response.status(200).send({ token });
  } catch (e) {
    return response.status(500).send({ message: 'Unable to retrieve user.' });
  }
});

app.post('/signup', async (request, response) => {
  const { username, password } = request.body;

  if (!password || !username) {
    return response
      .status(400)
      .send({ message: 'Missing username or password.' });
  }

  const userFile = usersBucket.file(username);

  const user = await userFile
    .get()
    .then((data) => data[0])
    .catch(() => null);

  if (user) {
    return response.status(409).send({ message: 'User already exists.' });
  }

  const hashedPassword = SHA256(
    password,
    process.env.PASSWORD_HASH_SECRET
  ).toString();

  const userData = toBuffer({
    username,
    password: hashedPassword,
  });

  await userFile.save(userData);

  const token = signData({
    user: { username },
  });

  response.status(200).send({ token });
});

app.put('/password', AUTH_MIDDLEWARE, async (request, response) => {
  const {
    user: { username },
  } = request.user;
  const { password } = request.body;

  const { file, bufferedFile } = await getBufferedFile(username);

  if (!bufferedFile) {
    return response.status(404).send({ message: 'User not found.' });
  }
  let originalUser;
  try {
    originalUser = JSON.parse(bufferedFile.toString());

    const hashedPassword = SHA256(
      password,
      process.env.PASSWORD_HASH_SECRET
    ).toString();

    await file.save(
      toBuffer({
        ...originalUser,
        password: hashedPassword,
      })
    );

    return response.sendStatus(200);
  } catch (e) {
    // if something goes wrong, it deletes the file :/
    await file.save(toBuffer(originalUser));
    return response.status(500).send({ message: 'Unable to update password.' });
  }
});

app.get('/user', AUTH_MIDDLEWARE, async (request, response) => {
  const {
    user: { username },
  } = request.user;

  const { file, bufferedFile } = await getBufferedFile(username);

  if (!bufferedFile) {
    return response.status(404).send({ message: 'User not found.' });
  }
  try {
    const { password, ...userData } = JSON.parse(bufferedFile.toString());

    return response.status(200).send(userData);
  } catch (e) {
    // if something goes wrong, it deletes the file :/
    await file.save(toBuffer(originalUser));
    return response.status(500).send({ message: 'Unable to get user.' });
  }
});

app.put('/user', AUTH_MIDDLEWARE, async (request, response) => {
  const {
    user: { username },
  } = request.user;

  // Don't let them update password here lol
  const { username: u, password, ...data } = request.body;

  const { file, bufferedFile } = await getBufferedFile(username);

  if (!bufferedFile) {
    return response.status(404).send({ message: 'User not found.' });
  }
  let originalUser;
  try {
    originalUser = JSON.parse(bufferedFile.toString());
    const { password: savedPassword, username } = originalUser;

    const payload = { username, ...data };
    await file.save(
      toBuffer({
        password: savedPassword,
        ...payload,
      })
    );

    return response.status(200).send(payload);
  } catch (e) {
    // if something goes wrong, it deletes the file :/
    await file.save(toBuffer(originalUser));
    return response.status(500).send({ message: 'Unable to save user.' });
  }
});

// add user delete
app.delete('/user', AUTH_MIDDLEWARE, async (request, response) => {
  const {
    user: { username },
  } = request.user;

  const userFile = usersBucket.file(username);
  const orderFile = ordersBucket.file(username);

  const u = userFile
    .delete()
    .then(() => true)
    .catch(() => false);

  const o = await orderFile
    .delete()
    .then(() => true)
    .catch(() => false);

  const [delUser] = await Promise.all([u, o]);

  if (!delUser) {
    return response.status(404).send({ message: 'User not found.' });
  }

  return response.sendStatus(200);
});

app.get('/tags', AUTH_MIDDLEWARE, (_, response) => {
  return response.status(200).send(Object.values(tags));
});

app.get('/coffee', AUTH_MIDDLEWARE, (_, response) => {
  return response.status(200).send(Object.values(coffee));
});

app.get('/coffee/:id', AUTH_MIDDLEWARE, (request, response) => {
  const { id } = request.params;
  const coffee = coffee[id];

  if (!coffee) {
    return response.status(404).send({ message: 'Invalid coffee ID.' });
  }

  return response.status(200).send(coffee);
});

const orderMapper = ({ id, coffeeId, size, createdAt }) => {
  const { prices, ...selectedCoffee } = coffee[coffeeId];
  const price = selectedCoffee[size];
  const delivered = Date.now() - createdAt > 120000;

  return {
    ...selectedCoffee,
    id,
    coffeeId: coffeeId,
    paidPrice: price,
    delivered,
    size,
  };
};

app.get('/order', AUTH_MIDDLEWARE, async (request, response) => {
  const {
    user: { username },
  } = request.user;

  const { bufferedFile } = await getBufferedFile(username, 'order');

  if (!bufferedFile) {
    return response.status(200).send([]);
  }
  try {
    const orders = Object.values(JSON.parse(bufferedFile.toString()));

    const mappedOrders = orders.map(orderMapper);

    return response.status(200).send(mappedOrders);
  } catch (e) {
    return response.status(500).send({ message: 'Unable to get orders.' });
  }
});

app.get('/order/:id', AUTH_MIDDLEWARE, async (request, response) => {
  const {
    user: { username },
  } = request.user;
  const { id } = request.params;

  const { bufferedFile } = await getBufferedFile(username, 'order');

  if (!bufferedFile) {
    return response.sendStatus(404).send({ message: 'Unable to get order.' });
  }

  try {
    const orders = JSON.parse(bufferedFile.toString());
    const order = orders[id];

    if (!order) {
      return response.status(404).send({ message: 'Unable to get order.' });
    }

    return response.status(200).send(orderMapper(order));
  } catch (e) {
    return response.status(500).send({ message: 'Unable to get orders.' });
  }
});

app.delete('/order/:id', AUTH_MIDDLEWARE, async (request, response) => {
  const {
    user: { username },
  } = request.user;
  const { id } = request.params;

  const { file, bufferedFile } = await getBufferedFile(username, 'order');

  if (!bufferedFile) {
    return response.status(200).send(null);
  }

  try {
    const orders = JSON.parse(bufferedFile.toString());
    const order = orders[id];

    if (!order) {
      return response.status(404).send({ message: 'Unable to get order.' });
    }

    delete orders[id];
    await file.save(toBuffer(orders));

    return response.status(200).send(orderMapper(order));
  } catch (e) {
    return response.status(500).send({ message: 'Unable to get orders.' });
  }
});

app.post('/order', AUTH_MIDDLEWARE, async (request, response) => {
  const {
    user: { username },
  } = request.user;
  const { id, size } = request.body;

  const { file, bufferedFile } = await getBufferedFile(username, 'order');

  let originalOrder;
  try {
    originalOrder = bufferedFile ? JSON.parse(bufferedFile.toString()) : {};

    const orderId = shortid.generate();
    const newOrder = {
      id: orderId,
      coffeeId: id,
      size,
      createdAt: Date.now(),
    };

    const newOrders = {
      ...originalOrder,
      [orderId]: newOrder,
    };

    await file.save(toBuffer(newOrders));

    return response.status(200).send(orderMapper(newOrder));
  } catch (e) {
    // if something goes wrong, it deletes the file :/
    await file.save(toBuffer(originalOrder));
    return response.status(500).send({ message: 'Unable to complete order.' });
  }
});

app.put('/order/:id', AUTH_MIDDLEWARE, async (request, response) => {
  const {
    user: { username },
  } = request.user;
  const { id, size } = request.body;
  const { id: orderId } = request.params;

  const { file, bufferedFile } = await getBufferedFile(username, 'order');

  let originalOrder;
  try {
    originalOrder = bufferedFile ? JSON.parse(bufferedFile.toString()) : {};

    const newOrder = {
      id: orderId,
      coffeeId: id,
      size,
      createdAt: Date.now(),
    };

    const newOrders = {
      ...originalOrder,
      [orderId]: newOrder,
    };

    await file.save(toBuffer(newOrders));

    return response.status(200).send(orderMapper(newOrder));
  } catch (e) {
    // if something goes wrong, it deletes the file :/
    await file.save(toBuffer(originalOrder));
    return response.status(500).send({ message: 'Unable to complete order.' });
  }
});

app.use((_, response) => {
  return response.sendStatus(404);
});

app.listen(3000, () => {
  console.log(`App listening at http://localhost:3000`);
});
