// use the path of your model
const User = require('../models/user');
const mongoose = require('mongoose');

 

// use the new name of the database
const url = 'mongodb://localhost:27017/testing_print_station'; 
beforeAll(async () => {
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify:false
    });
});

afterAll(async () => {

    await mongoose.connection.close();
});


describe('User Schema testing', () => {
     the code below is for insert testing
         it('Register User testing', () => {
             const user = {
                 'firstname': 'Sujan',
                 'lastname': 'thapa',
                 'address': 'ktm',
                 'phone': '9845658458',
                 'email': 'suman@gmail.com',
                 'password': '1234'
             };

             return User.create(user)
                 .then((pro_ret) => {
                     expect(pro_ret.email).toEqual('suman@gmail.com');
                 });
         });


    
    
})