intakeId = null;

function totalCals(data) {
  var total = 0;
  for (i = 0; i < data.length; i++) {
      total += data[i].calories;
  }
  return total;
}

function createUserOnServer(user) {
  var userData = "email=" + encodeURIComponent(user.email);
  userData += "&firstName=" + encodeURIComponent(user.firstName);
  userData += "&lastName=" + encodeURIComponent(user.lastName);
  userData += "&plainPassword=" + encodeURIComponent(user.plainPassword);

  return fetch("http://localhost:8080/users", {
    method: "POST",
    body: userData,
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
}

function loginUserOnServer(user) {
  var userData = "email=" + encodeURIComponent(user.email);
  userData += "&plainPassword=" + encodeURIComponent(user.pass);

  return fetch("http://localhost:8080/session", {
    method: "POST",
    body: userData,
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
}

function createIntakeOnServer(intake) {
  var intakeData = "category=" + encodeURIComponent(intake.category);
  intakeData += "&food=" + encodeURIComponent(intake.food);
  intakeData += "&serving=" + encodeURIComponent(intake.serving);
  intakeData += "&calories=" + encodeURIComponent(intake.calories);

  return fetch("http://localhost:8080/intakes", {
    method: "POST",
    body: intakeData,
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
}

function updateIntakeOnServer(intake) {
  var intakeData = "category=" + encodeURIComponent(intake.category);
  intakeData += "&food=" + encodeURIComponent(intake.food);
  intakeData += "&serving=" + encodeURIComponent(intake.serving);
  intakeData += "&calories=" + encodeURIComponent(intake.calories);

  return fetch("http://localhost:8080/intakes/" + intake.id, {
    method: "PUT",
    body: intakeData,
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
}

function deleteIntakeFromServer(intakeId) {
  return fetch("http://localhost:8080/intakes/" + intakeId, {
		method: "DELETE",
    credentials: "include",
	});
}

function getIntakeListFromServer() {
  return fetch("http://localhost:8080/intakes",{
    credentials: "include"
  });
}

var app = new Vue({
  el: '#app',
  data: {
    userEmail: '',
    userfName: '',
    userlName: '',
    userPassword: '',
    user: '',
    pass: '',
    totalCalories: '',
    intakeCategory: '',
    intakeFood: '',
    intakeServing: '',
    intakeCalories: '',
    intakes: [],
    activeColor: {
      color: 'red',
    },
    errorMessages: [],
    userErrors: [],
    login: true
  },
  methods: {
    validateCreate: function () {
      this.userErrors = [];

      if (this.userEmail.length == 0) {
        this.userErrors.push("Enter a username.");
      }
      if (this.userfName.length == 0) {
        this.userErrors.push("Enter your first name.");
      }
      if (this.userlName.length == 0) {
        this.userErrors.push("Enter your last name.");
      }
      if (this.userPassword.length == 0) {
        this.userErrors.push("Enter a password");
      }
      return this.userErrors == 0;
    },
    validateIntake: function () {
      this.errorMessages = [];

      if (this.intakeCategory.length == 0) {
        this.errorMessages.push("Specify a category.");
      }
      if (this.intakeFood.length == 0) {
        this.errorMessages.push("Specify a food.");
      }
      if (this.intakeServing.length == 0) {
        this.errorMessages.push("Specify a serving.");
      }
      if (this.intakeCalories.length == 0) {
        this.errorMessages.push("Specify calories.");
      }
      return this.errorMessages == 0;
    },
    createUser: function () {
      if (!this.validateCreate()) {
        return;
      }
      createUserOnServer({
        email: this.userEmail,
        firstName: this.userfName,
        lastName: this.userlName,
        plainPassword: this.userPassword
      }).then((response) => {
        if (response.status == 201) {
          alert("Account Created");
        } else {
          alert("username already exists");
        }
      });
      this.userEmail = "";
      this.userfName = "";
      this.userlName = "";
      this.userPassword = "";
    },
    loginUser: function() {
      loginUserOnServer({
        email: this.user,
        pass: this.pass
      }).then((response) => {
        if (response.status == 201) {
          // this.login = false;
          this.loadIntakes();
        } else {
          alert(`Username or Password is incorrect`);
        }
      });
      this.user = "";
      this.pass = "";
    },
    submitNewIntake: function () {
      if (!this.validateIntake()) {
        return;
      }
      createIntakeOnServer({
        category: this.intakeCategory,
        food: this.intakeFood,
        serving: this.intakeServing,
        calories: this.intakeCalories
      }).then((response) => {
        if (response.status == 201) {
          this.loadIntakes();
        } else if (response.status == 401) {
          alert("Log in or create an account");
        }
        else {
          alert("There was a problem saying your entry. Enter a correct category from the list.");
        }
      });
      this.intakeCategory = "";
      this.intakeFood = "";
      this.intakeServing = "";
      this.intakeCalories = "";
    },
    loadIntakes: function () {
      getIntakeListFromServer().then((response) => {
        response.json().then((data) => {
          console.log("entries loaded from server:", data);
          this.intakes = data;
          this.totalCalories = totalCals(data);
          this.login = false;
        });
      });
    },
    updateIntake: function (intake) {
      updateIntakeOnServer({
        category: this.intakeCategory,
        food: this.intakeFood,
        serving: this.intakeServing,
        calories: this.intakeCalories,
        id: intakeId
      }).then((response) => {
        if (response.status == 200) {
          this.loadIntakes();
        } else {
          alert("Loading resource failed.");
        }
      });
      this.intakeCategory = "";
      this.intakeFood = "";
      this.intakeServing = "";
      this.intakeCalories = "";
    },
    editIntake: function (intake) {
      intakeId = intake._id;
      this.intakeCategory = intake.category;
      this.intakeFood = intake.food;
      this.intakeServing = intake.serving;
      this.intakeCalories = intake.calories;
      console.log("edit this this entry:", intake);
    },
    removeIntake: function (intake) {
      console.log("delete this entry:", intake);
      deleteIntakeFromServer(intake._id).then((response) => {
        if (response.status == 200) {
          this.loadIntakes();
        } else {
          alert("Loading resource failed.");
        }
      });
    }
  },
  created: function () {
    this.loadIntakes();
  }
});