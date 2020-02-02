const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const cors = require('cors');

require('./db/mongoose');
const userRouter = require('./routers/user');
const categoryRouter = require('./routers/category');
const productRouter = require('./routers/product');

// utils
const utils = require('./utils/response-util');

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use('/resources',express.static(__dirname + '/public'));

app.use('*', cors())

app.use(userRouter);
app.use(categoryRouter);
app.use(productRouter);

// error handler
app.use(function(err, req, res, next) {
    // No routes handled the request and no system error, that means 404 issue.
    // Forward to next middleware to handle it.
    if (!err) return next();
  
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    const code = err.code || 500;
    const message = err.message || "Internal server error";

    res.status(code).send(utils.createResponse(code, message));
  });
  
 // catch 404. 404 should be consider as a default behavior, not a system error.
  app.use(function(req, res, next) {
    res.status(404).json(utils.createResponse(404, "Not found"));
  });


app.listen(process.env.PORT, () => {
    console.log(`localhost:${process.env.PORT}`);
});