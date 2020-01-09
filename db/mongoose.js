const mongoose = require('mongoose');

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify:false
};

mongoose.connect('mongodb://127.0.0.1:27017/printstation', options);

