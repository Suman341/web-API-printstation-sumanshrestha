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
    // the code below is for insert testing
        // it('Register User testing', () => {
        //     const user = {
        //         'firstname': 'Suman',
        //         'lastname': 'Shresta',
        //         'address': 'Kathmandu',
        //         'phone': '9808548545',
        //         'email': 'suman@gmail.com',
        //         'password': '1234'
        //     };

        //     return User.create(user)
        //         .then((pro_ret) => {
        //             expect(pro_ret.email).toEqual('suman@gmail.com');
        //         });
        // });


     delete individual user by id
         it('to test delete a user', async () => {
             const status = await User.deleteOne({_id :Object('5e47d4ac01c2570d08cb98fd')});
             expect(status.ok).toBe(1);
         })


        //delete all user
        // it('to test the delete all user ', async () => {
        //     const status = await User.deleteMany();
        //     expect(status.ok).toBe(1);
        // })


    //to update user details by id
    // it('to test update user', async () => {

    //     return User.findOneAndUpdate({_id :Object('5e47d4ac01c2570d08cb98fd')}, {$set : {firstname:'sujan'}})
    //     .then((pp)=>{
    //         expect(pp.firstname).toEqual('sujan')
    //     })

    // });

     // select all user
    //  it('testing the user for select all at once', async () => {
    //     const status = await User.find({});
    //     expect(status.length).toBeGreaterThan(0);
    // })


    
    
})