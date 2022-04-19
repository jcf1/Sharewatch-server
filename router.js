"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
let router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.send('YEP Clock (Server)');
});
module.exports = router;
