const express   = require('express');
const router    = express.Router();
const registro  = require('../controllers/registroController');
const loginCtrl = require('../controllers/loginController');

router.post('/registro',        registro.registroManual);
router.post('/registro-social', registro.registroSocial);
router.post('/login',           loginCtrl.login);
router.get('/usuarios',         registro.listarUsuarios);

module.exports = router;
