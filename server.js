const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.send("API IS RUNNING")
})
app.use('/api', require('./api/cppApi'));
app.use('/api/python', require('./api/pythonApi'));


app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
});
