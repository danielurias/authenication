## Resource

**Intake**

Attributes:

* category (string)
* food (string)
* serving (integer)
* calories (integer)

**User**

Attributes:

* email (string)
* firstName (string)
* lastName (string)
* encryptedPassword (string)

## Schema

```mongodb
Intake ({
category: STRING,
food: STRING,
serving: NUMBER,
calories: NUMBER,
user: mongoose.Schema.Types.ObjectID});
User ({
email: String,
firstName: String,
lastName: String,
encryptedPassword: String})
})
```

## REST Endpoints

Name                           | Method | Path
-------------------------------|--------|------------------
Retrieve intake collection     | GET    | /intakes
Retrieve intake member         | GET    | /intakes/*\<id\>*
Create intake member           | POST   | /intakes
Update intake member           | PUT    | /intakes/*\<id\>*
Delete intake member           | DELETE | /intakes/*\<id\>*
Create User                    | POST   | /users
Login User                     | POST   | /session

## Heroku Link

https://powerful-beyond-38748.herokuapp.com/
