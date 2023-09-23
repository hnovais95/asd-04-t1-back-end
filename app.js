var express = require("express");
var path = require("path");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var app = express();
app.use(cors());

var apiRouter = require("./routes/api");
var apiSegRouter = require("./routes/apiSegRouter");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", apiRouter);
app.use("/api/seg", apiSegRouter);

app.listen(process.env.PORT || 3000, function () {
	console.log("Servidor rodando na porta 3000");
});

module.exports = app;
