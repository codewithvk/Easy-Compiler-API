const express = require('express');
const { javaCompile} = require('../compiler/java')
const router = express.Router();


/*
 @Route: /api/java
 @Method: POST
 @Body: {
     code: string,
     input: string,
 }

 Alert : Make sure code and input are hex format.
 You can pass class name in header too , if you want customized class. By default it is Main.
*/


router.post('/', async (req, res) => {
    const InputCode = Buffer.from(req.body.code, 'base64').toString('binary')
    const DeCode = Buffer.from(req.body.input, 'base64').toString('binary')
    const CentralClass = req?.headers?.class || "Main"
    let response = await javaCompile(InputCode, DeCode, CentralClass);
    if (response.statusMes === "Compiler Error") {
        res.status(202).json(response)
    } else if (response.statusMes === "Run Time Error") {
        res.status(201).json(response)
    } else {
        res.status(200).json(response)
    }

});




module.exports = router;
