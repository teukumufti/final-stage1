const express = require("express");

const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const app = express();
const port = 5000;

const db = require("./conection/db");
const upload = require("./middleware/fileupload");

app.set("view engine", "hbs");
app.use("/public", express.static(__dirname + "/public"));
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(express.urlencoded({ extended: false }));

app.use(flash());
app.use(
  session({
    secret: "keyboard",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// let isLogin = true;

app.get("/home", function (req, res) {
  if (req.session.isLogin) {
    const userId = req.session.user.id;
    const query = `SELECT tb_project.id, tb_project.author_id, tb_project.name, tb_user.name as author, tb_project.start_date, tb_project.end_date, tb_project.techologies, tb_project.content, tb_project.image
    FROM tb_project LEFT JOIN tb_user on tb_project.author_id = tb_user.id WHERE  author_id = ${userId};`;

    db.connect(function (err, client) {
      if (err) throw err;

      client.query(query, function (err, result) {
        if (err) throw err;

        let data = result.rows;
        data = data.map(function (data) {
          return {
            ...data,
            isLogin: req.session.isLogin,
            name: data.name,
            start_date: convertToDate(data.start_date),
            end_date: convertToDate(data.end_date),
            content: data.content.slice(0, 50) + "....",
            duration: getDistanceTime(data.start_date, data.end_date),
            nodeJs: checkboxes(data.techologies[0]),
            javascripts: checkboxes(data.techologies[1]),
            reactJs: checkboxes(data.techologies[2]),
            vueJs: checkboxes(data.techologies[3]),
            // postAt: getFullTime(data.postAt),
          };
        });
        // console.log(data);
        if (!req.session.isLogin) {
          req.flash("danger", "silahkan login");
          return res.redirect("/login");
        }
        res.render("index", {
          isLogin: req.session.isLogin,
          user: req.session.user,
          projects: data,
        });
      });
    });
  } else {
    const query = `SELECT tb_project.id, tb_project.author_id, tb_project.name, tb_user.name as author, tb_project.start_date, tb_project.end_date, tb_project.techologies, tb_project.content, tb_project.image
    FROM tb_project LEFT JOIN tb_user on tb_project.author_id = tb_user.id`;

    db.connect(function (err, client) {
      if (err) throw err;

      client.query(query, function (err, result) {
        if (err) throw err;

        let data = result.rows;
        data = data.map(function (data) {
          return {
            ...data,
            isLogin: req.session.isLogin,
            name: data.name,
            start_date: convertToDate(data.start_date),
            end_date: convertToDate(data.end_date),
            content: data.content.slice(0, 50) + "....",
            duration: getDistanceTime(data.start_date, data.end_date),
            nodeJs: checkboxes(data.techologies[0]),
            javascripts: checkboxes(data.techologies[1]),
            reactJs: checkboxes(data.techologies[2]),
            vueJs: checkboxes(data.techologies[3]),
            // postAt: getFullTime(data.postAt),
          };
        });
        // console.log(data);
        if (!req.session.isLogin) {
          req.flash("danger", "silahkan login");
          return res.redirect("/login");
        }
        res.render("index", {
          isLogin: req.session.isLogin,
          user: req.session.user,
          projects: data,
        });
      });
    });
  }
  // console.log(req.session);
});

//get projects
app.get("/project", function (req, res) {
  if (!req.session.isLogin) {
    req.flash("danger", "silahkan login");
    return res.redirect("/login");
  }
  res.render("project", {
    isLogin: req.session.isLogin,
    user: req.session.user,
  });
});

//post project
app.post("/project", upload.single("inputImage"), function (req, res) {
  let data = req.body;

  const authorId = req.session.user.id;
  const image = req.file.filename;

  const query = `INSERT INTO tb_project(name, author_id, start_date, end_date, techologies, content, image) 
  VALUES ('${data.inputTitle}','${authorId}','${data.inputStartDate}','${data.inputEndDate}','{${data.nodeJs},${data.reactJs},${data.javascripts},${data.vueJs}}','${data.inputContent}','${image}')`;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, results) {
      if (err) throw err;
      done();
      res.redirect("/home");
    });
  });
});

// contact me
app.get("/contact", function (req, res) {
  if (!req.session.isLogin) {
    req.flash("danger", "silahkan login");
    return res.redirect("/login");
  }
  res.render("contact", {
    isLogin: req.session.isLogin,
    user: req.session.user,
  });
});

// detail project
app.get("/project-detail/:id", function (req, res) {
  let id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      `SELECT * FROM tb_project WHERE id = ${id}`,
      function (err, result) {
        if (err) throw err;
        done();
        let data = result.rows[0];
        // console.log(data);
        (data.duration = getDistanceTime(data.start_date, data.end_date)),
          (data.start_date = convertToDate(data.start_date)),
          (data.end_date = convertToDate(data.end_date)),
          (data.nodeJs = checkboxes(data.techologies[0])),
          (data.javascripts = checkboxes(data.techologies[1])),
          (data.reactJs = checkboxes(data.techologies[2])),
          (data.vueJs = checkboxes(data.techologies[3])),
          // data.postAt = getFullTime(data.postAt);

          res.render("project-detail", { projects: data });
      }
    );
  });
});

