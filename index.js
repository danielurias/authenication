
const express = require('express');
const cors = require('cors');
const model = require('./model');

const session = require('express-session');
const passport = require('passport');
const passportLocal = require('passport-local');

const app = express()
const port = process.env.PORT || 8080

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'))
app.use(cors({ credentials: true, origin: 'null' }))

app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal.Strategy({
  usernameField: "email",
  passwordField: "plainPassword"
}, function (email, plainPassword, done) {
  model.User.findOne({email: email}).then(function (user) {
    if (!user) {
      done(null, false);
      return;
    }
    
    user.verifyPassword(plainPassword, function (result) {
      if (result) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }).catch(function (err) {
    done(err);
  });
}));

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (userId, done) {
  model.User.findOne({ _id: userId}).then(function (user) {
    done(null, user);
  }).catch(function (err) {
    done(err);
  });
});

app.post("/session", passport.authenticate("local"), function (req, res) {
  res.sendStatus(201);
});

app.get("/session", function (req, res) {
  if (req.user) {
    res.json(req.user);
  } else {
    res.sendStatus(401);
  }
});

app.get('/intakes', (req, res) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  var filter = {
    user: req.user._id
  };

  model.Intake.find(filter).then((intakes) => {
    console.log("Entries listed from DB:", intakes);
    res.json(intakes);
  });
});

app.delete('/intakes/:intakeId', (req, res) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  model.Intake.findOneAndDelete({ _id: req.params.intakeId,  user: req.user._id}).then((intake) => {
      if (intake) {
          res.json(intake)
      } else {
          res.sendStatus(403);
      }
  })
});

app.post('/intakes', (req, res) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  var intake = new model.Intake({
    category: req.body.category,
    food: req.body.food,
    serving: req.body.serving,
    calories: req.body.calories,
    user: req.user._id
  });

  intake.save().then((intake) => {
    console.log('Entry created');
    res.status(201).json(intake);
  }).catch(function (err) {
    if (err.errors) {
      var messages = {};
      for (var e in err.errors) {
        messages[e] = err.errors[e].message;
      }
      res.status(422).json(messages);
    } else {
      res.sendStatus(500);
    }
  });
});

app.get('/intakes/:intakeId', (req, res) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  var filter = {
    user: req.user._id
  };

  model.Intake.findOne({ _id: req.params.intakeId }, filter).then((intake) => {
    if (intake) {
      res.json(intake);
    } else {
      res.sendStatus(404);
    }
  }).catch((err) => {
    res.sendStatus(400);
  })
})

app.put('/intakes/:intakeId', (req, res) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  model.Intake.findOne({ _id: req.params.intakeId, user: req.user._id }).then((intake) => {
    if (intake) {
        intake.category = req.body.category;
        intake.food = req.body.food;
        intake.serving = req.body.serving;
        intake.calories = req.body.calories;

        intake.save().then(() => {
        console.log('Entry updated');
        res.sendStatus(200);
        }).catch((err) => {
          res.sendStatus(500);
        });
    } else {
        res.sendStatus(403);
      }
  }).catch((err) => {
    console.log(err);
    res.sendStatus(400);
  })
})

app.post('/users', (req, res) => {
  var user = new model.User({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  });

  user.setEncryptedPassword(req.body.plainPassword, function () {
    user.save().then((user) => {
      console.log('User created');
      res.status(201).json(user);
    }).catch(function (err) {
      if (err.errors) {
        var messages = {};
        for (var e in err.errors) {
          messages[e] = err.errors[e].message;
        }
        res.status(422).json(messages);
      } else if (err.code == 11000) {
        res.status(422).json({
          email: "Already registered"
        });
      } else {
        res.sendStatus(500);
        console.log("Unkown error:", err);
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Listening at https://powerful-beyond-38748.herokuapp.com:${port}`)
})
