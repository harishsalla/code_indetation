const {Sequelize,DataTypes}=require("sequelize");
const sequelize = new Sequelize('school', 'root', 'Harish@9959', {
    host: 'localhost',
    logging:false,
    dialect: 'mysql'
  });

const auth=async()=>{
    try{
        await sequelize.authenticate()
        console.log("connection has been secured")
    }
    catch(error){
        console.log("error")
    }
}

auth()

// const hello="hello";
const db={};
db.Sequelize=Sequelize;
db.sequelize=sequelize;
// db.name="harish";

db.display=require('../models/display')(sequelize,DataTypes)

db.sequelize.sync({force:true})

module.exports=db;