// get data project
app.get("/update-project/:id", function (req, res) {
  let id = req.params.id;
  const query = `SELECT * FROM tb_project WHERE id = ${id}`;
  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, results) {
      if (err) throw err;
      done();
      let data = results.rows[0];
      (data.duration = getDistanceTime(data.start_date, data.end_date)),
        (data.start_date = getFullTime(data.start_date)),
        (data.end_date = getFullTime(data.end_date)),
        (data.nodeJs = checkboxes(data.techologies[0])),
        (data.javascripts = checkboxes(data.techologies[1])),
        (data.reactJs = checkboxes(data.techologies[2])),
        (data.vueJs = checkboxes(data.techologies[3])),
        // console.log(data);
        res.render("update-project", {
          update: data,
          id,
          isLogin: req.session.isLogin,
          user: req.session.user,
        });
    });
  });
});

// update data project
app.post(
  "/update-project/:id",
  upload.single("inputImage"),
  function (req, res) {
    let data = req.body;
    const id = req.params.id;
    const image = req.file.filename;
    let query = `UPDATE tb_project
	SET name='${data.inputTitle}', start_date='${data.inputStartDate}', end_date='${data.inputEndDate}', techologies='{${data.nodeJs},${data.reactJs},${data.javascripts},${data.vueJs}}',  content='${data.inputContent}', image='${image}'
	WHERE id=${id};`;

    db.connect(function (err, client, done) {
      if (err) throw err;

      client.query(query, function (err, result) {
        if (err) throw err;
        done();

        res.redirect("/home");
      });
    });
  }
);

// delete project
app.get("/delete-project/:id", function (req, res) {
  const id = req.params.id;

  const query = `DELETE FROM tb_project WHERE id=${id}`;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();
      res.redirect("/home");
    });
  });
});

// get register
app.get("/register", function (req, res) {
  res.render("register");
});
// post register
app.post("/register", function (req, res) {
  const { inputname, inputemail, inputpassword } = req.body;
  const hidePassword = bcrypt.hashSync(inputpassword, 10);

  const query = `INSERT INTO tb_user(name, email, password)
	VALUES ( '${inputname}', '${inputemail}','${hidePassword}')`;
  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, results) {
      if (err) throw err;
      done();
      // console.log(req.body);
      res.redirect("/login");
    });
  });
});

// get login
app.get("/login", function (req, res) {
  res.render("login");
});
// post login
app.post("/login", function (req, res) {
  const { inputemail, inputpassword } = req.body;
  const query = `SELECT * FROM tb_user WHERE email='${inputemail}';`;
  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, results) {
      if (err) throw err;
      done();
      // console.log(results.rows);
      if (results.rows.length == 0) {
        req.flash("danger", "Email belum terdaftar");
        return res.redirect("/login");
      }

      const isCompare = bcrypt.compareSync(
        inputpassword,
        results.rows[0].password
      );
      // console.log(isCompare)
      if (isCompare) {
        req.session.isLogin = true;
        req.session.user = {
          id: results.rows[0].id,
          name: results.rows[0].name,
          email: results.rows[0].email,
        };
        req.flash("success", "Login Success");
        res.redirect("/home");
      } else {
        req.flash("danger", "Password Salah");
        res.redirect("/login");
      }
    });
  });
});

// logout
app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/home");
  res.render("logout");
});

function getFullTime() {
  let month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "Jun",
    "July",
    "August",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  let time = new Date();
  let date = time.getDate();

  let monthIndex = time.getMonth();

  let years = time.getFullYear();

  let hours = time.getHours();
  let minutes = time.getMinutes();

  let fullTime = `${date} ${month[monthIndex]} ${years} ${hours}:${minutes}`;

  return fullTime;
}

function getDistanceTime(startDate, endDate) {
  let start = new Date(startDate);
  let end = new Date(endDate);

  let distance = end.getTime() - start.getTime();

  let years = Math.floor(distance / (1000 * 3600 * 24 * 30 * 12));
  let month = Math.round(distance / (1000 * 3600 * 24 * 30));
  let day = distance / (1000 * 3600 * 24);

  if (day < 30) {
    return day + " day ago";
  } else if (month < 12) {
    return month + " month ago";
  } else {
    return years + " years ago";
  }
}

function checkboxes(condition) {
  if (condition == "true") {
    return true;
  } else {
    return false;
  }
}

function convertToDate(date) {
  date = new Date(date);
  const dateString =
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  return dateString;
}

app.listen(port, function () {});
