import express, { Router, Request, Response } from "express";

let router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send('YEP Clock (Server)');
});

module.exports = router;
