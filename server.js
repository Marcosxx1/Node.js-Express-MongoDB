const mongoose = require('mongoose');
const dotenv = require('dotenv');


const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose
  .connect(DB, {
    // just some options to deal with deprecation warnings.
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

//Mongoose é sobre modelos, como blueprints para criar documentos
//Como classes em Js
//Utilizado para o CRUD, mas precisamos de um SCHEMA

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
