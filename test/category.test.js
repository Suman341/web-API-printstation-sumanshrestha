// use the path of your model
const Category = require('../models/category');
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


describe('category Schema testing', () => {
    //  for insert testing
        // it('register categpry', () => {
        //     const catg = {
        //         'category': 'Marbel frame'
                
        //     };
            
        //     return Category.create(catg)
        //         .then((pro_ret) => {
        //             expect(pro_ret.category).toEqual('Marbel frame');
        //         });
        // });


    // delete individual category by id
        it('to test delete a category', async () => {
            const status = await Category.deleteOne({_id :Object('5e47d81a8be2c11e043575b7')});
            expect(status.ok).toBe(1);
        })


    
    
    //to update category details by id
    // it('to test update category', async () => {
    
    //     return Category.findOneAndUpdate({_id :Object('5e47d81a8be2c11e043575b7')}, {$set : {category:'Glass'}})
    //     .then((pp)=>{
    //         expect(pp.category).toEqual('Glass')
    //     })
      
    // });  

     // select all category
    //  it('testing the category for select all at once', async () => {
    //     const status = await Category.find({});
    //     expect(status.length).toBeGreaterThan(0);
    // })
    
  
    
    
})