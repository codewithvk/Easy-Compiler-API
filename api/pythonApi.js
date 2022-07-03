const express = require('express');
const { PythonCompile } = require('../compiler/python');
const router = express.Router();
/*

 @Route: /api/python
 @Method: POST
 @Body: {
     code: string,
     input: string,
 }
 Alert : Make sure code and input are hex format.

 */
router.post('/', async (req, res) => {
    const InputCode = Buffer.from(req.body.code, 'base64').toString('binary')
    const DeCode = Buffer.from(req.body.input, 'base64').toString('binary')
    let response = await PythonCompile(InputCode, DeCode);
    console.log({response})
    if (response.statusMes === "Compiler Error") {
        res.status(202).json(response)
    } else if (response.statusMes === "Run Time Error") {
        res.status(201).json(response)
    } else {
        res.status(200).json(response)
    }

});




module.exports = router;
