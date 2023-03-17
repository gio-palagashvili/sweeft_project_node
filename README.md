
# sweeft_project_node

Sweeft back-end react internship test api.



## Installation

install with npm, I used nodemon to simplify the process.

```bash
  npm install sweeft_project_node
  cd sweeft_project_node
  npm start
```


### Database and Postman
The SQL code for the db is in the ```database``` folder, postman collection  ```sweeft.postman_collection.json```


    
## API Reference examples

#### Get all items

```http
  POST /user/register
```

| Parameter | Type     |
| :-------- | :------- | 
| `email` | `string` | 
| `password` | `string` | 

#### Get item

```http
  GET /transaction/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id of item to fetch |


