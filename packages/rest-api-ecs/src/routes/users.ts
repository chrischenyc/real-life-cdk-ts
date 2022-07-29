import express from 'express';
import { createValidator } from 'express-joi-validation';
import Joi from 'joi';

import { userStore } from '../store/user/user-store';

export const users = express.Router();
const validator = createValidator();

// POST /users - create a new user
users.post(
    '/',
    validator.body(
        Joi.object({
            username: Joi.string().required().min(4).max(10).alphanum(),
            fullName: Joi.string().required().max(50),
            email: Joi.string().email().required(),
            address: Joi.string().max(200).empty(),
        })
    ),
    async (req, res) => {
        try {
            await userStore.createUser(req.body);
            res.status(201).send();
        } catch (error) {
            res.status(500).json({ error });
        }
    }
);

// get /users/:id - get a user
users.get('/:username', validator.params(Joi.object({ username: Joi.string().required() })), async (req, res) => {
    try {
        const user = await userStore.getUser(req.params.username);
        user ? res.json(user) : res.status(404).json({ error: `username ${req.params.username} not found` });
    } catch (error) {
        res.status(501).json({ error });
    }
});

// patch /users/:id - update a user
users.patch(
    '/:username',
    validator.params(Joi.object({ username: Joi.string().required() })),
    validator.body(
        Joi.object({
            fullName: Joi.string().max(50).empty(),
            email: Joi.string().email().empty(),
            address: Joi.string().max(200).empty(),
        })
    ),
    async (req, res) => {
        try {
            await userStore.updateUser(req.params.username, req.body);
            res.status(200).send();
        } catch (error) {
            res.status(501).json({ error });
        }
    }
);
