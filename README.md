# Caffeinate - Coffee Delivery API

Faux API + database for learning purposes.

Part of my (upcoming) Udemy course on front end development!

This API is for a coffee delivery service, where customers can sign up and get coffee delivered to their front door!
Your job is to build the front end and ge this product rolling.

Your data will be stored for 3 days - so you can build a **tailored** app with **real** functions/users.

When demo day comes for your job interview or professor, you can show off your app working with and responding to real data.

# TODO

- [ ] Make the Udemy course

# Public facing API

There server can be accessed at `https://mock-server-uo5cf2letq-uw.a.run.app`

# Security

All passwords are hashed and data is saved in Google Cloud Storage to mock a database. Records are deleted after 3 days.

## Objects docs

There are 3 objects returned by this API: Users, Coffee, and Orders

## User object

The user object will always have a username, this cannot be changed once the user has been created.

However, you can add any other attributes you'd like to the user object.

Schema:

```javascript
{
  username: string,
  // additional optional attributes:
  firstName: any,
  address: any
}
```

## Coffee object

The coffee object represents a purchasable drinks from a coffee shop. It is a read only object.

Schema:

```javascript
{
    id: int,
    shop: string,
    name: string,
    description: string,
    prices: {
      large: float,
      medium: float,
      small: float,
    },
    tags: []string,
  }
```

## Orders object

The order object represents coffee orders for your customer

Schema:

```javascript
{
  id: string,
  shop: string,
  name: string,
  description: string,
  tags: []string,
  coffeeId: int,
  delivered: boolean
}
```

# API docs

This API uses Bearer Authentication Schema. Coffee orders will become `delivered` 2 minutes after the order is made.

## User API

The User API allows you to CRUD users

### Signup

Authentication: `no` <br />
Endpoint: `/signup` <br />
Method: `POST` <br />
Body: `{ username: USERNAME, password: PASSWORD } ` <br />
Response: `{ token: AUTH_TOKEN }` <br />

### Login

Authentication: `no` <br />
Endpoint: `/signup` <br />
Method: `POST` <br />
Body: `{ username: USERNAME, password: PASSWORD } ` <br />
Response: `{ token: AUTH_TOKEN }` <br />

### Update password

Authentication: `yes` <br />
Endpoint: `/password` <br />
Method: `PUT` <br />
Body: `{ password: NEW_PASSWORD } ` <br />

### Get user

Authentication: `yes` <br />
Endpoint: `/user` <br />
Method: `GET` <br />
Response: `User` <br />

### Update user

You can update any attribute you'd like other than `password`

Authentication: `yes` <br />
Endpoint: `/user` <br />
Method: `PUT` <br />
Body: `{ firstName: FIRST_NAME, ...OTHER_ATTRIBUTES }` <br />
Response: `User` <br />

### Delete user

Authentication: `yes` <br />
Endpoint: `/user` <br />
Method: `DELETE` <br />

## Coffee API

The Coffee API allows you to fetch all drinks deliverable via Caffeinate

### Get all coffee

Authentication: `yes` <br />
Endpoint: `/coffee` <br />
Method: `GET` <br />
Response: `[]Coffee`

### Get coffee by ID

Authentication: `yes` <br />
Endpoint: `/coffee/:id` <br />
Method: `GET` <br />
Response: `Coffee`

## Tags API

The Tags API allows you to fetch all the tags supported by Caffeinate

Tags allow you to filter which coffees you want to show your clients

### List tags

Authentication: `yes` <br />
Endpoint: `/tags` <br />
Method: `GET` <br />
Response: `[]string`

## Orders API

The orders API allows you to CRUD coffee orders for a user

### Get all orders

Authentication: `yes` <br />
Endpoint: `/orders` <br />
Method: `GET` <br />
Response: `[]Order` <br />

### Get order by ID

Authentication: `yes` <br />
Endpoint: `/order/:id` <br />
Method: `GET` <br />
Response: `Order` <br />

### Create an order

Authentication: `yes` <br />
Endpoint: `/order` <br />
Method: `POST` <br />
Body: `{ id: COFFEE_ID, size: COFFEE_SIZE }` <br />
Response: `Order`

### Update Order

And order cannot be updated after it has been delivered

Authentication: `yes` <br />
Endpoint: `/order/:id` <br />
Method: `PUT` <br />
Body: `{ id: COFFEE_ID, size: COFFEE_SIZE }` <br />
Response: `Order`

### Delete an order

Authentication: `yes` <br />
Endpoint: `/order/:id` <br />
Method: `DELETE` <br />
Response: `Order`
