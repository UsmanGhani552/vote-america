const express = require('express');
const app = express();
const mongoose = require('./config')

const userRoutes = require('./routes/userRoute');
const electionRoutes = require('./routes/electionRoute');
const voteRoutes = require('./routes/voteRoute');
require('dotenv').config()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.get('/', (req, res) => {
    res.send('Helloaaaa World!');
});

app.use('/api',userRoutes);
app.use('/api',electionRoutes);
app.use('/api',voteRoutes);

app.listen(process.env.PORT,function(){
    console.log(`Server is running on.....${process.env.PORT}`);
})