const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors=require("cors")
const dotenv=require("dotenv")
const app = express();
dotenv.config({path:"./bin/config.env"})
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Require App

const user=require("./user/urls");
const folder=require("./Folders/urls");

app.use("/user",user);
app.use("/",folder);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err.message)
  res.json({status:false,"error":err.message})
});

module.exports = app;
